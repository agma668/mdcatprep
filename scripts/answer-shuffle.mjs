// Shared helpers for option-position balancing.
//
// Problem this solves: AI-generated MCQ banks very often put the correct
// answer in the FIRST slot for every question (correct_answer = "A" for 100%
// of questions), which makes the answer key trivially guessable. This module
// rebalances option positions deterministically — seeded by the question text,
// so the same question always maps to the same layout, and re-running is
// idempotent (a given question always lands the same way).
//
// Correctness is preserved: we never change WHICH text is the answer, only
// WHERE it sits and the letter key that points to it. Questions whose
// explanation mentions an option letter ("the answer is B") are left alone.

import { createHash } from 'node:crypto'

export const LETTERS = ['A', 'B', 'C', 'D']

export function questionSeed(question) {
  const text = question.question_text || question.question || ''
  return parseInt(createHash('sha1').update(text).digest('hex').slice(0, 8), 16)
}

// Small deterministic PRNG (mulberry32) — fine for shuffling, no crypto needed.
function mulberry32(seed) {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function optionTexts(q) {
  return [q.option_a, q.option_b, q.option_c, q.option_d].map((v) =>
    v == null ? null : String(v).trim()
  )
}

export function answerLetter(q) {
  return String(q.correct_answer || '').trim().toUpperCase()
}

// Does the explanation reference an option LETTER? If so we must not relocate
// the answer — the explanation text would then contradict the key.
export function explanationMentionsLetter(q) {
  const e = String(q.explanation || '').toLowerCase()
  return /\boption [abcd]\b|\banswer is [abcd]\b|\bcorrect answer:? [abcd]\b|\bkey:? [abcd]\b/.test(e)
}

export function letterIndex(letter) {
  const i = LETTERS.indexOf(letter)
  return i >= 0 ? i : -1
}

export function distribution(questions) {
  const dist = { A: 0, B: 0, C: 0, D: 0 }
  for (const q of questions) {
    const l = answerLetter(q)
    if (dist[l] !== undefined) dist[l]++
  }
  return dist
}

// A bank is degenerate when one letter is the answer for a huge share of the
// questions (a strong "AI slop" signature). 45% is the sanity ceiling — a
// well-shuffled 4-option bank sits near 25%.
export function isDegenerate(questions, threshold = 0.45) {
  const total = questions.length
  if (total === 0) return false
  const dist = distribution(questions)
  return Object.values(dist).some((c) => c / total > threshold)
}

/**
 * Relocate the correct option of one question to a given slot and arrange the
 * distractors in the remaining slots. Returns null when the question can't be
 * touched safely (no valid current answer letter, missing correct text, or an
 * explanation that references a letter).
 *
 * The result depends ONLY on the question text + option texts (never on the
 * current option order): the target position is a parameter, and the
 * distractor order is a seeded content-hash sort — so the same question
 * always maps to the same layout for a given target. A distractor that
 * duplicates the answer text is dropped, since it would make the question
 * trivially guessable.
 */
export function rebalanceQuestionTo(q, target) {
  const current = letterIndex(answerLetter(q))
  if (current < 0) return null
  const opts = optionTexts(q)
  const correctText = opts[current]
  if (!correctText) return null
  if (explanationMentionsLetter(q)) return null

  const seed = questionSeed(q)
  const distractors = opts.filter((t, i) => i !== current && t !== correctText)
  distractors.sort((a, b) => {
    const ka = createHash('sha1').update(`${seed}:${a}`).digest('hex')
    const kb = createHash('sha1').update(`${seed}:${b}`).digest('hex')
    return ka < kb ? -1 : ka > kb ? 1 : 0
  })

  const out = [null, null, null, null]
  out[target] = correctText
  let d = 0
  for (let i = 0; i < 4; i++) {
    if (i !== target) out[i] = distractors[d++]
  }

  return {
    option_a: out[0],
    option_b: out[1],
    option_c: out[2],
    option_d: out[3],
    correct_answer: LETTERS[target],
  }
}

/**
 * Relocate the correct option of one question to a seeded-random position and
 * arrange the distractors in the remaining slots. Returns null when the
 * question can't be touched safely (no valid current answer letter, missing
 * correct text, or an explanation that references a letter).
 *
 * The result depends ONLY on the question text + option texts (never on the
 * current option order): the target position is the first PRNG draw, and the
 * distractor order is a seeded content-hash sort. That makes the rebalance
 * fully idempotent — running it on an already-rebalanced bank is a no-op.
 * A distractor that duplicates the answer text is dropped, since it would
 * make the question trivially guessable.
 */
export function rebalanceQuestion(q) {
  const seed = questionSeed(q)
  const rand = mulberry32(seed)
  // First draw decides the answer slot; the same seed always lands on the
  // same slot, so a re-run never relocates an answer that is already placed.
  return rebalanceQuestionTo(q, Math.floor(rand() * 4))
}

/**
 * Rebalance every question in a bank. Returns a NEW array (input untouched)
 * plus the count of questions whose positions changed.
 */
export function rebalanceQuestions(questions) {
  let changed = 0
  const next = questions.map((q) => {
    const moved = rebalanceQuestion(q)
    if (!moved) return q
    // Only count real relocations — a question that already matches the
    // seeded layout stays untouched, so re-running is idempotent.
    if (
      moved.option_a === q.option_a &&
      moved.option_b === q.option_b &&
      moved.option_c === q.option_c &&
      moved.option_d === q.option_d &&
      moved.correct_answer === answerLetter(q)
    ) {
      return q
    }
    changed++
    return { ...q, ...moved }
  })
  return { questions: next, changed }
}
