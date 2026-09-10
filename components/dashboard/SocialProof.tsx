"use client";

import { Users, TrendingUp, Clock } from "lucide-react";
import type { CommunityProofStats } from "@/lib/public-stats";
import { StatsAsOf } from "@/components/shared/StatsAsOf";

/**
 * Social-proof bar showing real platform activity. Every figure comes from
 * getCommunityProofStats() in lib/public-stats.ts — counts over real students'
 * records only (demo accounts excluded), computed server-side per page load.
 *
 * There is deliberately no "students online right now" figure: the only data
 * source that could approach it (client telemetry) records page views, not
 * presence, so any number would be an approximation — this bar never shows a
 * number it cannot back with a real query. If the server cannot verify the
 * stats, the bar renders nothing at all.
 */
export function SocialProof({ stats }: { stats: CommunityProofStats | null }) {
  if (!stats) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-white/40">
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-white/55 font-medium">
            {stats.answeredThisWeek.toLocaleString()} questions answered this week
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span className="text-white/55 font-medium">
            {stats.activeStudentsThisWeek} student{stats.activeStudentsThisWeek === 1 ? "" : "s"} practising this week
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-white/55 font-medium">
            {stats.studentsJoined.toLocaleString()} students joined
          </span>
        </span>
      </div>
      <StatsAsOf asOf={stats.asOf} />
    </div>
  );
}
