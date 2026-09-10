import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchAdaptiveQuestions } from '@/lib/analytics/question-scheduler'
import type { BankQuestion } from '@/lib/questions'
import { McqPlayer } from './McqPlayer'

export const metadata: Metadata = { title: 'Practice Session' }

export const dynamic = 'force-dynamic'

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; topic?: string; difficulty?: string; count?: string; time?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { subject, topic, difficulty, count, time } = await searchParams

  // Default 10; clamp to a sane range so a URL can't request thousands of rows.
  const parsedCount = Number(count)
  const limit = Number.isFinite(parsedCount) ? Math.min(Math.max(parsedCount, 1), 50) : 10

  // Parse time limit (minutes); 0 = untimed
  const parsedTime = Number(time)
  const timeLimitMinutes = Number.isFinite(parsedTime) && parsedTime > 0
    ? Math.min(Math.max(parsedTime, 1), 120)
    : 0

  // Use adaptive scheduling to prioritize weak areas and ensure variety
  const qs = await fetchAdaptiveQuestions(
    user.id,
    { subject, topic, difficulty },
    limit
  )

  if (qs.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-10 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
            No questions match your filters
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Try a different subject, topic, or difficulty.
          </p>
          <Link
            href="/dashboard/practice"
            className="inline-block mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            ← Back to practice setup
          </Link>
        </div>
      </div>
    )
  }

  // Rows without an id can't be recorded, so they are dropped rather than
  // rendered un-answerable.
  const questions = qs.filter((q): q is BankQuestion => !!q.id)

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <McqPlayer questions={questions} timeLimitMinutes={timeLimitMinutes} />
    </div>
  )
}
