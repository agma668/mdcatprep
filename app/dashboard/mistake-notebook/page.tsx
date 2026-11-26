'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flag,
  HelpCircle,
  Layers,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  getMyMistakeReviews,
  getMistakeStats,
  getDueMistakes,
  updateMistakeReview,
  mistakeToFlashcard,
  mistakesToFlashcards,
  markMistakeGuessed,
  type DueMistakeQuestion,
  type MistakeReviewRow,
  type MistakeStats,
} from '@/app/actions/mistakes'
import { MistakesDrill } from '@/components/dashboard/MistakesDrill'
import {
  bucketFor,
  ERROR_BUCKET_LABELS,
  ERROR_BUCKETS,
  MASTERY_REQUIRED_CORRECT_STREAK,
} from '@/lib/mistakes/classification'

const CLASSIFICATION_LABELS: Record<string, string> = {
  incorrect: 'Incorrect',
  guessed_correct: 'Guessed correctly',
  guessed_incorrect: 'Guessed incorrectly',
  slow: 'Slow',
  flagged: 'Flagged',
  repeatedly_missed: 'Repeatedly missed',
}

const MISS_REASON_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Why did you miss it? (optional)' },
  { value: 'did_not_know_concept', label: 'Did not know the concept' },
  { value: 'forgot_fact', label: 'Forgot a fact' },
  { value: 'misunderstood_question', label: 'Misunderstood the question' },
  { value: 'confused_two_concepts', label: 'Confused two concepts' },
  { value: 'calculation_error', label: 'Calculation error' },
  { value: 'careless_error', label: 'Careless error' },
  { value: 'time_management_issue', label: 'Time-management issue' },
]

const EMPTY_STATS: MistakeStats = {
  total: 0,
  notMastered: 0,
  masteredCount: 0,
  byClassification: {},
  bySubject: {},
}

