"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  PlayCircle,
  Subtitles,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

// ── FAQ data ──────────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    icon: Mic,
    label: "In-person meetings",
    description:
      "Hit record on your phone's voice recorder, share the file to Raxti — transcript and action items in minutes.",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp & call recordings",
    description:
      "Export the audio from any WhatsApp voice call, regular phone call, or Telegram voice message and upload it directly.",
  },
  {
    icon: Subtitles,
    label: "TikTok & Instagram captions",
    description:
      "Upload your video audio, download the SRT subtitle file, and import it straight into CapCut or your editor — no manual typing.",
  },
  {
    icon: PlayCircle,
    label: "YouTube content",
    description:
      "Paste a YouTube URL and get a full transcript. Great for research, study notes, and content repurposing.",
  },
];

const FAQS = [
  {
    category: "Getting started",
    items: [
      {
        q: "What is Raxti.app?",
        a: (
          <>
            Raxti.app is an AI-powered audio transcription tool. You upload an
            audio file (or paste a YouTube URL), choose the language, and get
            back a full transcript, a summary, and action items — all in under a
            minute for files up to 25 MB.
          </>
        ),
      },
      {
        q: "Who is it for?",
        a: (
          <>
            Anyone who records audio and needs it turned into text quickly:
            <ul className="mt-2 space-y-1 list-disc pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">In-person meetings</strong>{" "}
                — record on your phone, upload, done.
              </li>
              <li>
                <strong className="text-foreground">
                  WhatsApp / phone call recordings
                </strong>{" "}
                — export the audio and upload it directly.
              </li>
              <li>
                <strong className="text-foreground">
                  Content creators
                </strong>{" "}
                — generate SRT subtitle files for TikTok and Instagram without
                typing a single word.
              </li>
              <li>
                <strong className="text-foreground">
                  Researchers & students
                </strong>{" "}
                — transcribe lectures, interviews, or YouTube videos for notes
                and summaries.
              </li>
              <li>
                <strong className="text-foreground">
                  Non-English speakers
                </strong>{" "}
                — many AI chat tools work best in English. Transcribe your
                meeting in any language and feed the text to your AI assistant.
              </li>
            </ul>
          </>
        ),
      },
      {
        q: "How does the workflow work?",
        a: (
          <ol className="space-y-3 list-decimal pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Record</strong> — use your
              phone's built-in voice recorder, a call recording app, or export
              audio from any source.
            </li>
            <li>
              <strong className="text-foreground">Upload</strong> — drag the
              file onto Raxti or paste a YouTube URL. Supported formats: MP3,
              M4A, WAV, FLAC, OGG, WebM.
            </li>
            <li>
              <strong className="text-foreground">Choose your language</strong>{" "}
              — Raxti supports 105+ languages for transcription, and can
              translate the output summary into a different language.
            </li>
            <li>
              <strong className="text-foreground">Get results</strong> — full
              verbatim transcript, an AI-generated summary, bullet-point action
              items, and a downloadable SRT subtitle file.
            </li>
          </ol>
        ),
      },
    ],
  },
  {
    category: "Use cases",
    items: [
      {
        q: "Is it good for in-person meetings and phone call recordings?",
        a: (
          <>
            Yes — this is the core use case. Open your phone's voice recorder
            app before the meeting starts, record, then share the audio file to
            Raxti when you're done. You get a transcript, a summary, and action
            items without having to take a single note during the meeting.
            <br />
            <br />
            WhatsApp voice calls, regular phone calls (where recording is legal
            in your jurisdiction), and Telegram voice messages all work the same
            way — just export or forward the audio file and upload it.
          </>
        ),
      },
      {
        q: "What about online meetings like Zoom or Google Meet?",
        a: (
          <>
            Raxti works well for online meetings too, but for Zoom / Meet /
            Teams there is a free dedicated tool that may suit you better:{" "}
            <a
              href="https://fathom.video"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
            >
              Fathom
              <ExternalLink className="h-3 w-3" />
            </a>{" "}
            — it joins your call as a bot, records, and transcribes
            automatically, for free. We recommend Fathom for online meetings and
            Raxti for everything else (in-person, phone calls, WhatsApp, voice
            memos, and any recording that doesn't have a bot integration).
          </>
        ),
      },
      {
        q: "Can I transcribe YouTube videos?",
        a: (
          <>
            Yes — paste any YouTube URL into the Pro Dashboard and Raxti will
            extract the audio and transcribe it.
            <br />
            <br />
            <strong>Important copyright note:</strong> Some YouTube content is
            protected by copyright. Transcribing a video for personal research,
            study notes, or accessibility purposes is generally considered fair
            use in most jurisdictions, but redistributing, publishing, or
            monetising someone else's transcript without permission may infringe
            their rights. Always check the video's licence and terms before
            sharing any transcript publicly. Raxti does not store YouTube audio
            — the extraction is done on the fly and discarded after
            transcription.
          </>
        ),
      },
      {
        q: "How do I use Raxti for TikTok or Instagram subtitles?",
        a: (
          <>
            This is one of the most popular uses:
            <ol className="mt-2 space-y-2 list-decimal pl-5 text-muted-foreground">
              <li>
                Record or export your video's audio as an MP3 or M4A file (most
                video editors can do this in one click).
              </li>
              <li>Upload it to Raxti and let it transcribe.</li>
              <li>
                Click <strong className="text-foreground">Download SRT</strong>{" "}
                in the results panel.
              </li>
              <li>
                Import the .srt file into CapCut, Premiere, DaVinci Resolve, or
                any editor that accepts subtitle files — your captions are placed
                automatically with accurate timecodes.
              </li>
            </ol>
            <br />
            No manual typing, no syncing captions by hand. Raxti supports 105+
            languages, so this works for videos in any language.
          </>
        ),
      },
    ],
  },
  {
    category: "Files & formats",
    items: [
      {
        q: "What audio formats are supported?",
        a: (
          <>
            <strong>MP3, M4A, WAV, FLAC, OGG, WebM</strong> are all supported.
            <br />
            <br />
            Files under 25 MB are sent directly to Whisper (OpenAI's
            transcription engine) and work in every browser. Files over 25 MB
            (Pro plan) are decoded in your browser first — MP3, M4A, WAV, and
            FLAC work in all browsers; WebM and OGG require Chrome or Firefox
            (not Safari).
            <br />
            <br />
            <strong>Tip:</strong> If you're on Safari and have a large WebM or
            OGG file, convert it to MP3 or M4A first using any free converter.
          </>
        ),
      },
      {
        q: "Is there a file size limit?",
        a: (
          <>
            <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Free plan:</strong> 25 MB
                per file. At 64 kbps mono (typical voice recording) that covers
                ~50 minutes of audio.
              </li>
              <li>
                <strong className="text-foreground">Starter (€2.99/mo):</strong>{" "}
                up to 100 MB, 90 minutes of transcription per month.
              </li>
              <li>
                <strong className="text-foreground">Pro (€7.99/mo):</strong> up
                to 500 MB, 400 minutes per month.
              </li>
              <li>
                <strong className="text-foreground">
                  Business (€19.99/mo):
                </strong>{" "}
                up to 2 GB, 1 200 minutes per month.
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    category: "Languages & accuracy",
    items: [
      {
        q: "Which languages are supported?",
        a: (
          <>
            Raxti uses OpenAI Whisper which supports{" "}
            <strong>105 languages</strong>, including English, Spanish, French,
            German, Portuguese, Arabic, Chinese, Japanese, Hindi, Russian,
            Finnish, Latvian, Lithuanian, Estonian, and many more. You can also
            transcribe in one language and get the summary written in a
            different one.
          </>
        ),
      },
      {
        q: "Why is this useful for non-English speakers?",
        a: (
          <>
            Most AI assistants (ChatGPT, Claude, Gemini, etc.) work best when
            you prompt them in English. If your meeting, lecture, or call was in
            another language, manually translating everything before feeding it
            to an AI is tedious. Raxti transcribes and summarises in your
            language, and you can optionally export the summary in English —
            ready to drop straight into any AI workflow.
          </>
        ),
      },
      {
        q: "How accurate is the transcription?",
        a: (
          <>
            Raxti uses{" "}
            <strong>OpenAI Whisper</strong>, one of the most accurate
            open-source speech recognition models available. Accuracy depends on
            audio quality — a clear voice recording in a quiet room will be very
            close to perfect; a noisy environment or heavy accent may introduce
            more errors. For best results, use a directional microphone or
            record close to the speaker.
          </>
        ),
      },
    ],
  },
  {
    category: "Privacy & data",
    items: [
      {
        q: "What happens to my audio files?",
        a: (
          <>
            Audio files are sent to OpenAI's Whisper API for transcription and
            are not stored by Raxti beyond the duration of the request. The
            resulting transcript and summary are saved to your account so you
            can access them later — you can delete any result at any time from
            your dashboard. We do not use your audio or transcripts for
            advertising or AI model training.
          </>
        ),
      },
      {
        q: "Is my data safe?",
        a: (
          <>
            All communication is encrypted over HTTPS. Transcripts stored in
            your account are protected by row-level security — only you can
            access your own data. See our{" "}
            <Link
              href="/privacy-policy"
              className="text-primary hover:text-primary/80 underline"
            >
              Privacy Policy
            </Link>{" "}
            for full details.
          </>
        ),
      },
    ],
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activePage="how-it-works" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">

        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm">
            FAQ
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about Raxti.app — who it's for, how it
            works, and what it can do.
          </p>
        </div>

        {/* Use-case chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
          {USE_CASES.map(({ icon: Icon, label, description }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-center"
              title={description}
            >
              <div className="mx-auto bg-primary/10 rounded-full p-2.5 w-fit">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground leading-tight">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* FAQ sections */}
        <div className="space-y-10">
          {FAQS.map(({ category, items }) => (
            <section key={category}>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {category}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {items.map(({ q, a }) => (
                  <AccordionItem
                    key={q}
                    value={q}
                    className="border border-border rounded-lg px-5 bg-card"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="text-muted-foreground mb-4">
            Reach out at{" "}
            <a
              href="mailto:martins@vilums.co"
              className="text-primary hover:text-primary/80 underline"
            >
              martins@vilums.co
            </a>{" "}
            — we reply to every message.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try it free
            </Link>
            <Link
              href="/pro"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
