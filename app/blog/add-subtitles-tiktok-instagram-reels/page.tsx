import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/blog-posts";

const post = blogPosts.find((p) => p.slug === "add-subtitles-tiktok-instagram-reels")!;

export const metadata: Metadata = {
  title: `${post.title} — raxti.app`,
  description: post.description,
  alternates: {
    canonical: "https://raxti.app/blog/add-subtitles-tiktok-instagram-reels",
  },
  openGraph: {
    title: post.title,
    description: post.description,
    type: "article",
    publishedTime: post.date,
  },
};

export default function TikTokSubtitlesPost() {
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
            Content Creators
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
            If you create short-form video content in a language other than English — whether that's
            Latvian, Russian, Spanish, German, Arabic, or any of the other 100+ languages people
            actually speak — you've probably run into the same wall: <strong>TikTok and Instagram
            auto-captions don't work reliably for non-English speech.</strong>
          </p>
          <p>
            They'll transcribe your Latvian TikTok as garbled English. Your Russian Reel gets
            skipped entirely. Your Spanish Story ends up with captions that are more embarrassing
            than no captions at all. Meanwhile, the English-speaking creator down the street gets
            auto-captions that are 95% accurate, saving them an hour of manual work per week.
          </p>
          <p>
            This post explains how to add accurate, timestamped subtitles to your TikToks,
            Instagram Reels, and Stories in any language — automatically — using an SRT file
            workflow that takes about five minutes.
          </p>

          <h2>Why auto-captions fail for non-English creators</h2>
          <p>
            TikTok and Instagram's built-in auto-caption tools are trained heavily on English. For
            major languages like Spanish or French they're passable, but for smaller language
            communities — Latvian, Lithuanian, Estonian, Macedonian, Slovenian, Croatian, Georgian,
            Armenian, and hundreds of others — they either produce nonsense or simply refuse to work.
          </p>
          <p>
            This matters beyond convenience. Research consistently shows that videos with captions
            get <strong>12–40% more watch time</strong> than uncaptioned ones. Subtitles help
            viewers watching on mute (the majority on mobile), improve accessibility for the hearing
            impaired, and make your content discoverable to people who wouldn't otherwise understand
            your spoken language. A creator posting in Latvian who adds accurate Latvian captions —
            or adds an English subtitle track — immediately doubles their potential audience.
          </p>

          <h2>The SRT file method: what it is and why it works</h2>
          <p>
            An <strong>SRT file</strong> (SubRip Subtitle, <code>.srt</code>) is a plain-text file
            that pairs transcript lines with timestamps. It looks like this:
          </p>
          <pre>{`1
00:00:01,200 --> 00:00:03,800
Šodien mēs runāsim par...

2
00:00:04,100 --> 00:00:06,500
...kā pievienot subtitrus saviem video.`}</pre>
          <p>
            Every major video editing app — <strong>CapCut, Adobe Premiere, DaVinci Resolve,
            Final Cut Pro, iMovie</strong> — accepts SRT files directly. You import the file, and
            the captions snap into place automatically, timed to the word. No manual typing, no
            copy-pasting, no syncing by hand.
          </p>
          <p>
            TikTok's desktop uploader also accepts SRT files if you want to bypass their
            auto-caption system entirely and use your own accurate transcript.
          </p>

          <h2>Step-by-step: add subtitles to your TikTok or Reel in 5 minutes</h2>

          <h3>Step 1 — Export or record the audio from your video</h3>
          <p>
            You have a few options depending on your workflow:
          </p>
          <ul>
            <li>
              <strong>Export audio from your editing app.</strong> In CapCut: share → export as
              audio. In Premiere: File → Export → Audio. This gives you an MP3 or M4A file.
            </li>
            <li>
              <strong>Use the video file directly.</strong> Raxti accepts video files too — MP4,
              MOV, WEBM — not just audio. Upload the whole video if it&apos;s under the file size
              limit.
            </li>
            <li>
              <strong>Record audio separately.</strong> If you script your videos, you can upload
              the voice-over audio directly before you shoot.
            </li>
          </ul>

          <h3>Step 2 — Upload to raxti.app</h3>
          <p>
            Go to <Link href="/">raxti.app</Link>, sign in, and open the Pro Dashboard. Drag your
            audio or video file onto the upload zone (or tap to select it on mobile). Files up to
            25 MB work on the free plan; the Pro and Business plans handle larger files by
            automatically splitting them into chunks and stitching the transcript back together.
          </p>

          <h3>Step 3 — Choose your language settings</h3>
          <p>
            This is the key step that makes it work for non-English content:
          </p>
          <ul>
            <li>
              <strong>Input language:</strong> select the language you spoke in the video, or leave
              it on Auto-detect. For less common languages, manually selecting (e.g. Latvian,
              Lithuanian, Arabic) gives better accuracy than auto-detect.
            </li>
            <li>
              <strong>Output language:</strong> this is the language your transcript, summary, and
              subtitles will be written in. Set it to the same language for native-language
              subtitles, or switch to English if you want to caption your Latvian video with English
              subtitles for an international audience.
            </li>
          </ul>

          <h3>Step 4 — Download the SRT file</h3>
          <p>
            Once processing completes — typically 30 seconds to a few minutes depending on video
            length — scroll to the results section and click <strong>Download SRT</strong>. You get
            a timestamped subtitle file ready to import.
          </p>

          <h3>Step 5 — Import into CapCut, Premiere, or your editor</h3>
          <p>
            <strong>CapCut (most TikTok creators&apos; choice):</strong> Open your project →
            Text → Auto Captions → Import SRT. Your captions appear on the timeline, already
            synced. Edit font, size, and position to match your brand.
          </p>
          <p>
            <strong>Adobe Premiere:</strong> File → Import, select your .srt file, drag it onto
            a subtitle track above your video.
          </p>
          <p>
            <strong>DaVinci Resolve:</strong> Timeline → Import Subtitle, select your .srt.
          </p>
          <p>
            <strong>TikTok desktop uploader:</strong> When uploading, scroll to Captions →
            Upload captions → select your .srt. Your manually-generated subtitles replace
            TikTok&apos;s auto-caption attempt.
          </p>

          <h2>What about Instagram Stories and Reels?</h2>
          <p>
            Instagram doesn&apos;t accept SRT files for upload — you have to burn the subtitles
            into the video itself (called "open captions" or "hardcoded subtitles"). The workflow
            is:
          </p>
          <ol>
            <li>Generate your SRT with Raxti</li>
            <li>Import it into CapCut or Premiere</li>
            <li>Style the subtitles to your aesthetic (font, color, drop shadow)</li>
            <li>Export the video with captions baked in</li>
            <li>Upload the finished video to Instagram</li>
          </ol>
          <p>
            This is the standard workflow for any serious Reels or Stories creator — the baked-in
            captions look more intentional than Instagram&apos;s auto-generated ones and you
            control exactly how they look.
          </p>

          <h2>Languages that benefit most from this workflow</h2>
          <p>
            Any non-English creator gains something from accurate auto-captioning, but the biggest
            gains are for speakers of languages where platform auto-captions consistently fail:
          </p>
          <ul>
            <li><strong>Baltic languages:</strong> Latvian, Lithuanian, Estonian</li>
            <li><strong>Eastern European languages:</strong> Russian, Ukrainian, Polish, Czech, Slovak, Slovenian, Croatian, Serbian, Macedonian, Bulgarian</li>
            <li><strong>Middle Eastern languages:</strong> Arabic, Hebrew, Farsi, Turkish</li>
            <li><strong>South Asian languages:</strong> Hindi, Bengali, Tamil, Telugu, Urdu</li>
            <li><strong>East Asian languages:</strong> Japanese, Korean, Mandarin, Cantonese</li>
            <li><strong>Nordic languages:</strong> Finnish, Swedish, Norwegian, Danish</li>
            <li><strong>Any smaller language community</strong> where platform auto-captions produce errors or nothing at all</li>
          </ul>
          <p>
            Raxti uses OpenAI Whisper, which covers 105 languages. If you can speak it, there&apos;s
            a good chance we can transcribe it.
          </p>

          <h2>A note on accuracy</h2>
          <p>
            Whisper-based transcription is excellent for speech-heavy content — podcasts, vlogs,
            commentary, tutorials, interviews — and performs well on audio recorded in normal
            conditions. Background music, crowd noise, or very fast delivery will reduce accuracy.
            For your most important content, it&apos;s worth reading through the generated
            transcript before exporting, especially for names, technical terms, or numbers.
          </p>
          <p>
            For Latvian specifically: OpenAI Whisper handles it, but dedicated tools trained on
            Baltic languages may produce slightly better word-error rates on challenging audio. For
            a subtitling workflow where you&apos;re reviewing the output anyway, the difference is
            usually small enough to be correctable in two minutes.
          </p>

          <h2>The bottom line for content creators</h2>
          <p>
            If you&apos;re posting TikToks, Reels, or Stories in a non-English language and not
            captioning your content, you&apos;re leaving reach, accessibility, and watch time on
            the table. The five-minute workflow above — upload audio, download SRT, import into
            CapCut — removes the biggest friction point for non-English creators: the absence of
            reliable auto-captions in your language.
          </p>
          <p>
            You don&apos;t need to type a single word of your transcript manually.
          </p>
        </article>

        <div className="mt-14 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ready to add subtitles to your next video?
          </h3>
          <p className="text-muted-foreground mb-4">
            Upload your audio, download your SRT, and import into CapCut or Premiere in minutes.
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
