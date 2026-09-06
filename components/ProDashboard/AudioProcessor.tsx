"use client";

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import Results from '@/components/Results';
import ProcessingStatus from '@/components/ProcessingStatus';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { chunkAudioFile } from '@/lib/audioChunker';

interface AudioResult {
  id?: string;
  transcript: string;
  summary: string;
  actionItems: string[];
  segments?: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
}

interface AudioProcessorProps {
  user: User;
  results: AudioResult | null;
  setResults: (results: AudioResult | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

/** Files above this size use the Web Audio chunking path. */
const CHUNK_THRESHOLD_MB = 25;

const AudioProcessor = ({ user, results, setResults, error, setError }: AudioProcessorProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputLanguage, setInputLanguage] = useState<string>("en");
  const [outputLanguage, setOutputLanguage] = useState<string>("en");

  // Chunked-processing progress UI
  const [chunkStage, setChunkStage] = useState<string>("");
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number } | null>(null);

  // Guard against concurrent invocations (e.g. retry while processing)
  const processingRef = useRef(false);

  // ── Save result to history ────────────────────────────────────────────────
  const saveResultToHistory = async (
    result: AudioResult,
    fileName: string,
    fileSize: number,
    durationSec?: number
  ) => {
    try {
      // Insert core fields first — always safe regardless of migrations
      const { data: inserted, error: dbErr } = await supabase
        .from('audio_results')
        .insert({
          user_id: user.id,
          file_name: fileName || 'Untitled Audio',
          file_size: fileSize,
          transcript: result.transcript,
          summary: result.summary,
          action_items: result.actionItems,
          segments: result.segments,
          input_language: inputLanguage,
          output_language: outputLanguage,
        })
        .select('id')
        .single();

      if (dbErr) {
        console.error('Error saving result to history:', dbErr);
        return;
      }

      // Patch in duration if we have it and the column exists (migration may not have run yet)
      if (durationSec !== undefined && inserted?.id) {
        await supabase
          .from('audio_results')
          .update({ duration_seconds: Math.round(durationSec) })
          .eq('id', inserted.id)
          .then(({ error }) => {
            if (error) console.warn('duration_seconds column missing — run migration 20250601_add_duration_seconds.sql');
          });
      }
    } catch (err) {
      console.error('Error saving to history:', err);
    }
  };

  // ── File / language handlers ──────────────────────────────────────────────
  const handleFileSelected = (file: File) => {
    setAudioFile(file);
    setResults(null);
    setError(null);
  };
  const handleInputLanguageChange = (v: string) => setInputLanguage(v);
  const handleOutputLanguageChange = (v: string) => setOutputLanguage(v);

  // ── Shared summary generation ─────────────────────────────────────────────
  const generateSummary = async (transcript: string) => {
    const { data, error: err } = await supabase.functions.invoke('generate-summary', {
      body: { transcript, outputLanguage },
    });
    if (err) throw err;
    return {
      summary: data?.summary || "No summary generated",
      actionItems: data?.actionItems || [],
    };
  };

