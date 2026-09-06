"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import Results from "@/components/Results";
import ProcessingStatus from "@/components/ProcessingStatus";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import EmailCollectionModal from "@/components/EmailCollectionModal";
import { useAuth } from "@/contexts/AuthContext";

const IndexPage = () => {
  const { user } = useAuth();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) { setHasActiveSubscription(false); return; }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch("/api/check-subscription", {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const data = await res.json();
        setHasActiveSubscription(data?.subscribed || false);
      } catch (err) {
        console.error("Error checking subscription:", err);
      }
    };
    checkSubscription();
  }, [user]);

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

  const processAudio = async () => {
    if (!audioFile) return;
    if (audioFile.size > 25 * 1024 * 1024) {
      setError("File size exceeds 25MB limit for the free version. Please upgrade to PRO for larger files.");
      toast.error("File size exceeds free version limit");
      return;
    }
    try {
      setIsProcessing(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          if (!event.target?.result) throw new Error("Failed to read the audio file");
          const base64String = event.target.result as string;
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch("/api/process-audio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({
              audioData: base64String,
              inputLanguage,
              outputLanguage,
              userId: user?.id,
            }),
          });
          const data = await res.json();
          if (!res.ok || data?.error) throw new Error(data?.error || "Processing failed");
          const processedResult = {
            transcript: data.transcript || "No transcript generated",
            summary: data.summary || "No summary generated",
            actionItems: data.actionItems || [],
            segments: data.segments || [],
          };
          setResults(processedResult);
          if (user) await saveResultToHistory(processedResult, audioFile.name, audioFile.size);
          toast.success("Audio processed successfully!");
        } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred during processing");
          toast.error("Error processing audio");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => { setError("Failed to read the audio file"); setIsProcessing(false); };
      reader.readAsDataURL(audioFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    if (audioFile) { setIsProcessing(false); setError(null); setTimeout(() => processAudio(), 500); }
  };

  const fileSizeMB = audioFile ? audioFile.size / (1024 * 1024) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <img src="/images/logo.png" alt="raxti.app logo" className="h-24" />
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/how-it-works" className="text-steno-blue hover:text-steno-darkBlue transition-colors">
              How It Works
            </Link>
            <Link href="/pro" className="text-steno-blue hover:text-steno-darkBlue transition-colors font-medium">
              PRO
            </Link>
            {user && hasActiveSubscription && (
              <Link href="/pro-dashboard" className="text-steno-blue hover:text-steno-darkBlue transition-colors font-medium">
                Pro Dashboard
              </Link>
            )}
            {user ? (
              <Link href="/profile" className="text-steno-blue hover:text-steno-darkBlue transition-colors">
                Profile
              </Link>
            ) : (
              <Link href="/auth" className="text-steno-blue hover:text-steno-darkBlue transition-colors">
                Sign In
              </Link>
            )}
          </nav>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">raxti.app</span>
            <span className="block text-steno-blue text-2xl sm:text-3xl mt-3">
              Turn your audio into actionable insights
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Upload audio, get transcripts, summaries, and action items instantly.
          </p>
        </div>

        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-500" />
          <AlertDescription className="ml-2 text-amber-700">
            Free version supports file uploads only up to 25MB. For larger uploads,{" "}
            <Link href="/pro" className="font-semibold underline hover:text-amber-800">
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
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
                        {error}
                      </div>
                    )}
                  </>
                ) : (
                  <ProcessingStatus
                    isProcessing={isProcessing}
                    fileSizeMB={fileSizeMB}
                    isPro={hasActiveSubscription}
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
