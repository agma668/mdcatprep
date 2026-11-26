// Pure mistake-recovery rules shared by the server actions and their tests.
//
// Keeping classification and mastery as pure functions (no database, no clock
// injection needed beyond explicit inputs) means the rules can be unit-tested
// directly and can never drift between the dashboard and the action layer.

export const CLASSIFICATIONS = [
  'incorrect',
  'guessed_correct',
  'guessed_incorrect',
  'slow',
  'flagged',
  'repeatedly_missed',
] as const

export type MistakeClassification = (typeof CLASSIFICATIONS)[number]

export const MISS_REASONS = [
  'did_not_know_concept',
  'forgot_fact',
  'misunderstood_question',
  'confused_two_concepts',
  'calculation_error',
  'careless_error',
  'time_management_issue',
] as const

export type MissReason = (typeof MISS_REASONS)[number]

/**
 * The notebook groups by error type, not by subject: "I did not know it", "I
 * guessed", "I was too slow" and "I flagged it and still got it wrong" are four
 * different problems with four different fixes, and a flat list hides which one
 * is costing the most marks.
 *
 * The mapping is deliberately total — every classification lands in exactly one
 * bucket, so no mistake can be counted by two groups at once. `repeatedly_missed`
 * stays in "wrong" because it is a wrong answer with a longer history; the card
 * still names it in full, so nothing is hidden by the bucket.
 */
export const ERROR_BUCKETS = ["wrong", "guessed", "slow", "flagged"] as const

export type ErrorBucket = (typeof ERROR_BUCKETS)[number]

export const ERROR_BUCKET_LABELS: Record<ErrorBucket, string> = {
  wrong: "Wrong answer",
  guessed: "Guessed",
  slow: "Too slow",
  flagged: "Flagged, still wrong",
}

export function bucketFor(classification: MistakeClassification): ErrorBucket {
  switch (classification) {
    case "guessed_correct":
    case "guessed_incorrect":
      return "guessed"
    case "slow":
      return "slow"
    case "flagged":
      return "flagged"
    case "incorrect":
    case "repeatedly_missed":
      return "wrong"
  }
}

export function isMistakeClassification(value: string): value is MistakeClassification {
  return (CLASSIFICATIONS as readonly string[]).includes(value)
}

export function isMissReason(value: string): value is MissReason {
  return (MISS_REASONS as readonly string[]).includes(value)
}

/** Whether a student may attach this miss reason (all reasons are optional). */
export function validateMissReason(value: string | null | undefined): MissReason | null {
  if (value == null || value === '') return null
  if (!isMissReason(value)) {
    throw new Error(`Unknown miss reason: ${value}`)
  }
  return value
}

export interface AttemptSignals {
  /** Was the chosen answer correct? */
  correct: boolean
  /** Did the student flag the question for revision? */
  flagged?: boolean
  /** Exceeded the per-question time budget. */
  slow?: boolean
  /** The student self-reported guessing on this question. */
  guessed?: boolean
  /** How many earlier attempts on this same question were wrong. */
  priorWrongCount?: number
}

/**
 * Derive the most informative classification for one attempt.
 *
 * Priority is deliberate: a repeatedly-missed question is the strongest signal
 * (it outranks a single guess), then a guess, then slowness, then a plain
 * miss. A flagged-but-correct question is "flagged" only when it is also slow;
 * a fast correct answer is simply correct and should not enter the notebook.
 * Returns null for a correct, unflagged answer — nothing to review.
 */
export function deriveClassification(signals: AttemptSignals): MistakeClassification | null {
  const { correct, flagged, slow, guessed, priorWrongCount = 0 } = signals

  if (correct && !guessed && !flagged) return null
  if (correct && guessed) return 'guessed_correct'

  // From here the answer was wrong (or an explicitly flagged guess).
  if (priorWrongCount >= 2) return 'repeatedly_missed'
  if (guessed) return 'guessed_incorrect'
  if (slow) return 'slow'
  if (flagged) return 'flagged'
  return 'incorrect'
}

/**
 * Evidence threshold for mastery. A student is only "proficient" once they
 * have answered the same question correctly on at least two separate attempts
 * after the mistake. Opening an explanation or viewing a question contributes
 * nothing — mastery must be earned through repeated successful practice, which
 * is exactly the anti-pattern this rule guards against.
 */
export const MASTERY_REQUIRED_CORRECT_STREAK = 2

export interface MasteryEvidence {
  /** Consecutive correct re-attempts on this question (most recent first). */
  correctStreak: number
}

export function hasEarnedMastery(evidence: MasteryEvidence): boolean {
  return evidence.correctStreak >= MASTERY_REQUIRED_CORRECT_STREAK
}
