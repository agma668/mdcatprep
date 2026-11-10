'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition, type FormEvent } from 'react'
import { Archive, CalendarDays, Check, Pause, Play, Plus, Star } from 'lucide-react'
import {
  archiveGoal,
  createStudentGoal,
  setPrimaryGoal,
  updateStudentGoal,
  type ExamOption,
  type GoalStatus,
  type StudentGoal,
} from '@/app/actions/goals'

const STATUS_LABEL: Record<GoalStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
}

const STATUS_TONE: Record<GoalStatus, string> = {
  active: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  paused: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  completed: 'border-sky-400/25 bg-sky-400/10 text-sky-300',
  archived: 'border-white/10 bg-white/[0.05] text-white/55',
}

function formatDate(value: string | null): string {
  if (!value) return 'No target date'
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function GoalsClient({ goals, exams }: { goals: StudentGoal[]; exams: ExamOption[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [examId, setExamId] = useState(exams[0]?.id ?? '')
  const [variantId, setVariantId] = useState(exams[0]?.variants[0]?.id ?? '')
  const [targetDate, setTargetDate] = useState('')

  const selectedExam = exams.find((exam) => exam.id === examId)
  const variants = selectedExam?.variants ?? []
  const showingArchived = goals.some((goal) => goal.status === 'archived')

  function chooseExam(nextExamId: string) {
    setExamId(nextExamId)
    setVariantId(exams.find((exam) => exam.id === nextExamId)?.variants[0]?.id ?? '')
    setError(null)
  }

  function run(action: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action()
      if (!result.success) {
        setError(result.error ?? 'Could not update this goal.')
        return
      }
      setError(null)
      router.refresh()
    })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!examId || !variantId) {
      setError('Choose an exam and paper first.')
      return
    }
    startTransition(async () => {
      const result = await createStudentGoal({ examId, variantId, targetDate: targetDate || null })
      if (!result.success) {
        setError(result.error ?? 'Could not save this goal.')
        return
      }
      setError(null)
      setTargetDate('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section
        aria-label="Add a preparation goal"
        className="rounded-[var(--radius-xl)] border border-white/10 bg-[var(--color-surface)] p-5 sm:p-6"
      >
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
          <Plus className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
          Add a goal
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          You can hold several goals at once. Only one active goal per paper is allowed; your first
          active goal becomes primary.
        </p>

        {exams.length === 0 ? (
          <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-[var(--color-text-muted)]">
            No Prep Spaces are open for goals yet. Browse the{' '}
            <Link href="/exams" className="font-semibold text-[var(--color-primary)] hover:underline">
              Prep Space catalogue
            </Link>{' '}
            to see what is in progress.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)]">
              Exam
              <select
                value={examId}
                onChange={(event) => chooseExam(event.target.value)}
                disabled={pending}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[var(--field-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-[var(--color-text-muted)]">
              Paper
              <select
                value={variantId}
                onChange={(event) => setVariantId(event.target.value)}
                disabled={pending || variants.length === 0}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[var(--field-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              >
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-[var(--color-text-muted)]">
              Target date <span className="font-normal">(optional)</span>
              <input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                disabled={pending}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[var(--field-2)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={pending || !examId || !variantId}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/15 px-4 py-2 text-sm font-bold text-[var(--color-primary-light)] transition-colors hover:bg-[var(--color-primary)]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {pending ? 'Saving…' : 'Save goal'}
              </button>
            </div>
          </form>
        )}

        {error ? (
          <p role="alert" className="mt-3 rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-300">
            {error}
          </p>
        ) : null}
      </section>

      <section aria-label="Saved goals" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
            Saved goals <span className="font-normal text-[var(--color-text-muted)]">({goals.length})</span>
          </h2>
          <Link href="/exams" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
            Browse Prep Spaces
          </Link>
        </div>

        {goals.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[var(--color-surface)] p-5 text-sm text-[var(--color-text-muted)]">
            No goals saved yet. Add the exam you are preparing for above.
          </p>
        ) : (
          <ul className="space-y-3">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className="rounded-[var(--radius-lg)] border border-white/10 bg-[var(--color-surface)] p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{goal.examTitle}</h3>
                      {goal.isPrimary ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--signal-400)]/30 bg-[var(--signal-500)]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--signal-200)]">
                          <Star className="h-3 w-3" aria-hidden="true" />
                          Primary
                        </span>
                      ) : null}
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONE[goal.status]}`}>
                        {STATUS_LABEL[goal.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{goal.variantTitle}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatDate(goal.targetDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {goal.status === 'active' && !goal.isPrimary ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => setPrimaryGoal(goal.id))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition-colors hover:border-[var(--signal-400)]/40 hover:text-[var(--signal-200)] disabled:opacity-50"
                      >
                        <Star className="h-3.5 w-3.5" aria-hidden="true" />
                        Make primary
                      </button>
                    ) : null}

                    {goal.status === 'active' ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => updateStudentGoal(goal.id, { status: 'paused' }))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition-colors hover:text-amber-300 disabled:opacity-50"
                      >
                        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                        Pause
                      </button>
                    ) : null}

                    {goal.status === 'paused' ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => updateStudentGoal(goal.id, { status: 'active' }))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition-colors hover:text-emerald-300 disabled:opacity-50"
                      >
                        <Play className="h-3.5 w-3.5" aria-hidden="true" />
                        Resume
                      </button>
                    ) : null}

                    {goal.status !== 'archived' ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => archiveGoal(goal.id))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition-colors hover:text-red-300 disabled:opacity-50"
                      >
                        <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                        Archive
                      </button>
                    ) : null}

                    {goal.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-300">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        Completed
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showingArchived ? (
          <p className="text-xs text-[var(--color-text-muted)]">
            Archived goals stay in your history; they no longer block starting the same paper again.
          </p>
        ) : null}
      </section>
    </div>
  )
}
