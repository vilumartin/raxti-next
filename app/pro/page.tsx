"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ProVersion = () => {
  const router = useRouter();

  const handleProButtonClick = () => {
    router.push("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <img
              src="/images/logo.png"
              alt="raxti.app logo"
              className="h-24"
            />
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-steno-blue transition-colors"
            >
              Home
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-600 hover:text-steno-blue transition-colors"
            >
              How It Works
            </Link>
            <Link href="/pro" className="text-steno-blue font-medium">
              PRO
            </Link>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1 text-sm">
            Premium Features
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Raxti Pro
          </h1>
          <p className="mt-3 text-xl text-gray-600 sm:mt-5">
            Your Smarter Audio Intelligence Tool
          </p>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Designed for power users who need more flexibility, control, and
            productivity from their audio workflows.
          </p>
          <div className="mt-8">
            <Button
              className="rounded-full px-8 py-6 bg-steno-blue hover:bg-steno-darkBlue text-lg"
              onClick={handleProButtonClick}
            >
              Get Started with Pro
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            ✨ What&apos;s Included in Raxti Pro?
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <div className="bg-steno-blue/10 p-3 rounded-full inline-block mb-4">
                <FileIcon className="h-6 w-6 text-steno-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Unlimited File Size Uploads
              </h3>
              <p className="text-gray-600">
                Remove the 25MB limit — upload and process full-length
                interviews, lectures, and event recordings with ease.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <div className="bg-steno-blue/10 p-3 rounded-full inline-block mb-4">
                <LanguagesIcon className="h-6 w-6 text-steno-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multilingual Magic</h3>
              <p className="text-gray-600">
                Transcribe and summarize in 105 languages. Get structured
                insights in your preferred language — not just English.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <div className="bg-steno-blue/10 p-3 rounded-full inline-block mb-4">
                <FileTextIcon className="h-6 w-6 text-steno-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Prompt Library</h3>
              <p className="text-gray-600">
                Pre-built, battle-tested prompt templates for lecture recaps,
                interview summaries (with speaker labels), investor meeting
                notes, and more.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <div className="bg-steno-blue/10 p-3 rounded-full inline-block mb-4">
                <DownloadIcon className="h-6 w-6 text-steno-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Smart Export Options
              </h3>
              <p className="text-gray-600">
                Download your results as plain text (.txt), markdown (.md), or
                PDF (.pdf).
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <div className="bg-steno-blue/10 p-3 rounded-full inline-block mb-4">
                <ShareIcon className="h-6 w-6 text-steno-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Sharing</h3>
              <p className="text-gray-600">
                Send insights directly to Slack, Notion, Email, or Google Drive.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
              <div className="bg-steno-blue/10 p-3 rounded-full inline-block mb-4">
                <CheckSquareIcon className="h-6 w-6 text-steno-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Actionable Outputs
              </h3>
              <p className="text-gray-600">
                Generate to-do lists, calendar events, and notes.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-amber-50 border border-amber-100 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">
              Offline Mode (Coming Soon)
            </h3>
            <p className="text-gray-600">
              Local transcription and summarization — for full privacy, even
              without internet access.
            </p>
          </div>
        </div>
      </div>

      {/* Who's It For Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-steno-blue/10 p-3 rounded-full mb-4">
              <RocketIcon className="h-6 w-6 text-steno-blue" />
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
                className="bg-white rounded-lg p-4 border border-gray-100 text-center"
              >
                <p className="font-medium text-gray-800">{persona}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 italic">
              Anyone who needs structured insights from audio, fast and private.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            📚 Use Cases
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Use Case 1 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Founders:</h3>
              <p className="text-gray-600">
                Summarize investor and team meetings. Never miss follow-ups or
                action points.
              </p>
            </div>

            {/* Use Case 2 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Consultants:</h3>
              <p className="text-gray-600">
                Extract key takeaways from client calls. Turn conversations into
                deliverables.
              </p>
            </div>

            {/* Use Case 3 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Creators:</h3>
              <p className="text-gray-600">
                Transform podcast convos into content. Capture insights from
                streams or YouTube videos.
              </p>
            </div>

            {/* Use Case 4 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Students:</h3>
              <p className="text-gray-600">
                Record and summarize lectures, group work, or study sessions.
              </p>
            </div>

            {/* Use Case 5 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Teams:</h3>
              <p className="text-gray-600">
                Document live webinars or brainstorms. Share knowledge
                instantly.
              </p>
            </div>

            {/* Use Case 6 */}
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Busy parents:</h3>
              <p className="text-gray-600">
                Create today&apos;s plan and to-do list simply by recording your
                voice while doing other stuff.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-steno-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Raxti Pro — Turn Your Audio into Clarity, Structure, and Action.
          </h2>
          <Button
            className="bg-white text-steno-blue hover:bg-gray-100 px-8 py-6 rounded-full text-lg"
            onClick={handleProButtonClick}
          >
            Get Raxti Pro Today
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProVersion;
