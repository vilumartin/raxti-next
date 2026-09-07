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
    slug: "latvian-speech-to-text-tools",
    title: "Latvian speech-to-text, compared: Tilde, Hugo.gov.lv, and where Raxti fits",
    description:
      "Tilde and Hugo.gov.lv are genuinely good options if you're transcribing Latvian. Here's an honest look at both, and where Raxti fits when you need more languages, custom prompts, or SRT subtitles.",
    date: "2026-09-07",
    readingTime: "6 min read",
  },
];
