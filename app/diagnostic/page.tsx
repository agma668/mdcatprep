import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchSubjectQuota, fetchPublishedQuestions, shuffleQuestions } from '@/lib/questions-repo'
import type { BankQuestion } from '@/lib/questions'
import { utcMidnight } from '@/lib/utils'
import { DiagnosticPlayer } from './DiagnosticPlayer'

export const metadata: Metadata = {
  title: 'Free Diagnostic Quiz — Check Your Level',
  description:
    'Take a free 10-question diagnostic quiz across Biology, Chemistry, Physics and English. Find your strongest and weakest subjects instantly.',
}

export const dynamic = 'force-dynamic'

const TARGET_SUBJECTS = ['Biology', 'Chemistry', 'Physics', 'English']
const PER_SUBJECT = 3

export default async function DiagnosticPage() {
  const service = createServiceClient()

  // Same-day freshness: a signed-in student must not meet a question they
  // already answered today (the same UTC dayKey the streak/goal logic uses)
  // on another surface — that is the cross-surface repeat this quiz used to
  // cause. Their today-attempted ids are excluded from the quota draw and
  // the set is topped up from the general pool; only when same-day
  // exclusions would leave fewer than 10 questions does the draw fall back
  // to the excluded quota picks (an honest session beats a stuck one).
  // Guests have no attempt history, so their draw is exactly as before — the
  // auth check is skipped entirely when no session cookie exists so a public
  // funnel page pays nothing extra for anonymous visitors.
  const cookieStore = await cookies()
  const hasSessionCookie = cookieStore.getAll().some((c) => c.name.includes('auth-token'))
  const excludedToday = new Set<string>()
  if (hasSessionCookie) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const since = utcMidnight(new Date()).toISOString()
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('question_id')
        .eq('student_id', user.id)
        .gte('created_at', since)
      for (const a of attempts ?? []) {
        const qid = a.question_id
        if (qid) excludedToday.add(qid)
      }
    }
  }

  // Fetch 2 published questions per target subject (quota + general-pool fill
  // live in the question repo), dropping anything answered today.
  const quotaRows = await fetchSubjectQuota(service, TARGET_SUBJECTS, PER_SUBJECT, 20)
  const questions: BankQuestion[] = quotaRows.filter((q): q is BankQuestion => {
    const qid = q.id
    return !!qid && !excludedToday.has(qid)
  })

  if (questions.length < 10) {
    // Same-day exclusions thinned the quota draw — top up from the general
    // pool, still skipping today's answers.
    const have = new Set(questions.map((q) => q.id).filter((id): id is string => Boolean(id)))
    const pool = await fetchPublishedQuestions(service, { limit: 150 })
    for (const q of pool) {
      const qid = q.id
      if (questions.length >= 10) break
      if (!qid || have.has(qid) || excludedToday.has(qid)) continue
      questions.push(q as BankQuestion)
      have.add(qid)
    }
    if (questions.length < 10) {
      // Nearly the whole bank was answered today — fall back to the excluded
      // quota picks rather than refusing to start.
      for (const q of quotaRows) {
        const qid = q.id
        if (questions.length >= 10) break
        if (qid && !have.has(qid)) {
          questions.push(q as BankQuestion)
          have.add(qid)
        }
      }
    }
  }

  // Shuffle 10 for a fair mix. Rows without an id can't be recorded, so
  // they are dropped.
  const finalQuestions = shuffleQuestions(questions).slice(0, 10)

  if (finalQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
        <div className="p-6 md:p-8 max-w-3xl mx-auto w-full text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-white mb-2">No questions available yet</h1>
          <p className="text-white/60 text-sm">The diagnostic quiz will be available once practice questions are published.</p>
          <Link href="/" className="inline-block mt-6 text-sm font-medium text-[var(--color-accent-light)] hover:underline">← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
        <DiagnosticPlayer questions={finalQuestions} />
      </div>
    </div>
  )
}
