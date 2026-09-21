import { Users, BookOpenCheck, BadgeCheck, Flame } from "lucide-react";
import type { PublicAnalyticsStats } from "@/lib/public-stats";
import { BANK_TOTAL, formatStat } from "@/lib/stats";

/**
 * Compact social-proof bar that sits just under the hero, above the colleges
 * strip — the first reassurance a prospective student reads after the CTA.
 *
 * Every number is real and comes from the same `getPublicStats` seam the hero
 * reads, so a figure here can never disagree with a figure there, and demo
 * accounts never count toward either. Server-rendered (no "use client"), so
 * there is no hydration gap and the values arrive in the served HTML.
 *
 * Fail-open: when the analytics seam could not be verified (DB unreachable) the
 * bar drops to one honest product fact — the live bank size from `lib/stats.ts`,
 * the ONE owner of that figure — rather than inventing activity. That is the
 * only behavioural difference from the cadet site's original, which hardcoded
 * its fallback figure and would have drifted from its own bank.
 *
 * Weekly-active is deliberately held out of the strip at the community's
 * current size: "2" beside a large answered-count reads as ghost-town, so the
 * all-time and 30-day volumes carry the proof. The swap-back is the one branch
 * below, and it turns itself on at double digits.
 */

interface Stat {
  value: string;
  label: string;
  icon: typeof Users;
}

export function SocialProofBar({ analytics }: { analytics: PublicAnalyticsStats | null }) {
  const stats: Stat[] = analytics
    ? [
        {
          value: formatStat(Math.max(analytics.questionsAnswered, 0)),
          label: "Questions answered by real students",
          icon: BookOpenCheck,
        },
        {
          value: formatStat(analytics.answeredLast30Days),
          label: "Attempts in the last 30 days",
          icon: Flame,
        },
        {
          value:
            analytics.activeStudentsThisWeek >= 10
              ? formatStat(analytics.activeStudentsThisWeek)
              : "Daily",
          label:
            analytics.activeStudentsThisWeek >= 10
              ? "Students practising this week"
              : "Practice habit, built daily",
          icon: Users,
        },
        { value: "100%", label: "Free for every student", icon: BadgeCheck },
      ]
    : [
        { value: formatStat(BANK_TOTAL), label: "Questions in the bank", icon: BookOpenCheck },
        { value: "100%", label: "Free for every student", icon: BadgeCheck },
      ];

  // The fallback carries two stats, not four: a fixed 4-column grid would
  // leave the two unused cells showing the separator colour as a bare grey
  // slab on desktop. Columns follow the count instead (the cadet original
  // renders that slab in its degraded state).
  const columnClass = stats.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2";

  return (
    <section
      aria-label="Social proof"
      className="border-b border-[var(--line-2)] bg-[var(--field-1)]"
    >
      <div className="container-page">
        <div className={`grid ${columnClass} gap-px overflow-hidden bg-[var(--line-2)]`}>
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-3 bg-[var(--field-1)] px-6 py-5 sm:justify-start"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--r-2)] border border-[var(--line-signal)] bg-[var(--tint-signal)]"
              >
                <Icon className="h-5 w-5 text-[var(--signal-300)]" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums leading-none text-[var(--steel-100)]">
                  {value}
                </p>
                <p className="mt-1 text-xs text-[var(--steel-300)]">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
