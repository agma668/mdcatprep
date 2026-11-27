import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  Layers,
  RotateCcw,
  Target,
} from "lucide-react";

import { getMyGoals } from "@/app/actions/goals";
import { getFlashcardDashboard } from "@/app/actions/flashcards";
import { getMyMistakeReviews } from "@/app/actions/mistakes";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { fetchAttempts } from "@/lib/analytics/fetch-attempts";
import { buildDailyPlan } from "@/lib/plan/daily-plan";
import {
  MIN_TOPIC_ATTEMPTS,
  WEAK_AREA_TARGET_ACCURACY,
  areaLabel,
  drillHref,
  rankWeakAreas,
  type WeakArea,
} from "@/lib/plan/weak-areas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Study Plan" };

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const MAX_TOPIC_ROWS = 8;
const MAX_SUBJECT_ROWS = 5;

const TASK_ICONS = {
  start: Target,
  mistakes: RotateCcw,
  cards: Layers,
  drill: Target,
  mock: ClipboardCheck,
} as const;

/** Whole days from today (UTC) to a yyyy-mm-dd goal date. */
function daysUntil(dateISO: string | null): number | null {
  if (!dateISO) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateISO);
  if (!match) return null;
  const target = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / DAY_MS);
}

function lastSeenLabel(area: WeakArea): string {
  if (area.daysSinceLastAttempt === 0) return "last tried today";
  if (area.daysSinceLastAttempt === 1) return "last tried yesterday";
  return `last tried ${area.daysSinceLastAttempt} days ago`;
}