  // ── Path A: small file — send the whole file directly ────────────────────
  const processSmallAudio = async () => {
    const file = audioFile!;

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          if (!evt.target?.result) throw new Error("Failed to read the audio file");

          const base64 = evt.target.result as string;
          toast.info("Transcribing audio…");

          const { data: td, error: te } = await supabase.functions.invoke('process-audio', {
            body: { audioData: base64, inputLanguage, outputLanguage, userId: user.id, skipSummary: true },
          });
          if (te || td?.error) throw new Error(td?.error || te?.message || "Transcription failed");

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
            setResults(full);
            await saveResultToHistory(full, file.name, file.size);
            toast.success("Summary ready!");
          } catch {
            const partial: AudioResult = { ...partialResult, summary: "Failed to generate summary.", actionItems: [] };
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
      reader.readAsDataURL(file);
    });
  };

  // ── Path B: large file — Web Audio decode → WAV chunks → Whisper ─────────
  const processLargeAudio = async () => {
    const file = audioFile!;

    // Step 1: decode + chunk in the browser
    setChunkStage("Decoding audio…");
    setChunkProgress(null);

    let chunks: string[];
    let totalDurationSec: number;

    try {
      ({ chunks, totalDurationSec } = await chunkAudioFile(file, (evt) => {
        if (evt.stage === "decoding") {
          setChunkStage("Decoding audio…");
        } else if (evt.stage === "resampling") {
          setChunkStage("Preparing audio…");
        } else {
          setChunkStage("Preparing audio…");
          setChunkProgress({ current: evt.chunkIndex + 1, total: evt.totalChunks });
        }
      }));
    } catch (err: any) {
      throw new Error(`Could not decode audio: ${err.message}`);
    }

    // Step 2: transcribe each chunk sequentially
    const transcripts: string[] = [];
    const allSegments: any[] = [];
    let timeOffset = 0;

    for (let i = 0; i < chunks.length; i++) {
      setChunkStage(`Transcribing part ${i + 1} of ${chunks.length}…`);
      setChunkProgress({ current: i + 1, total: chunks.length });

      const { data, error: err } = await supabase.functions.invoke('process-audio', {
        body: {
          audioData: chunks[i],
          inputLanguage,
          outputLanguage,
          userId: user.id,
          skipSummary: true,
        },
      });

      if (err || data?.error) {
        throw new Error(data?.error || err?.message || `Failed on chunk ${i + 1} of ${chunks.length}`);
      }

      if (data?.transcript?.trim()) {
        transcripts.push(data.transcript.trim());
      }

      if (Array.isArray(data?.segments)) {
        const adjusted = (data.segments as any[]).map((s) => ({
          ...s,
          start: s.start + timeOffset,
          end: s.end + timeOffset,
        }));
        allSegments.push(...adjusted);
        if (adjusted.length > 0) {
          timeOffset = adjusted[adjusted.length - 1].end;
        }
      }
    }

    const transcript = transcripts.join(" ");

    // Step 3: show transcript, then generate summary
    setChunkStage("Generating summary…");
    setChunkProgress(null);

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
      setResults(full);
      await saveResultToHistory(full, file.name, file.size, totalDurationSec);
      toast.success("Summary ready!");
    } catch {
      const partial: AudioResult = { ...partialResult, summary: "Failed to generate summary.", actionItems: [] };
      setResults(partial);
      toast.error("Failed to generate summary");
      await saveResultToHistory(partial, file.name, file.size, totalDurationSec);
    }
  };

  // ── Main entry point ──────────────────────────────────────────────────────
  const processAudio = async () => {
    if (!audioFile || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);
    setChunkStage("");
    setChunkProgress(null);

    try {
      const sizeMB = audioFile.size / (1024 * 1024);
      if (sizeMB > CHUNK_THRESHOLD_MB) {
        await processLargeAudio();
      } else {
        await processSmallAudio();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during processing");
      toast.error("Error processing audio");
    } finally {
      setIsProcessing(false);
      setChunkStage("");
      setChunkProgress(null);
      processingRef.current = false;
    }
  };

  const handleRetry = () => {
    if (!processingRef.current) processAudio();
  };

  const fileSizeMB = audioFile ? audioFile.size / (1024 * 1024) : 0;
  const isLargeFile = fileSizeMB > CHUNK_THRESHOLD_MB;

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        {!results ? (
          <div className="space-y-8">
            {!isProcessing ? (
              <>
                <FileUpload
                  onFileSelected={handleFileSelected}
                  onProcess={processAudio}
                  isProcessing={isProcessing}
                  file={audioFile}
                  onInputLanguageChange={handleInputLanguageChange}
                  onOutputLanguageChange={handleOutputLanguageChange}
                  selectedInputLanguage={inputLanguage}
                  selectedOutputLanguage={outputLanguage}
                />

                {/* Large-file info banner */}
                {audioFile && isLargeFile && !error && (
                  <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-blue-300">
                      Large file detected ({fileSizeMB.toFixed(1)} MB). It will be decoded in
                      your browser and split into 5-minute chunks — no conversion needed.
                      Processing may take a few minutes.
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
              /* ── Processing progress UI ── */
              <div className="space-y-6">
                {isLargeFile && chunkStage ? (
                  /* Chunked-file progress */
                  <div className="rounded-xl border border-border bg-card p-8 text-center space-y-6">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />

                    <div>
                      <p className="text-lg font-semibold text-foreground">{chunkStage}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {audioFile?.name} &middot; {fileSizeMB.toFixed(1)} MB
                      </p>
                    </div>

                    {chunkProgress && (
                      <div className="space-y-2 max-w-xs mx-auto">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Part {chunkProgress.current} of {chunkProgress.total}</span>
                          <span>{Math.round((chunkProgress.current / chunkProgress.total) * 100)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${(chunkProgress.current / chunkProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Each 5-minute chunk is sent to Whisper separately.
                      Don&apos;t close this tab.
                    </p>
                  </div>
                ) : (
                  /* Standard single-file processing status */
                  <ProcessingStatus
                    isProcessing={isProcessing}
                    fileSizeMB={fileSizeMB}
                    isPro={true}
                    onRetry={handleRetry}
                  />
                )}
              </div>
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
