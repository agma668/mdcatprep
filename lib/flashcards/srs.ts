// SM-2-lite spaced-repetition scheduling for flashcards.
//
// Four ratings, same vocabulary as Anki:
//   again — wrong / drew a blank -> stays in today's queue (10-minute step)
//   hard  — right but effortful  -> short interval, ease drops slightly
//   good  — right, comfortable   -> standard interval growth
//   easy  — right, instant       -> interval grows faster, ease rises
//
// Deliberately simplified from full SM-2: no per-card lapse bookkeeping, no
// separate relearning queue. A card is either learning (repetitions < 2,
// minute-scale steps) or reviewing (day-scale steps). That is enough for a
// school exam's horizon and keeps the whole engine in one pure function that
// is trivially testable.

export type CardRating = 'again' | 'hard' | 'good' | 'easy'

export interface SrsState {
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export interface ScheduledState extends SrsState {
  /** Next review time (ISO string). */
  dueAt: string
  /** True while the card is in its minute-scale learning steps. */
  isLearning: boolean
}

const MIN_EASE = 1.3
const MAX_EASE = 3.2

/** Minute-scale learning steps before a card graduates to day-scale review. */
const LEARNING_STEPS_MINUTES = [10, 60 * 24] as const

/** "Good" day-scale multipliers per repetition round (capped below). */
const GOOD_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60] as const

/** Hard cards grow at a fixed slow rate regardless of ease. */
const HARD_INTERVAL_DAYS = 1
/** Easy bonus multiplies the interval beyond "good". */
const EASY_BONUS = 1.3
/** Cap so no card disappears for half a year mid-session. */
const MAX_INTERVAL_DAYS = 120

export function scheduleCard(
  state: SrsState,
  rating: CardRating,
  now: Date = new Date()
): ScheduledState {
  let { easeFactor, intervalDays, repetitions } = state

  // Ease drifts with the rating, clamped — "again" punishes hardest.
  const easeDelta =
    rating === 'again' ? -0.2 : rating === 'hard' ? -0.15 : rating === 'easy' ? 0.15 : 0
  easeFactor = Math.min(MAX_EASE, Math.max(MIN_EASE, easeFactor + easeDelta))

  if (rating === 'again') {
    // Blank/wrong: back to step 1 of learning, today.
    repetitions = 0
    intervalDays = 0
    return {
      easeFactor,
      intervalDays,
      repetitions,
      dueAt: addMinutes(now, LEARNING_STEPS_MINUTES[0]).toISOString(),
      isLearning: true,
    }
  }

  // Learning phase: fixed minute steps regardless of rating.
  if (repetitions < LEARNING_STEPS_MINUTES.length && intervalDays === 0) {
    const step = rating === 'hard' ? Math.max(0, repetitions) : repetitions + 1
    repetitions = Math.min(step, LEARNING_STEPS_MINUTES.length)
    const isLearning = repetitions < LEARNING_STEPS_MINUTES.length
    const minutes = isLearning
      ? LEARNING_STEPS_MINUTES[repetitions]
      : // Graduating: today's "good" becomes 1 day, "easy" skips ahead.
        rating === 'easy'
        ? 2 * 24 * 60
        : 24 * 60
    return {
      easeFactor,
      intervalDays: isLearning ? 0 : minutes / (24 * 60),
      repetitions,
      dueAt: addMinutes(now, minutes).toISOString(),
      isLearning,
    }
  }

  // Review phase: day-scale intervals.
  repetitions += 1
  if (rating === 'hard') {
    intervalDays = Math.max(HARD_INTERVAL_DAYS, Math.round(intervalDays * 1.2))
  } else if (rating === 'easy') {
    const base =
      intervalDays > 0 ? intervalDays : GOOD_INTERVALS_DAYS[Math.min(repetitions - 1, GOOD_INTERVALS_DAYS.length - 1)]
    intervalDays = Math.round(base * EASY_BONUS * easeFactor)
  } else {
    intervalDays =
      intervalDays > 0
        ? Math.round(intervalDays * easeFactor)
        : GOOD_INTERVALS_DAYS[Math.min(repetitions - 1, GOOD_INTERVALS_DAYS.length - 1)]
  }
  intervalDays = Math.min(Math.max(intervalDays, 1), MAX_INTERVAL_DAYS)

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueAt: addDaysToDate(now, intervalDays).toISOString(),
    isLearning: false,
  }
}

/** True when a due_at timestamp is at/before now. */
export function isDue(dueAt: string, now: Date = new Date()): boolean {
  return new Date(dueAt).getTime() <= now.getTime()
}

function addMinutes(d: Date, minutes: number): Date {
  return new Date(d.getTime() + minutes * 60 * 1000)
}

function addDaysToDate(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000)
}
