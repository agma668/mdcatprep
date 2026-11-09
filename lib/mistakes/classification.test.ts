// Unit tests for lib/mistakes/classification.ts.
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/mistakes/classification.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  deriveClassification,
  hasEarnedMastery,
  isMissReason,
  isMistakeClassification,
  validateMissReason,
  MASTERY_REQUIRED_CORRECT_STREAK,
} from './classification.ts'

test('a correct, unflagged, non-guess answer is not a mistake', () => {
  assert.equal(deriveClassification({ correct: true }), null)
})

test('a correct guess is classified as guessed_correct', () => {
  assert.equal(deriveClassification({ correct: true, guessed: true }), 'guessed_correct')
})

test('a wrong plain answer is incorrect', () => {
  assert.equal(deriveClassification({ correct: false }), 'incorrect')
})

test('a wrong guess outranks slowness and flagging', () => {
  assert.equal(deriveClassification({ correct: false, guessed: true, slow: true }), 'guessed_incorrect')
})

test('repeated misses outrank every other wrong signal', () => {
  assert.equal(
    deriveClassification({ correct: false, guessed: true, slow: true, priorWrongCount: 2 }),
    'repeatedly_missed'
  )
  // A single prior miss is not yet "repeated".
  assert.equal(deriveClassification({ correct: false, priorWrongCount: 1 }), 'incorrect')
})

test('slow wrong answers are classified slow; flagged wrong are flagged', () => {
  assert.equal(deriveClassification({ correct: false, slow: true }), 'slow')
  assert.equal(deriveClassification({ correct: false, flagged: true }), 'flagged')
})

test('classification and miss-reason guards reject unknown values', () => {
  assert.equal(isMistakeClassification('slow'), true)
  assert.equal(isMistakeClassification('brilliant'), false)
  assert.equal(isMissReason('forgot_fact'), true)
  assert.equal(isMissReason('bad_luck'), false)
})

test('validateMissReason returns null for empty and throws for unknown', () => {
  assert.equal(validateMissReason(null), null)
  assert.equal(validateMissReason(''), null)
  assert.equal(validateMissReason('careless_error'), 'careless_error')
  assert.throws(() => validateMissReason('not_a_reason'))
})

test('mastery requires repeated correct evidence, never a single view', () => {
  assert.equal(hasEarnedMastery({ correctStreak: 0 }), false)
  assert.equal(hasEarnedMastery({ correctStreak: 1 }), false)
  assert.equal(hasEarnedMastery({ correctStreak: MASTERY_REQUIRED_CORRECT_STREAK }), true)
  assert.equal(hasEarnedMastery({ correctStreak: 5 }), true)
})
