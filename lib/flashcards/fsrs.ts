// FSRS spaced-repetition engine for Edweb flashcards.
//
// This is a thin, fully-typed wrapper around the maintained `ts-fsrs` library
// (MIT, https://github.com/open-spaced-repetition/ts-fsrs), which implements
// the Free Spaced Repetition Scheduler algorithm — NOT a fixed-interval
// approximation. Rather than reimplementing memory-model maths by hand we use
// the canonical implementation and adapt its `Card` shape to plain JSON so it
// can be persisted and unit-tested without a database.
//
// Four ratings, matching Anki and the other prep products:
//   again — forgot / drew a blank      -> lapse, short relearning step
//   hard  — recalled with real effort  -> small stability gain
//   good  — recalled correctly         -> standard stability gain
//   easy  — recalled instantly         -> largest stability gain
//
// The scheduler derives, per review:
//   * memory stability   (days until recall probability falls to the target)
//   * card difficulty    (0–10, intrinsic difficulty of the item)
//   * review interval    (scheduled_days)
//   * next due date      (UTC ISO timestamp)
//   * lifecycle state     (new | learning | review | relearning)
//
// All functions here are pure: the caller supplies `now`, so tests control the
// clock and the result never depends on the machine's timezone (dates are
// emitted as UTC ISO strings and only ever compared as epoch milliseconds).

import {
  FSRS,
  Rating,
  State,
  createEmptyCard,
  generatorParameters,
  type Card,
  type Grade,
} from 'ts-fsrs'

export type FsrsRating = 'again' | 'hard' | 'good' | 'easy'

export type FsrsLifecycle = 'new' | 'learning' | 'review' | 'relearning'

/** Serialisable FSRS card state — the persisted memory model for one card. */
export interface FsrsState {
  /** Next review time, UTC ISO. */
  due: string
  /** Memory stability in days (> 0 once the card has been reviewed). */
  stability: number
  /** Intrinsic difficulty, 0–10. */
  difficulty: number
  /** Days scheduled by the previous review. */
  scheduledDays: number
  /** Whole days elapsed since the last review at scheduling time. */
  elapsedDays: number
  /** Position within the (re)learning steps, if any. */
  learningSteps: number
  /** Total successful reviews. */
  reps: number
  /** Total lapses (times the card was forgotten after being learned). */
  lapses: number
  /** Lifecycle bucket. */
  state: FsrsLifecycle
  /** Last review time, UTC ISO, or null for a brand-new card. */
  lastReview: string | null
}

/** One review outcome, retained for history / audit. */
export interface FsrsLogEntry {
  rating: FsrsRating
  state: FsrsLifecycle
  due: string
  stability: number
  difficulty: number
  scheduledDays: number
  review: string
}

export interface FsrsScheduleResult {
  card: FsrsState
  log: FsrsLogEntry
}

// A single deterministic scheduler instance. Fuzz is disabled so identical
// inputs always produce identical schedules (important for tests and for
// preserving review history faithfully). Retention 0.9 and the library's
// default FSRS-6 weights are used.
const scheduler = new FSRS(
  generatorParameters({
    enable_fuzz: false,
    request_retention: 0.9,
    maximum_interval: 36500,
  })
)

const RATING_MAP: Record<FsrsRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
}

const LIFECYCLE_BY_STATE: Record<State, FsrsLifecycle> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
}

const STATE_BY_LIFECYCLE: Record<FsrsLifecycle, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
}

const VALID_RATINGS: readonly FsrsRating[] = ['again', 'hard', 'good', 'easy']

export function isFsrsRating(value: string): value is FsrsRating {
  return (VALID_RATINGS as readonly string[]).includes(value)
}

/** A brand-new, never-reviewed card, due immediately. */
export function emptyFsrsState(now: Date = new Date()): FsrsState {
  return toFsrsState(createEmptyCard(now))
}

/** Review scheduling for one rating. Pure: `now` is the review timestamp. */
export function scheduleFsrs(
  state: FsrsState,
  rating: FsrsRating,
  now: Date = new Date()
): FsrsScheduleResult {
  const card = toCard(state)
  const record = scheduler.next(card, now, RATING_MAP[rating])
  return {
    card: toFsrsState(record.card),
    log: {
      rating,
      state: LIFECYCLE_BY_STATE[record.log.state],
      due: record.log.due.toISOString(),
      stability: record.log.stability,
      difficulty: record.log.difficulty,
      scheduledDays: record.log.scheduled_days,
      review: record.log.review.toISOString(),
    },
  }
}

/**
 * Preview every rating's outcome for a card without committing, so the UI can
 * show the next interval on each button (e.g. "Good · 6d").
 */
export function previewFsrs(
  state: FsrsState,
  now: Date = new Date()
): Record<FsrsRating, FsrsState> {
  const card = toCard(state)
  const preview = scheduler.repeat(card, now)
  return {
    again: toFsrsState(preview[Rating.Again].card),
    hard: toFsrsState(preview[Rating.Hard].card),
    good: toFsrsState(preview[Rating.Good].card),
    easy: toFsrsState(preview[Rating.Easy].card),
  }
}

/** True when a due timestamp is at/before `now`. Both interpreted as UTC. */
export function fsrsIsDue(due: string, now: Date = new Date()): boolean {
  return new Date(due).getTime() <= now.getTime()
}

/** Whole-day interval the scheduler assigned for a rating (for UI labels). */
export function intervalLabel(state: FsrsState): string {
  if (state.state === 'new') return 'new'
  const days = state.scheduledDays
  if (days <= 0) return '<1d'
  if (days < 30) return `${days}d`
  if (days < 365) return `${Math.round(days / 30)}mo`
  return `${Math.round(days / 365)}y`
}

function toCard(state: FsrsState): Card {
  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsedDays,
    scheduled_days: state.scheduledDays,
    learning_steps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: STATE_BY_LIFECYCLE[state.state],
    last_review: state.lastReview ? new Date(state.lastReview) : undefined,
  }
}

function toFsrsState(card: Card): FsrsState {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduledDays: card.scheduled_days,
    elapsedDays: card.elapsed_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: LIFECYCLE_BY_STATE[card.state],
    lastReview: card.last_review ? card.last_review.toISOString() : null,
  }
}
