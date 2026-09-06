"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Results from '@/components/Results';
import ProcessingStatus from '@/components/ProcessingStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Video, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import LanguageSelector from '@/components/LanguageSelector';
import { useResultsSaver } from './ResultsSaver';

interface YouTubeResult {
  transcript: string;
  summary: string;
  actionItems: string[];
  segments?: {
    id: number;
    start: number;
    end: number;
    text: string;
  }[];
  videoTitle?: string;
  videoDuration?: string;
}

interface YouTubeProcessorProps {
  user: User;
  results: YouTubeResult | null;
  setResults: (results: YouTubeResult | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const YouTubeProcessor = ({ user, results, setResults, error, setError }: YouTubeProcessorProps) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputLanguage, setOutputLanguage] = useState<string>("en");
  const { saveResult } = useResultsSaver({ user });

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)/,
      /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
    ];
    
    return patterns.some(pattern => pattern.test(url));
  };

  const [processingStep, setProcessingStep] = useState<string>("");

  const extractEdgeFunctionError = async (functionError: any): Promise<string> => {
    let msg = functionError.message;
    try {
      const ctx = functionError.context;
      if (ctx instanceof Response) {
        const body = await ctx.json().catch(() => ctx.text());
        msg = (typeof body === 'object' ? body?.error || body?.message : body) || msg;
      } else if (typeof ctx === 'object' && ctx !== null) {
        msg = ctx?.error || ctx?.message || msg;
      }
    } catch { /* keep original */ }
    return msg;
  };

  const processYouTubeVideo = async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a YouTube video URL');
      return;
    }

    if (!validateYouTubeUrl(videoUrl.trim())) {
      setError('Please enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=...)');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);
      setResults(null);

      // ── Step 1: Get download URL from YouTube + RapidAPI ──────────────────
      setProcessingStep("Fetching audio from YouTube (this can take 1-2 minutes)...");
      console.log("🎥 Step 1: youtube-extractor →", videoUrl);

      const { data: extractData, error: extractError } = await supabase.functions.invoke('youtube-extractor', {
        body: { videoUrl: videoUrl.trim(), outputLanguage, userId: user?.id },
      });

      if (extractError) {
        throw new Error(await extractEdgeFunctionError(extractError));
      }
      if (extractData?.error) {
        throw new Error(extractData.error);
      }

      const { downloadUrl, videoTitle, videoDuration } = extractData;
      console.log("✅ Step 1 complete — download URL:", downloadUrl);

      // ── Step 2: Transcribe via process-audio using the download URL ────────
      setProcessingStep(`Transcribing "${videoTitle || 'video'}"...`);
      console.log("🎵 Step 2: process-audio with audioUrl");

      const { data: audioData, error: audioError } = await supabase.functions.invoke('process-audio', {
        body: {
          audioUrl: downloadUrl,
          inputLanguage: 'auto',
          outputLanguage,
          userId: user?.id,
          isInternalCall: true,
        },
      });

      if (audioError) {
        throw new Error(await extractEdgeFunctionError(audioError));
      }
      if (audioData?.error) {
        throw new Error(audioData.error);
      }

      console.log("✅ Step 2 complete:", {
        transcriptLength: audioData.transcript?.length,
        videoTitle,
      });

      const processedResult = {
        transcript: audioData.transcript || "No transcript generated",
        summary: audioData.summary || "No summary generated",
        actionItems: audioData.actionItems || [],
        segments: audioData.segments || [],
        videoTitle,
        videoDuration,
      };

      setResults(processedResult);

      await saveResult(
        processedResult,
        videoTitle || 'YouTube Video',
        0,
        'auto',
        outputLanguage
      );

      toast.success("YouTube video processed successfully!");
    } catch (err) {
      console.error("❌ Error processing YouTube video:", err);
      const msg = err instanceof Error ? err.message : "An unknown error occurred";
      const friendly =
        msg.includes("copyright") || msg.includes("CONVERSION_ERROR") || msg.includes("protected")
          ? "Unable to process this video — it may be protected by copyright or region restrictions. Please try a different video."
          : msg.includes("timed out") || msg.includes("timeout")
          ? "Processing timed out. Please try a shorter video or try again later."
          : msg;
      setError(friendly);
      toast.error("Error processing YouTube video");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleRetry = () => {
    console.log("🔄 Retrying YouTube processing...");
    if (videoUrl) {
      setIsProcessing(false);
      setError(null);
      setTimeout(() => {
        processYouTubeVideo();
      }, 500);
    }
  };

  const handleReset = () => {
    setVideoUrl('');
    setResults(null);
    setError(null);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        {!results ? (
          <div className="space-y-6">
            {!isProcessing ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Video className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold">YouTube Video Processing (Beta)</h3>
                </div>
                
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    Enter a YouTube video URL below to extract audio, transcribe it, and generate summaries with action items.
                    <br />
                    <strong>Note:</strong> Processing may take a few minutes depending on video length.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="youtube-url">YouTube Video URL</Label>
                    <Input
                      id="youtube-url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Supports youtube.com/watch, youtu.be, and video ID formats
                    </p>
                  </div>

                  <LanguageSelector 
                    onLanguageChange={setOutputLanguage}
                    selectedLanguage={outputLanguage}
                    label="Summary & Action Items Language"
                    id="output-language-select"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={processYouTubeVideo}
                    disabled={!videoUrl.trim() || isProcessing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Process YouTube Video
                  </Button>
                </div>
              </>
            ) : (
              <ProcessingStatus 
                isProcessing={isProcessing}
                fileSizeMB={0}
                isPro={true}
                onRetry={handleRetry}
                customMessage={processingStep || "Extracting audio from YouTube video and processing..."}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {results.videoTitle && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Video className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{results.videoTitle}</h4>
                  {results.videoDuration && (
                    <p className="text-sm text-gray-600">Duration: {results.videoDuration}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(videoUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <Results 
              results={results} 
              onReset={handleReset}
              userId={user?.id}
              inputLanguage="auto"
              outputLanguage={outputLanguage}
              hasActiveSubscription={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeProcessor;
