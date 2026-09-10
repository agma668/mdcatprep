"use client";

import { motion, MotionConfig } from "framer-motion";
import { CheckCircle, CalendarRange, Target, TrendingUp, Users } from "lucide-react";
import { StatsAsOf } from "@/components/shared/StatsAsOf";

// Real community numbers computed by lib/public-stats.ts over real students'
// attempts only (demo accounts are excluded). Every value here is passed from
// the server — this component never shows an invented figure.

export interface AnalyticsStats {
  accuracy: number;
  questionsAnswered: number;
  answeredLast30Days: number;
  activeStudentsThisWeek: number;
  /** ISO timestamp of when these counts were computed. */
  asOf: string;
}

// One pass across the row rather than four separate entrances: 70ms apart and
// 12px of travel, so the readouts settle instead of parading in.
const FADE_UP = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export function AnalyticsPreview({ analytics }: { analytics: AnalyticsStats }) {
  // Two settled all-time totals and two rolling windows. The previous version
  // gave each card its own hue — emerald, blue, gold, purple — which made four
  // related readings look like four unrelated things. Colour now carries the
  // one distinction that matters: steel for history that has finished, beacon
  // for the counts still moving this week.
  const cards = [
    {
      label: "Overall Accuracy",
      value: analytics.accuracy > 0 ? `${analytics.accuracy}%` : "—",
      sub: "real students, all-time",
      icon: Target,
      live: false,
    },
    {
      label: "Questions Answered",
      value: analytics.questionsAnswered.toLocaleString(),
      sub: "all-time, real students",
      icon: CheckCircle,
      live: false,
    },
    {
      label: "Answered in 30 Days",
      value: analytics.answeredLast30Days.toLocaleString(),
      sub: "the last 30 days",
      icon: CalendarRange,
      live: true,
    },
    {
      label: "Active This Week",
      value: analytics.activeStudentsThisWeek.toLocaleString(),
      sub: "students practising",
      icon: Users,
      live: true,
    },
  ];

  return (
    <section
      aria-label="Community practice totals"
      className="section-padding bg-mesh relative overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/4 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,var(--tint-signal)_0%,transparent_62%)]"
      />
      {/* framer only honours prefers-reduced-motion when it is told to. With
          this, the 12px rise is dropped for anyone who asked for less motion
          and the cards simply fade in. */}
      <MotionConfig reducedMotion="user">
        <div className="container-page relative">
        <div className="mb-14 text-center">
          {/* Beacon, not brass: this chip is a claim about live data, and beacon
              is the one token reserved for numbers that are still moving. */}
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-beacon)] bg-[var(--tint-beacon)] px-4 py-1.5 text-xs font-semibold text-[var(--beacon-400)]">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> Real Community Numbers
          </span>
          <h2 className="mb-4 text-3xl text-[var(--steel-100)] sm:text-4xl">
            Track Every <span className="text-[var(--signal-200)]">Detail</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--steel-300)]">
            Live totals from every approved student&apos;s practice records —
            no estimates, refreshed on every visit.
          </p>
        </div>
        {/* Full container width on purpose. This 4-up strip sits directly above
            the 4-up exam-countdown grid, which spans the whole container-page;
            when this one was capped at max-w-4xl the two adjacent grids had
            different gutters (890px vs 1104px at 1440) and the misalignment was
            the first thing the eye caught. The hero's own 4-up stat row is
            full-width too, so all three now share one measure. */}
        <div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map(({ label, value, sub, icon: Icon, live }, i) => (
              <motion.div
                key={label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={FADE_UP}
                className={`group rounded-[var(--r-3)] border bg-[var(--srf-1)] p-5 shadow-[var(--shadow-md)] transition-[border-color,background-color] duration-[var(--dur-2)] ease-[var(--ease-out-quart)] hover:bg-[var(--srf-2)] ${
                  live
                    ? "border-[var(--line-beacon)]"
                    : "border-[var(--line-2)] hover:border-[var(--line-3)]"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--steel-400)]">{label}</p>
                  {/* Inner radius = outer − padding, so the chip sits concentric
                      inside the card corner rather than fighting it. */}
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--r-1)] ${
                      live
                        ? "bg-[var(--tint-beacon)] text-[var(--beacon-400)]"
                        : "bg-[var(--srf-3)] text-[var(--steel-300)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p
                  className={`font-display text-2xl font-bold tabular-nums ${
                    live ? "text-[var(--beacon-400)]" : "text-[var(--steel-100)]"
                  }`}
                >
                  {value}
                </p>
                <p className="mt-1 text-[11px] text-[var(--steel-400)]">{sub}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] text-[var(--steel-400)]">
            Accuracy and question totals cover real students only — practice accounts are never counted in these numbers.
          </p>
          <div className="mt-3 flex justify-center">
            <StatsAsOf asOf={analytics.asOf} />
          </div>
        </div>
        </div>
      </MotionConfig>
    </section>
  );
}
