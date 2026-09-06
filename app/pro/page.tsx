"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import {
  CheckIcon,
  DownloadIcon,
  ShareIcon,
  CalendarIcon,
  FileTextIcon,
  LanguagesIcon,
  CheckSquareIcon,
  RocketIcon,
  FileIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const ProVersion = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleProButtonClick = async () => {
    // Not logged in → go to auth first
    if (!user) {
      router.push("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        toast.error(data.error || "Failed to start checkout. Please try again.");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      toast.error("Something went wrong. Please try again.");
      console.error("Checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <Logo variant="compact" />
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Home
            </Link>
            <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              How It Works
            </Link>
            <Link href="/pro" className="text-primary font-medium text-sm">
              PRO
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 px-3 py-1 text-sm">
            Premium Features
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Raxti Pro
          </h1>
          <p className="mt-3 text-xl text-muted-foreground sm:mt-5">
            Your Smarter Audio Intelligence Tool
          </p>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            Designed for power users who need more flexibility, control, and
            productivity from their audio workflows.
          </p>
          <div className="mt-8">
            <Button
              className="rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-lg"
              onClick={handleProButtonClick}
              disabled={isLoading}
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Redirecting...</> : "Get Started with Pro"}
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            ✨ What&apos;s Included in Raxti Pro?
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-4">
                <FileIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Unlimited File Size Uploads
              </h3>
              <p className="text-muted-foreground">
                Remove the 25MB limit — upload and process full-length
                interviews, lectures, and event recordings with ease.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-4">
                <LanguagesIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multilingual Magic</h3>
              <p className="text-muted-foreground">
                Transcribe and summarize in 105 languages. Get structured
                insights in your preferred language — not just English.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-4">
                <FileTextIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Prompt Library</h3>
              <p className="text-muted-foreground">
                Pre-built, battle-tested prompt templates for lecture recaps,
                interview summaries (with speaker labels), investor meeting
                notes, and more.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-4">
                <DownloadIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Smart Export Options
              </h3>
              <p className="text-muted-foreground">
                Download your results as plain text (.txt), markdown (.md), or
                PDF (.pdf).
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-4">
                <ShareIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Sharing</h3>
              <p className="text-muted-foreground">
                Send insights directly to Slack, Notion, Email, or Google Drive.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-muted/50 rounded-lg p-6 border border-border">
              <div className="bg-primary/10 p-3 rounded-full inline-block mb-4">
                <CheckSquareIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Actionable Outputs
              </h3>
              <p className="text-muted-foreground">
                Generate to-do lists, calendar events, and notes.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-amber-50 border border-amber-100 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Offline Mode (Coming Soon)
            </h3>
            <p className="text-muted-foreground">
              Local transcription and summarization — for full privacy, even
              without internet access.
            </p>
          </div>
        </div>
      </div>

      {/* Who's It For Section */}
      <div className="py-12 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-primary/10 p-3 rounded-full mb-4">
              <RocketIcon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Who&apos;s It Built For?</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              "Startup founders",
              "Consultants",
              "Content creators",
              "Coaches & mentors",
              "Students",
              "Busy parents",
              "Curious learners",
              "Journalists",
            ].map((persona) => (
              <div
                key={persona}
                className="bg-card rounded-lg p-4 border border-border text-center"
              >
                <p className="font-medium text-foreground">{persona}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground italic">
              Anyone who needs structured insights from audio, fast and private.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            📚 Use Cases
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Use Case 1 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Founders:</h3>
              <p className="text-muted-foreground">
                Summarize investor and team meetings. Never miss follow-ups or
                action points.
              </p>
            </div>

            {/* Use Case 2 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Consultants:</h3>
              <p className="text-muted-foreground">
                Extract key takeaways from client calls. Turn conversations into
                deliverables.
              </p>
            </div>

            {/* Use Case 3 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Creators:</h3>
              <p className="text-muted-foreground">
                Transform podcast convos into content. Capture insights from
                streams or YouTube videos.
              </p>
            </div>

            {/* Use Case 4 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Students:</h3>
              <p className="text-muted-foreground">
                Record and summarize lectures, group work, or study sessions.
              </p>
            </div>

            {/* Use Case 5 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Teams:</h3>
              <p className="text-muted-foreground">
                Document live webinars or brainstorms. Share knowledge
                instantly.
              </p>
            </div>

            {/* Use Case 6 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Busy parents:</h3>
              <p className="text-muted-foreground">
                Create today&apos;s plan and to-do list simply by recording your
                voice while doing other stuff.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Raxti Pro — Turn Your Audio into Clarity, Structure, and Action.
          </h2>
          <Button
            className="bg-white text-primary hover:bg-white/90 px-8 py-6 rounded-full text-lg font-semibold"
            onClick={handleProButtonClick}
            disabled={isLoading}
          >
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin inline" />Redirecting...</> : "Get Raxti Pro Today"}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProVersion;
