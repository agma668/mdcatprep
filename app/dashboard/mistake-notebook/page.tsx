'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle2, Flag, Sparkles, TrendingUp } from 'lucide-react'
import {
  getMyMistakeReviews,
  getMistakeStats,
  updateMistakeReview,
  mistakeToFlashcard,
  type MistakeReviewRow,
  type MistakeStats,
} from '@/app/actions/mistakes'

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

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 text-foreground min-h-screen">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Mistake Recovery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review what you missed, name why it happened, and earn mastery through repeated successful practice.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="To revise" value={stats.notMastered} accent="rose" />
        <StatCard label="Mastered" value={stats.masteredCount} accent="emerald" />
        <StatCard label="Categories" value={Object.keys(stats.byClassification).length} accent="amber" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
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
          {visible.map((review) => (
            <article key={review.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-secondary text-secondary-foreground">
                  <Flag className="w-3 h-3" />
                  {CLASSIFICATION_LABELS[review.classification] ?? review.classification}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
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
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark mastered
                  </button>
                )}

                <button
                  onClick={() => void handleFlashcard(review.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold text-foreground"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Make flashcard
                </button>

                <Link
                  href="/dashboard/practice"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent"
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Retry similar
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {reviews.length > 0 && Object.keys(stats.byClassification).length > 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> By classification
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.byClassification).map(([key, count]) => (
              <span key={key} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                {CLASSIFICATION_LABELS[key] ?? key}: {count}
              </span>
            ))}
          </div>
        </div>
      ) : null}
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
