"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResultsHistory from "@/components/ResultsHistory";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, History, Video, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProSubscription } from "@/hooks/useProSubscription";
import ProNavigation from "@/components/ProDashboard/ProNavigation";
import ProHeader from "@/components/ProDashboard/ProHeader";
import AudioProcessor from "@/components/ProDashboard/AudioProcessor";
import YouTubeProcessor from "@/components/ProDashboard/YouTubeProcessor";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

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

const ProDashboard = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const { user, hasActiveSubscription, isLoading, refresh } = useProSubscription();
  const [results, setResults] = useState<AudioResult | null>(null);
  const [youtubeResults, setYoutubeResults] = useState<AudioResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log(
    "🎛️ ProDashboard render - User:",
    !!user,
    "Loading:",
    isLoading,
    "HasSub:",
    hasActiveSubscription
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSelectResult = (historicalResult: any) => {
    setResults({
      transcript: historicalResult.transcript,
      summary: historicalResult.summary,
      actionItems: historicalResult.action_items,
      segments: historicalResult.segments,
    });
    setActiveTab("upload");
  };

  const handleRefreshSubscription = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      toast.success("Subscription status refreshed");
    } catch (err) {
      toast.error("Failed to refresh subscription status");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading while checking authentication
  if (!user) {
    console.log("⏳ No user - showing loading");
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show loading while checking subscription
  if (isLoading) {
    console.log("⏳ Checking subscription - showing loading");
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Checking subscription...</div>
          <Button
            variant="outline"
            onClick={handleRefreshSubscription}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh Status
          </Button>
        </div>
      </div>
    );
  }

  // If we get here and don't have an active subscription, show a helpful message instead of redirecting
  if (!hasActiveSubscription) {
    console.log("❌ No active subscription - showing helpful message");
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Pro Subscription Required
            </h2>
            <p className="text-muted-foreground mb-4">
              You need an active Pro subscription to access this dashboard.
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/pro")}
                className="w-full"
              >
                Get Pro Subscription
              </Button>
              <Button
                variant="outline"
                onClick={handleRefreshSubscription}
                disabled={isRefreshing}
                className="w-full"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("✅ All checks passed - rendering ProDashboard");

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <ProNavigation onSignOut={handleSignOut} />
        <ProHeader user={user} />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Audio Processing
            </TabsTrigger>
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              YouTube Transcription (Beta)
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Results History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <AudioProcessor
              user={user}
              results={results}
              setResults={setResults}
              error={error}
              setError={setError}
            />
          </TabsContent>

          <TabsContent value="youtube">
            <YouTubeProcessor
              user={user}
              results={youtubeResults}
              setResults={setYoutubeResults}
              error={youtubeError}
              setError={setYoutubeError}
            />
          </TabsContent>

          <TabsContent value="history">
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <ResultsHistory onSelectResult={handleSelectResult} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ProDashboard;
