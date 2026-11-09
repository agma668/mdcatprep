'use client'

import { useState } from 'react'
import { CalendarClock, Layers, Sparkles } from 'lucide-react'
import {
  getFlashcardDashboard,
  setDailyNewLimit,
  type FlashcardDashboardPayload,
} from '@/app/actions/flashcards'

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[var(--color-surface)] p-3 text-center">
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-1">
        {label}
      </p>
    </div>
  )
}

export function ReviewDashboard({ initial }: { initial: FlashcardDashboardPayload }) {
  const [data, setData] = useState(initial)
  const [limit, setLimit] = useState(initial.dailyNewLimit)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function saveLimit() {
    setSaving(true)
    const result = await setDailyNewLimit(limit)
    if (!result.success) {
      setMessage(result.error ?? 'Could not save the limit.')
      setSaving(false)
      return
    }
    const refreshed = await getFlashcardDashboard()
    setData(refreshed)
    setLimit(refreshed.dailyNewLimit)
    setMessage('Daily new-card limit saved.')
    setSaving(false)
  }

  if (data.unavailable) return null

  const s = data.summary

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-[var(--color-surface)] p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="text-sm font-bold flex items-center gap-1.5 text-[var(--color-text-primary)]">
          <Layers className="w-4 h-4" /> Your review queue
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          {data.queueSize} card{data.queueSize === 1 ? '' : 's'} ready today
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="New" value={s.newCount} tone="text-[var(--color-primary)]" />
        <Stat label="Due" value={s.dueCount} tone="text-rose-400" />
        <Stat label="Learning" value={s.learningCount} tone="text-amber-400" />
        <Stat label="Relearning" value={s.relearningCount} tone="text-orange-400" />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-xs font-semibold text-[var(--color-text-muted)]">
          <span className="block mb-1">Daily new-card limit</span>
          <input
            type="number"
            min={0}
            max={500}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-24 rounded-lg border border-white/10 bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          />
        </label>
        <button
          onClick={() => void saveLimit()}
          disabled={saving}
          className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-[var(--color-primary-foreground)] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save limit'}
        </button>
        {message ? <span className="text-xs text-[var(--color-text-muted)]">{message}</span> : null}
      </div>

      {s.upcoming.length > 0 ? (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5 mb-2">
            <CalendarClock className="w-3.5 h-3.5" /> Next 7 days
          </p>
          <div className="flex flex-wrap gap-2">
            {s.upcoming.map((day) => (
              <span
                key={day.date}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-background)] border border-white/10 text-[var(--color-text-muted)]"
              >
                {day.date.slice(5)}: {day.count}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Nothing scheduled beyond today.
        </p>
      )}
    </section>
  )
}
