// Today's plan: what is actually due, plus the smallest useful next step.
//
// Everything here is composed from real state — mistakes on the 1/3/7-day
// ladder, cards FSRS says are due, and the weak areas ranked from the student's
// own attempts. It never promises a score, a rank or a timeline: the minutes
// are rough working estimates, and the page says so.
//
// Pure so the rules can be tested without a database and cannot drift between
// the plan list and its total.

import {
  areaLabel,
  drillHref,
  WEAK_AREA_TARGET_ACCURACY,
  type WeakArea,
} from "./weak-areas.ts";

export const PLAN_KINDS = ["start", "mistakes", "cards", "drill", "mock"] as const;
export type PlanKind = (typeof PLAN_KINDS)[number];

export interface PlanInput {
  /** Weak areas already ranked weakest-first. */
  weakAreas: readonly WeakArea[];
  /** Mistake reviews the notebook can serve right now. */
  dueMistakes: number;
  /** Flashcards FSRS says are due right now. */
  dueCards: number;
  /** Whole days until the primary goal date; null when unset. */
  daysToGoal: number | null;
  /** Whether the student has any recorded attempt at all. */
  hasAttempts: boolean;
}

export interface PlanTask {
  id: string;
  kind: PlanKind;
  title: string;
  detail: string;
  href: string;
  minutes: number;
}

export interface DailyPlan {
  tasks: PlanTask[];
  totalMinutes: number;
  /** One line for the top of the page. */
  headline: string;
  /** What the plan is not, shown beside the total. */
  note: string;
}

const MIN_TASK_MINUTES = 3;
const DRILL_QUESTION_COUNT = 10;
const DRILL_MINUTES = 12;
const MOCK_MINUTES = 45;
/** Past this many days before the goal, a mock stops being a plan and becomes panic. */
const MOCK_WINDOW_DAYS = 14;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function plural(n: number, one: string, many = `${one}s`): string {
  return n === 1 ? one : many;
}

function mistakeTask(dueMistakes: number): PlanTask {
  return {
    id: "mistakes",
    kind: "mistakes",
    title: `Clear ${dueMistakes} ${plural(dueMistakes, "mistake")} due today`,
    detail:
      "These are on the 1/3/7-day ladder. Answering them here records the attempt, so mastery can move.",
    href: "/dashboard/mistake-notebook",
    minutes: clamp(Math.round(dueMistakes), 5, 30),
  };
}

function cardsTask(dueCards: number): PlanTask {
  return {
    id: "cards",
    kind: "cards",
    title: `Review ${dueCards} due ${plural(dueCards, "card")}`,
    detail: "FSRS has these scheduled for today. Rating them is what keeps the schedule honest.",
    href: "/dashboard/flashcards",
    minutes: clamp(Math.ceil(dueCards / 6), MIN_TASK_MINUTES, 25),
  };
}

function drillTask(area: WeakArea, index: number): PlanTask {
  return {
    id: `drill-${index}-${area.subject}-${area.topic ?? "subject"}`,
    kind: "drill",
    title: `${DRILL_QUESTION_COUNT} questions on ${areaLabel(area)}`,
    detail: `${area.accuracy}% across ${area.attempted} attempts — ${area.gap} points below the ${WEAK_AREA_TARGET_ACCURACY}% target.`,
    href: drillHref(area, DRILL_QUESTION_COUNT),
    minutes: DRILL_MINUTES,
  };
}

function mockTask(daysToGoal: number): PlanTask {
  return {
    id: "mock",
    kind: "mock",
    title: "Sit one timed mock",
    detail: `${daysToGoal} ${plural(daysToGoal, "day")} to your goal date. A timed run shows pacing that untimed practice hides.`,
    href: "/dashboard/mock-test",
    minutes: MOCK_MINUTES,
  };
}

function startTask(): PlanTask {
  return {
    id: "start",
    kind: "start",
    title: `Answer ${DRILL_QUESTION_COUNT} questions to start your profile`,
    detail:
      "The plan is built from your own answers. Until there are some, there is nothing honest to rank.",
    href: "/dashboard/practice",
    minutes: DRILL_MINUTES,
  };
}

/**
 * Compose today's plan.
 *
 * Order is deliberate: work that decays if skipped (due mistakes, due cards)
 * comes before work that can wait (a drill), which comes before the optional
 * mock. Two drills at most — a plan with eight items is a list, not a plan.
 */
export function buildDailyPlan(input: PlanInput): DailyPlan {
  const tasks: PlanTask[] = [];

  const dueMistakes = Math.max(0, Math.floor(input.dueMistakes));
  const dueCards = Math.max(0, Math.floor(input.dueCards));

  if (dueMistakes > 0) tasks.push(mistakeTask(dueMistakes));
  if (dueCards > 0) tasks.push(cardsTask(dueCards));

  // A subject row is dropped when one of its topics is already in the plan:
  // "10 questions on Biology · Genetics" followed by "10 questions on Biology"
  // is the same drill twice, not a second priority.
  const seenSubjects = new Set<string>();
  const weak = input.weakAreas
    .filter((area) => {
      if (area.scope === "subject" && seenSubjects.has(area.subject)) return false;
      seenSubjects.add(area.subject);
      return true;
    })
    .slice(0, 2);
  if (weak.length > 0) {
    tasks.push(drillTask(weak[0], 0));
  }

  if (
    input.daysToGoal !== null &&
    input.daysToGoal >= 0 &&
    input.daysToGoal <= MOCK_WINDOW_DAYS
  ) {
    tasks.push(mockTask(input.daysToGoal));
  }

  if (weak.length > 1) {
    tasks.push(drillTask(weak[1], 1));
  }

  if (tasks.length === 0) {
    tasks.push(startTask());
  }

  const totalMinutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  const headline = `${tasks.length} ${plural(tasks.length, "task")} · about ${totalMinutes} minutes`;

  return {
    tasks,
    totalMinutes,
    headline,
    note: input.hasAttempts
      ? "Minutes are rough working estimates, not a promise of what you will score. The plan only uses work you actually have to do today."
      : "This is a starting point, not a diagnosis. Once you have answered some questions, the plan will rank your real weak areas.",
  };
}
