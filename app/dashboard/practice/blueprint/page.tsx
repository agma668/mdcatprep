import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VERIFIED_BLUEPRINTS } from '@/lib/quiz/registry'
import { loadBlueprintQuiz } from '@/lib/quiz/load'
import type { BankQuestion } from '@/lib/questions'
import { McqPlayer } from '../quiz/McqPlayer'

export const metadata: Metadata = { title: 'Blueprint Practice' }

export const dynamic = 'force-dynamic'

export default async function BlueprintPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ blueprint?: string; count?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { blueprint: blueprintId, count } = await searchParams
  const parsedCount = Number(count)
  const total = Number.isFinite(parsedCount) ? Math.min(Math.max(parsedCount, 5), 50) : 20

  // No blueprint chosen yet: let the student pick a verified pattern.
  if (!blueprintId) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Blueprint practice</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Build a quiz that matches a verified exam subject split.
        </p>
        <div className="mt-6 space-y-3">
          {VERIFIED_BLUEPRINTS.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No verified exam blueprints are available yet.
            </p>
          ) : (
            VERIFIED_BLUEPRINTS.map((bp) => (
              <Link
                key={bp.id}
                href={`/dashboard/practice/blueprint?blueprint=${encodeURIComponent(bp.id)}&count=20`}
                className="block rounded-xl border border-white/10 bg-[var(--color-surface)] p-4 hover:border-[var(--color-primary)]"
              >
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{bp.id}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">{bp.sourceNote}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    )
  }

  const quiz = await loadBlueprintQuiz(blueprintId, total)
  if (!quiz) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
        <p className="text-sm text-[var(--color-text-primary)]">That blueprint is not available.</p>
        <Link href="/dashboard/practice/blueprint" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Choose another
        </Link>
      </div>
    )
  }

  const questions = quiz.questions.filter((q): q is BankQuestion => Boolean(q.id))

  if (questions.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
        <p className="text-sm text-[var(--color-text-primary)]">No published questions match this blueprint yet.</p>
        <Link href="/dashboard/practice" className="text-sm text-[var(--color-primary)] hover:underline">
          ← Back to practice setup
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-4 rounded-xl border border-white/10 bg-[var(--color-surface)] p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Blueprint</p>
        <p className="text-sm text-[var(--color-text-primary)] mt-1">
          {quiz.plan.sections.map((s) => `${s.subject}: ${s.count}`).join(' · ')}
        </p>
        {quiz.shortfall.length > 0 ? (
          <p className="text-xs text-amber-500 mt-1">
            Bank shortfall: {quiz.shortfall.map((s) => `${s.subject} (−${s.count})`).join(', ')}
          </p>
        ) : null}
      </div>
      <McqPlayer questions={questions} timeLimitMinutes={0} />
    </div>
  )
}
