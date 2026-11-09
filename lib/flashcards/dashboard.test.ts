// Unit tests for lib/flashcards/dashboard.ts.
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/flashcards/dashboard.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { queueSize, summariseReviewState, type FlashcardSummary } from './dashboard.ts'
import type { ReviewRow } from './types.ts'

const NOW = new Date('2026-11-09T12:00:00Z')

function row(over: Partial<ReviewRow & { fsrs_state?: string }>): ReviewRow {
  return {
    card_id: 'c',
    due_at: NOW.toISOString(),
    interval_days: 1,
    repetitions: 1,
    ease_factor: 2.5,
    last_rating: 'good',
    last_reviewed_at: NOW.toISOString(),
    times_correct: 1,
    times_wrong: 0,
    ...over,
  } as ReviewRow
}

test('cards with no row are new; rows are counted as reviewed', () => {
  const summary = summariseReviewState(['a', 'b', 'c'], { a: row({ card_id: 'a' }) }, NOW)
  assert.equal(summary.totalCards, 3)
  assert.equal(summary.newCount, 2)
  assert.equal(summary.reviewedCount, 1)
})

test('due, future and learning buckets are separated', () => {
  const byCard: Record<string, ReviewRow> = {
    due: row({ card_id: 'due', due_at: new Date(NOW.getTime() - 1000).toISOString() }),
    future: row({ card_id: 'future', due_at: new Date(NOW.getTime() + 2 * 86_400_000).toISOString() }),
    learning: row({
      card_id: 'learning',
      due_at: new Date(NOW.getTime() - 1000).toISOString(),
      fsrs_state: 'learning',
    } as Partial<ReviewRow>),
    relearning: row({
      card_id: 'relearning',
      due_at: new Date(NOW.getTime() + 86_400_000).toISOString(),
      fsrs_state: 'relearning',
    } as Partial<ReviewRow>),
  }
  const summary = summariseReviewState(['due', 'future', 'learning', 'relearning'], byCard, NOW)
  assert.equal(summary.dueCount, 2) // due + learning (both due now)
  assert.equal(summary.learningCount, 1)
  assert.equal(summary.relearningCount, 1)
  assert.equal(summary.newCount, 0)
})

test('upcoming workload is bucketed by UTC day within seven days', () => {
  const byCard: Record<string, ReviewRow> = {
    d1: row({ card_id: 'd1', due_at: new Date(NOW.getTime() + 86_400_000).toISOString() }),
    d1b: row({ card_id: 'd1b', due_at: new Date(NOW.getTime() + 86_400_000 + 3_600_000).toISOString() }),
    d3: row({ card_id: 'd3', due_at: new Date(NOW.getTime() + 3 * 86_400_000).toISOString() }),
    far: row({ card_id: 'far', due_at: new Date(NOW.getTime() + 30 * 86_400_000).toISOString() }),
  }
  const summary = summariseReviewState(['d1', 'd1b', 'd3', 'far'], byCard, NOW)
  // Two cards land on the same UTC day.
  assert.equal(summary.upcoming.length, 2)
  assert.equal(summary.upcoming[0].count, 2)
  assert.equal(summary.upcoming[1].count, 1)
  // The 30-day card is beyond the horizon and not listed.
  assert.ok(summary.upcoming.every((d) => d.date <= '2026-11-16'))
})

test('upcoming dates are sorted ascending', () => {
  const byCard: Record<string, ReviewRow> = {
    late: row({ card_id: 'late', due_at: new Date(NOW.getTime() + 5 * 86_400_000).toISOString() }),
    soon: row({ card_id: 'soon', due_at: new Date(NOW.getTime() + 86_400_000).toISOString() }),
  }
  const summary = summariseReviewState(['late', 'soon'], byCard, NOW)
  assert.deepEqual(
    summary.upcoming.map((d) => d.date),
    [...summary.upcoming.map((d) => d.date)].sort()
  )
})

test('queue size caps new cards at the limit but never caps due reviews', () => {
  const summary: FlashcardSummary = {
    totalCards: 100,
    newCount: 50,
    dueCount: 10,
    learningCount: 0,
    relearningCount: 0,
    reviewedCount: 50,
    upcoming: [],
  }
  assert.equal(queueSize(summary, 20), 30)
  assert.equal(queueSize(summary, 0), 10)
  assert.equal(queueSize(summary, 100), 60)
})
