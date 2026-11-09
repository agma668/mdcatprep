// Unit tests for lib/flashcards/organization.ts.
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/flashcards/organization.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_TAGS_PER_CARD,
  isBuryActive,
  isStudyable,
  normaliseTags,
  type CardMeta,
} from './organization.ts'

const NOW = new Date('2026-11-09T12:00:00Z')

test('tags are lowercased, hyphenated and trimmed', () => {
  assert.deepEqual(normaliseTags([' Cell Biology ', 'High Yield']), ['cell-biology', 'high-yield'])
})

test('a comma-separated string is accepted and deduplicated', () => {
  assert.deepEqual(normaliseTags('heart, Heart , ECG'), ['heart', 'ecg'])
})

test('invalid characters are stripped and empty tags dropped', () => {
  assert.deepEqual(normaliseTags(['!!!', 'a/b', 'ok']), ['ab', 'ok'])
})

test('tag count and length are bounded', () => {
  const many = Array.from({ length: 30 }, (_, i) => `tag-${i}`)
  assert.equal(normaliseTags(many).length, MAX_TAGS_PER_CARD)
  assert.equal(normaliseTags(['x'.repeat(100)])[0].length, 32)
})

test('bury is active only in the future', () => {
  assert.equal(isBuryActive(new Date(NOW.getTime() + 3_600_000).toISOString(), NOW), true)
  assert.equal(isBuryActive(new Date(NOW.getTime() - 3_600_000).toISOString(), NOW), false)
  assert.equal(isBuryActive(null, NOW), false)
  assert.equal(isBuryActive('not-a-date', NOW), false)
})

test('suspended and actively buried cards are not studyable', () => {
  const base: CardMeta = { card_id: 'c', starred: false, suspended: false, buried_until: null, tags: [] }
  assert.equal(isStudyable(undefined, NOW), true)
  assert.equal(isStudyable(base, NOW), true)
  assert.equal(isStudyable({ ...base, suspended: true }, NOW), false)
  assert.equal(
    isStudyable({ ...base, buried_until: new Date(NOW.getTime() + 60_000).toISOString() }, NOW),
    false
  )
  assert.equal(
    isStudyable({ ...base, buried_until: new Date(NOW.getTime() - 60_000).toISOString() }, NOW),
    true
  )
})
