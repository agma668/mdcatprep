// Unit tests for the FSRS engine (lib/flashcards/fsrs.ts).
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/flashcards/fsrs.test.ts
//
// These assert the behavioural contract the flashcard actions depend on:
// the four ratings behave monotonically, a forgotten card re-enters learning,
// scheduling is deterministic, due dates are correct and timezone-independent,
// and the memory model (stability grows, difficulty stays bounded).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  emptyFsrsState,
  scheduleFsrs,
  previewFsrs,
  fsrsIsDue,
  isFsrsRating,
  type FsrsState,
} from './fsrs.ts'

const NOW = new Date('2026-09-10T10:00:00Z')

function daysUntil(iso: string): number {
  return (new Date(iso).getTime() - NOW.getTime()) / 86_400_000
}

test('a fresh card is new, due immediately, with no memory state', () => {
  const card = emptyFsrsState(NOW)
  assert.equal(card.state, 'new')
  assert.equal(card.reps, 0)
  assert.equal(card.lapses, 0)
  assert.equal(card.stability, 0)
  assert.equal(fsrsIsDue(card.due, NOW), true)
})

test('first review of each rating schedules a future due date', () => {
  for (const rating of ['again', 'hard', 'good', 'easy'] as const) {
    const { card } = scheduleFsrs(emptyFsrsState(NOW), rating, NOW)
    assert.ok(new Date(card.due).getTime() > NOW.getTime(), `${rating} must be due in the future`)
    assert.equal(card.reps, 1)
    assert.ok(card.stability > 0, `${rating} must establish stability`)
  }
})

test('easy schedules at least as far out as good, and good at least as far as hard', () => {
  const base = emptyFsrsState(NOW)
  const hard = scheduleFsrs(base, 'hard', NOW).card
  const good = scheduleFsrs(base, 'good', NOW).card
  const easy = scheduleFsrs(base, 'easy', NOW).card
  assert.ok(
    new Date(easy.due).getTime() >= new Date(good.due).getTime(),
    'easy should not be due before good'
  )
  assert.ok(
    new Date(good.due).getTime() >= new Date(hard.due).getTime(),
    'good should not be due before hard'
  )
})

test('again on a learned card triggers a lapse and relearning', () => {
  // Graduate a card into the review state first.
  let card: FsrsState = emptyFsrsState(NOW)
  for (let i = 0; i < 3; i++) {
    card = scheduleFsrs(card, 'good', NOW).card
  }
  assert.equal(card.state, 'review')
  const lapsesBefore = card.lapses

  const forgotten = scheduleFsrs(card, 'again', NOW)
  assert.equal(forgotten.card.state, 'relearning')
  assert.equal(forgotten.card.lapses, lapsesBefore + 1)
  assert.ok(forgotten.card.stability < card.stability, 'a lapse must reduce stability')
})

test('repeated good reviews grow stability and push the due date further', () => {
  // Review on each scheduled due date, as a real student would. Reviewing at
  // the same instant is a no-op for memory (elapsed = 0), so advancing the
  // clock is what exercises stability growth.
  let card = emptyFsrsState(NOW)
  let clock = NOW
  const stabilities: number[] = []
  const dues: number[] = []
  for (let i = 0; i < 5; i++) {
    card = scheduleFsrs(card, 'good', clock).card
    stabilities.push(card.stability)
    dues.push(new Date(card.due).getTime())
    clock = new Date(card.due)
  }
  for (let i = 1; i < stabilities.length; i++) {
    assert.ok(
      stabilities[i] >= stabilities[i - 1],
      `stability should not shrink on repeated success (${stabilities[i - 1]} -> ${stabilities[i]})`
    )
  }
  assert.ok(stabilities[stabilities.length - 1] > stabilities[0])
  for (let i = 1; i < dues.length; i++) {
    assert.ok(dues[i] >= dues[i - 1], 'due date should not move backwards')
  }
})

test('difficulty stays within the FSRS 0–10 band', () => {
  let card = emptyFsrsState(NOW)
  for (let i = 0; i < 12; i++) card = scheduleFsrs(card, 'again', NOW).card
  assert.ok(card.difficulty >= 0 && card.difficulty <= 10)
  for (let i = 0; i < 12; i++) card = scheduleFsrs(card, 'easy', NOW).card
  assert.ok(card.difficulty >= 0 && card.difficulty <= 10)
})

test('scheduling is deterministic for identical inputs', () => {
  const base = emptyFsrsState(NOW)
  const a = scheduleFsrs(base, 'good', NOW).card
  const b = scheduleFsrs(base, 'good', NOW).card
  assert.deepEqual(a, b)
})

test('due dates are absolute UTC instants, independent of local timezone', () => {
  const base = emptyFsrsState(NOW)
  const card = scheduleFsrs(base, 'good', NOW).card
  // ISO strings round-trip to the same epoch millisecond.
  assert.equal(new Date(card.due).toISOString(), card.due)
  assert.ok(card.due.endsWith('Z'))

  // A card scheduled for ~1 day lands ~1 day out regardless of locale.
  const oneDayStates = scheduleFsrs({ ...base, state: 'review', stability: 5, difficulty: 5, reps: 3, scheduledDays: 5 }, 'good', NOW).card
  assert.ok(daysUntil(oneDayStates.due) >= 1)
})

test('fsrsIsDue treats the boundary as due and future as not due', () => {
  const past = new Date(NOW.getTime() - 60_000).toISOString()
  const future = new Date(NOW.getTime() + 60_000).toISOString()
  assert.equal(fsrsIsDue(past, NOW), true)
  assert.equal(fsrsIsDue(NOW.toISOString(), NOW), true)
  assert.equal(fsrsIsDue(future, NOW), false)
})

test('previewFsrs returns a full schedule for every rating without mutating input', () => {
  const base = emptyFsrsState(NOW)
  const snapshot = JSON.stringify(base)
  const preview = previewFsrs(base, NOW)
  assert.deepEqual(Object.keys(preview).sort(), ['again', 'easy', 'good', 'hard'])
  for (const rating of ['again', 'hard', 'good', 'easy'] as const) {
    assert.ok(preview[rating].due)
  }
  assert.equal(JSON.stringify(base), snapshot, 'preview must not mutate the input state')
})

test('review log records rating, prior state, due and timestamp', () => {
  const { log } = scheduleFsrs(emptyFsrsState(NOW), 'good', NOW)
  assert.equal(log.rating, 'good')
  assert.equal(log.state, 'new')
  assert.equal(new Date(log.review).getTime(), NOW.getTime())
  assert.equal(new Date(log.due).toISOString(), log.due)
})

test('isFsrsRating guards unknown ratings', () => {
  assert.equal(isFsrsRating('good'), true)
  assert.equal(isFsrsRating('manual'), false)
  assert.equal(isFsrsRating(''), false)
})
