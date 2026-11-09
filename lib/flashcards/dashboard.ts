// Pure flashcard review-dashboard maths.
//
// The dashboard must never invent progress, so everything here is derived from
// the student's real review rows plus the fixed list of shipped cards:
//   * new        — a card with no review row yet
//   * learning   — FSRS lifecycle 'learning'
//   * relearning — FSRS lifecycle 'relearning'
//   * due        — reviewed, not suspended, due at/before now
//   * upcoming   — reviewed, due in the next seven days, bucketed by UTC day
// Timezone-independent: days are UTC and comparisons are epoch milliseconds.

import type { ReviewRow } from './types'

export interface UpcomingDay {
  /** UTC date, YYYY-MM-DD. */
  date: string
  count: number
}

export interface FlashcardSummary {
  totalCards: number
  newCount: number
  dueCount: number
  learningCount: number
  relearningCount: number
  /** Cards with at least one recorded review (any state). */
  reviewedCount: number
  upcoming: UpcomingDay[]
}

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Optional FSRS columns tolerated when the draft migration is applied. */
type AugmentedRow = ReviewRow & { fsrs_state?: string | null }

export function summariseReviewState(
  cardIds: string[],
  byCard: Record<string, ReviewRow>,
  now: Date = new Date()
): FlashcardSummary {
  const nowMs = now.getTime()
  const horizonMs = nowMs + 7 * 86_400_000

  let newCount = 0
  let dueCount = 0
  let learningCount = 0
  let relearningCount = 0
  let reviewedCount = 0
  const upcomingMap = new Map<string, number>()

  for (const id of cardIds) {
    const row = byCard[id] as AugmentedRow | undefined
    if (!row) {
      newCount += 1
      continue
    }
    reviewedCount += 1

    if (row.fsrs_state === 'learning') learningCount += 1
    else if (row.fsrs_state === 'relearning') relearningCount += 1

    const dueMs = new Date(row.due_at).getTime()
    if (Number.isNaN(dueMs)) continue
    if (dueMs <= nowMs) {
      // Learning/relearning cards that are due also count toward the queue.
      dueCount += 1
    } else if (dueMs <= horizonMs) {
      const key = dayKey(dueMs)
      upcomingMap.set(key, (upcomingMap.get(key) ?? 0) + 1)
    }
  }

  const upcoming = [...upcomingMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalCards: cardIds.length,
    newCount,
    dueCount,
    learningCount,
    relearningCount,
    reviewedCount,
    upcoming,
  }
}

/**
 * How many of the due queue fit under the student's daily new-card limit.
 * New cards are surfaced only up to the limit; due reviews are always shown
 * because forgetting is not the student's fault and should never be capped.
 */
export function queueSize(summary: FlashcardSummary, dailyNewLimit: number): number {
  const limit = Math.max(0, Math.floor(dailyNewLimit))
  return summary.dueCount + Math.min(summary.newCount, limit)
}
