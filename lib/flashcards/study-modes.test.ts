// Unit tests for lib/flashcards/study-modes.ts.
// Run with: node --import ./scripts/_jev-serveronly-hook.mjs --test lib/flashcards/study-modes.test.ts

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildMultipleChoice,
  buildTrueFalse,
  checkTypedAnswer,
  normaliseAnswer,
} from './study-modes.ts'
import type { Flashcard } from './flashcards-data.ts'

const card = (id: string, front: string, back: string): Flashcard => ({ id, front, back })

const target = card('t', 'What is the powerhouse of the cell?', 'Mitochondria')
const pool = [
  target,
  card('a', 'What is the site of protein synthesis?', 'Ribosome'),
  card('b', 'What stores genetic information?', 'Nucleus'),
  card('c', 'What controls what enters the cell?', 'Cell membrane'),
]

test('multiple choice includes the real answer and unique distractors', () => {
  const q = buildMultipleChoice(target, pool, 42, 4)
  assert.ok(q)
  assert.equal(q.prompt, target.front)
  assert.equal(q.options.length, 4)
  assert.equal(q.options[q.correctIndex], 'Mitochondria')
  assert.equal(new Set(q.options.map((o) => o.toLowerCase())).size, 4)
})

test('multiple choice is deterministic for the same seed', () => {
  const a = buildMultipleChoice(target, pool, 7, 4)
  const b = buildMultipleChoice(target, pool, 7, 4)
  assert.deepEqual(a, b)
  // A different seed still yields a valid question with the real answer.
  const c = buildMultipleChoice(target, pool, 8, 4)
  assert.ok(c)
  assert.equal(c.options[c.correctIndex], 'Mitochondria')
})

test('multiple choice returns null without enough distinct distractors', () => {
  const q = buildMultipleChoice(target, [target, card('x', 'Q', 'Mitochondria')], 1, 4)
  assert.equal(q, null)
})

test('true/false true pairs the card with its own answer', () => {
  // Find a seed whose first draw is >= 0.5 (true case).
  let item = null
  for (let seed = 1; seed < 50 && !item; seed++) {
    const candidate = buildTrueFalse(target, pool, seed)
    if (candidate?.answer) item = candidate
  }
  assert.ok(item)
  assert.equal(item.statement, `${target.front} → ${target.back}`)
})

test('true/false false borrows a different real answer', () => {
  let item = null
  for (let seed = 1; seed < 50 && !item; seed++) {
    const candidate = buildTrueFalse(target, pool, seed)
    if (candidate && candidate.answer === false) item = candidate
  }
  assert.ok(item)
  const shown = item.statement.split('→')[1].trim()
  assert.notEqual(shown.toLowerCase(), target.back.toLowerCase())
  assert.ok(pool.some((c) => c.back.toLowerCase() === shown.toLowerCase()))
})

test('typed answers ignore case, punctuation and articles', () => {
  assert.equal(normaliseAnswer('The Mitochondria!'), 'mitochondria')
  assert.equal(checkTypedAnswer('mitochondria', 'Mitochondria'), true)
  assert.equal(checkTypedAnswer('  THE MITOCHONDRIA. ', 'mitochondria'), true)
})

test('typed answers accept a full sentence containing the key idea', () => {
  assert.equal(checkTypedAnswer('It is the mitochondria', 'Mitochondria'), true)
})

test('typed answers reject wrong or empty answers', () => {
  assert.equal(checkTypedAnswer('ribosome', 'Mitochondria'), false)
  assert.equal(checkTypedAnswer('', 'Mitochondria'), false)
  assert.equal(checkTypedAnswer('mitochondria', ''), false)
})
