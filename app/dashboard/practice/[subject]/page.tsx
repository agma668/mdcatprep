import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { subjectIcon } from '@/lib/subjects'
import { PenLine } from 'lucide-react'
import { TimeLimitSelector } from './TimeLimitSelector'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>
}): Promise<Metadata> {
  const { subject } = await params
  const title = decodeURIComponent(subject)
  return { title: `${title} Practice` }
}

export default async function SubjectPracticePage({
  params,
}: {
  params: Promise<{ subject: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const subject = decodeURIComponent((await params).subject)

  const { data: published } = await supabase
    .from('questions')
    .select('topic, difficulty')
    .eq('status', 'published')
    .eq('subject', subject)

  const rows = published ?? []

  const topics: { name: string; count: number; difficulties: string[] }[] = []
  const map = new Map<string, { count: number; difficulties: Set<string> }>()
  for (const row of rows) {
    const name = row.topic?.trim() || 'General'
    if (!map.has(name)) map.set(name, { count: 0, difficulties: new Set() })
    const entry = map.get(name)!
    entry.count += 1
    if (row.difficulty) entry.difficulties.add(row.difficulty)
  }
  for (const [name, entry] of map) {
    topics.push({
      name,
      count: entry.count,
      difficulties: [...entry.difficulties].sort(),
    })
  }
  topics.sort((a, b) => b.count - a.count)

  // Sparse-topic rule: a topic needs enough questions to be worth its own
  // drill. Anything below the threshold would send a student into a 1–2
  // question session (observed live: many topics carry a single question).
  // Small topics are combined into one honest "quick mix" card instead — a
  // real 10-question session across the subject, never a dead end.
  const SMALL_TOPIC_LIMIT = 10
  const bigTopics = topics.filter((t) => t.count >= SMALL_TOPIC_LIMIT)
  const smallTopics = topics.filter((t) => t.count < SMALL_TOPIC_LIMIT)
  const smallQuestionCount = smallTopics.reduce((sum, t) => sum + t.count, 0)
  const smallDifficulties = [...new Set(smallTopics.flatMap((t) => t.difficulties))].sort()

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <Link
        href="/dashboard/practice"
        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        ← All subjects
      </Link>

      <div className="mt-3 flex items-center gap-3 mb-2">
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-12 h-12 rounded-[var(--radius-md)] text-2xl bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]/10"
        >
          {subjectIcon(subject)}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gradient-brand">
            {subject}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {rows.length} published question{rows.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-dashed border-white/15  p-10 text-center mt-6">
          <p className="text-4xl mb-3" aria-hidden="true">🔍</p>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            No questions published yet
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Check back soon — the academy is adding questions.
          </p>
        </div>
      ) : (
        <>
          {/* Time limit selector */}
          <TimeLimitSelector subject={subject} questionCount={rows.length} />

          {/* English extras: passage + composition */}
          {subject === 'English' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Link
                href="/dashboard/practice/passage"
                className="group card-lift glass-tile-glow border border-white/10 rounded-[var(--radius-lg)]  p-6"
              >
                <span
                  aria-hidden="true"
                  className="icon-tile w-12 h-12 rounded-[var(--radius-md)] text-2xl bg-indigo-500/10"
                >
                  📄
                </span>
                <h3 className="mt-4 font-bold text-[var(--color-text-primary)] text-lg">
                  Passage Practice
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Read a passage and answer the questions, just like the real paper.
                </p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-[var(--color-primary)]">
                  Start passage
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
              <Link
                href="/dashboard/essays"
                className="group card-lift glass-tile-glow border border-white/10 rounded-[var(--radius-lg)]  p-6"
              >
                <span
                  aria-hidden="true"
                  className="icon-tile w-12 h-12 rounded-[var(--radius-md)] bg-amber-500/10"
                >
                  <PenLine className="w-6 h-6 text-[#b45309]" />
                </span>
                <h3 className="mt-4 font-bold text-[var(--color-text-primary)] text-lg">
                  Composition Practice
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Get a random essay or story topic and write 200–250 words.
                </p>
                <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-[var(--color-primary)]">
                  Get a topic
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            </div>
          )}

          {/* Topic tiles — individual drills only for topics big enough to
              stand alone; smaller topics are combined into a quick-mix card */}
          {bigTopics.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mt-8 mb-3">
                Practice by topic
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bigTopics.map(t => (
                  <Link
                    key={t.name}
                    href={`/dashboard/practice/quiz?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(t.name)}&count=10`}
                    className="group card-lift glass-tile-glow border border-white/10 rounded-[var(--radius-lg)]  p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        aria-hidden="true"
                        className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] text-xl bg-indigo-500/10"
                      >
                        {subjectIcon(subject)}
                      </span>
                      <span className="text-[11px] font-bold text-[var(--color-text-muted)] bg-white/[0.06]/[0.04] border border-white/10 rounded-full px-2.5 py-1">
                        {t.count} Qs
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold text-[var(--color-text-primary)] leading-snug">
                      {t.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {t.difficulties.length > 0
                        ? t.difficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(' · ')
                        : 'Mixed difficulty'}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Quick mix — sparse topics combined into one real session */}
          {smallTopics.length > 0 && (
            <div className={bigTopics.length > 0 ? 'mt-8' : 'mt-6'}>
              {bigTopics.length === 0 && (
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                  Practice
                </h2>
              )}
              <Link
                href={`/dashboard/practice/quiz?subject=${encodeURIComponent(subject)}&count=10`}
                className="group card-lift glass-tile-glow flex flex-col sm:flex-row sm:items-center gap-4 border border-[var(--color-primary)]/25 rounded-[var(--radius-lg)] p-6 bg-gradient-to-br from-[var(--color-primary)]/[0.07] to-transparent"
              >
                <span
                  aria-hidden="true"
                  className="flex items-center justify-center w-12 h-12 shrink-0 rounded-[var(--radius-md)] text-2xl bg-[var(--color-primary)]/15 ring-1 ring-[var(--color-primary)]/25"
                >
                  {subjectIcon(subject)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-[var(--color-text-primary)] leading-snug">
                    Quick mix — every {subject} topic
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {smallTopics.length} small topic{smallTopics.length === 1 ? '' : 's'} combined into one {Math.min(10, smallQuestionCount)}-question drill — a proper session, never a one-question dead end.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-[11px] font-bold text-[var(--color-text-muted)] bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-1">
                    {smallQuestionCount} Qs
                  </span>
                  <span className="hidden sm:block text-xs text-[var(--color-text-muted)]">
                    {smallDifficulties.length > 0
                      ? smallDifficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(' · ')
                      : 'Mixed difficulty'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)]">
                    Start
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
