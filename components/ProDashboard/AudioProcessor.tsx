"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/FileUpload";
import Results from "@/components/Results";
import ProcessingStatus, { ProcessingStep } from "@/components/ProcessingStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { chunkAudioFile } from "@/lib/audioChunker";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AudioResult {
  id?: string;
  transcript: string;
  summary: string;
  actionItems: string[];
  segments?: { id: number; start: number; end: number; text: string }[];
}

interface AudioProcessorProps {
  user: User;
  results: AudioResult | null;
  setResults: (results: AudioResult | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Files above this threshold use the Web Audio chunking path */
const CHUNK_THRESHOLD_MB = 25;

/** Update one step in the array immutably */
function patchStep(
  steps: ProcessingStep[],
  id: string,
  patch: Partial<ProcessingStep>
): ProcessingStep[] {
  return steps.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

// ── Component ─────────────────────────────────────────────────────────────────

const AudioProcessor = ({
  user,
  results,
  setResults,
  error,
  setError,
}: AudioProcessorProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputLanguage, setInputLanguage] = useState("en");
  const [outputLanguage, setOutputLanguage] = useState("en");
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [estimatedRemainingSec, setEstimatedRemainingSec] = useState<number | null>(null);
  const [isStalled, setIsStalled] = useState(false);

  // Prevent concurrent processing invocations
  const processingRef = useRef(false);

  // Track per-chunk elapsed ms for ETA
  const chunkTimingsRef = useRef<number[]>([]);

  // Stall timer ref
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Step helpers (useCallback to avoid stale closure in the async paths) ───

  const setStep = useCallback(
    (id: string, patch: Partial<ProcessingStep>) =>
      setSteps((prev) => patchStep(prev, id, patch)),
    []
  );

  const startStep = useCallback(
    (id: string, detail?: string) =>
      setStep(id, { status: "active", startedAt: Date.now(), detail }),
    [setStep]
  );

  const doneStep = useCallback(
    (id: string, detail?: string) =>
      setStep(id, { status: "done", completedAt: Date.now(), detail }),
    [setStep]
  );

  const errorStep = useCallback(
    (id: string, detail?: string) =>
      setStep(id, { status: "error", completedAt: Date.now(), detail }),
    [setStep]
  );

  // ── DB save ───────────────────────────────────────────────────────────────

  const saveResultToHistory = async (
    result: AudioResult,
    fileName: string,
    fileSize: number,
    durationSec?: number
  ) => {
    try {
      const { data: inserted, error: dbErr } = await supabase
        .from("audio_results")
        .insert({
          user_id: user.id,
          file_name: fileName || "Untitled Audio",
          file_size: fileSize,
          transcript: result.transcript,
          summary: result.summary,
          action_items: result.actionItems,
          segments: result.segments,
          input_language: inputLanguage,
          output_language: outputLanguage,
        })
        .select("id")
        .single();

      if (dbErr) {
        console.error("Error saving result to history:", dbErr);
        return;
      }

      if (durationSec !== undefined && inserted?.id) {
        await supabase
          .from("audio_results")
          .update({ duration_seconds: Math.round(durationSec) })
          .eq("id", inserted.id)
          .then(({ error }) => {
            if (error)
              console.warn(
                "duration_seconds column missing — run migration 20250601_add_duration_seconds.sql"
              );
          });
      }
    } catch (err) {
      console.error("Error saving to history:", err);
    }
  };

  // ── Summary generation ────────────────────────────────────────────────────

  const generateSummary = async (transcript: string) => {
    const { data, error: err } = await supabase.functions.invoke("generate-summary", {
      body: { transcript, outputLanguage },
    });
    if (err) throw err;
    return {
      summary: data?.summary || "No summary generated",
      actionItems: data?.actionItems || [],
    };
  };

  // ── Path A: small file — single request ──────────────────────────────────

  const processSmallAudio = async (file: File, stepList: ProcessingStep[]) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          if (!evt.target?.result) throw new Error("Failed to read the audio file");

          doneStep("read");
          startStep("transcribe", "Sending to Whisper API…");

          const { data: td, error: te } = await supabase.functions.invoke("process-audio", {
            body: {
              audioData: evt.target.result as string,
              inputLanguage,
              outputLanguage,
              userId: user.id,
              skipSummary: true,
            },
          });

          if (te || td?.error)
            throw new Error(td?.error || te?.message || "Transcription failed");

          doneStep("transcribe", `${td.segments?.length ?? 0} segments`);
          startStep("summarize", "Generating summary and action items…");

          const partialResult: AudioResult = {
            transcript: td.transcript || "No transcript generated",
            summary: "Generating summary…",
            actionItems: [],
            segments: td.segments || [],
          };
          setResults(partialResult);
          toast.success("Transcript ready! Generating summary…");

          try {
            const { summary, actionItems } = await generateSummary(td.transcript);
            const full: AudioResult = { ...partialResult, summary, actionItems };
            doneStep("summarize");
            setResults(full);
            await saveResultToHistory(full, file.name, file.size);
            toast.success("Summary ready!");
          } catch {
            errorStep("summarize", "Failed — see results");
            const partial: AudioResult = {
              ...partialResult,
              summary: "Failed to generate summary.",
              actionItems: [],
            };
            setResults(partial);
            toast.error("Failed to generate summary");
            await saveResultToHistory(partial, file.name, file.size);
          }

          resolve();
        } catch (err: any) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read the audio file"));

      // Mark "read" as active first
      startStep("read", "Loading file…");
      reader.readAsDataURL(file);
    });
  };

  // ── Path B: large file — Web Audio decode → WAV chunks ───────────────────

  const processLargeAudio = async (file: File) => {
    chunkTimingsRef.current = [];

    // Step: decode
    startStep("decode", "Using browser Web Audio API…");

    let chunks: string[];
    let totalDurationSec: number;

    try {
      let totalChunks = 0;
      ({ chunks, totalDurationSec } = await chunkAudioFile(file, (evt) => {
        if (evt.stage === "decoding") {
          setStep("decode", { status: "active", detail: "Decoding audio…" });
        } else if (evt.stage === "resampling") {
          doneStep("decode", "Decoded");
          startStep("prepare", "Resampling to 16 kHz mono…");
        } else {
          // encoding chunks
          totalChunks = evt.totalChunks;
          if (evt.chunkIndex === 0) {
            doneStep("prepare", `${evt.totalChunks} chunks prepared`);
          }
          setStep("prepare", {
            status: "done",
            detail: `${evt.totalChunks} × 5-min WAV chunks`,
          });
        }
      }));

      // Ensure decode + prepare show as done if the callback didn't fire for all stages
      setSteps((prev) => {
        let updated = prev;
        if (prev.find((s) => s.id === "decode")?.status !== "done")
          updated = patchStep(updated, "decode", { status: "done", completedAt: Date.now(), detail: "Decoded" });
        if (prev.find((s) => s.id === "prepare")?.status !== "done")
          updated = patchStep(updated, "prepare", {
            status: "done",
            completedAt: Date.now(),
            detail: `${chunks.length} × 5-min WAV chunks`,
          });
        return updated;
      });
    } catch (err: any) {
      errorStep("decode", err.message);
      throw new Error(`Could not decode audio: ${err.message}`);
    }

    // Step: transcribe chunks
    const transcripts: string[] = [];
    const allSegments: any[] = [];
    let timeOffset = 0;
    const totalChunks = chunks.length;

    startStep("transcribe", `Chunk 1 of ${totalChunks}…`);

    for (let i = 0; i < totalChunks; i++) {
      const chunkStart = Date.now();
      const pct = Math.round((i / totalChunks) * 100);

      setStep("transcribe", {
        status: "active",
        detail: `Chunk ${i + 1} of ${totalChunks}`,
        progress: pct,
      });

      // Reset stall timer for each chunk
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
      stallTimerRef.current = setTimeout(() => setIsStalled(true), 90_000);

      const { data, error: err } = await supabase.functions.invoke("process-audio", {
        body: {
          audioData: chunks[i],
          inputLanguage,
          outputLanguage,
          userId: user.id,
          skipSummary: true,
          // Tells the edge function to skip per-chunk subscription checks —
          // saves 3-8s per chunk and avoids hitting the 150s timeout.
          skipSubscriptionCheck: true,
        },
      });

      if (err || data?.error) {
        if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
        // Extract the real error — supabase.functions.invoke wraps the actual
        // error body; try to surface it instead of the generic "non-2xx" message.
        let msg = data?.error || data?.message;
        if (!msg && err) {
          try {
            const ctx = (err as any).context;
            if (ctx instanceof Response) {
              const body = await ctx.json().catch(() => ctx.text());
              msg = (typeof body === "object" ? body?.error || body?.message : body) || err.message;
            } else {
              msg = err.message;
            }
          } catch {
            msg = err.message;
          }
        }
        throw new Error(msg || `Failed on chunk ${i + 1}/${totalChunks}`);
      }

      // Track timing for ETA
      const chunkMs = Date.now() - chunkStart;
      chunkTimingsRef.current.push(chunkMs);
      setIsStalled(false);

      // Estimate remaining time from average of completed chunks
      const avgMs =
        chunkTimingsRef.current.reduce((a, b) => a + b, 0) /
        chunkTimingsRef.current.length;
      const remaining = ((totalChunks - i - 1) * avgMs) / 1000;
      setEstimatedRemainingSec(remaining > 0 ? remaining : null);

      if (data?.transcript?.trim()) transcripts.push(data.transcript.trim());

      if (Array.isArray(data?.segments)) {
        const adjusted = (data.segments as any[]).map((s) => ({
          ...s,
          start: s.start + timeOffset,
          end: s.end + timeOffset,
        }));
        allSegments.push(...adjusted);
        if (adjusted.length > 0) timeOffset = adjusted[adjusted.length - 1].end;
      }
    }

    if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    setEstimatedRemainingSec(null);

    doneStep("transcribe", `${totalChunks} chunks · ${transcripts.join(" ").split(" ").length} words`);

    const transcript = transcripts.join(" ");

    // Step: summarize
    startStep("summarize", "Generating summary and action items…");

    const partialResult: AudioResult = {
      transcript,
      summary: "Generating summary…",
      actionItems: [],
      segments: allSegments,
    };
    setResults(partialResult);
    toast.success("Transcript ready! Generating summary…");

    try {
      const { summary, actionItems } = await generateSummary(transcript);
      const full: AudioResult = { ...partialResult, summary, actionItems };
      doneStep("summarize");
      setResults(full);
      await saveResultToHistory(full, file.name, file.size, totalDurationSec);
      toast.success("Summary ready!");
    } catch {
      errorStep("summarize", "Failed — see results");
      const partial: AudioResult = {
        ...partialResult,
        summary: "Failed to generate summary.",
        actionItems: [],
      };
      setResults(partial);
      toast.error("Failed to generate summary");
      await saveResultToHistory(partial, file.name, file.size, totalDurationSec);
    }
  };

  // ── Main entry ────────────────────────────────────────────────────────────

  const processAudio = async () => {
    if (!audioFile || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);
    setIsStalled(false);
    setEstimatedRemainingSec(null);
    chunkTimingsRef.current = [];

    const sizeMB = audioFile.size / (1024 * 1024);
    const isLarge = sizeMB > CHUNK_THRESHOLD_MB;

    // Build initial step list
    const initialSteps: ProcessingStep[] = isLarge
      ? [
          { id: "decode",    label: "Decode audio in browser", status: "pending" },
          { id: "prepare",   label: "Split into 5-min chunks",  status: "pending" },
          { id: "transcribe",label: "Transcribe with Whisper",  status: "pending" },
          { id: "summarize", label: "Generate summary",         status: "pending" },
        ]
      : [
          { id: "read",      label: "Read file",                status: "pending" },
          { id: "transcribe",label: "Transcribe with Whisper",  status: "pending" },
          { id: "summarize", label: "Generate summary",         status: "pending" },
        ];

    setSteps(initialSteps);

    try {
      if (isLarge) {
        await processLargeAudio(audioFile);
      } else {
        await processSmallAudio(audioFile, initialSteps);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during processing");
      toast.error("Error processing audio");
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
      if (stallTimerRef.current) clearTimeout(stallTimerRef.current);
    }
  };

  const handleRetry = () => {
    if (!processingRef.current) processAudio();
  };

  const fileSizeMB = audioFile ? audioFile.size / (1024 * 1024) : 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        {!results ? (
          <div className="space-y-6">
            {!isProcessing ? (
              <>
                <FileUpload
                  onFileSelected={setAudioFile}
                  onProcess={processAudio}
                  isProcessing={isProcessing}
                  file={audioFile}
                  onInputLanguageChange={setInputLanguage}
                  onOutputLanguageChange={setOutputLanguage}
                  selectedInputLanguage={inputLanguage}
                  selectedOutputLanguage={outputLanguage}
                />

                {/* Large-file info banner */}
                {audioFile && fileSizeMB > CHUNK_THRESHOLD_MB && !error && (
                  <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm">
                    <svg className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-300">
                      Large file ({fileSizeMB.toFixed(1)} MB) — decoded in your
                      browser and split into 2-minute chunks for transcription.
                      MP3, M4A, WAV and FLAC work in all browsers. WebM and OGG
                      require Chrome or Firefox (not Safari).
                    </p>
                  </div>
                )}

                {error && (
                  <div
                    className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg"
                    role="alert"
                  >
                    <span className="block sm:inline text-sm">{error}</span>
                  </div>
                )}
              </>
            ) : (
              <ProcessingStatus
                steps={steps}
                fileName={audioFile?.name}
                fileSizeMB={fileSizeMB}
                estimatedRemainingSec={estimatedRemainingSec}
                isStalled={isStalled}
                onRetry={handleRetry}
              />
            )}
          </div>
        ) : (
          <Results
            results={results}
            onReset={() => {
              setAudioFile(null);
              setResults(null);
            }}
            userId={user?.id}
            inputLanguage={inputLanguage}
            outputLanguage={outputLanguage}
            hasActiveSubscription={true}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AudioProcessor;
