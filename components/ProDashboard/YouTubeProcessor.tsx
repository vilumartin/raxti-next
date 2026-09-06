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
      
      console.log("🎥 Processing YouTube video:", videoUrl);
      
      const { data, error: functionError } = await supabase.functions.invoke('youtube-extractor', {
        body: { videoUrl: videoUrl.trim(), outputLanguage, userId: user?.id },
      });

      if (functionError) {
        console.error("❌ Function error:", functionError);
        let errorMessage = "An error occurred while processing the YouTube video.";
        if (functionError.message?.includes("Failed to send a request")) {
          errorMessage = "Unable to connect to the YouTube processing service. The video may have copyright restrictions, be private, or be unavailable in your region.";
        } else if (functionError.message?.includes("Load failed")) {
          errorMessage = "Failed to load the YouTube processing service. Please check your internet connection and try again.";
        } else {
          errorMessage = `Processing failed: ${functionError.message}`;
        }
        throw new Error(errorMessage);
      }

      if (data?.error) {
        console.error("❌ Processing error:", data.error);
        
        // Handle specific error messages from the edge function
        let errorMessage = data.error;
        
        if (data.error.includes("copyright restrictions") || 
            data.error.includes("CONVERSION_ERROR") ||
            data.error.includes("protected") ||
            data.error.includes("unavailable for conversion")) {
          errorMessage = "⚠️ Unable to process this video due to copyright restrictions or content protection.\n\n" +
                        "This video may be:\n" +
                        "• Protected by copyright\n" +
                        "• Restricted in your region\n" +
                        "• Set to private by the creator\n" +
                        "• Blocked for audio extraction\n\n" +
                        "Please try with a different video that allows audio extraction.";
        } else if (data.error.includes("timed out") || data.error.includes("timeout")) {
          errorMessage = "⏱️ Processing timed out - this video may be too long or the server is busy.\n\n" +
                        "Please try:\n" +
                        "• A shorter video\n" +
                        "• Waiting a few minutes and trying again";
        } else if (data.error.includes("API service") || data.error.includes("service temporarily unavailable")) {
          errorMessage = "🔧 The YouTube processing service is temporarily unavailable.\n\n" +
                        "Please try again in a few minutes.";
        }
        
        throw new Error(errorMessage);
      }
      
      console.log("✅ YouTube processing completed successfully:", {
        transcriptLength: data.transcript?.length || 0,
        summaryLength: data.summary?.length || 0,
        actionItems: data.actionItems?.length || 0,
        videoTitle: data.videoTitle
      });
      
      const processedResult = {
        transcript: data.transcript || "No transcript generated",
        summary: data.summary || "No summary generated",
        actionItems: data.actionItems || [],
        segments: data.segments || [],
        videoTitle: data.videoTitle,
        videoDuration: data.videoDuration
      };
      
      setResults(processedResult);
      
      // Save the YouTube transcription to results history
      await saveResult(
        processedResult,
        data.videoTitle || 'YouTube Video',
        0, // No file size for YouTube videos
        'auto', // Input language is auto-detected
        outputLanguage
      );
      
      toast.success("YouTube video processed successfully!");
    } catch (err) {
      console.error("❌ Error processing YouTube video:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during processing");
      toast.error("Error processing YouTube video");
    } finally {
      setIsProcessing(false);
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
                customMessage="Extracting audio from YouTube video and processing..."
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
