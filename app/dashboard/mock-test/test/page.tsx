import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { fetchPublishedQuestions, fillQuestions, shuffleQuestions } from '@/lib/questions-repo'
import type { BankQuestion, QuizQuestion } from '@/lib/questions'
import { USAT_ELITE_BANK } from '@/lib/usat-comprehensive-bank'
import { buildUsatMockPaper, USAT_MOCK_MINUTES } from '@/lib/usat-mock'
import { NUST_NET_BANK } from '@/lib/nust-questions'
import { buildNetMockPaper, netMockMinutes } from '@/lib/nust-mock'
import { MockTestPlayer } from './MockTestPlayer'

export const metadata: Metadata = { title: 'Mock Test' }
export const dynamic = 'force-dynamic'

const TEST_CONFIGS: Record<string, { duration: number; sections: { name: string; count: number }[] }> = {
  full: {
    duration: 180,
    sections: [
      { name: 'Biology', count: 34 },
      { name: 'Chemistry', count: 24 },
      { name: 'Physics', count: 30 },
      { name: 'English', count: 12 },
    ],
  },
  'bio-heavy': {
    duration: 60,
    sections: [{ name: 'Biology', count: 40 }],
  },
  quick: {
    duration: 30,
    sections: [{ name: 'Mixed', count: 25 }],
  },
}

export default async function MockTestPage({ searchParams }: { searchParams: Promise<{ format?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { format } = await searchParams

  // The USAT paper never touches the Supabase pool: it is assembled from the
  // bundled USAT bank at the official scholarship split, reshuffled every run.
  if (format === 'usat-m') {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
        <MockTestPlayer
          questions={buildUsatMockPaper(USAT_ELITE_BANK)}
          durationMinutes={USAT_MOCK_MINUTES}
          format="usat-m"
        />
      </div>
    )
  }

  // The NET-Engineering paper never touches the Supabase pool: it is assembled
  // from the bundled NET bank at NUST's official weighting (scaled to what the
  // bank holds), reshuffled every run.
  if (format === 'net-eng') {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
        <MockTestPlayer
          questions={buildNetMockPaper(NUST_NET_BANK)}
          durationMinutes={netMockMinutes(NUST_NET_BANK)}
          format="net-eng"
        />
      </div>
    )
  }

  const config = TEST_CONFIGS[format || 'quick']
  if (!config) redirect('/dashboard/mock-test')

  // Fetch each section's questions (subject-filtered except the quick-test
  // Mixed pool), topped up from the general pool, then shuffled. The select
  // shape, publish gate, fill and shuffle all live in the question repo.
  const service = createServiceClient()
  const sectionSets = await Promise.all(
    config.sections.map((section) =>
      fetchPublishedQuestions(
        service,
        section.name === 'Mixed' ? { limit: section.count } : { subject: section.name, limit: section.count }
      )
    )
  )
  const totalNeeded = config.sections.reduce((sum, sec) => sum + sec.count, 0)
  const combined: QuizQuestion[] = []
  for (const set of sectionSets) combined.push(...set)
  // Rows without an id can't be recorded, so they are dropped.
  const questions = shuffleQuestions(await fillQuestions(service, combined, totalNeeded))
    .filter((q): q is BankQuestion => Boolean(q.id))

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
      <MockTestPlayer
        questions={questions}
        durationMinutes={config.duration}
        format={format || 'quick'}
      />
    </div>
  )
}
