export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readingTime: string;
}

// Add new posts here as they're published. Each entry needs a matching
// route at app/blog/<slug>/page.tsx.
export const blogPosts: BlogPostMeta[] = [
  {
    slug: "extract-ideas-youtube-videos",
    title: "Watched a YouTube Video but Forgot to Take Notes? How to Extract Key Ideas with Raxti",
    description:
      "Paste any YouTube URL and get a structured summary, action items, and a full transcript in minutes. A practical workflow for researchers, knowledge workers, and anyone who watches a lot of long-form content.",
    date: "2026-10-02",
    readingTime: "8 min read",
  },
  {
    slug: "add-subtitles-tiktok-instagram-reels",
    title: "How to Add Subtitles to TikTok and Instagram Reels Automatically (in Any Language)",
    description:
      "TikTok and Instagram auto-captions fail for most non-English languages. Here's the five-minute workflow to generate accurate, timestamped SRT subtitles for your Reels, Stories, and TikToks — in Latvian, Russian, Spanish, Arabic, or any of 105 languages.",
    date: "2026-10-02",
    readingTime: "7 min read",
  },
  {
    slug: "latvian-speech-to-text-tools",
    title: "Latvian speech-to-text, compared: Tilde, Hugo.gov.lv, and where Raxti fits",
    description:
      "Tilde and Hugo.gov.lv are genuinely good options if you're transcribing Latvian. Here's an honest look at both, and where Raxti fits when you need more languages, custom prompts, or SRT subtitles.",
    date: "2026-09-07",
    readingTime: "6 min read",
  },
];
