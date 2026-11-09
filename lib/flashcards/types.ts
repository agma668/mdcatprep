// Shared contract between the two flashcard backends:
//
//   dashboard  — server actions (app/actions/flashcards.ts) persist review
//                state to flashcard_reviews, scoped by RLS to the student.
//   public     — lib/flashcards/guest-progress.ts persists the same row shape
//                to localStorage so visitors can study without an account.
//
// Both return ReviewRow-shaped state and GradeResult, so the study UI
// (FlashcardsClient) renders identically over either backend. Scheduling
// itself lives in srs.ts (pure SM-2-lite); this module is types only.

import type { CardRating } from './srs'

export type { CardRating }

export interface ReviewRow {
  card_id: string
  due_at: string
  interval_days: number
  repetitions: number
  ease_factor: number
  last_rating: string | null
  last_reviewed_at: string | null
  times_correct: number
  times_wrong: number
}

export interface ReviewStatePayload {
  /** card_id -> review row. Missing id = never reviewed (new). */
  byCard: Record<string, ReviewRow>
  /** True when the backing store read failed — the UI shows all-new and hides stats. */
  unavailable: boolean
}

export interface GradeResult {
  success: boolean
  error?: string
  /** Updated scheduling state for optimistic UI (null when failed). */
  next?: {
    cardId: string
    dueAt: string
    intervalDays: number
    repetitions: number
    easeFactor: number
    isLearning: boolean
    /** FSRS memory-model extras (present from the FSRS engine). */
    difficulty?: number
    stability?: number
    state?: string
    scheduledDays?: number
  }
}

export interface ResetResult {
  success: boolean
  error?: string
}

/** What a flashcard page hands the study UI: grade + reset, nothing else. */
export interface FlashcardBackend {
  grade: (cardId: string, rating: CardRating) => Promise<GradeResult>
  reset: (cardId: string) => Promise<ResetResult>
}
