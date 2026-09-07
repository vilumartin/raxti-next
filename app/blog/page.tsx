import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — raxti.app",
  description:
    "Notes on transcription, subtitles, and turning audio into usable text — from the team building raxti.app.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar activePage="blog" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm">
            Blog
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            From the raxti.app blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Notes on transcription, subtitles, and turning audio into text you can
            actually use.
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <p className="text-xs text-muted-foreground mb-2">
                {formatDate(post.date)} · {post.readingTime}
              </p>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {post.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
