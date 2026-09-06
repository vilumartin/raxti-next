"use client";

import { Headphones, Mic, FileText, Sparkles, Volume2, MessageSquare } from "lucide-react";

const WaveformIcon = () => (
  <div className="flex items-end gap-[3px] h-8 px-1">
    {[3, 6, 9, 12, 8, 14, 10, 7, 4, 5].map((h, i) => (
      <div
        key={i}
        className="wave-bar w-[3px] rounded-full bg-primary"
        style={{ height: `${h * 2}px` }}
      />
    ))}
  </div>
);

const TranscriptSnippet = () => (
  <div className="space-y-1.5 text-xs font-mono">
    <div className="flex gap-2 items-center">
      <span className="text-primary text-[10px] shrink-0">00:12</span>
      <div className="h-1.5 w-24 rounded bg-muted-foreground/30" />
    </div>
    <div className="flex gap-2 items-center">
      <span className="text-primary text-[10px] shrink-0">00:28</span>
      <div className="h-1.5 w-16 rounded bg-muted-foreground/30" />
    </div>
    <div className="flex gap-2 items-center">
      <span className="text-primary text-[10px] shrink-0">00:45</span>
      <div className="h-1.5 w-20 rounded bg-muted-foreground/30" />
    </div>
  </div>
);

interface FloatCardProps {
  animClass: string;
  delay?: string;
  className?: string;
  children: React.ReactNode;
  glowColor?: string;
}

const FloatCard = ({ animClass, delay = "0s", className = "", children, glowColor }: FloatCardProps) => (
  <div
    className={`absolute glass-card rounded-2xl p-3 ${animClass} ${className}`}
    style={{
      animationDelay: delay,
      perspective: "800px",
      transformStyle: "preserve-3d",
      ...(glowColor ? { boxShadow: `0 0 24px 6px ${glowColor}` } : {}),
    }}
  >
    {children}
  </div>
);

export const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>

      {/* Headphones — top left */}
      <FloatCard
        animClass="animate-float-a"
        delay="0s"
        className="left-[4%] top-[12%] hidden lg:block"
        glowColor="hsl(212 92% 58% / 0.25)"
      >
        <div className="flex flex-col items-center gap-2 p-2">
          <Headphones className="h-10 w-10 text-primary" strokeWidth={1.5} />
          <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Audio</span>
        </div>
      </FloatCard>

      {/* Waveform — top right */}
      <FloatCard
        animClass="animate-float-b"
        delay="1.2s"
        className="right-[5%] top-[8%] hidden lg:block"
      >
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Waveform</span>
          <WaveformIcon />
        </div>
      </FloatCard>

      {/* Microphone — left middle */}
      <FloatCard
        animClass="animate-float-c"
        delay="0.6s"
        className="left-[2%] top-[42%] hidden xl:block"
      >
        <div className="flex flex-col items-center gap-2 p-1">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
            <Mic className="h-8 w-8 text-primary relative z-10" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Record</span>
        </div>
      </FloatCard>

      {/* Transcript snippet — right middle */}
      <FloatCard
        animClass="animate-float-d"
        delay="2s"
        className="right-[3%] top-[38%] hidden xl:block"
      >
        <div className="flex flex-col gap-2 min-w-[130px]">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Transcript</span>
          </div>
          <TranscriptSnippet />
        </div>
      </FloatCard>

      {/* Sparkles / AI — bottom left */}
      <FloatCard
        animClass="animate-float-e"
        delay="3s"
        className="left-[6%] bottom-[18%] hidden lg:block"
      >
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="h-6 w-6 text-yellow-400" strokeWidth={1.5} />
          <div>
            <div className="text-[10px] font-semibold text-foreground">AI Summary</div>
            <div className="h-1 w-16 rounded bg-yellow-400/40 mt-1" />
          </div>
        </div>
      </FloatCard>

      {/* Volume / Speaker — bottom right */}
      <FloatCard
        animClass="animate-float-b"
        delay="1.8s"
        className="right-[7%] bottom-[22%] hidden lg:block"
      >
        <div className="flex items-center gap-2 px-1">
          <Volume2 className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <div className="space-y-1">
            <div className="h-1 w-10 rounded-full bg-primary/60" />
            <div className="h-1 w-14 rounded-full bg-primary/40" />
            <div className="h-1 w-8 rounded-full bg-primary/20" />
          </div>
        </div>
      </FloatCard>

      {/* Action Items badge — top center-right */}
      <FloatCard
        animClass="animate-float-a"
        delay="2.5s"
        className="right-[20%] top-[5%] hidden 2xl:block"
      >
        <div className="flex items-center gap-2 px-1">
          <MessageSquare className="h-5 w-5 text-green-400" strokeWidth={1.5} />
          <span className="text-[10px] font-semibold text-green-400">Action Items</span>
        </div>
      </FloatCard>

    </div>
  );
};
