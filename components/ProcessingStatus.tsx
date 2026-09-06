"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// ── Step types ────────────────────────────────────────────────────────────────

export type StepStatus = "pending" | "active" | "done" | "error";

export interface ProcessingStep {
  id: string;
  label: string;
  status: StepStatus;
  /** Secondary line shown under the label while active or on completion */
  detail?: string;
  /** 0-100 sub-progress (shown as a bar while active) */
  progress?: number;
  /** epoch ms when this step started (used for per-step elapsed display) */
  startedAt?: number;
  /** epoch ms when this step finished */
  completedAt?: number;
}

interface ProcessingStatusProps {
  /** Ordered list of processing steps */
  steps: ProcessingStep[];
  /** Name of the file being processed */
  fileName?: string;
  /** File size in MB */
  fileSizeMB?: number;
  /** Seconds remaining (computed by parent from chunk timings); null = unknown */
  estimatedRemainingSec?: number | null;
  /** Whether the process appears stalled */
  isStalled?: boolean;
  /** Called when the user clicks Retry */
  onRetry?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtElapsed(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

function fmtRemaining(sec: number): string {
  if (sec < 60) return `~${Math.ceil(sec)}s remaining`;
  const m = Math.ceil(sec / 60);
  return `~${m} min remaining`;
}

// ── Step icon ─────────────────────────────────────────────────────────────────

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20 text-destructive">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex h-6 w-6 items-center justify-center">
        {/* Pulsing ring */}
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
        </span>
      </span>
    );
  }
  // pending
  return (
    <span className="flex h-6 w-6 items-center justify-center">
      <span className="h-2.5 w-2.5 rounded-full border-2 border-muted-foreground/40" />
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const ProcessingStatus = ({
  steps,
  fileName,
  fileSizeMB,
  estimatedRemainingSec,
  isStalled,
  onRetry,
}: ProcessingStatusProps) => {
  const [now, setNow] = useState(Date.now());

  // Tick every second for live elapsed times
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Overall elapsed: from when the first step started to now
  const firstStartedAt = steps.find((s) => s.startedAt)?.startedAt;
  const lastCompletedAt = steps.filter((s) => s.completedAt).at(-1)?.completedAt;
  const overallElapsedMs = firstStartedAt
    ? (lastCompletedAt && steps.every((s) => s.status === "done")
        ? lastCompletedAt
        : now) - firstStartedAt
    : 0;

  const activeStep = steps.find((s) => s.status === "active");

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-lg font-semibold text-foreground">Processing audio</p>
        {(fileName || fileSizeMB) && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {fileName && <span className="font-medium">{fileName}</span>}
            {fileName && fileSizeMB && <span className="mx-1.5 opacity-50">·</span>}
            {fileSizeMB && <span>{fileSizeMB.toFixed(1)} MB</span>}
          </p>
        )}
      </div>

      {/* Step list */}
      <ol className="space-y-3">
        {steps.map((step, i) => {
          const stepElapsedMs =
            step.startedAt
              ? (step.completedAt ?? (step.status === "active" ? now : step.startedAt)) -
                step.startedAt
              : 0;

          return (
            <li key={step.id} className="flex items-start gap-3">
              {/* Connector + icon */}
              <div className="flex flex-col items-center">
                <StepIcon status={step.status} />
                {i < steps.length - 1 && (
                  <span
                    className={`mt-1 w-px flex-1 rounded-full transition-colors ${
                      step.status === "done" ? "bg-green-500/30" : "bg-border"
                    }`}
                    style={{ height: "20px" }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-baseline justify-between gap-4">
                  <span
                    className={`text-sm font-medium ${
                      step.status === "pending"
                        ? "text-muted-foreground"
                        : step.status === "done"
                        ? "text-foreground"
                        : step.status === "error"
                        ? "text-destructive"
                        : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.status === "done" && stepElapsedMs > 0 && (
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {fmtElapsed(stepElapsedMs)}
                    </span>
                  )}
                  {step.status === "active" && stepElapsedMs > 0 && (
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {fmtElapsed(stepElapsedMs)}
                    </span>
                  )}
                </div>

                {/* Sub-detail line */}
                {step.detail && step.status !== "pending" && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                )}

                {/* Sub-progress bar (active step only) */}
                {step.status === "active" && step.progress !== undefined && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                    {estimatedRemainingSec != null && estimatedRemainingSec > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {fmtRemaining(estimatedRemainingSec)}
                      </p>
                    )}
                  </div>
                )}

                {/* Stall warning */}
                {step.status === "active" && isStalled && (
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                    <p className="text-xs text-amber-400">
                      Taking longer than expected — server may be busy.
                    </p>
                    {onRetry && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onRetry}
                        className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Footer: overall elapsed */}
      {overallElapsedMs > 0 && activeStep && (
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Elapsed: {fmtElapsed(overallElapsedMs)}</span>
          <span>Don&apos;t close this tab</span>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
