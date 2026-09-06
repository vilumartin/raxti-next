"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import Results from "@/components/Results";
import ProcessingStatus, { ProcessingStep } from "@/components/ProcessingStatus";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import EmailCollectionModal from "@/components/EmailCollectionModal";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { FloatingElements } from "@/components/FloatingElements";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

const IndexPage = () => {
  const { user } = useAuth();
  const { isSubscribed: hasActiveSubscription } = useSubscription();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [results, setResults] = useState<{
    transcript: string;
    summary: string;
    actionItems: string[];
    segments?: { id: number; start: number; end: number; text: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [inputLanguage, setInputLanguage] = useState<string>("en");
  const [outputLanguage, setOutputLanguage] = useState<string>("en");

  const saveResultToHistory = async (result: any, fileName: string, fileSize: number) => {
    if (!user) return;
    try {
      await supabase.from("audio_results").insert({
        user_id: user.id,
        file_name: fileName || "Untitled Audio",
        file_size: fileSize,
        transcript: result.transcript,
        summary: result.summary,
        action_items: result.actionItems,
        segments: result.segments,
        input_language: inputLanguage,
        output_language: outputLanguage,
      });
    } catch (err) {
      console.error("Error saving to history:", err);
    }
  };

  const handleFileSelected = async (file: File) => {
    setAudioFile(file);
    setResults(null);
    setError(null);
  };

  const buildSteps = (): ProcessingStep[] => [
    { id: "read",       label: "Read file",               status: "pending" },
    { id: "transcribe", label: "Transcribe with Whisper", status: "pending" },
    { id: "summarize",  label: "Generate summary",        status: "pending" },
  ];

  const patchStep = (id: string, patch: Partial<ProcessingStep>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const processAudio = async () => {
    if (!audioFile) return;
    if (audioFile.size > 25 * 1024 * 1024) {
      setError("File size exceeds 25MB. Upgrade to PRO for larger files.");
      toast.error("File size exceeds free version limit");
      return;
    }
    const initialSteps = buildSteps();
    setSteps(initialSteps);
    setIsProcessing(true);
    setError(null);

    try {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            if (!event.target?.result) throw new Error("Failed to read the audio file");
            patchStep("read", { status: "done", completedAt: Date.now() });
            patchStep("transcribe", { status: "active", startedAt: Date.now(), detail: "Sending to Whisper API…" });

            const base64String = event.target.result as string;
            const { data, error: functionError } = await supabase.functions.invoke("process-audio", {
              body: { audioData: base64String, inputLanguage, outputLanguage, userId: user?.id },
            });

            if (functionError) throw new Error(functionError.message || "Processing failed");
            if (data?.error) throw new Error(data.error);

            patchStep("transcribe", { status: "done", completedAt: Date.now() });
            patchStep("summarize", { status: "active", startedAt: Date.now(), detail: "Building summary…" });

            const processedResult = {
              transcript: data.transcript || "No transcript generated",
              summary: data.summary || "No summary generated",
              actionItems: data.actionItems || [],
              segments: data.segments || [],
            };

            patchStep("summarize", { status: "done", completedAt: Date.now() });
            setResults(processedResult);
            if (user) await saveResultToHistory(processedResult, audioFile.name, audioFile.size);
            toast.success("Audio processed successfully!");
            resolve();
          } catch (err: any) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read the audio file"));
        patchStep("read", { status: "active", startedAt: Date.now() });
        reader.readAsDataURL(audioFile);
      });
    } catch (err: any) {
      setError(err.message || "An unknown error occurred during processing");
      toast.error("Error processing audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (audioFile) { setIsProcessing(false); setError(null); setTimeout(() => processAudio(), 500); }
  };

  const fileSizeMB = audioFile ? audioFile.size / (1024 * 1024) : 0;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col relative">
      <FloatingElements />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Logo variant="compact" />
          </Link>
          <nav className="flex items-center space-x-4 sm:space-x-6">
            <Link href="/how-it-works" className="text-primary hover:text-primary/80 transition-colors text-sm">
              How It Works
            </Link>
            <Link href="/pro" className="text-primary hover:text-primary/80 transition-colors font-medium text-sm">
              PRO
            </Link>
            {user && hasActiveSubscription && (
              <Link href="/pro-dashboard" className="text-primary hover:text-primary/80 transition-colors font-medium text-sm">
                Pro Dashboard
              </Link>
            )}
            {user ? (
              <Link href="/profile" className="text-primary hover:text-primary/80 transition-colors text-sm">
                Profile
              </Link>
            ) : (
              <Link href="/auth" className="text-primary hover:text-primary/80 transition-colors text-sm">
                Sign In
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="block">raxti.app</span>
            <span className="block text-primary text-2xl sm:text-3xl mt-3">
              Turn your audio into actionable insights
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Upload audio, get transcripts, summaries, and action items instantly.
          </p>
        </div>

        <Alert className="mb-4 border-amber-500/30 bg-amber-500/10">
          <InfoIcon className="h-4 w-4 text-amber-400" />
          <AlertDescription className="ml-2 text-amber-300 dark:text-amber-300">
            Free version supports file uploads only up to 25MB. For larger uploads,{" "}
            <Link href="/pro" className="font-semibold underline hover:opacity-80">
              get PRO version!
            </Link>
          </AlertDescription>
        </Alert>

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
                      onInputLanguageChange={setInputLanguage}
                      onOutputLanguageChange={setOutputLanguage}
                      selectedInputLanguage={inputLanguage}
                      selectedOutputLanguage={outputLanguage}
                    />
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded" role="alert">
                        {error}
                      </div>
                    )}
                  </>
                ) : (
                  <ProcessingStatus
                    steps={steps}
                    fileName={audioFile?.name}
                    fileSizeMB={fileSizeMB}
                    onRetry={handleRetry}
                  />
                )}
              </div>
            ) : (
              <Results
                results={results}
                onReset={() => { setAudioFile(null); setResults(null); }}
                userId={user?.id}
                inputLanguage={inputLanguage}
                outputLanguage={outputLanguage}
                hasActiveSubscription={hasActiveSubscription}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
      <EmailCollectionModal open={showEmailModal} onOpenChange={setShowEmailModal} />
    </div>
  );
};

export default IndexPage;
