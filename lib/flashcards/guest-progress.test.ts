// Unit tests for the guest flashcard backend (lib/flashcards/guest-progress.ts).
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/flashcards/guest-progress.test.ts
//
// The guest store is the public /flashcards page's whole engine, and until now
// it ran a different scheduler from the signed-in dashboard. These tests drive
// the real module (no mocks of the scheduler) against a localStorage stub and
// assert what a visitor actually experiences: a graded card carries the full
// FSRS memory model, the next grade continues that memory, the four rating
// buttons can be previewed, and a forgotten card goes back to relearning.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FLASHCARD_DECKS } from './flashcards-data.ts'

const store = new Map<string, string>()

// The module reads `window.localStorage` inside its functions, so the stub has
// to exist before any of them run.
;(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  },
  addEventListener: () => {},
  removeEventListener: () => {},
}

const { gradeGuestCard, previewGuestIntervals, resetGuestCard } = await import(
  './guest-progress.ts'
)

const CARD_ID = FLASHCARD_DECKS[0].cards[0].id

test('a guest grade persists the FSRS memory model, not just a date', () => {
  resetGuestCard(CARD_ID)
  const result = gradeGuestCard(CARD_ID, 'good')
  assert.equal(result.success, true)
  assert.ok(result.next, 'a successful grade returns the next state')
  assert.ok(
    new Date(result.next!.dueAt).getTime() > Date.now(),
    'the card must be scheduled in the future'
  )
  assert.ok((result.next!.stability ?? 0) > 0)
  assert.ok(['learning', 'review'].includes(result.next!.state ?? ''))

  const raw = store.get('medprep:flashcard-reviews:v1')
  assert.ok(raw, 'the row is written to localStorage')
  const row = JSON.parse(raw!)[CARD_ID]
  assert.equal(row.fsrs_state, result.next!.state)
  assert.equal(row.stability, result.next!.stability)
  assert.equal(row.difficulty, result.next!.difficulty)
  assert.equal(row.scheduled_days, result.next!.scheduledDays)
  assert.equal(row.last_rating, 'good')
})

test('the next grade continues the stored memory rather than re-seeding it', () => {
  const first = JSON.parse(store.get('medprep:flashcard-reviews:v1')!)[CARD_ID]
  const second = gradeGuestCard(CARD_ID, 'good')
  assert.equal(second.success, true)
  const row = JSON.parse(store.get('medprep:flashcard-reviews:v1')!)[CARD_ID]
  assert.equal(row.repetitions > first.repetitions, true, 'reps advance')
  assert.ok(row.stability > 0)
  assert.equal(row.times_correct, 1 + 1)
})

test('every rating can be previewed before grading', () => {
  const preview = previewGuestIntervals(CARD_ID)
  assert.ok(preview, 'a known card has a preview')
  assert.deepEqual(Object.keys(preview!).sort(), ['again', 'easy', 'good', 'hard'])
  for (const label of Object.values(preview!)) {
    assert.match(label, /^\d+(m|h|d|mo|y)$/, `unexpected interval label: ${label}`)
  }
  assert.equal(previewGuestIntervals('not-a-card'), null)
})

test('"again" forgets the card: it returns soon and counts a lapse', () => {
  const before = JSON.parse(store.get('medprep:flashcard-reviews:v1')!)[CARD_ID]
  const result = gradeGuestCard(CARD_ID, 'again')
  assert.equal(result.success, true)
  const row = JSON.parse(store.get('medprep:flashcard-reviews:v1')!)[CARD_ID]
  assert.ok(row.lapses >= 1, 'a forgotten card records a lapse')
  assert.equal(row.times_wrong, 1)
  assert.ok(
    new Date(row.due_at).getTime() - Date.now() < 86_400_000,
    'again brings the card back inside a day'
  )
  assert.ok(row.stability <= before.stability, 'a lapse must not increase stability')
})

test('an unknown card id is refused instead of inventing a schedule', () => {
  const result = gradeGuestCard('no-such-card', 'good')
  assert.equal(result.success, false)
  assert.equal(result.next, undefined)
})
