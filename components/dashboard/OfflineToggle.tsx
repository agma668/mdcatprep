'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Download, Trash2, Loader2, ArrowRight } from 'lucide-react'
import { cacheQuestions, getCachedCount, clearCachedQuestions, type OfflineQuestion } from '@/lib/offline'

export function OfflineToggle() {
  const [cachedCount, setCachedCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    getCachedCount().then(setCachedCount).catch(() => setCachedCount(0))
  }, [])

  const handleDownload = async () => {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/questions?status=published&limit=200')
      if (!res.ok) throw new Error('Failed to fetch questions')
      const data = await res.json()
      const questions: OfflineQuestion[] = (data.questions ?? data ?? []).map((q: Record<string, unknown>) => ({
        id: q.id as string,
        subject: q.subject as string,
        topic: (q.topic as string) || null,
        question_text: q.question_text as string,
        option_a: q.option_a as string,
        option_b: q.option_b as string,
        option_c: (q.option_c as string) || null,
        option_d: (q.option_d as string) || null,
        correct_answer: q.correct_answer as string,
        explanation: (q.explanation as string) || null,
      }))
      if (questions.length === 0) {
        setStatus('No questions available to cache.')
        setLoading(false)
        return
      }
      const count = await cacheQuestions(questions)
      setCachedCount(count)
      setStatus(
        count === 1
          ? 'Cached 1 question. Visit Offline Practice once while online, then it works with no internet.'
          : `Cached ${count} questions. Visit Offline Practice once while online, then it works with no internet.`
      )
    } catch {
      setStatus('Failed to download questions. Try again.')
    }
    setLoading(false)
  }

  const handleClear = async () => {
    setLoading(true)
    await clearCachedQuestions()
    setCachedCount(0)
    setStatus('Offline bank cleared.')
    setLoading(false)
  }

  return (
    <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="icon-tile w-10 h-10 rounded-[var(--radius-md)] text-xl bg-white/[0.06]">
          📴
        </span>
        <div>
          <h3 className="font-bold text-[var(--color-text-primary)]">Offline Practice</h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            {cachedCount !== null
              ? `${cachedCount} question${cachedCount === 1 ? '' : 's'} cached`
              : 'Checking cache…'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-sm font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download for Offline
        </button>

        {cachedCount !== null && cachedCount > 0 && (
          <Link
            href="/offline-practice"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary-light)] hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            Practice Offline
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}

        {cachedCount !== null && cachedCount > 0 && (
          <button
            onClick={handleClear}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] border border-white/10 text-white/60 text-sm font-semibold hover:border-rose-500/30 hover:text-rose-400 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {status && (
        <p className="text-xs text-[var(--color-text-muted)] mt-3">{status}</p>
      )}
    </div>
  )
}
