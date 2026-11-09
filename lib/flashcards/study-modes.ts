// Alternative flashcard study modes (GitHub issue #5, sections F/E).
//
// Every generated prompt is derived ONLY from the real card content passed in —
// no invented facts, no templated filler. Distractors are other cards' backs
// from the same deck, so a multiple-choice question always has a plausible but
// genuinely incorrect alternative. Shuffling is seeded and deterministic so
// tests are stable and a student can resume the same set.

import type { Flashcard } from './flashcards-data'

/** Small deterministic PRNG (mulberry32) so shuffles are reproducible. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export interface MultipleChoice {
  cardId: string
  prompt: string
  options: string[]
  correctIndex: number
}

/**
 * Build a multiple-choice question from a card and a distractor pool. The
 * correct option is always an option; distractors are unique, non-empty and
 * never equal to the answer. Returns null when there are not enough distinct
 * distractor answers to form the requested number of options.
 */
export function buildMultipleChoice(
  card: Flashcard,
  pool: Flashcard[],
  seed = 1,
  optionCount = 4
): MultipleChoice | null {
  const answer = card.back.trim()
  if (!answer) return null

  const seen = new Set<string>([answer.toLowerCase()])
  const distractors: string[] = []
  for (const other of pool) {
    if (other.id === card.id) continue
    const text = other.back.trim()
    if (!text) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    distractors.push(text)
    if (distractors.length >= optionCount - 1) break
  }
  if (distractors.length < optionCount - 1) return null

  const rng = seededRandom(seed)
  const picked = shuffle(distractors.slice(0, optionCount - 1), rng)
  const options = shuffle([answer, ...picked], rng)
  return {
    cardId: card.id,
    prompt: card.front,
    options,
    correctIndex: options.indexOf(answer),
  }
}

export interface TrueFalse {
  cardId: string
  statement: string
  answer: boolean
  /** The card the statement is actually about (for explanation). */
  sourceCardId: string
}

/**
 * Build a true/false item. With probability 1/2 the statement pairs a card's
 * front with its own back (true); otherwise it borrows another card's back
 * (false). Uses only real content.
 */
export function buildTrueFalse(card: Flashcard, pool: Flashcard[], seed = 1): TrueFalse | null {
  if (!card.front.trim() || !card.back.trim()) return null
  const rng = seededRandom(seed)
  const makeFalse = rng() < 0.5

  if (makeFalse) {
    const other = pool.find(
      (c) => c.id !== card.id && c.back.trim() && c.back.trim().toLowerCase() !== card.back.trim().toLowerCase()
    )
    if (other) {
      return { cardId: card.id, statement: `${card.front} → ${other.back}`, answer: false, sourceCardId: card.id }
    }
  }
  return { cardId: card.id, statement: `${card.front} → ${card.back}`, answer: true, sourceCardId: card.id }
}

/** Normalise a typed answer for comparison (case, punctuation, articles). */
export function normaliseAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(a|an|the|of|is|are)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Grade a typed recall answer against the card's real back text. Exact match
 * after normalisation passes; otherwise the answer must contain the expected
 * key phrase (guards against a lucky single word). Deliberately forgiving about
 * wording, strict about content — the student must produce the idea.
 */
export function checkTypedAnswer(input: string, expected: string): boolean {
  const a = normaliseAnswer(input)
  const b = normaliseAnswer(expected)
  if (!a || !b) return false
  if (a === b) return true
  return a.includes(b) || b.includes(a)
}
