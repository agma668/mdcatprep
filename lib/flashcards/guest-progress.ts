// Guest (no-account) flashcard review state, persisted in localStorage.
//
// The public /flashcards page lets any visitor run real spaced-repetition
// sessions without signup — the growth pattern every big prep site uses:
// let people taste the engine first, convert later. This module is the guest
// twin of the dashboard's server actions (app/actions/flashcards.ts): it
// speaks the exact same ReviewRow shape and the same SM-2-lite scheduler, so
// a guest session feels identical to a signed-in one.
//
// The state is exposed as a React external store (useSyncExternalStore
// contract): getServerSnapshot returns an empty payload during SSR/hydration
// so server and client HTML always agree, then the client re-renders from
// localStorage after mount — no hydration mismatch, no setState-in-effect.
// Writes fail soft (private-mode browsers block localStorage): grading still
// works for the session, progress just won't survive a reload.

import { scheduleCard, type CardRating } from './srs'
import { CARDS_BY_ID } from './flashcards-data'
import type { GradeResult, ReviewRow, ReviewStatePayload, ResetResult } from './types'

const STORAGE_KEY = 'medprep:flashcard-reviews:v1'

const EMPTY: ReviewStatePayload = { byCard: {}, unavailable: false }

function readAll(): Record<string, ReviewRow> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, ReviewRow>
    if (!parsed || typeof parsed !== 'object') return {}
    // Drop malformed rows defensively rather than crashing the page.
    const byCard: Record<string, ReviewRow> = {}
    for (const [id, row] of Object.entries(parsed)) {
      if (row && typeof row.card_id === 'string' && typeof row.due_at === 'string') {
        byCard[id] = row
      }
    }
    return byCard
  } catch {
    return {}
  }
}

function writeAll(byCard: Record<string, ReviewRow>): boolean {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(byCard))
    return true
  } catch {
    return false
  }
}

// ── External store (useSyncExternalStore contract) ──────────────────────

let snapshot: ReviewStatePayload = EMPTY
let hydrated = false
const listeners = new Set<() => void>()

function refresh() {
  snapshot = { byCard: readAll(), unavailable: false }
}

function notify() {
  for (const listener of listeners) listener()
}

function handleStorage(event: StorageEvent) {
  // Another tab changed the guest progress — keep this one in sync.
  if (event.key === STORAGE_KEY || event.key === null) {
    refresh()
    notify()
  }
}

/** Subscribe to guest review-state changes (storage events + local writes). */
export function subscribeGuestReviewState(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage)
    }
  }
}

/** Client snapshot — reads localStorage once, then serves the cached read. */
export function getGuestReviewSnapshot(): ReviewStatePayload {
  if (!hydrated) {
    hydrated = true
    refresh()
  }
  return snapshot
}

/** Server/hydration snapshot — always empty so SSR HTML matches first paint. */
export function getGuestServerSnapshot(): ReviewStatePayload {
  return EMPTY
}

/** One-off read for non-React callers (kept for symmetry/debugging). */
export function getGuestReviewState(): ReviewStatePayload {
  return { byCard: readAll(), unavailable: false }
}

function commit(row: ReviewRow) {
  const byCard = readAll()
  byCard[row.card_id] = row
  writeAll(byCard)
  refresh()
  notify()
}

// ── Mutations (same contract as the server actions) ─────────────────────

/** Grade a card as a guest: same scheduler as the server, local persistence. */
export function gradeGuestCard(cardId: string, rating: CardRating): GradeResult {
  if (!CARDS_BY_ID.has(cardId)) return { success: false, error: 'Unknown card.' }

  const prev = readAll()[cardId] ?? {
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    times_correct: 0,
    times_wrong: 0,
  }

  const next = scheduleCard(
    {
      easeFactor: Number(prev.ease_factor) || 2.5,
      intervalDays: prev.interval_days ?? 0,
      repetitions: prev.repetitions ?? 0,
    },
    rating
  )

  const wasCorrect = rating !== 'again'
  const row: ReviewRow = {
    card_id: cardId,
    due_at: next.dueAt,
    interval_days: next.intervalDays,
    repetitions: next.repetitions,
    ease_factor: next.easeFactor,
    last_rating: rating,
    last_reviewed_at: new Date().toISOString(),
    times_correct: (Number(prev.times_correct) || 0) + (wasCorrect ? 1 : 0),
    times_wrong: (Number(prev.times_wrong) || 0) + (wasCorrect ? 0 : 1),
  }

  // Grading succeeds for the session even if storage is blocked; only the
  // persistence is lost.
  commit(row)

  return {
    success: true,
    next: {
      cardId,
      dueAt: next.dueAt,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      easeFactor: next.easeFactor,
      isLearning: next.isLearning,
    },
  }
}

/** Reset one card's guest review history. */
export function resetGuestCard(cardId: string): ResetResult {
  const byCard = readAll()
  delete byCard[cardId]
  writeAll(byCard)
  refresh()
  notify()
  return { success: true }
}
