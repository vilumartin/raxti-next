"use client";


import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import Results from '@/components/Results';
import ProcessingStatus from '@/components/ProcessingStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

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

          const { data: { session } } = await supabase.auth.getSession();

          const transcriptRes = await fetch('/api/process-audio', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
            },
            body: JSON.stringify({
              audioData: base64String,
              inputLanguage,
              outputLanguage,
              userId: user?.id,
              skipSummary: true,
            }),
          });
          const transcriptData = await transcriptRes.json();

          if (!transcriptRes.ok || transcriptData?.error) {
            const fileSizeMB = (audioFile.size / (1024 * 1024)).toFixed(1);
            const fileExtension = audioFile.name.split('.').pop()?.toLowerCase();
            let errorMessage = transcriptData?.error || "Failed to transcribe audio file";
            if (!transcriptRes.ok && audioFile.size > 25 * 1024 * 1024 && fileExtension === 'm4a') {
              errorMessage = `M4A file (${fileSizeMB}MB) cannot be chunked due to format limitations. Please convert to MP3/WAV.`;
            }
            throw new Error(errorMessage);
          }
          
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
            console.log("📡 Calling /api/generate-summary...");
            const summaryRes = await fetch('/api/generate-summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript: transcriptData.transcript, outputLanguage }),
            });
            const summaryData = await summaryRes.json();

            if (!summaryRes.ok || !summaryData) {
              throw new Error(summaryData?.error || "No summary data received");
            }
            
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
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
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
