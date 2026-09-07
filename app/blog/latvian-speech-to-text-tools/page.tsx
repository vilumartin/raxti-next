import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/blog-posts";

const post = blogPosts.find((p) => p.slug === "latvian-speech-to-text-tools")!;

export const metadata: Metadata = {
  title: `${post.title} — raxti.app`,
  description: post.description,
  alternates: {
    canonical: "https://raxti.app/blog/latvian-speech-to-text-tools",
  },
  openGraph: {
    title: post.title,
    description: post.description,
    type: "article",
    publishedTime: post.date,
  },
};

export default function LatvianSpeechToTextPost() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activePage="blog" />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: { "@type": "Person", name: "Martins Vilums" },
            publisher: { "@type": "Organization", name: "raxti.app" },
          }),
        }}
      />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <Link
          href="/blog"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          ← Back to blog
        </Link>

        <header className="mt-6 mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm">
            Comparison
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {post.readingTime}
          </p>
        </header>

        <article className="prose dark:prose-invert prose-headings:font-semibold prose-a:text-primary max-w-none">
          <p>
            If you're searching for speech-to-text in Latvian, two names keep
            coming up: <strong>Hugo.gov.lv</strong> and{" "}
            <strong>Tilde</strong>. That's not an accident — both are solid,
            purpose-built tools, and this post is not an attempt to talk you
            out of using either of them. If Latvian is the only language you
            need, one of the two probably covers you already.
          </p>
          <p>
            We built Raxti for a different, narrower gap: people juggling
            more than one language, or who need the output shaped a
            particular way — subtitles for a video, a transcript from a
            YouTube link, a summary written to a custom prompt. Here's an
            honest look at all three, so you can pick the right one instead
            of defaulting to whichever you heard of first.
          </p>

          <h2>Hugo.gov.lv — free, simple, Latvian only</h2>
          <p>
            Hugo.gov.lv is a free transcription tool from the Latvian
            government's language technology platform. You dictate straight
            into the browser or upload an audio/video file — up to an hour
            long and 1 GB — and get text back. Files are automatically
            deleted after 72 hours.
          </p>
          <p>
            It does exactly what it sets out to do, at no cost, for Latvian.
            There's no summary, no action items, no subtitle export, and no
            support for other languages — it isn't trying to be more than a
            straightforward dictation and transcription tool, and for a lot
            of people that's plenty.
          </p>
          <p>
            <strong>Best fit:</strong> a one-off Latvian recording — a
            lecture, a meeting, a voice memo — where you just want the text
            and don't need anything done with it afterward.
          </p>

          <h2>Tilde — enterprise-grade, 29 languages</h2>
          <p>
            Tilde's transcription tool is aimed squarely at organizations:
            speaker-separated transcripts, subtitle files with timestamps,
            AI-generated summaries, API access, and deployment options that
            range from a EU-based SaaS platform to a private cloud or fully
            on-premises setup for teams with strict data-handling
            requirements. They publish a 94% accuracy figure and support 29
            languages, including Latvian, with pricing built for regular,
            ongoing use — plans start at €6.99/month for 60 minutes, scaling
            up to custom enterprise contracts with a dedicated account
            manager.
          </p>
          <p>
            <strong>Best fit:</strong> a business or public institution that
            transcribes regularly, needs data to stay in the EU or on their
            own infrastructure, wants API integration into existing systems,
            or handles meetings across the languages Tilde supports.
          </p>

          <h2>What an independent benchmark found</h2>
          <p>
            This isn't just a hunch. In March 2026, Latvian blogger Aivis
            Brutans{" "}
            <a
              href="https://aivis.medium.com/audio-p%C4%81rveide-uz-tekstu-kur%C5%A1-r%C4%ABks-ir-prec%C4%ABz%C4%81ks-6951e5407ae5"
              target="_blank"
              rel="noopener noreferrer"
            >
              ran an independent word-error-rate test
            </a>{" "}
            across a dozen transcription tools, using a real Latvian audio
            recording and the JiWER library to score each result. ElevenLabs
            and Soniox came out on top; Tilde Transcribe landed in the top
            five at roughly 4.9% WER, despite having no way to define custom
            terms; Hugo.lv scored around 10.8% WER. TurboScribe — built on
            the same OpenAI Whisper model family Raxti runs on — was among
            the weakest performers for Latvian specifically, and ChatGPT and
            Claude.ai couldn't produce a usable transcript at all.
          </p>
          <p>
            That test is a useful reality check on what Raxti is and isn't
            good for: for Latvian audio specifically, a tool trained on
            Baltic languages, or one of the stronger commercial speech APIs,
            will likely out-transcribe a general-purpose Whisper-based tool
            like ours.
          </p>

          <h2>So where does Raxti fit?</h2>
          <p>
            We're not trying to out-transcribe either of these tools in
            Latvian — a model trained specifically on Baltic languages may
            well handle Latvian better than a general-purpose one. Raxti
            exists for what's outside that scope:
          </p>
          <ul>
            <li>
              <strong>105 languages, not 1 or 29.</strong> Raxti runs on
              OpenAI's Whisper, which covers everything from Arabic and Hindi
              to Japanese and Swahili — useful if your recordings aren't
              consistently in Latvian or a handful of EU languages, or you
              deal with multilingual meetings, calls, or interviews.
            </li>
            <li>
              <strong>Custom prompts.</strong> Instead of a fixed summary
              template, you can tell Raxti exactly how to shape the output —
              a different structure, a specific focus, a different tone —
              per recording.
            </li>
            <li>
              <strong>SRT subtitles for content creators.</strong> Upload
              your video's audio, download a timestamped .srt file, and drop
              it straight into CapCut, Premiere, or DaVinci Resolve — built
              for TikTok and Instagram captioning workflows, not just
              enterprise review documents.
            </li>
            <li>
              <strong>YouTube transcripts from a URL.</strong> Paste a link,
              get the transcript — no download-then-upload step.
            </li>
            <li>
              <strong>Pricing built for individuals.</strong> A free tier for
              short files, then plans starting at €2.99/month — priced for a
              single creator or professional, not a team procurement budget.
            </li>
          </ul>

          <h2>The honest recommendation</h2>
          <p>
            Need Latvian, want it free, and don't need anything beyond the
            text itself? Use Hugo.gov.lv. Running a business or institution
            that transcribes regularly and needs EU/on-prem hosting, speaker
            separation, or API access? Tilde is built for that. Working
            across languages, need SRT subtitles for short-form video, want
            YouTube transcripts, or want control over how your summary reads?
            That's where{" "}
            <Link href="/" className="font-medium">
              Raxti
            </Link>{" "}
            comes in.
          </p>
          <p>
            All three can be true at once — we'd genuinely rather point you
            to the right tool than pretend to be the only option.
          </p>
        </article>

        <div className="mt-14 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Working across languages, or need SRT for social video?
          </h3>
          <p className="text-muted-foreground mb-4">
            Try Raxti free — no card required for short files.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Try it free
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-foreground px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
