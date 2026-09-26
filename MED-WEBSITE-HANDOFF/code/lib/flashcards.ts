/**
 * Flashcard types, constants, and the pure spaced-repetition scheduler.
 *
 * CLIENT-SAFE: this file has zero server dependencies. Import it from
 * client components (FlashcardPlayer) without pulling in any Supabase
 * server code. The actual DB functions live in lib/flashcards-server.ts.
 *
 * MODEL (FSRS-lite, the 4-tier ladder):
 *   Again → <10 min   Hard → 1 day   Good → 3 days   Easy → 7 days
 */

/** The four grades, in ladder order. */
export const GRADES = [0, 1, 2, 3] as const;
export type Grade = (typeof GRADES)[number];

export const GRADE_META: Record<
  Grade,
  { label: string; shortInterval: string; keyHint: string; tone: string }
> = {
  0: { label: "Again", shortInterval: "<10m", keyHint: "1", tone: "rose" },
  1: { label: "Hard", shortInterval: "1d", keyHint: "2", tone: "amber" },
  2: { label: "Good", shortInterval: "3d", keyHint: "3", tone: "emerald" },
  3: { label: "Easy", shortInterval: "7d", keyHint: "4", tone: "sky" },
};

/** Seed intervals (minutes) for a brand-new card, by grade. */
const SEED_MINUTES: Record<Grade, number> = {
  0: 9, // <10 minutes
  1: 24 * 60, // 1 day
  2: 3 * 24 * 60, // 3 days
  3: 7 * 24 * 60, // 7 days
};

/** Growth multipliers once a card already has history. */
const GROWTH: Record<Grade, number> = {
  0: 0, // a lapse resets to the seed
  1: 1.2,
  2: 2.2,
  3: 2.9,
};

/** Cap so an interval never runs away to years. */
const MAX_MINUTES = 180 * 24 * 60; // ~6 months

/**
 * Pure scheduler: given the card's previous state and today's grade, the next
 * state. Exposed for tests; the DB writes go through gradeCard below.
 */
export function nextSchedule(
  prev: { intervalMinutes: number; reps: number; lapses: number },
  grade: Grade
): { intervalMinutes: number; dueMinutes: number; reps: number; lapses: number } {
  const reps = prev.reps + 1;
  if (grade === 0) {
    return { intervalMinutes: SEED_MINUTES[0], dueMinutes: SEED_MINUTES[0], reps, lapses: prev.lapses + 1 };
  }
  const base =
    prev.intervalMinutes > 0 ? prev.intervalMinutes * GROWTH[grade] : SEED_MINUTES[grade];
  const intervalMinutes = Math.min(MAX_MINUTES, Math.max(SEED_MINUTES[grade], Math.round(base)));
  return { intervalMinutes, dueMinutes: intervalMinutes, reps, lapses: prev.lapses };
}

export type FlashcardRow = {
  question_id: string;
  due_at: string;
  interval_minutes: number;
  reps: number;
  lapses: number;
};

export type DueCard = {
  questionId: string;
  subject: string;
  topic: string | null;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string | null;
  optionD: string | null;
  correctAnswer: string;
  explanation: string | null;
  reps: number;
  lapses: number;
};

/** Shape of the honest "not set up" failure the UI branches on. */
export type FlashcardFailure = { unavailable: true; reason: string };

export function isMissingTable(err: { message?: string } | null): boolean {
  if (!err?.message) return false;
  const m = err.message.toLowerCase();
  return (
    m.includes("does not exist") ||
    m.includes("could not find the table") ||
    m.includes("schema cache") ||
    m.includes("relation")
  );
}

/** Export SEED_MINUTES so the server file can use it. */
export { SEED_MINUTES };
