import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/blog-posts";

const post = blogPosts.find((p) => p.slug === "extract-ideas-youtube-videos")!;

export const metadata: Metadata = {
  title: `${post.title} — raxti.app`,
  description: post.description,
  alternates: {
    canonical: "https://raxti.app/blog/extract-ideas-youtube-videos",
  },
  openGraph: {
    title: post.title,
    description: post.description,
    type: "article",
    publishedTime: post.date,
  },
};

export default function YouTubeIdeasPost() {
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
            Productivity
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
            You watched a 45-minute YouTube video on business strategy, product design, investing,
            or whatever subject you&apos;re currently obsessed with. You nodded along. You paused it
            twice. You thought: <em>I need to remember this.</em>
          </p>
          <p>
            Three days later, you remember that the video existed. You remember it was good. You
            remember almost nothing specific from it.
          </p>
          <p>
            This is not a memory problem. It&apos;s a workflow problem — and it has a straightforward
            fix.
          </p>

          <h2>Why we don&apos;t retain what we watch</h2>
          <p>
            Watching is passive. Reading and writing are active. When you watch a YouTube video,
            you&apos;re processing audio and visuals simultaneously in a lean-back mode that feels
            productive but produces almost no durable memory trace. Studies on learning retention
            consistently show that passive consumption — watching, listening, reading without
            annotation — produces far weaker recall than active processing like note-taking,
            summarising in your own words, or teaching the material to someone else.
          </p>
          <p>
            The problem compounds at scale. If you watch three or four long-form YouTube videos
            per week — interviews, lectures, documentary-style deep dives, conference talks — and
            take no notes, you&apos;re spending four to six hours a week on input that largely
            evaporates within 72 hours.
          </p>

          <h2>The transcript-first approach to YouTube learning</h2>
          <p>
            The highest-leverage thing you can do to a YouTube video is turn it into text first.
            Once a video is text, you can:
          </p>
          <ul>
            <li>Search it (Ctrl+F for the exact moment someone said something)</li>
            <li>Copy the specific quote you wanted to save</li>
            <li>Ask an AI to summarise, challenge, expand, or apply the ideas</li>
            <li>Drop it into your notes app (Notion, Obsidian, Apple Notes) as a reference</li>
            <li>Compare it against other sources on the same topic</li>
            <li>Turn it into a brief for someone else without them having to watch 45 minutes</li>
          </ul>
          <p>
            The bottleneck has always been getting the text. YouTube&apos;s own auto-generated
            captions exist, but they&apos;re a wall of unformatted text with no punctuation, no
            paragraphing, and no summary. They&apos;re technically a transcript — practically, they&apos;re
            nearly unusable.
          </p>

          <h2>What Raxti does with a YouTube URL</h2>
          <p>
            Paste a YouTube link into <Link href="/">raxti.app</Link>&apos;s YouTube tab. Within a
            minute or two (depending on video length), you get:
          </p>
          <ul>
            <li>
              <strong>A clean, punctuated transcript.</strong> Readable text with proper sentences
              and paragraphs, not a raw caption dump.
            </li>
            <li>
              <strong>A structured summary.</strong> Two to four paragraphs that capture what the
              video actually argued or covered, not just a topic list.
            </li>
            <li>
              <strong>Action items and key takeaways.</strong> Extracted automatically — the specific
              things the speaker recommended, concluded, or flagged as important.
            </li>
            <li>
              <strong>Custom prompt output.</strong> Ask a specific question about the video.
              &ldquo;What are the three most counterintuitive claims in this talk?&rdquo; or
              &ldquo;Summarise this for someone with no background in the topic&rdquo; or
              &ldquo;List every book, person, or tool mentioned.&rdquo;
            </li>
          </ul>
          <p>
            The output is in whatever language you choose — so if you watched a video in English
            but want your notes in Latvian, Russian, or Spanish, you can set the output language
            accordingly. This makes it genuinely useful for non-English speakers who consume a lot
            of English-language content.
          </p>

          <h2>Use cases that go beyond simple note-taking</h2>

          <h3>Research and knowledge gathering</h3>
          <p>
            If you&apos;re researching a topic — building a business, learning a new skill, preparing
            for a conversation or interview — YouTube has some of the most valuable long-form content
            anywhere. Founders talking about their actual mistakes, investors explaining their actual
            frameworks, domain experts going deep on narrow topics that never made it into a book.
          </p>
          <p>
            The problem is that research requires accumulation. One video isn&apos;t knowledge — ten
            videos distilled into notes, compared against each other, and synthesised into a point
            of view, that&apos;s knowledge. Raxti makes the accumulation step fast enough to actually
            do it: paste URL, get structured notes, save to Notion or Obsidian, repeat.
          </p>

          <h3>Capturing ideas before they disappear</h3>
          <p>
            You&apos;re listening to a podcast-style YouTube interview while doing something else —
            cooking, exercising, commuting. Someone says something that clicks. You want to save it,
            but you can&apos;t write and you can&apos;t pause.
          </p>
          <p>
            Later, paste the URL. Search the transcript for the keyword you half-remember. Find the
            exact sentence. Copy it. Done — the idea is saved in less time than it takes to find
            the video again and scrub to the right timestamp.
          </p>

          <h3>Briefing someone without making them watch an hour of video</h3>
          <p>
            You watched something you want a colleague, partner, or team member to know about.
            Forwarding a 50-minute YouTube link has about a 5% chance of being watched. Forwarding
            a two-paragraph summary with three action items has a much better chance of being read
            and acted on.
          </p>
          <p>
            Extract the summary, edit it into a Slack message or email, and link to the original for
            anyone who wants to go deeper.
          </p>

          <h3>Competitive and market intelligence</h3>
          <p>
            Conference talks, investor presentations, product launches, and earnings call summaries
            all end up on YouTube. So do interviews with founders, analysts, and customers talking
            about exactly the problems your product solves.
          </p>
          <p>
            Systematically transcribing and summarising the right YouTube content is a form of
            research that most teams skip entirely because the friction is too high. Lowering that
            friction to a URL paste changes the calculus.
          </p>

          <h3>Preparing for a conversation or meeting</h3>
          <p>
            You&apos;re meeting someone. They gave a talk at a conference, a podcast interview, or a
            recorded Q&amp;A that&apos;s on YouTube. You have twenty minutes, not two hours. Transcribe
            it, read the summary and action items, then watch the three minutes that seem most
            relevant. You&apos;ll walk in better prepared than someone who watched the whole thing
            passively while distracted.
          </p>

          <h3>Building a second brain from video content</h3>
          <p>
            Apps like Notion, Obsidian, and Roam Research are popular for building personal
            knowledge bases — collections of notes, ideas, and references that you can search and
            connect later. Most people fill these with text they&apos;ve read. Very few have a reliable
            workflow for getting video content into the same system, because the friction of
            transcribing it manually is too high.
          </p>
          <p>
            A consistent Raxti-to-Notion workflow (or Raxti-to-Obsidian, or Raxti-to-Apple Notes)
            means your knowledge base reflects what you&apos;ve actually been watching, not just what
            you&apos;ve been reading.
          </p>

          <h2>What makes a good video to transcribe?</h2>
          <p>
            Raxti works best on speech-heavy content. The ideal inputs are:
          </p>
          <ul>
            <li>Long-form interviews and podcasts (30–180 minutes)</li>
            <li>Conference talks and keynotes</li>
            <li>Educational explainer videos and lectures</li>
            <li>Documentary-style deep dives</li>
            <li>Founder or investor interviews</li>
            <li>News analysis and commentary</li>
            <li>Tutorial and how-to content where the speaker explains their reasoning</li>
          </ul>
          <p>
            Videos with heavy background music, lots of B-roll with no narration, or very dense
            visuals without verbal explanation yield less useful transcripts — the spoken word is
            what gets transcribed, so the more substantive the speech, the more useful the output.
          </p>

          <h2>A note on non-English YouTube content</h2>
          <p>
            A significant share of the most valuable YouTube content for any given professional or
            community is not in English. Business content in Russian, Spanish, Arabic, or Chinese.
            Academic lectures in German or French. Industry interviews in whatever language that
            industry mostly operates in.
          </p>
          <p>
            Raxti handles 105 languages on the transcription side. Set the input language to match
            the video, and set the output language to whatever you want your notes in. The
            translation is not perfect — it&apos;s built on Whisper&apos;s multilingual model — but for
            most conversational content it&apos;s accurate enough to be genuinely useful.
          </p>
          <p>
            For speakers of smaller languages, this opens up the reverse workflow too: watch English
            content, get notes back in your native language. Watch Latvian content, get a summary
            in English to share with an international team.
          </p>

          <h2>The workflow, compressed</h2>
          <ol>
            <li>
              Find a YouTube video worth your attention — a talk, interview, lecture, or deep dive
            </li>
            <li>
              Go to <Link href="/">raxti.app</Link> → sign in → Pro Dashboard → YouTube tab
            </li>
            <li>Paste the URL, choose your output language, click Process</li>
            <li>
              While it runs (1–3 minutes), finish what you were doing or start the next one
            </li>
            <li>
              Read the summary and action items — takes 2 minutes
            </li>
            <li>
              Use the custom prompt to extract anything specific you want: quotes, references,
              counterarguments, a brief for a colleague
            </li>
            <li>
              Save the output to your notes app of choice
            </li>
          </ol>
          <p>
            Seven steps that take under five minutes in total. The video is now a searchable,
            shareable, referenceable note rather than a memory that will fade by Thursday.
          </p>

          <h2>What Raxti is not</h2>
          <p>
            It&apos;s worth being direct about limits. Raxti is not a replacement for watching the
            video if the value is in the delivery — a speaker&apos;s energy, the visual demonstrations,
            the audience reactions. It&apos;s a tool for extracting the intellectual content — the
            arguments, frameworks, recommendations, and data — from videos that are primarily about
            what&apos;s being said.
          </p>
          <p>
            It also won&apos;t work on age-restricted videos, private videos, or content that YouTube
            or the creator has blocked from external access. And for very long videos (90+ minutes),
            processing takes a few minutes rather than seconds.
          </p>
          <p>
            For everything else — and there&apos;s a lot of everything else on YouTube — it&apos;s the
            fastest way to turn passive watching into durable notes.
          </p>
        </article>

        <div className="mt-14 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Try it on a YouTube video you watched recently
          </h3>
          <p className="text-muted-foreground mb-4">
            Paste the URL, get a structured summary and action items. Free to start, no card required.
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
