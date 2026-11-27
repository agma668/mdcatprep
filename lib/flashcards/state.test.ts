// Unit tests for the row↔FSRS seam (lib/flashcards/state.ts).
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/flashcards/state.test.ts
//
// These assert the contract both backends depend on: a row written before FSRS
// existed still produces a usable card, a never-reviewed card stays new, an FSRS
// row round-trips without losing memory state, and the preview labels describe
// the interval the scheduler actually assigned.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  difficultyToEase,
  easeToDifficulty,
  previewIntervalLabel,
  reviewRowToFsrsState,
} from './state.ts'
import { scheduleFsrs } from './fsrs.ts'

const NOW = new Date('2026-11-27T10:00:00Z')

test('a never-reviewed row is a new card, due now', () => {
  const state = reviewRowToFsrsState({ due_at: NOW.toISOString(), interval_days: 0 }, NOW)
  assert.equal(state.state, 'new')
  assert.equal(state.reps, 0)
  assert.equal(state.stability, 0)
})

test('a legacy SM-2 row seeds the memory model rather than resetting it', () => {
  const state = reviewRowToFsrsState(
    {
      due_at: NOW.toISOString(),
      interval_days: 6,
      ease_factor: 2.4,
      repetitions: 4,
      times_wrong: 1,
      last_reviewed_at: '2026-11-21T10:00:00Z',
    },
    NOW
  )
  assert.equal(state.state, 'review')
  assert.equal(state.stability, 6, 'stability seeds from the legacy interval')
  assert.equal(state.reps, 4)
  assert.equal(state.lapses, 1)
  assert.ok(Math.abs(state.difficulty - easeToDifficulty(2.4)) < 1e-9)
})

test('an FSRS row round-trips through the scheduler unchanged', () => {
  const reviewed = scheduleFsrs(
    reviewRowToFsrsState({ due_at: NOW.toISOString() }, NOW),
    'good',
    NOW
  ).card
  const row = {
    due_at: reviewed.due,
    stability: reviewed.stability,
    difficulty: reviewed.difficulty,
    fsrs_state: reviewed.state,
    scheduled_days: reviewed.scheduledDays,
    elapsed_days: reviewed.elapsedDays,
    learning_steps: reviewed.learningSteps,
    repetitions: reviewed.reps,
    lapses: reviewed.lapses,
    last_reviewed_at: reviewed.lastReview,
  }
  assert.deepEqual(reviewRowToFsrsState(row, NOW), reviewed)
})

test('preview labels read minutes, days, months and years', () => {
  const base = reviewRowToFsrsState(null, NOW)
  assert.equal(previewIntervalLabel({ ...base, due: addMinutes(NOW, 2) }, NOW), '2m')
  assert.equal(previewIntervalLabel({ ...base, due: addMinutes(NOW, 5 * 60) }, NOW), '5h')
  assert.equal(previewIntervalLabel({ ...base, due: addMinutes(NOW, 3 * 1440) }, NOW), '3d')
  assert.equal(previewIntervalLabel({ ...base, due: addMinutes(NOW, 60 * 1440) }, NOW), '2mo')
  assert.equal(previewIntervalLabel({ ...base, due: addMinutes(NOW, 400 * 1440) }, NOW), '1y')
})

test('difficulty and legacy ease stay inside their published bands', () => {
  for (const difficulty of [-3, 0, 4.2, 7.5, 10, 14]) {
    const ease = difficultyToEase(difficulty)
    assert.ok(ease >= 1.3 && ease <= 3.2)
    const back = easeToDifficulty(ease)
    assert.ok(back >= 0 && back <= 10)
  }
})

function addMinutes(now: Date, minutes: number): string {
  return new Date(now.getTime() + minutes * 60_000).toISOString()
}
