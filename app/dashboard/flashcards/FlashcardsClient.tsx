'use client'

import { useMemo, useReducer, useState, useTransition, type ReactNode } from 'react'
import { gradeFlashcard, resetFlashcard } from '@/app/actions/flashcards'
import type { Flashcard, FlashcardDeck } from '@/lib/flashcards/flashcards-data'
import { isDue } from '@/lib/flashcards/srs'
import type { FlashcardBackend, ReviewRow, ReviewStatePayload } from '@/lib/flashcards/types'
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
  index: number
  revealed: boolean
  answered: number
  correct: number
}

type Action =
  | { type: 'open'; deck: FlashcardDeck; queue: Flashcard[] }
  | { type: 'reveal' }
  | { type: 'rate'; rating: 'again' | 'hard' | 'good' | 'easy' }
  | { type: 'next' }
  | { type: 'close' }

function reducer(state: Session | null, action: Action): Session | null {
  switch (action.type) {
    case 'open':
      return { deck: action.deck, queue: action.queue, index: 0, revealed: false, answered: 0, correct: 0 }
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

function dueCount(deck: FlashcardDeck, byCard: Record<string, ReviewRow>): number {
  const now = new Date()
  return deck.cards.filter((card) => {
    const row = byCard[card.id]
    return !row || isDue(row.due_at, now)
  }).length
}

function progressLabel(deck: FlashcardDeck, byCard: Record<string, ReviewRow>): string {
  const learned = deck.cards.filter((card) => {
    const row = byCard[card.id]
    // "Learned" = reviewed at least once and currently not due.
    return row && row.repetitions > 0 && !isDue(row.due_at)
  }).length
  return `${learned}/${deck.cards.length}`
}

export function FlashcardsClient({ decks, initialReviewState, backend, notice, reviewStateOverride }: Props) {
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
    let cards = 0
    for (const deck of relevantDecks) {
      due += dueCount(deck, reviewState.byCard)
      cards += deck.cards.length
    }
    return { due, cards }
  }, [relevantDecks, reviewState.byCard])

  const openDeck = (deck: FlashcardDeck) => {
    const now = new Date()
    // Session queue: cards due now first (oldest due_at first), then the
    // remaining cards so a student can always study the full deck offline of
    // the schedule.
    const due = deck.cards
      .filter((c) => {
        const row = reviewState.byCard[c.id]
        return !row || isDue(row.due_at, now)
      })
      .sort((a, b) => {
        const da = reviewState.byCard[a.id]?.due_at ?? ''
        const db = reviewState.byCard[b.id]?.due_at ?? ''
        return da.localeCompare(db)
      })
    const notDue = deck.cards.filter((c) => {
      const row = reviewState.byCard[c.id]
      return row && !isDue(row.due_at, now)
    })
    startTransition(() => {
      setSaveError(null)
      dispatch({ type: 'open', deck, queue: [...due, ...notDue] })
    })
  }

  const rate = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!session) return
    const card = session.queue[session.index]
    if (!card) return
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

        {finished ? (
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
              onClick={() => !session.revealed && dispatch({ type: 'reveal' })}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  if (!session.revealed) dispatch({ type: 'reveal' })
                  else rate('good')
                }
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

            {session.revealed ? (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {RATING_BUTTONS.map(({ rating, label, hint, classes }) => (
                  <button
                    key={rating}
                    onClick={() => rate(rating)}
                    title={hint}
                    className={`rounded-[var(--radius-md)] border py-3 text-sm font-bold transition-colors cursor-pointer ${classes}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
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
          {reviewState.unavailable ? '' : `${totals.due} of ${totals.cards} due for review`}
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
          const due = dueCount(deck, reviewState.byCard)
          const isNew = deck.cards.every((c) => !reviewState.byCard[c.id])
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
