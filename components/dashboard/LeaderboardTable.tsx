"use client";

import { TrackedLink } from "@/components/TrackedLink";
import Link from "next/link";
import { fmtInt, fmtUTCDate, fmtUTCTime } from "@/lib/fmt";
import { Trophy, Flame, Users, Target, TrendingUp } from "lucide-react";
import type { LeaderboardEntry, LeaderboardStats, SelfRankInfo } from "@/lib/leaderboard";
import { ChallengeButton } from "./ChallengeButton";

function medalFor(rank: number): { ring: string; label: string } {
  if (rank === 1) return { ring: "bg-[#e8c96a] text-[#1a1406]", label: "Gold" };
  if (rank === 2) return { ring: "bg-[#c9d1d9] text-[#111820]", label: "Silver" };
  if (rank === 3) return { ring: "bg-[#c98a5a] text-[#241206]", label: "Bronze" };
  return { ring: "bg-white/[0.06] text-white/60", label: "" };
}

export function LeaderboardTable({
  entries,
  stats,
  self = null,
}: {
  entries: LeaderboardEntry[];
  stats: LeaderboardStats;
  /** The signed-in student's own rank, only when they are ranked BELOW the
   *  visible board — students the table already shows get nothing extra. */
  self?: SelfRankInfo | null;
}) {
  const hasBoard = entries.length > 0;

  return (
    <div className="space-y-6">
      {/* Community stats band */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <Users className="w-3.5 h-3.5" /> Students
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-white">
            {fmtInt(stats.totalStudents)}
          </p>
        </div>
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <Target className="w-3.5 h-3.5" /> Questions
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-white">
            {fmtInt(stats.totalQuestions)}
          </p>
        </div>
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <Flame className="w-3.5 h-3.5" /> Avg streak
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-white">{stats.avgStreak}</p>
        </div>
      </div>

      {!hasBoard ? (
        <div className="glass-tile-glow rounded-[var(--radius-xl)] border border-white/10 p-10 text-center">
          <Trophy className="w-10 h-10 mx-auto text-[var(--color-primary)]/70" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-extrabold text-white">The board is warming up</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
            Rankings appear as students solve questions — accuracy and streaks update live.
            Be the first name students see when they open the board.
          </p>
          <TrackedLink
            to="/dashboard/practice"
            className="mt-6 inline-flex rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-light)]"
           label="leaderboard-empty">
            Start practising
          </TrackedLink>
        </div>
      ) : (
        <div className="glass-tile-glow overflow-hidden rounded-[var(--radius-xl)] border border-white/10">
          {/* Column header */}
          <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.02] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <span className="w-10 shrink-0">Rank</span>
            <span className="flex-1 truncate">Student</span>
            <span className="hidden w-16 text-right sm:block">Accuracy</span>
            <span className="w-20 text-right">Questions</span>
            <span className="hidden w-16 text-right sm:block">Streak</span>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {entries.map((s) => {
              const medal = medalFor(s.rank);
              return (
                <div
                  key={s.rank}
                  className={`flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors ${
                    s.rank === 1
                      ? "bg-gradient-to-r from-[var(--color-primary)]/[0.10] via-transparent to-transparent"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${medal.ring} ${
                      s.rank <= 3 ? "shadow-[var(--glow-brass)]" : ""
                    }`}
                    title={medal.label}
                  >
                    {s.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">{s.name}</span>
                  <span
                    className={`hidden w-16 text-right text-xs font-bold tabular-nums sm:block ${
                      s.accuracy >= 85 ? "text-emerald-400" : s.accuracy >= 70 ? "text-[var(--color-primary-light)]" : "text-white/50"
                    }`}
                  >
                    {s.accuracy}%
                  </span>
                  <span className="w-20 text-right text-sm font-extrabold tabular-nums text-[var(--color-primary-light)]">
                    {fmtInt(s.questions)}
                  </span>
                  <span className="hidden w-16 items-center justify-end gap-1 text-right text-xs font-bold tabular-nums text-white/60 sm:flex">
                    <Flame className="h-3.5 w-3.5 text-orange-400/80" />
                    {s.streak}
                  </span>
                  {s.studentId && <ChallengeButton opponentId={s.studentId} opponentName={s.name} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Your rank — only for students the top-15 table does not show. All
          numbers come from the same ranked rows as the board above. */}
      {self && (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-primary)]/25 bg-gradient-to-br from-[var(--color-primary)]/[0.07] to-transparent p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-base font-extrabold tabular-nums text-[var(--color-primary-light)] ring-1 ring-[var(--color-primary)]/30">
                #{self.rank}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                  Your rank
                </p>
                <p className="text-base font-extrabold text-white">
                  You&apos;re #{self.rank} — the board shows the top {entries.length}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Questions
                </p>
                <p className="mt-0.5 text-lg font-extrabold tabular-nums text-white">
                  {fmtInt(self.questions)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Accuracy
                </p>
                <p
                  className={`mt-0.5 text-lg font-extrabold tabular-nums ${
                    self.accuracy >= 85
                      ? "text-emerald-400"
                      : self.accuracy >= 70
                        ? "text-[var(--color-primary-light)]"
                        : "text-white/70"
                  }`}
                >
                  {self.accuracy}%
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-4 text-sm text-[var(--color-text-secondary)]">
            <TrendingUp className="h-4 w-4 shrink-0 text-[var(--color-primary-light)]" aria-hidden="true" />
            {self.questionsNeeded} more{' '}
            {self.questionsNeeded === 1 ? "question" : "questions"} to pass #{self.aboveRank} — keep going.
          </p>
        </div>
      )}

      <p className="text-center text-[11px] text-[var(--color-text-muted)]">
        Ranking by total questions solved — every subject drill, mock test and daily quiz counts.
      </p>
    </div>
  );
}
