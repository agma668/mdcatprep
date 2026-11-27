// One seam between a persisted review row and the FSRS scheduler.
//
// Two backends write review rows — the signed-in server actions
// (app/actions/flashcards.ts) and the guest localStorage store
// (lib/flashcards/guest-progress.ts) — and they used to run different
// algorithms: FSRS on the server, SM-2-lite in the browser. That meant a guest
// who signed up had a schedule the account could not continue, and "Again" meant
// two different things on two pages of the same site. Both now go through this
// module, so a row means the same thing wherever it came from.
//
// Nothing here invents progress: a row written before the FSRS columns existed
// only has legacy columns, and we seed the memory model from them so the next
// review evolves correctly. A never-reviewed card stays new.

// Explicit .ts extension: this module is unit-tested by running the TypeScript
// directly under node --test (see the test script), where extensionless
// relative imports do not resolve.
import { emptyFsrsState, type FsrsLifecycle, type FsrsState } from "./fsrs.ts";

/** The columns the scheduler reads, from either schema version. */
export type StoredReviewRow = {
  due_at?: string | null;
  stability?: number | null;
  difficulty?: number | null;
  fsrs_state?: string | null;
  scheduled_days?: number | null;
  elapsed_days?: number | null;
  learning_steps?: number | null;
  repetitions?: number | null;
  lapses?: number | null;
  interval_days?: number | null;
  ease_factor?: number | null;
  times_wrong?: number | null;
  times_correct?: number | null;
  last_reviewed_at?: string | null;
};

export function isFsrsLifecycle(value: string | null | undefined): value is FsrsLifecycle {
  return (
    value === "new" || value === "learning" || value === "review" || value === "relearning"
  );
}

/**
 * Legacy `ease_factor` is constrained to [1.3, 3.2]; FSRS difficulty is 0–10.
 * We mirror difficulty into ease so pre-FSRS readers keep working.
 */
export function difficultyToEase(difficulty: number): number {
  const ease = 3.2 - (Math.min(10, Math.max(0, difficulty)) / 10) * 1.9;
  return Math.min(3.2, Math.max(1.3, Number(ease.toFixed(3))));
}

export function easeToDifficulty(ease: number): number {
  const d = ((3.2 - ease) / 1.9) * 10;
  return Math.min(10, Math.max(0, Number(d.toFixed(3))));
}

/**
 * Reconstruct a usable FSRS state from whatever the row carries. New rows (or
 * rows written before the FSRS migration) only have the legacy columns; the
 * next review then evolves correctly under FSRS.
 */
export function reviewRowToFsrsState(
  row: StoredReviewRow | null | undefined,
  now: Date
): FsrsState {
  if (!row) return emptyFsrsState(now);

  const stability = Number(row.stability);
  if (Number.isFinite(stability) && stability > 0 && isFsrsLifecycle(row.fsrs_state)) {
    return {
      due: row.due_at ?? now.toISOString(),
      stability,
      difficulty: Number(row.difficulty) || 5,
      scheduledDays: Number(row.scheduled_days ?? row.interval_days ?? 0),
      elapsedDays: Number(row.elapsed_days ?? 0),
      learningSteps: Number(row.learning_steps ?? 0),
      reps: Number(row.repetitions ?? 0),
      lapses: Number(row.lapses ?? 0),
      state: row.fsrs_state,
      lastReview: row.last_reviewed_at ?? null,
    };
  }

  // Legacy / never-reviewed fallback.
  const reviewed = Boolean(row.last_reviewed_at);
  const interval = Number(row.interval_days ?? 0);
  const lifecycle: FsrsLifecycle = !reviewed
    ? "new"
    : interval > 0
      ? "review"
      : "learning";
  return {
    due: row.due_at ?? now.toISOString(),
    stability: reviewed ? Math.max(interval, 0.1) : 0,
    // A new card has no difficulty yet; seeding one from the default ease made
    // ts-fsrs reject the state ("Invalid memory state"), so grading a row that
    // existed but had never been reviewed could fail outright.
    difficulty: reviewed ? easeToDifficulty(Number(row.ease_factor) || 2.5) : 0,
    scheduledDays: interval,
    elapsedDays: 0,
    learningSteps: 0,
    reps: Number(row.repetitions ?? 0),
    lapses: Number(row.times_wrong ?? 0),
    state: lifecycle,
    lastReview: row.last_reviewed_at ?? null,
  };
}

/**
 * The interval a rating would apply, as Anki prints it on the button.
 *
 * `intervalLabel()` in fsrs.ts describes a card's *current* interval; a preview
 * is about the *next* one, and FSRS learning steps are minutes (1m, 10m), which
 * "scheduledDays: 0" would flatten to "<1d". Reading the actual due distance
 * keeps the four buttons honest — "Again · 2m", "Good · 3d".
 */
export function previewIntervalLabel(state: FsrsState, now: Date = new Date()): string {
  const ms = new Date(state.due).getTime() - now.getTime();
  if (!Number.isFinite(ms)) return "—";
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}