function WeakAreaRow({ area, rank }: { area: WeakArea; rank: number }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-border bg-card p-4">
      <span className="w-5 shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{areaLabel(area)}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {area.attempted} attempts · {area.correct} correct · {lastSeenLabel(area)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span
          className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-foreground/10 sm:block"
          aria-hidden="true"
        >
          <span
            className="block h-full rounded-full bg-rose-400"
            style={{ width: `${area.accuracy}%` }}
          />
        </span>
        <span className="rounded-full border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[11px] font-bold text-rose-400">
          {area.accuracy}%
        </span>
        <Link
          href={drillHref(area)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline"
        >
          Practise <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

export default async function StudyPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [attempts, mistakeReviews, flashcards, goals] = await Promise.all([
    fetchAttempts(user.id),
    getMyMistakeReviews(),
    getFlashcardDashboard().catch(() => null),
    getMyGoals(),
  ]);

  const report = rankWeakAreas(attempts);
  const weakAreas = [...report.topics, ...report.subjects];

  // Same rule as the notebook's due count: unmastered, on the ladder and
  // answerable. The run caps at 200, so the plan caps the same way.
  const dueMistakes = Math.min(
    200,
    (mistakeReviews.reviews ?? []).filter(
      (review) => !review.mastered && review.retry?.due && review.question_text !== null
    ).length
  );
  const dueCards = flashcards?.summary.dueCount ?? 0;

  const activeGoal =
    goals.find((goal) => goal.isPrimary && goal.status === "active") ??
    goals.find((goal) => goal.status === "active") ??
    null;
  const daysToGoal = daysUntil(activeGoal?.targetDate ?? null);

  const plan = buildDailyPlan({
    weakAreas,
    dueMistakes,
    dueCards,
    daysToGoal,
    hasAttempts: attempts.length > 0,
  });

  const hasWeakAreas = weakAreas.length > 0;

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Today"
        title="Your study plan"
        description="Built from what you have actually answered — mistakes due on the ladder, cards FSRS has scheduled, and the topics your own accuracy puts below target."
      />

      {/* Where the goal date comes from, and when there isn't one. */}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex items-center gap-3">
          <CalendarClock className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <div>
            {activeGoal ? (
              <>
                <p className="text-sm font-bold text-foreground">
                  {daysToGoal !== null && daysToGoal >= 0
                    ? `${daysToGoal} ${daysToGoal === 1 ? "day" : "days"} to your goal date`
                    : daysToGoal !== null
                      ? "Your goal date has passed"
                      : "Goal saved without a date"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {activeGoal.examTitle} · {activeGoal.variantTitle}
                  {activeGoal.targetDate ? ` · ${activeGoal.targetDate}` : ""}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-foreground">No goal date set</p>
                <p className="text-[11px] text-muted-foreground">
                  Add one to see a countdown and get a timed mock in the final two weeks.
                </p>
              </>
            )}
          </div>
        </div>
        <Link
          href="/dashboard/goals"
          className="text-[11px] font-bold text-accent hover:underline"
        >
          {activeGoal ? "Manage goals" : "Set a goal date"} →
        </Link>
      </section>

      {/* The plan itself. */}
      <section aria-labelledby="plan-heading" className="mb-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="plan-heading" className="text-xs font-bold uppercase tracking-wider text-foreground">
            Today&apos;s plan
          </h2>
          <p className="text-[11px] font-semibold text-muted-foreground">{plan.headline}</p>
        </div>

        <ol className="space-y-3">
          {plan.tasks.map((task, index) => {
            const Icon = TASK_ICONS[task.kind];
            return (
              <li
                key={task.id}
                className="flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">
                    <span className="mr-1.5 tabular-nums text-muted-foreground">{index + 1}.</span>
                    {task.title}
                  </p>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                    {task.detail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    ~{task.minutes} min
                  </span>
                  <Link
                    href={task.href}
                    className="inline-flex items-center gap-1 rounded-xl bg-accent px-3.5 py-2 text-[11px] font-bold text-accent-foreground shadow-sm"
                  >
                    Start <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{plan.note}</p>
      </section>

      {/* The ranked weak areas behind the drills. */}
      <section aria-labelledby="weak-heading">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2
            id="weak-heading"
            className="text-xs font-bold uppercase tracking-wider text-foreground"
          >
            Where the marks are leaking
          </h2>
          <p className="text-[11px] font-semibold text-muted-foreground">
            {report.topics.length + report.subjects.length} below the {WEAK_AREA_TARGET_ACCURACY}%
            target with enough evidence
          </p>
        </div>
        <p className="mb-4 max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
          Ranked by how far below target a topic sits, how much evidence backs it and how recent
          that evidence is. No exam weighting is applied, because the academy has no verified
          per-topic weighting for this exam — a guessed weight would make the order look more
          authoritative than it is.
        </p>

        {!hasWeakAreas ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            {attempts.length === 0 ? (
              <>
                <p className="text-sm font-bold text-foreground">Nothing to rank yet</p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                  Answer {MIN_TOPIC_ATTEMPTS}+ questions in a topic and it can be judged. The plan
                  above starts with the smallest real step.
                </p>
                <Link
                  href="/dashboard/practice"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-foreground"
                >
                  Start practising <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-foreground">
                  Nothing below target with enough evidence
                </p>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                  That is either good news or a sign the samples are still small. The details
                  below say which.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {report.topics.length > 0 ? (
              <div>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  By topic
                </h3>
                <ol className="space-y-2">
                  {report.topics.slice(0, MAX_TOPIC_ROWS).map((area, index) => (
                    <WeakAreaRow key={`${area.subject}-${area.topic}`} area={area} rank={index + 1} />
                  ))}
                </ol>
              </div>
            ) : null}

            {report.subjects.length > 0 ? (
              <div>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  By subject
                </h3>
                <ol className="space-y-2">
                  {report.subjects.slice(0, MAX_SUBJECT_ROWS).map((area, index) => (
                    <WeakAreaRow key={area.subject} area={area} rank={index + 1} />
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        )}

        {/* What was left out, and why. */}
        <div className="mt-5 space-y-1.5 text-[11px] leading-relaxed text-muted-foreground">
          {report.belowThresholdTopics > 0 ? (
            <p>
              {report.belowThresholdTopics}{" "}
              {report.belowThresholdTopics === 1 ? "topic has" : "topics have"} fewer than{" "}
              {MIN_TOPIC_ATTEMPTS} attempts — too little to judge, so left out rather than ranked.
            </p>
          ) : null}
          {report.unlabelledAttempts > 0 ? (
            <p>
              {report.unlabelledAttempts}{" "}
              {report.unlabelledAttempts === 1 ? "attempt is" : "attempts are"} not linked to a
              subject, so {report.unlabelledAttempts === 1 ? "it is" : "they are"} counted nowhere
              here.
            </p>
          ) : null}
          <p>
            Accuracy is correct answers ÷ attempts, all time, on this account only. It is not a
            predicted exam score.
          </p>
        </div>
      </section>
    </div>
  );
}
