'use client'

import { useState } from 'react'
import { Clock, FileText, Play } from 'lucide-react'
import { MockTestPlayer } from '@/app/dashboard/mock-test/test/MockTestPlayer'
import type { QuizQuestion } from '@/lib/questions'

/**
 * Start gate for the public UHS 2025 sitting. MockTestPlayer starts its
 * countdown the moment it mounts, so rendering it inside the page would burn
 * the 180 minutes while a visitor is still reading the instructions.
 */
export function Uhs2025Sitting({
  questions,
  durationMinutes,
}: {
  questions: QuizQuestion[]
  durationMinutes: number
}) {
  const [started, setStarted] = useState(false)

  if (started) {
    return (
      <MockTestPlayer
        questions={questions}
        durationMinutes={durationMinutes}
        title="UHS MDCAT 2025 — Paper ID-D"
        recordAttempts={false}
      />
    )
  }

  return (
    <div className="glass-tile-glow rounded-[var(--radius-xl)] border border-[var(--line-2)] p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--steel-300)]">
        <span className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {questions.length} questions, as printed
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {durationMinutes} minutes, no pause
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[var(--steel-400)]">
        The clock starts when you begin and does not stop. There is no negative marking applied here —
        your score is simply the number of answers that match the official key. Answers are revealed
        with the key only after you submit; this paper ships without explanations, so none are invented
        for it.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--steel-500)]">
        Results on this page are not saved to an account. Sign in and use the dashboard mock tests to
        keep a record of your attempts.
      </p>

      <button
        type="button"
        onClick={() => setStarted(true)}
        className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--signal-500)] px-6 py-3 font-bold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--signal-600)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal-300)]"
      >
        <Play className="h-4 w-4" aria-hidden="true" />
        Start the 180-minute paper
      </button>
    </div>
  )
}
