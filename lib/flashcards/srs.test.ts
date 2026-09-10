// Unit tests for the SM-2-lite scheduler (lib/flashcards/srs.ts).
// Run with: node --test lib/flashcards/srs.test.ts
//
// Covers the contract both backends (server actions + guest localStorage)
// depend on: learning steps stay minute-scale, review intervals grow with
// ease, "again" resets to step 1, and nothing escapes the ease/interval
// clamps.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scheduleCard, isDue } from './srs.ts'
import type { SrsState } from './srs.ts'

const NOW = new Date('2026-09-10T10:00:00Z')
const FRESH: SrsState = { easeFactor: 2.5, intervalDays: 0, repetitions: 0 }

function minutesUntil(dueAt: string): number {
  return (new Date(dueAt).getTime() - NOW.getTime()) / 60_000
}

function daysUntil(dueAt: string): number {
  return (new Date(dueAt).getTime() - NOW.getTime()) / 86_400_000
}

test('again on a new card stays in learning with a 10-minute step', () => {
  const next = scheduleCard(FRESH, 'again', NOW)
  assert.equal(next.isLearning, true)
  assert.equal(next.repetitions, 0)
  assert.equal(next.intervalDays, 0)
  assert.equal(minutesUntil(next.dueAt), 10)
  assert.equal(next.easeFactor, 2.3) // 2.5 - 0.2
})

test('good/hard/easy walk the two learning steps, then graduate to day-scale', () => {
  // Learning steps are [10 min, 24 h]: a fresh "good" jumps to the second
  // step (24 h, still learning), the next "good" graduates to a 1-day review.
  const step1 = scheduleCard(FRESH, 'good', NOW)
  assert.equal(step1.isLearning, true)
  assert.equal(minutesUntil(step1.dueAt), 1440)

  const step2State = { easeFactor: 2.5, intervalDays: 0, repetitions: 1 }
  const step2 = scheduleCard(step2State, 'good', NOW)
  assert.equal(step2.isLearning, false)
  assert.equal(step2.intervalDays, 1)
  assert.equal(daysUntil(step2.dueAt), 1)

  // Easy graduates straight to 2 days.
  const easyGrad = scheduleCard(step2State, 'easy', NOW)
  assert.equal(easyGrad.intervalDays, 2)
})

test('review-phase good grows the interval by ease factor', () => {
  const state: SrsState = { easeFactor: 2.5, intervalDays: 7, repetitions: 3 }
  const next = scheduleCard(state, 'good', NOW)
  assert.equal(next.intervalDays, 18) // round(7 * 2.5)
  assert.equal(next.isLearning, false)
})

test('hard grows slowly, easy applies its bonus', () => {
  const state: SrsState = { easeFactor: 2.5, intervalDays: 10, repetitions: 4 }

  const hard = scheduleCard(state, 'hard', NOW)
  assert.equal(hard.intervalDays, 12) // round(10 * 1.2)
  assert.equal(hard.easeFactor, 2.35)

  const easy = scheduleCard(state, 'easy', NOW)
  assert.equal(easy.intervalDays, Math.round(10 * 1.3 * 2.65))
  assert.equal(easy.easeFactor, 2.65)
})

test('again during review resets the card to learning step 1', () => {
  const state: SrsState = { easeFactor: 2.5, intervalDays: 30, repetitions: 5 }
  const next = scheduleCard(state, 'again', NOW)
  assert.equal(next.repetitions, 0)
  assert.equal(next.intervalDays, 0)
  assert.equal(next.isLearning, true)
  assert.equal(minutesUntil(next.dueAt), 10)
})

test('ease is clamped to [1.3, 3.2] and intervals to 120 days', () => {
  const low: SrsState = { easeFactor: 1.35, intervalDays: 0, repetitions: 0 }
  const hammered = scheduleCard(scheduleCard(scheduleCard(low, 'again', NOW), 'again', NOW), 'again', NOW)
  assert.equal(hammered.easeFactor, 1.3)

  const high: SrsState = { easeFactor: 3.15, intervalDays: 100, repetitions: 9 }
  const easyStreak = scheduleCard(high, 'easy', NOW)
  assert.equal(easyStreak.intervalDays, 120)
  assert.equal(easyStreak.easeFactor, 3.2)
})

test('isDue', () => {
  const past = new Date(NOW.getTime() - 60_000).toISOString()
  const future = new Date(NOW.getTime() + 60_000).toISOString()
  assert.equal(isDue(past, NOW), true)
  assert.equal(isDue(future, NOW), false)
  assert.equal(isDue(NOW.toISOString(), NOW), true) // boundary: due
})
