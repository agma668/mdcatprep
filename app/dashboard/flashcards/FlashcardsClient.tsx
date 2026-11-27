'use client'

import { useEffect, useMemo, useReducer, useState, useTransition, type ReactNode } from 'react'
import {
  gradeFlashcard,
  previewFlashcardIntervals,
  resetFlashcard,
} from '@/app/actions/flashcards'
import type { Flashcard, FlashcardDeck } from '@/lib/flashcards/flashcards-data'
import { fsrsIsDue } from '@/lib/flashcards/fsrs'
import type {
  CardRating,
  FlashcardBackend,
  ReviewRow,
  ReviewStatePayload,
} from '@/lib/flashcards/types'
import { usePrepChoice } from '@/lib/prep-choice'
import { getPrepTest } from '@/lib/prep-tests'

// Flashcards UI: deck grid -> focused study session (flip + rate) -> back to
// the grid with updated due counts. All grading goes through the injected
// backend — the server actions on the dashboard, the localStorage twin on the
// public /flashcards page — so guests and students get the identical study
// experience. The local reducer mirrors the backend's returned state so
// counts update instantly without a full re-render.

type Props = {
  decks: FlashcardDeck[]
  initialReviewState: ReviewStatePayload
  /** New cards a session may introduce. Due reviews are never capped. */
  dailyNewLimit?: number
  /** Persistence layer. Defaults to the dashboard's server actions. */
  backend?: FlashcardBackend
  /** Static banner shown above the deck grid (e.g. the guest notice). */
  notice?: ReactNode
  /** Externally-owned review state (guest localStorage via
   *  useSyncExternalStore). When set, the component stops owning state and
   *  mirrors its updates through the backend's notifications instead. */
  reviewStateOverride?: ReviewStatePayload
}

type Session = {
  deck: FlashcardDeck
  queue: Flashcard[]
  /** 'due' = the schedule only; 'all' = the student asked to study ahead. */
  mode: 'due' | 'all'
  index: number
  revealed: boolean
  answered: number
  correct: number
}

type Action =
  | { type: 'open'; deck: FlashcardDeck; queue: Flashcard[]; mode: 'due' | 'all' }
  | { type: 'reveal' }
  | { type: 'rate'; rating: 'again' | 'hard' | 'good' | 'easy' }
  | { type: 'next' }
  | { type: 'close' }

function reducer(state: Session | null, action: Action): Session | null {
  switch (action.type) {
    case 'open':
      return {
        deck: action.deck,
        queue: action.queue,
        mode: action.mode,
        index: 0,
        revealed: false,
        answered: 0,
        correct: 0,
      }
    case 'reveal':
      return state ? { ...state, revealed: true } : state
    case 'rate': {
      if (!state) return state
      const correct = state.correct + (action.rating === 'again' ? 0 : 1)
      const queue =
        action.rating === 'again'
          ? // Wrong: the card re-joins the END of today's queue.
            [...state.queue, state.queue[state.index]]
          : state.queue
      return { ...state, queue, revealed: false, answered: state.answered + 1, correct }
    }
    case 'next':
      return state ? { ...state, index: state.index + 1 } : state
    case 'close':
      return null
  }
}