export default function MistakeNotebookPage() {
  const [reviews, setReviews] = useState<MistakeReviewRow[]>([])
  const [stats, setStats] = useState<MistakeStats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unmastered' | 'mastered'>('unmastered')
  const [bulkBusy, setBulkBusy] = useState(false)
  // The run. 'list' is the notebook; 'review' is today's due queue served one
  // card at a time through the same drill the wrong-answer path always had.
  const [mode, setMode] = useState<'list' | 'review'>('list')
  const [dueBusy, setDueBusy] = useState(false)
  const [dueQuestions, setDueQuestions] = useState<DueMistakeQuestion[]>([])

  const load = useCallback(async () => {
    const [reviewsResult, statsResult] = await Promise.all([getMyMistakeReviews(), getMistakeStats()])
    if (reviewsResult.error) setError(reviewsResult.error)
    else setError(null)
    setReviews(reviewsResult.reviews ?? [])
    if (!statsResult.error) setStats(statsResult.stats ?? EMPTY_STATS)
    setLoading(false)
  }, [])

  useEffect(() => {
    // Defer the fetch to a task so the effect never sets state synchronously.
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  const visible = reviews.filter((r) => {
    if (filter === 'all') return true
    return filter === 'mastered' ? r.mastered : !r.mastered
  })

  // Grouped by error type — wrong → guessed → too slow → flagged — and due
  // first inside each group. The four are different problems with different
  // fixes, and one flat list hid which of them was costing the most marks; the
  // date sort on its own buried the three things worth doing today under forty
  // that are not due until next week.
  const ordered = [...visible].sort((a, b) => {
    const bucketDiff =
      ERROR_BUCKETS.indexOf(bucketFor(a.classification)) -
      ERROR_BUCKETS.indexOf(bucketFor(b.classification))
    if (bucketDiff !== 0) return bucketDiff
    const aDue = a.retry?.due ? 0 : 1
    const bDue = b.retry?.due ? 0 : 1
    if (aDue !== bDue) return aDue - bDue
    return (a.retry?.dueAt ?? '').localeCompare(b.retry?.dueAt ?? '')
  })
  const bucketCount = ordered.reduce<Record<string, number>>((acc, review) => {
    const bucket = bucketFor(review.classification)
    acc[bucket] = (acc[bucket] ?? 0) + 1
    return acc
  }, {})

  // The count on the button and the cards underneath it read from the same
  // state, so the CTA can never promise a run the list does not contain.
  const dueNow = reviews.filter((r) => !r.mastered && r.retry?.due).length
  const nextUp = reviews
    .filter((r) => !r.mastered && r.retry && !r.retry.due)
    .sort((a, b) => (a.retry?.dueAt ?? '').localeCompare(b.retry?.dueAt ?? ''))[0]

  async function handleMissReason(id: string, value: string) {
    const result = await updateMistakeReview(id, { miss_reason: value === '' ? null : value })
    if (!result.success) {
      setNotice(result.error ?? 'Could not save the reason.')
      return
    }
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, miss_reason: value === '' ? null : value } : r)))
    setNotice('Reason saved.')
  }

  async function handleMastered(id: string) {
    const result = await updateMistakeReview(id, { mastered: true })
    if (!result.success) {
      setNotice(result.error ?? 'Could not mark as mastered.')
      return
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, mastered: true, mastered_at: new Date().toISOString() } : r))
    )
    setStats((prev) => ({
      ...prev,
      notMastered: Math.max(0, prev.notMastered - 1),
      masteredCount: prev.masteredCount + 1,
    }))
    setNotice('Marked as mastered.')
  }

  async function handleFlashcard(id: string) {
    const result = await mistakeToFlashcard(id)
    setNotice(result.success ? 'Flashcard created.' : result.error ?? 'Could not create a flashcard.')
  }

  async function handleGuessed(id: string, guessed: boolean) {
    const result = await markMistakeGuessed(id, guessed)
    if (!result.success) {
      setNotice(result.error ?? 'Could not save that.')
      return
    }
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, classification: guessed ? 'guessed_incorrect' : 'incorrect' }
          : r
      )
    )
    setNotice(guessed ? 'Filed as a guess.' : 'Filed as a wrong answer.')
  }

  async function startReview() {
    setDueBusy(true)
    const result = await getDueMistakes()
    setDueBusy(false)
    if (result.error) {
      setNotice(result.error)
      return
    }
    setDueQuestions(result.questions)
    setMode('review')
  }

  function backToNotebook() {
    setMode('list')
    setDueQuestions([])
    void load()
  }

  async function handleBulkFlashcards() {
    setBulkBusy(true)
    const result = await mistakesToFlashcards([])
    setBulkBusy(false)
    setNotice(
      result.success
        ? `Cards: ${result.created} made${result.skipped > 0 ? `, ${result.skipped} already there` : ''}.`
        : result.error ?? 'Could not create the cards.'
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 text-foreground min-h-screen">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Mistake Recovery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Grouped by how you missed it — a wrong answer, a guess, a slow one, or a
          flagged question — retried at 1, 3 and 7 days, and mastered only after two
          correct re-answers.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="To revise" value={stats.notMastered} accent="rose" />
        <StatCard label="Mastered" value={stats.masteredCount} accent="emerald" />
        <StatCard
          label="Due today"
          value={reviews.filter((r) => !r.mastered && r.retry?.due).length}
          accent="amber"
        />
      </div>

      {mode === 'review' ? (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-extrabold tracking-tight">Today&apos;s review</h2>
          <MistakesDrill questions={dueQuestions} onExit={backToNotebook} />
        </section>
      ) : (
        <>
      {/* The run, at the top of the page and ahead of the list. The ladder and the
          mastery gate were labels until something put the question back in front
          of the student; this is that something. */}
      <section className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold tracking-tight">Today&apos;s review</h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
              {dueNow > 0
                ? `${dueNow} ${dueNow === 1 ? 'question is' : 'questions are'} due on the 1/3/7-day ladder. Answering here records the attempt, so mastery moves and the question can leave the notebook.`
                : nextUp?.retry
                  ? `Nothing is due yet — the next re-check is ${nextUp.retry.label
                      .replace(/^Due /, '')
                      .toLowerCase()}.`
                  : 'Nothing is due. A missed question comes back a day later, then three, then seven.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void startReview()}
            disabled={dueNow === 0 || dueBusy || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-foreground shadow transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {dueBusy ? 'Loading…' : dueNow > 0 ? `Start review (${dueNow})` : 'Nothing due'}
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(['unmastered', 'mastered', 'all'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === key
                ? 'bg-accent text-accent-foreground shadow'
                : 'text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            {key}
          </button>
        ))}

        {reviews.some((r) => !r.mastered) ? (
          <button
            type="button"
            onClick={() => void handleBulkFlashcards()}
            disabled={bulkBusy}
            className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-bold text-foreground transition-colors hover:border-accent disabled:opacity-50"
          >
            <Layers className="w-3.5 h-3.5" />
            {bulkBusy ? 'Making cards…' : 'Make cards from all new mistakes'}
          </button>
        ) : null}
      </div>

      {notice ? (
        <p className="mb-4 text-xs font-semibold text-[var(--color-text-muted)]">{notice}</p>
      ) : null}

      {loading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">Loading your mistake notebook...</div>
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          The mistake notebook is not available yet. {error}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
            🎉
          </div>
          <h3 className="text-xl font-bold">Nothing to revise in this view</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Missed questions you record will appear here for review and mastery.
          </p>
          <Link
            href="/dashboard/practice"
            className="inline-block px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-xs uppercase tracking-wider shadow"
          >
            Start a Practice Drill →
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {ordered.map((review, index) => {
            const bucket = bucketFor(review.classification)
            const startsBucket =
              index === 0 || bucketFor(ordered[index - 1].classification) !== bucket
            return (
            <Fragment key={review.id}>
            {startsBucket ? (
              <div
                className={`flex items-baseline justify-between gap-3 border-b border-border pb-2 ${
                  index === 0 ? '' : 'pt-6'
                }`}
              >
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {ERROR_BUCKET_LABELS[bucket]}
                </h2>
                <span className="text-xs font-semibold text-muted-foreground">
                  {bucketCount[bucket]} {bucketCount[bucket] === 1 ? 'question' : 'questions'}
                </span>
              </div>
            ) : null}
            <article key={review.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-secondary text-secondary-foreground">
                  <Flag className="w-3 h-3" />
                  {CLASSIFICATION_LABELS[review.classification] ?? review.classification}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    review.retry?.due ? 'text-rose-400' : 'text-muted-foreground'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {review.retry
                    ? review.retry.label
                    : new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="font-semibold text-base text-foreground leading-relaxed">
                {review.question_text ?? 'Question unavailable'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="font-bold text-emerald-400 block mb-1">Correct answer</span>
                  <span className="text-foreground font-medium">{review.question_correct_answer ?? '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-background border border-border text-xs">
                  <span className="font-bold text-foreground block mb-1">Topic</span>
                  <span className="text-muted-foreground">
                    {[review.question_subject, review.question_topic].filter(Boolean).join(' · ') || '—'}
                  </span>
                </div>
              </div>

              {review.question_explanation ? (
                <details className="rounded-xl bg-background border border-border p-4 text-xs text-muted-foreground">
                  <summary className="font-bold text-foreground cursor-pointer">Explanation</summary>
                  <p className="mt-2 leading-relaxed">{review.question_explanation}</p>
                </details>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  <span className="sr-only">Miss reason</span>
                  <select
                    value={review.miss_reason ?? ''}
                    onChange={(e) => void handleMissReason(review.id, e.target.value)}
                    className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground"
                  >
                    {MISS_REASON_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                {review.mastered ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
                  </span>
                ) : (
                  <button
                    onClick={() => void handleMastered(review.id)}
                    disabled={review.correct_streak < MASTERY_REQUIRED_CORRECT_STREAK}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold transition-opacity disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {review.correct_streak > 0
                      ? `Mastery ${review.correct_streak}/${MASTERY_REQUIRED_CORRECT_STREAK}`
                      : 'Mark mastered'}
                  </button>
                )}

                {!review.mastered &&
                review.correct_streak < MASTERY_REQUIRED_CORRECT_STREAK ? (
                  <span className="text-[11px] text-muted-foreground">
                    {review.correct_streak === 0
                      ? `Answer it right ${MASTERY_REQUIRED_CORRECT_STREAK}× to earn mastery.`
                      : `${MASTERY_REQUIRED_CORRECT_STREAK - review.correct_streak} more correct re-answer to earn mastery.`}
                  </span>
                ) : null}

                <button
                  onClick={() => void handleFlashcard(review.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Make flashcard
                </button>

                {/* The one error type the app cannot see for itself. */}
                <button
                  onClick={() =>
                    void handleGuessed(review.id, !review.classification.startsWith('guessed'))
                  }
                  aria-pressed={review.classification.startsWith('guessed')}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                    review.classification.startsWith('guessed')
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-background border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" /> I guessed
                </button>

                <Link
                  href="/dashboard/practice"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent"
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Retry similar
                </Link>
              </div>
            </article>
            </Fragment>
            )
          })}
        </div>
      )}
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: 'rose' | 'emerald' | 'amber' }) {
  const tone =
    accent === 'rose'
      ? 'text-rose-400'
      : accent === 'emerald'
        ? 'text-emerald-400'
        : accent === 'amber'
          ? 'text-amber-400'
          : 'text-foreground'
  return (
    <div className="bg-card border border-border rounded-2xl p-4 text-center">
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
