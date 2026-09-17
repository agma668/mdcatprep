"use client";

import { Trophy, Flame, Zap, Medal, Crown } from "lucide-react";
import { fmtInt, fmtUTCDate, fmtUTCTime } from "@/lib/fmt";
import { motion, MotionConfig } from "framer-motion";
import type { LeaderboardEntry, LeaderboardStats } from "@/lib/leaderboard";

// 12px of travel, not 24, and the row stagger stops compounding after the
// eighth entry — a board with twenty names should not take two seconds to
// finish arriving before it can be read.
const FADE_UP = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

interface Props {
  entries: LeaderboardEntry[];
  stats: LeaderboardStats;
}

export function LeaderboardPreview({ entries, stats }: Props) {
  if (entries.length === 0) return null;

  // Same colour grammar as the totals section above: steel for a settled
  // all-time figure, beacon for the measure that moves week to week.
  const statCards = [
    {
      label: "Total Questions",
      value: fmtInt(stats.totalQuestions),
      icon: Zap,
      live: false,
    },
    {
      label: "Avg Daily Streak",
      value: stats.avgStreak > 0 ? stats.avgStreak + " days" : "—",
      icon: Flame,
      live: true,
    },
  ];

  return (
    <section
      aria-label="Community leaderboard"
      className="section-padding bg-mesh relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -top-32 right-1/4 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,var(--tint-signal)_0%,transparent_62%)]"
      />
      {/* Tells framer to honour prefers-reduced-motion: the rise is dropped and
          the rows and readouts just fade in. */}
      <MotionConfig reducedMotion="user">
        <div className="container-page relative">
        <div className="mb-14 text-center">
          {/* Signal, not brass. This chip is a section label, and a section
              label is never the medal metal — the two earned distinctions on
              this page are the rank-1 crown and a streak of a week or more,
              and they keep champagne to themselves so it still means something
              when it appears. */}
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-signal)] bg-[var(--tint-signal)] px-4 py-1.5 text-xs font-semibold text-[var(--signal-300)]">
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
            Community
          </span>
          <h2 className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl">
            Compete with <span className="text-[var(--signal-200)]">Top Students</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--steel-300)]">
            Ranked by total questions answered — accuracy breaks ties. Practice daily to climb the board.
          </p>
        </div>
        {/* Power stats — real data only. max-w-3xl, matching the board below:
            at max-w-2xl this pair sat 96px narrower than the table directly
            under it, which reads as a misalignment rather than as a
            deliberately different measure. */}
        <div className="mx-auto mb-10 grid max-w-3xl grid-cols-2 gap-4">
          {statCards.map(({ label, value, icon: Icon, live }, i) => (
            <motion.div
              key={label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={FADE_UP}
              className={`rounded-[var(--r-3)] border bg-[var(--srf-1)] p-4 text-center shadow-[var(--shadow-md)] ${
                live ? "border-[var(--line-beacon)]" : "border-[var(--line-2)]"
              }`}
            >
              <Icon
                aria-hidden="true"
                className={`mx-auto mb-2 h-5 w-5 ${
                  live ? "text-[var(--beacon-400)]" : "text-[var(--steel-300)]"
                }`}
              />
              <p
                className={`font-display text-xl font-bold tabular-nums ${
                  live ? "text-[var(--beacon-400)]" : "text-[var(--steel-100)]"
                }`}
              >
                {value}
              </p>
              <p className="mt-1 text-[11px] text-[var(--steel-400)]">{label}</p>
            </motion.div>
          ))}
        </div>
        {/* Leaderboard table. Divs, so the column widths can stay on a 12-track
            grid, but with the table roles a screen reader needs — without them
            this reads aloud as one unbroken run of names and numbers. */}
        <div className="mx-auto max-w-3xl">
          <div
            role="table"
            aria-label="Top students by questions answered"
            className="overflow-hidden rounded-[var(--r-4)] border border-[var(--line-2)] bg-[var(--srf-1)] shadow-[var(--shadow-lg)]"
          >
            <div
              role="row"
              className="grid grid-cols-12 gap-2 border-b border-[var(--line-2)] bg-[var(--srf-2)] px-5 py-3 text-xs font-semibold text-[var(--steel-400)]"
            >
              <div role="columnheader" aria-label="Rank" className="col-span-1">
                #
              </div>
              <div role="columnheader" className="col-span-4">
                Student
              </div>
              <div role="columnheader" className="col-span-2 text-center">
                Streak
              </div>
              <div role="columnheader" className="col-span-2 text-center">
                Accuracy
              </div>
              <div role="columnheader" className="col-span-3 text-right">
                Questions
              </div>
            </div>
            {entries.map((student, i) => {
              const isTop3 = student.rank <= 3;
              return (
                <motion.div
                  key={student.rank}
                  role="row"
                  custom={Math.min(i, 8) + 2}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={FADE_UP}
                  className={`grid grid-cols-12 items-center gap-2 border-b border-[var(--line-1)] px-5 py-3 ${
                    isTop3 ? "bg-[var(--srf-2)]" : ""
                  }`}
                >
                  <div role="cell" className="col-span-1">
                    {student.rank === 1 ? (
                      <Crown className="h-4 w-4 text-[var(--champagne)]" aria-hidden="true" />
                    ) : student.rank <= 3 ? (
                      <Medal className="h-4 w-4 text-[var(--steel-300)]" aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-bold tabular-nums text-[var(--steel-400)]">
                        {student.rank}
                      </span>
                    )}
                  </div>
                  <div role="cell" className="col-span-4">
                    <p
                      className={`text-sm font-semibold ${
                        isTop3 ? "text-[var(--steel-100)]" : "text-[var(--steel-200)]"
                      }`}
                    >
                      {student.name}
                    </p>
                  </div>
                  <div role="cell" className="col-span-2 text-center">
                    {/* A week held is an earned distinction, so it takes the
                        medal metal; anything shorter stays quiet steel. */}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${
                        student.streak >= 7
                          ? "text-[var(--champagne)]"
                          : "text-[var(--steel-400)]"
                      }`}
                    >
                      <Flame className="h-3 w-3" aria-hidden="true" /> {student.streak}
                    </span>
                  </div>
                  <div role="cell" className="col-span-2 text-center">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        student.accuracy >= 80
                          ? "text-[var(--ok)]"
                          : "text-[var(--steel-400)]"
                      }`}
                    >
                      {student.accuracy}%
                    </span>
                  </div>
                  <div role="cell" className="col-span-3 text-right">
                    <span className="text-xs font-bold tabular-nums text-[var(--steel-200)]">
                      {fmtInt(student.questions)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-[var(--steel-400)]">
            Refreshed live from practice records. Answer questions to climb!
          </p>
        </div>
        </div>
      </MotionConfig>
    </section>
  );
}
