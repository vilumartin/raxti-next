"use client";


import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import Results from '@/components/Results';
import ProcessingStatus from '@/components/ProcessingStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

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

const AudioProcessor = ({ user, results, setResults, error, setError }: AudioProcessorProps) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputLanguage, setInputLanguage] = useState<string>("en");
  const [outputLanguage, setOutputLanguage] = useState<string>("en");

  // Save processed results to history
  const saveResultToHistory = async (result: any, fileName: string, fileSize: number) => {
    try {
      console.log("Attempting to save result to history for user:", user.id);
      
      const { error } = await supabase
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
          output_language: outputLanguage
        });

      if (error) {
        console.error('Error saving result to history:', error);
      } else {
        console.log('Successfully saved result to history');
      }
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const handleFileSelected = async (file: File) => {
    setAudioFile(file);
    setResults(null);
    setError(null);
  };

  const handleInputLanguageChange = (value: string) => {
    setInputLanguage(value);
  };
  
  const handleOutputLanguageChange = (value: string) => {
    setOutputLanguage(value);
  };

  const processAudio = async () => {
    if (!audioFile) return;

    // Early format check: M4A files > 25 MB cannot be chunked (container format limitation)
    const fileExt = audioFile.name.split('.').pop()?.toLowerCase();
    const isM4a = fileExt === 'm4a' || audioFile.type === 'audio/mp4' || audioFile.type === 'audio/x-m4a';
    const fileSizeMBEarly = audioFile.size / (1024 * 1024);
    if (isM4a && fileSizeMBEarly > 25) {
      setError(`M4A_FORMAT_LIMIT:${fileSizeMBEarly.toFixed(1)}`);
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      
      const fileSizeMB = audioFile.size / (1024 * 1024);
      console.log("Processing audio file:", audioFile.name, "size:", fileSizeMB.toFixed(2), "MB");
      
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          if (!event.target?.result) {
            throw new Error("Failed to read the audio file");
          }
          
          const base64String = event.target.result as string;
          
          // Step 1: Get transcript only (fast)
          console.log("🎵 Step 1: Transcribing audio...");
          toast.info("Transcribing audio...");

          const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke('process-audio', {
            body: {
              audioData: base64String,
              inputLanguage,
              outputLanguage,
              userId: user?.id,
              skipSummary: true,
            },
          });

          if (transcriptError) {
            console.error("Transcript error:", transcriptError);
            const fileSizeMB = (audioFile.size / (1024 * 1024)).toFixed(1);
            const fileExtension = audioFile.name.split('.').pop()?.toLowerCase();
            let errorMessage = transcriptError.message || "Failed to transcribe audio file";
            if (transcriptError.message?.includes("Edge Function returned a non-2xx status code")) {
              if (audioFile.size > 25 * 1024 * 1024 && fileExtension === 'm4a') {
                errorMessage = `M4A file (${fileSizeMB}MB) cannot be chunked due to format limitations. Please convert to MP3/WAV.`;
              } else {
                errorMessage = "Processing failed. Please try converting your file to MP3 or WAV format.";
              }
            }
            throw new Error(errorMessage);
          }

          if (transcriptData?.error) throw new Error(transcriptData.error);
          
          // Display transcript immediately
          console.log("✅ Transcript received, displaying results...");
          const partialResult = {
            transcript: transcriptData.transcript || "No transcript generated",
            summary: "Generating summary...",
            actionItems: [],
            segments: transcriptData.segments || [],
          };
          
          setResults(partialResult);
          toast.success("Transcript ready! Generating summary...");
          
          // Step 2: Generate summary in background
          console.log("📝 Step 2: Generating summary and action items...");
          console.log("📝 Transcript length:", transcriptData.transcript?.length);
          console.log("📝 Output language:", outputLanguage);
          
          try {
            console.log("📡 Invoking generate-summary function...");
            const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-summary', {
              body: { transcript: transcriptData.transcript, outputLanguage },
            });

            if (summaryError) throw summaryError;
            if (!summaryData) throw new Error("No summary data received from function");
            
            // Update with complete results
            console.log("✅ Summary generated successfully");
            console.log("📄 Summary length:", summaryData?.summary?.length);
            console.log("📋 Action items count:", summaryData?.actionItems?.length);
            
            const completeResult = {
              transcript: transcriptData.transcript,
              summary: summaryData?.summary || "No summary generated",
              actionItems: summaryData?.actionItems || [],
              segments: transcriptData.segments || [],
            };
            
            setResults(completeResult);
            await saveResultToHistory(completeResult, audioFile.name, audioFile.size);
            toast.success("Summary ready!");
            
          } catch (summaryError) {
            console.error("❌ Summary generation failed:", summaryError);
            console.error("❌ Full error object:", summaryError);
            
            // Keep the transcript, just show error for summary
            const resultWithError = {
              ...partialResult,
              summary: "Failed to generate summary. Please try again.",
              actionItems: []
            };
            setResults(resultWithError);
            toast.error("Failed to generate summary");
            await saveResultToHistory(resultWithError, audioFile.name, audioFile.size);
          }
          
        } catch (err) {
          console.error(err);
          setError(err instanceof Error ? err.message : "An unknown error occurred during processing");
          toast.error("Error processing audio");
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setError("Failed to read the audio file");
        setIsProcessing(false);
        toast.error("Failed to read the audio file");
      };
      
      reader.readAsDataURL(audioFile);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsProcessing(false);
      toast.error("Error processing audio");
    }
  };

  const handleRetry = () => {
    console.log("🔄 Retrying audio processing from Pro Dashboard...");
    if (audioFile) {
      setIsProcessing(false);
      setError(null);
      setTimeout(() => {
        processAudio();
      }, 500);
    }
  };

  const fileSizeMB = audioFile ? audioFile.size / (1024 * 1024) : 0;

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
                
                {error && (() => {
                  // M4A large-file error: rich conversion prompt
                  if (error.startsWith("M4A_FORMAT_LIMIT:")) {
                    const sizeMB = error.split(":")[1];
                    return (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-amber-300">M4A files over 25 MB cannot be chunked</p>
                            <p className="text-sm text-amber-200/80 mt-1">
                              M4A is a container format — splitting raw bytes breaks the file structure, so every chunk fails.
                              Your file is <strong>{sizeMB} MB</strong>. Please convert it to MP3 first (same quality, smaller size, fully chunkable).
                            </p>
                          </div>
                        </div>
                        <div className="pl-8 space-y-2">
                          <p className="text-xs font-medium text-amber-300 uppercase tracking-wide">Free online converters</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "CloudConvert", url: "https://cloudconvert.com/m4a-to-mp3" },
                              { label: "Zamzar", url: "https://www.zamzar.com/convert/m4a-to-mp3/" },
                              { label: "FreeConvert", url: "https://www.freeconvert.com/m4a-to-mp3" },
                            ].map(({ label, url }) => (
                              <a
                                key={label}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-colors"
                              >
                                {label}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                          <p className="text-xs text-amber-200/60">
                            Or use ffmpeg locally: <code className="bg-black/30 px-1 rounded">ffmpeg -i input.m4a output.mp3</code>
                          </p>
                        </div>
                        <div className="pl-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-400 hover:text-amber-300 px-0"
                            onClick={() => setError(null)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  // Generic error
                  return (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg" role="alert">
                      <span className="block sm:inline text-sm">{error}</span>
                    </div>
                  );
                })()}
              </>
            ) : (
              <ProcessingStatus 
                isProcessing={isProcessing}
                fileSizeMB={fileSizeMB}
                isPro={true}
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
