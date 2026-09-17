'use client'

import { TrackedLink } from "@/components/TrackedLink";
import { useState } from 'react'
import Link from 'next/link'
import { Clock, Dices } from 'lucide-react'

const TIME_OPTIONS = [
  { label: 'Untimed', value: 0, desc: 'No time limit' },
  { label: '15 min', value: 15, desc: 'Quick session' },
  { label: '30 min', value: 30, desc: 'Standard practice' },
  { label: '45 min', value: 45, desc: 'Deep focus' },
] as const

export function TimeLimitSelector({
  subject,
  questionCount,
}: {
  subject: string
  questionCount: number
}) {
  const [selectedTime, setSelectedTime] = useState<number>(0)
  const [questionCountInput, setQuestionCountInput] = useState<number>(10)

  const count = Math.min(Math.max(questionCountInput, 1), Math.min(questionCount, 50))
  const timeParam = selectedTime > 0 ? `&time=${selectedTime}` : ''
  const quizHref = `/dashboard/practice/quiz?subject=${encodeURIComponent(subject)}&count=${count}${timeParam}`

  return (
    <div className="mt-6 glass-tile-glow border border-white/10 rounded-[var(--radius-lg)]  p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">
          Start Practice Session
        </h2>
      </div>

      {/* Time limit */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          Time Limit
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedTime(opt.value)}
              className={[
                'px-3 py-2.5 rounded-[var(--radius-md)] border-2 text-center transition-all duration-200 cursor-pointer',
                selectedTime === opt.value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'border-white/10 bg-white/[0.06]/[0.04] hover:border-[var(--color-primary)]/50 text-white/60',
              ].join(' ')}
            >
              <span className="block text-sm font-bold">{opt.label}</span>
              <span className="block text-[10px] text-[var(--color-text-muted)] mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question count */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          Questions
        </p>
        <div className="flex items-center gap-3">
          {[10, 20, 30].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setQuestionCountInput(n)}
              disabled={n > questionCount}
              className={[
                'px-4 py-2 rounded-[var(--radius-md)] border-2 text-sm font-bold transition-all duration-200 cursor-pointer',
                n > questionCount
                  ? 'opacity-40 cursor-not-allowed border-[var(--color-border)] bg-white/[0.06] text-[var(--color-text-muted)]'
                  : questionCountInput === n
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-white/10 bg-white/[0.06]/[0.04] hover:border-[var(--color-primary)]/50 text-white/60',
              ].join(' ')}
            >
              {n}
            </button>
          ))}
          <span className="text-xs text-[var(--color-text-muted)]">
            of {questionCount} available
          </span>
        </div>
      </div>

      {/* Start button */}
      <TrackedLink
        to={quizHref}
        className="group w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[var(--radius-md)] gradient-brand text-[var(--on-cta)] text-sm font-bold shadow-[var(--glow-signal-lg)] transition-all hover:brightness-110"
       label="time-limit-start">
        <Dices className="w-4 h-4" />
        {selectedTime > 0 ? `Start Timed Session (${selectedTime} min)` : 'Start Practice'}
      </TrackedLink>
    </div>
  )
}
