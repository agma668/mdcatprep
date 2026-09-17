"use client";

import { TrackedLink } from "@/components/TrackedLink";
import Link from "next/link";
import { Trophy, Flame, Crown, Medal } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard";

interface Props {
  entries: LeaderboardEntry[];
}

export function SidebarLeaderboard({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="px-3 pb-3">
      <div className="rounded-[var(--radius-md)] bg-white/[0.06]/[0.04]/[0.04] border border-white/[0.06] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.05]">
          <Trophy className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">
            Top Students
          </span>
        </div>

        {/* Entries */}
        <div className="divide-y divide-white/[0.04]">
          {entries.map((s) => (
            <div
              key={s.rank}
              className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.06]/[0.04]/[0.03] transition-colors"
            >
              {/* Rank */}
              <div className="w-5 shrink-0 flex justify-center">
                {s.rank === 1 ? (
                  <Crown className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
                ) : s.rank <= 3 ? (
                  <Medal className="w-3 h-3 text-white/45" />
                ) : (
                  <span className="text-[10px] font-bold text-white/40">{s.rank}</span>
                )}
              </div>

              {/* Name */}
              <span className="min-w-0 flex-1 text-xs font-semibold text-white/80 truncate">
                {s.name}
              </span>

              {/* Stats */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-white/50">
                  <Flame className="w-2.5 h-2.5 text-orange-400/70" />
                  {s.streak}
                </span>
                <span className={`text-[10px] font-bold ${s.accuracy >= 80 ? "text-emerald-400/80" : "text-white/45"}`}>
                  {s.accuracy}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <TrackedLink
          to="/dashboard/leaderboard"
          className="block text-center py-2 text-[10px] font-semibold text-[var(--color-accent-light)]/70 hover:text-[var(--color-accent-light)] transition-colors border-t border-white/[0.05]"
         label="sidebar-leaderboard">
          View full board →
        </TrackedLink>
      </div>
    </div>
  );
}