const RATING_BUTTONS = [
  { rating: 'again' as const, label: 'Again', hint: 'Wrong — back in today', classes: 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25' },
  { rating: 'hard' as const, label: 'Hard', hint: 'Right, with effort', classes: 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25' },
  { rating: 'good' as const, label: 'Good', hint: 'Right, comfortable', classes: 'bg-[var(--signal-500)]/15 border-[var(--signal-500)]/40 text-[var(--signal-200)] hover:bg-[var(--signal-500)]/25' },
  { rating: 'easy' as const, label: 'Easy', hint: 'Instant recall', classes: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25' },
]

/**
 * Due and never-seen cards are different work — Anki never lumps them into one
 * number, and a "12 due" badge that is mostly new cards cannot be trusted. A
 * card with no row is new, whatever its (absent) date says.
 */
function deckCounts(
  deck: FlashcardDeck,
  byCard: Record<string, ReviewRow>
): { due: number; fresh: number; total: number } {
  const now = new Date()
  let due = 0
  let fresh = 0
  for (const card of deck.cards) {
    const row = byCard[card.id]
    if (!row) fresh += 1
    else if (fsrsIsDue(row.due_at, now)) due += 1
  }
  return { due, fresh, total: deck.cards.length }
}

function progressLabel(deck: FlashcardDeck, byCard: Record<string, ReviewRow>): string {
  const learned = deck.cards.filter((card) => {
    const row = byCard[card.id]
    // "Learned" = reviewed at least once and currently not due.
    return row && row.repetitions > 0 && !fsrsIsDue(row.due_at)
  }).length
  return `${learned}/${deck.cards.length}`
}

export function FlashcardsClient({
  decks,
  initialReviewState,
  dailyNewLimit = 20,
  backend,
  notice,
  reviewStateOverride,
}: Props) {
  // The dashboard passes initialReviewState from the server and lets the
  // component own its copy (optimistic updates). Guest surfaces pass
  // reviewStateOverride backed by useSyncExternalStore over localStorage —
  // same React state semantics, hydrated after mount without a mismatch.
  const [ownState, setOwnState] = useState<ReviewStatePayload>(initialReviewState)
  const reviewState = reviewStateOverride ?? ownState
  const setReviewState = setOwnState
  const [session, dispatch] = useReducer(reducer, null)
  const [pending, startTransition] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<string>('All')
  // What each rating button would do, keyed by card. Fetched once per card when
  // it is flipped, so the four buttons read like Anki's ("Good · 3d") without a
  // round-trip per button.
  const [intervals, setIntervals] = useState<
    Record<string, Record<CardRating, string> | null>
  >({})
  const [previewBusy, setPreviewBusy] = useState(false)

  // The sidebar's "Preparing for" choice narrows the deck grid to the chosen
  // test's own decks. PMDC-family decks are omitted=? the shared syllabus; the
  // HEC USAT-M decks carry an explicit tests list. When the choice leaves a
  // test with no decks (nothing authored yet) the full grid returns and the
  // banner says so plainly instead of showing an empty page.
  const storedChoice = usePrepChoice('medical')
  const prepTest = getPrepTest('medical', storedChoice)

  const relevantDecks = useMemo(() => {
    if (!prepTest) return decks
    const matched = decks.filter(
      (d) => d.tests?.includes(prepTest.id) ?? prepTest.pmdcFamily === true
    )
    return matched.length > 0 ? matched : decks
  }, [decks, prepTest])
  const narrowed = prepTest !== null && relevantDecks.length < decks.length

  const subjects = useMemo(
    () => ['All', ...Array.from(new Set(relevantDecks.map((d) => d.subject)))],
    [relevantDecks]
  )
  const visibleDecks = useMemo(
    () =>
      subjectFilter === 'All'
        ? relevantDecks
        : relevantDecks.filter((d) => d.subject === subjectFilter),
    [relevantDecks, subjectFilter]
  )

  const totals = useMemo(() => {
    let due = 0
    let fresh = 0
    let cards = 0
    for (const deck of relevantDecks) {
      const counts = deckCounts(deck, reviewState.byCard)
      due += counts.due
      fresh += counts.fresh
      cards += counts.total
    }
    return { due, fresh, cards }
  }, [relevantDecks, reviewState.byCard])

  const openDeck = (deck: FlashcardDeck, mode: 'due' | 'all' = 'due') => {
    const now = new Date()
    const byCard = reviewState.byCard
    // Anki's queue, in its priority order: reviews the schedule says are due
    // (oldest first), then up to the new-card limit of never-seen cards. Cards
    // that are not due do not come back early unless the student asks to study
    // ahead — otherwise "due" would describe the whole deck and the limit would
    // be decoration.
    const due = deck.cards
      .filter((c) => {
        const row = byCard[c.id]
        return Boolean(row) && fsrsIsDue(row!.due_at, now)
      })
      .sort((a, b) =>
        (byCard[a.id]?.due_at ?? '').localeCompare(byCard[b.id]?.due_at ?? '')
      )
    const fresh = deck.cards.filter((c) => !byCard[c.id])
    const notDue = deck.cards.filter((c) => {
      const row = byCard[c.id]
      return Boolean(row) && !fsrsIsDue(row!.due_at, now)
    })
    const limit = mode === 'all' ? fresh.length : Math.max(0, Math.floor(dailyNewLimit))
    const queue =
      mode === 'all' ? [...due, ...fresh, ...notDue] : [...due, ...fresh.slice(0, limit)]
    startTransition(() => {
      setSaveError(null)
      dispatch({ type: 'open', deck, queue, mode })
    })
  }

  // Ask the backend what each rating would schedule. Guest backends compute it
  // locally; the dashboard asks the server, which reads the same row a grade
  // will read.
  const loadPreview = async (cardId: string) => {
    if (cardId in intervals) return
    setPreviewBusy(true)
    try {
      const preview = await (backend?.preview ?? previewFlashcardIntervals)(cardId)
      setIntervals((prev) => ({ ...prev, [cardId]: preview }))
    } finally {
      setPreviewBusy(false)
    }
  }

  const rate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!session) return
    const card = session.queue[session.index]
    if (!card) return
    // The preview described the state before this answer; drop it so the next
    // flip of this card asks again rather than showing a stale interval.
    setIntervals((prev) => {
      if (!(card.id in prev)) return prev
      const next = { ...prev }
      delete next[card.id]
      return next
    })
    // Optimistic: advance immediately; the server response only corrects us
    // if the save failed.
    dispatch({ type: 'rate', rating })
    dispatch({ type: 'next' })
    startTransition(async () => {
      const result = await (backend?.grade ?? gradeFlashcard)(card.id, rating)
      if (result.success && result.next) {
        setReviewState((prev) => ({
          ...prev,
          byCard: {
            ...prev.byCard,
            [card.id]: {
              card_id: card.id,
              due_at: result.next!.dueAt,
              interval_days: result.next!.intervalDays,
              repetitions: result.next!.repetitions,
              ease_factor: result.next!.easeFactor,
              last_rating: rating,
              last_reviewed_at: new Date().toISOString(),
              times_correct: (prev.byCard[card.id]?.times_correct ?? 0) + (rating === 'again' ? 0 : 1),
              times_wrong: (prev.byCard[card.id]?.times_wrong ?? 0) + (rating === 'again' ? 1 : 0),
            },
          },
        }))
        setSaveError(null)
      } else {
        setSaveError(result.error ?? 'Could not save your rating. Progress for this card was not saved.')
      }
    })
  }

  const resetCard = (cardId: string) => {
    startTransition(async () => {
      const result = await (backend?.reset ?? resetFlashcard)(cardId)
      if (result.success) {
        setReviewState((prev) => {
          const byCard = { ...prev.byCard }
          delete byCard[cardId]
          return { ...prev, byCard }
        })
      }
    })
  }

  // Keyboard control, Anki-style: Space/Enter flips then grades "good", 1–4
  // pick a rating once the answer is visible, Esc ends the session. Rebound on
  // every render (no dep array) so the handlers always see current state.
  useEffect(() => {
    if (!session) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }
      if (event.key === 'Escape') {
        dispatch({ type: 'close' })
        return
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        if (!session.revealed) dispatch({ type: 'reveal' })
        else rate('good')
        return
      }
      const index = Number(event.key) - 1
      if (session.revealed && Number.isInteger(index) && index >= 0 && index < 4) {
        event.preventDefault()
        rate(RATING_BUTTONS[index].rating)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ── Study session view ────────────────────────────────────────────────
  if (session) {
    const card = session.queue[session.index]
    const finished = !card
    const deckTotal = session.queue.length

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={() => dispatch({ type: 'close' })}
            className="text-sm font-semibold text-[var(--steel-300)] hover:text-white transition-colors cursor-pointer"
          >
            ← End session
          </button>
          <span className="text-xs font-bold text-[var(--color-text-muted)]">
            {session.deck.icon} {session.deck.title} · {Math.min(session.index + (finished ? 0 : 1), deckTotal)}/{deckTotal}
          </span>
        </div>

        {/* Session progress bar */}
        <div className="h-1.5 rounded-full bg-white/[0.06] mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--signal-500)] transition-all duration-300"
            style={{ width: `${deckTotal ? (session.answered / Math.max(session.answered + (finished ? 0 : deckTotal - session.index), 1)) * 100 : 0}%` }}
          />
        </div>

        {deckTotal === 0 ? (
          <div className="glass-tile-glow rounded-[var(--radius-xl)] p-10 text-center">
            <p className="text-4xl mb-3">📅</p>
            <h2 className="text-xl font-extrabold text-gradient-brand">Nothing due in this deck</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
              Every card is scheduled for a later day — that is the schedule doing its job, not an
              error. Come back when one is due, or study ahead and answer early.
            </p>
            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => openDeck(session.deck, 'all')}
                className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--signal-500)]/15 border border-[var(--signal-500)]/40 text-[var(--signal-200)] text-sm font-bold hover:bg-[var(--signal-500)]/25 transition-colors cursor-pointer"
              >
                Study all {session.deck.cards.length} cards anyway
              </button>
              <button
                onClick={() => dispatch({ type: 'close' })}
                className="px-5 py-2.5 rounded-[var(--radius-md)] bg-white/[0.06] border border-white/10 text-white text-sm font-bold hover:bg-white/[0.12] transition-colors cursor-pointer"
              >
                Back to decks
              </button>
            </div>
          </div>
        ) : finished ? (
          <div className="glass-tile-glow rounded-[var(--radius-xl)] p-10 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <h2 className="text-xl font-extrabold text-gradient-brand">Session complete</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {session.correct}/{session.answered} recalled on the first try
              {session.answered > 0
                ? ` · ${Math.round((session.correct / session.answered) * 100)}%`
                : ''}
            </p>
            <div className="mt-6 flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => openDeck(session.deck)}
                className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--signal-500)]/15 border border-[var(--signal-500)]/40 text-[var(--signal-200)] text-sm font-bold hover:bg-[var(--signal-500)]/25 transition-colors cursor-pointer"
              >
                Study again
              </button>
              <button
                onClick={() => dispatch({ type: 'close' })}
                className="px-5 py-2.5 rounded-[var(--radius-md)] bg-white/[0.06] border border-white/10 text-white text-sm font-bold hover:bg-white/[0.12] transition-colors cursor-pointer"
              >
                Back to decks
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                if (session.revealed) return
                dispatch({ type: 'reveal' })
                void loadPreview(card.id)
              }}
              aria-label={session.revealed ? 'Card answer' : 'Card question — activate to reveal'}
              className="w-full text-left min-h-[280px] glass-tile-glow rounded-[var(--radius-xl)] p-8 flex flex-col justify-center hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)] mb-4">
                {session.revealed ? 'Answer' : 'Question · tap to flip'}
              </p>
              <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {session.revealed ? card.back : card.front}
              </p>
              {session.revealed && card.hint && (
                <p className="mt-4 text-xs text-[var(--color-text-muted)]">Hint: {card.hint}</p>
              )}
            </button>

            {session.revealed && (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {RATING_BUTTONS.map(({ rating, label, hint, classes }, i) => (
                  <button
                    key={rating}
                    onClick={() => rate(rating)}
                    title={hint}
                    className={`rounded-[var(--radius-md)] border py-3 text-sm font-bold transition-colors cursor-pointer ${classes}`}
                  >
                    {label}
                    <span className="mt-0.5 block text-[10px] font-semibold opacity-75">
                      {intervals[card.id]?.[rating] ?? (previewBusy ? '…' : hint)}
                    </span>
                    <span className="sr-only">keyboard shortcut {i + 1}</span>
                  </button>
                ))}
              </div>
            )}

            {session.revealed && (
              <p className="mt-3 hidden sm:block text-center text-[10px] font-semibold text-[var(--color-text-muted)]">
                Space flips · 1–4 rate · Esc ends the session
              </p>
            )}

            {!session.revealed && (
              <p className="mt-5 text-center text-xs text-[var(--color-text-muted)]">
                Recall the answer out loud, then tap the card to check yourself.
              </p>
            )}

            {saveError && (
              <p role="alert" className="mt-4 text-xs font-semibold text-red-400 text-center">
                {saveError}
              </p>
            )}
          </>
        )}
      </div>
    )
  }

  // ── Deck grid view ────────────────────────────────────────────────────
  return (
    <div>
      {notice && (
        <div className="glass-tile-glow rounded-[var(--radius-lg)] px-4 py-3 mb-6 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {notice}
        </div>
      )}

      {/* Filters + totals */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setSubjectFilter(s)}
            className={`touch-chip px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              subjectFilter === s
                ? 'bg-[var(--signal-500)] text-[var(--on-cta)]'
                : 'bg-white/[0.06] text-[var(--steel-300)] hover:bg-white/[0.12] hover:text-white ring-1 ring-white/10'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="ml-auto text-xs font-semibold text-[var(--color-text-muted)]">
          {reviewState.unavailable
            ? ''
            : `${totals.due} due · ${totals.fresh} new · ${totals.cards} cards`}
        </span>
      </div>

      {saveError && (
        <p role="alert" className="mb-4 text-xs font-semibold text-red-400">{saveError}</p>
      )}

      {narrowed && prepTest && (
        <p className="mb-4 text-xs text-[var(--steel-300)]">
          {prepTest.mark} Showing the decks for <strong className="text-white">{prepTest.label}</strong> — switch tests in the sidebar to see others.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleDecks.map((deck) => {
          const counts = deckCounts(deck, reviewState.byCard)
          const due = counts.due
          const isNew = counts.fresh === deck.cards.length
          return (
            <div
              key={deck.id}
              className="group glass-tile-glow rounded-[var(--radius-lg)] p-5 flex flex-col hover:translate-y-[-2px] transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="icon-tile w-11 h-11 text-xl bg-[var(--srf-2)] ring-1 ring-white/10 flex items-center justify-center">
                  {deck.icon}
                </span>
                {due > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-[var(--signal-500)]/15 ring-1 ring-[var(--signal-500)]/40 px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--signal-200)]">
                    {due} due
                  </span>
                ) : counts.fresh > 0 ? (
                  <span className="inline-flex items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 px-2.5 py-0.5 text-[10px] font-bold text-[var(--steel-300)]">
                    {counts.fresh} new
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-white/[0.06] ring-1 ring-white/10 px-2.5 py-0.5 text-[10px] font-bold text-[var(--steel-300)]">
                    {isNew ? 'new' : 'done ✓'}
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-bold text-[var(--color-text-primary)]">{deck.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)] flex-1">
                {deck.description}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">
                  {deck.subject} · {progressLabel(deck, reviewState.byCard)} locked in
                </span>
                <button
                  onClick={() => openDeck(deck)}
                  disabled={pending}
                  className="touch-chip px-3.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--signal-500)]/15 border border-[var(--signal-500)]/40 text-[var(--signal-200)] text-xs font-bold hover:bg-[var(--signal-500)]/25 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Study
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Per-card review history (collapsed summary; reset lets a student start over) */}
      <section aria-label="Your review history" className="mt-10">
        <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-3">Card history</h2>
        {reviewState.unavailable ? (
          <p className="text-xs text-[var(--color-text-muted)]">
            Review tracking isn&apos;t available yet — you can still study every deck.
          </p>
        ) : (
          <div className="glass-tile-glow rounded-[var(--radius-lg)] p-4">
            {Object.values(reviewState.byCard).length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                Nothing reviewed yet. Your history appears here after your first session.
              </p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {Object.values(reviewState.byCard)
                  .sort((a, b) => (a.last_reviewed_at ?? '').localeCompare(b.last_reviewed_at ?? ''))
                  .slice(-12)
                  .reverse()
                  .map((row) => {
                    const meta = decks.flatMap((d) => d.cards).find((c) => c.id === row.card_id)
                    return (
                      <li key={row.card_id} className="py-2.5 flex items-center gap-3 text-xs">
                        <span className="min-w-0 flex-1 truncate text-[var(--color-text-secondary)]">
                          {meta?.front ?? row.card_id}
                        </span>
                        <span className="shrink-0 text-[var(--color-text-muted)]">
                          {row.times_correct}✓ / {row.times_wrong}✗
                        </span>
                        <button
                          onClick={() => resetCard(row.card_id)}
                          className="shrink-0 text-[10px] font-bold text-[var(--steel-400)] hover:text-white transition-colors cursor-pointer"
                          title="Reset this card's schedule"
                        >
                          reset
                        </button>
                      </li>
                    )
                  })}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
