"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Loader2 } from "lucide-react";

interface UsageCounterProps {
  userId: string;
  /** Monthly cap in minutes shown to the user (display only for now). */
  limitMinutes?: number;
}

interface Usage {
  /** Total duration from duration_seconds column (null if column not yet added) */
  totalMinutes: number | null;
  /** Number of recordings this month */
  count: number;
  /** Whether the duration_seconds column exists in the DB */
  hasDuration: boolean;
}

const MONTH_LIMIT = 300; // Pro tier: 5 hours / month

/** First day of the current month in ISO string */
function monthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

/** Format seconds as "Xh Ym" or "Ym" */
function fmtMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function UsageCounter({ userId, limitMinutes = MONTH_LIMIT }: UsageCounterProps) {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("audio_results")
          .select("duration_seconds, created_at")
          .eq("user_id", userId)
          .gte("created_at", monthStart());

        if (error) {
          console.warn("UsageCounter query failed:", error.message);
          setLoading(false);
          return;
        }

        const rows = data ?? [];
        const hasDuration = rows.some((r) => r.duration_seconds !== null);
        const totalSec = hasDuration
          ? rows.reduce((sum, r) => sum + (r.duration_seconds ?? 0), 0)
          : null;

        setUsage({
          totalMinutes: totalSec !== null ? totalSec / 60 : null,
          count: rows.length,
          hasDuration,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading usage…</span>
      </div>
    );
  }

  if (!usage) return null;

  const used = usage.totalMinutes ?? null;
  const pct = used !== null ? Math.min(100, (used / limitMinutes) * 100) : null;
  const nearLimit = pct !== null && pct >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          This month
        </span>
        <span className={nearLimit ? "text-amber-500 font-medium" : "text-muted-foreground"}>
          {used !== null
            ? `${fmtMinutes(used)} / ${fmtMinutes(limitMinutes)}`
            : `${usage.count} recording${usage.count !== 1 ? "s" : ""}`}
        </span>
      </div>

      {pct !== null && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct >= 90 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {nearLimit && used !== null && (
        <p className="text-xs text-amber-500">
          {pct! >= 100
            ? "Monthly limit reached. Upgrade or wait until next month."
            : `${fmtMinutes(limitMinutes - used)} remaining this month.`}
        </p>
      )}
    </div>
  );
}
