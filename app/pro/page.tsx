"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  CheckIcon,
  DownloadIcon,
  ShareIcon,
  FileTextIcon,
  LanguagesIcon,
  CheckSquareIcon,
  RocketIcon,
  FileIcon,
  Loader2,
  Clock,
  Zap,
  Building2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Tier definitions ──────────────────────────────────────────────────────────

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    icon: Clock,
    price: "€2.99",
    period: "/month",
    tagline: "Perfect for light users",
    highlight: false,
    minutes: 90,
    maxFileMB: 100,
    features: [
      "90 min transcription / month",
      "Files up to 100 MB",
      "All audio formats (M4A, MP3, WAV, WebM…)",
      "105 languages",
      "Results history",
      "Custom prompts",
      "PDF / TXT / MD export",
    ],
    missing: ["Priority queue", "API access", "Team seats"],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    price: "€7.99",
    period: "/month",
    tagline: "For regular professionals",
    highlight: true,
    minutes: 400,
    maxFileMB: 500,
    features: [
      "400 min transcription / month",
      "Files up to 500 MB",
      "All audio formats",
      "105 languages",
      "Results history",
      "Custom prompts",
      "PDF / TXT / MD export",
      "Priority processing queue",
      "YouTube video transcription",
    ],
    missing: ["API access", "Team seats"],
  },
  {
    id: "business",
    name: "Business",
    icon: Building2,
    price: "€19.99",
    period: "/month",
    tagline: "For power users & teams",
    highlight: false,
    minutes: 1200,
    maxFileMB: 2000,
    features: [
      "1,200 min transcription / month",
      "Files up to 2 GB",
      "All audio formats",
      "105 languages",
      "Results history",
      "Custom prompts",
      "PDF / TXT / MD export",
      "Priority processing queue",
      "YouTube video transcription",
      "API access (coming soon)",
      "Team seats (coming soon)",
    ],
    missing: [],
  },
];

// ── Checkout helper ───────────────────────────────────────────────────────────

function useCheckout() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null); // tier id being loaded

  const startCheckout = async (tierId: string) => {
    if (!user) { router.push("/auth"); return; }

    setLoading(tierId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth"); return; }

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan: tierId }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error || "Failed to start checkout. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return { startCheckout, loading };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProPage() {
  const { startCheckout, loading } = useCheckout();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar activePage="pro" />

      {/* Hero */}
      <div className="py-14 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm">
            Simple pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Transcribe in any language.<br />
            <span className="text-primary">Pay for what you use.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            All plans include large file support, all formats (M4A, MP3, WAV, WebM…),
            and 105 languages. No per-minute overage fees — just a flat monthly rate.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  tier.highlight
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full">
                      Most popular
                    </span>
                  </div>
                )}

                {/* Tier header */}
                <div className="mb-6">
                  <div className={`inline-flex p-2.5 rounded-xl mb-3 ${tier.highlight ? "bg-primary/20" : "bg-muted"}`}>
                    <Icon className={`h-5 w-5 ${tier.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{tier.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{tier.tagline}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Up to {tier.minutes} min / month · {tier.maxFileMB >= 2000 ? "2 GB" : `${tier.maxFileMB} MB`} per file
                  </p>
                </div>

                {/* CTA */}
                <Button
                  className={`w-full mb-8 ${tier.highlight ? "" : "variant-outline"}`}
                  variant={tier.highlight ? "default" : "outline"}
                  onClick={() => startCheckout(tier.id)}
                  disabled={loading !== null}
                >
                  {loading === tier.id ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting…</>
                  ) : (
                    `Get ${tier.name}`
                  )}
                </Button>

                {/* Feature list */}
                <ul className="space-y-2.5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {tier.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/60">
                      <span className="h-4 w-4 mt-0.5 shrink-0 flex items-center justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Free tier note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Not sure yet?{" "}
          <Link href="/" className="text-primary hover:underline font-medium">
            Try the free tier
          </Link>{" "}
          — 20 min/month, files up to 25 MB, no card required.
        </p>
      </div>

      {/* Features grid */}
      <div className="border-t border-border py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">
            Everything included in all paid plans
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileIcon,
                title: "All formats, any size",
                desc: "M4A, MP3, WAV, WebM, OGG, FLAC. Large files are decoded in your browser and chunked automatically — no conversion needed.",
              },
              {
                icon: LanguagesIcon,
                title: "105 languages",
                desc: "Transcribe in any language Whisper supports. Get your summary and action items in a different language if you prefer.",
              },
              {
                icon: FileTextIcon,
                title: "Custom prompt library",
                desc: "Pre-built templates for investor meetings, lectures, client calls, interviews with speaker labels, and more.",
              },
              {
                icon: DownloadIcon,
                title: "Smart export",
                desc: "Download as plain text, Markdown, or PDF. Copy to clipboard in one click.",
              },
              {
                icon: CheckSquareIcon,
                title: "Action items & summaries",
                desc: "Structured output: transcript, concise summary, and a numbered action list — ready to paste into Notion or your task manager.",
              },
              {
                icon: ShareIcon,
                title: "Results history",
                desc: "All your transcriptions stored and searchable. Pick up where you left off anytime.",
              },
            ].map(({ icon: I, title, desc }) => (
              <div key={title} className="bg-card rounded-xl p-5 border border-border">
                <div className="bg-primary/10 p-2.5 rounded-lg inline-block mb-3">
                  <I className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use cases */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="bg-primary/10 p-2.5 rounded-full">
              <RocketIcon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Built for non-English speakers first</h2>
          </div>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Most AI meeting tools default to English. Raxti was designed from day one
            for multilingual meetings — transcribe in your language, get summaries in
            your language, share directly with your AI assistant or team.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              "Startup founders", "Consultants", "Content creators", "Coaches",
              "Students", "Researchers", "Journalists", "Busy professionals",
            ].map((p) => (
              <div key={p} className="bg-muted/50 rounded-lg p-3 border border-border text-center">
                <p className="text-sm font-medium text-foreground">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div className="bg-primary py-14 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
            Turn every meeting into structured knowledge.
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Start for €2.99 / month. Cancel anytime.
          </p>
          <Button
            className="bg-white text-primary hover:bg-white/90 px-8 py-5 rounded-full text-base font-semibold"
            onClick={() => startCheckout("starter")}
            disabled={loading !== null}
          >
            {loading === "starter" ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting…</>
            ) : (
              "Get started for €2.99"
            )}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
