import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { USAT_MOCK_SPLIT, USAT_MOCK_TOTAL } from '@/lib/usat-mock'
import { MockTestSetup } from './MockTestSetup'

export const metadata: Metadata = { title: 'Mock Test' }
export const dynamic = 'force-dynamic'

/**
 * The HEC USAT-M scholarship paper's sections come from the USAT mock lib so
 * the format card, the assembled paper and the pattern line it names can never
 * drift apart — one split, three readers.
 */
const USAT_M_FORMAT = {
  id: 'usat-m',
  name: 'HEC USAT-M Scholarship Mock',
  duration: 100,
  totalMarks: USAT_MOCK_TOTAL,
  description:
    'The Balochistan / ex-FATA scholarship pattern — Verbal 26 · Quantitative 32 · Physics 11 · Chemistry 11 · Biology 20, 50% pass — sectioned like the real paper, served from the dedicated USAT bank.',
  sections: USAT_MOCK_SPLIT.map((s) => ({ name: s.subject, questions: s.count, marks: s.count })),
}

const TEST_FORMATS = [
  {
    id: 'full',
    name: 'MDCAT-Weighted Full Mock',
    duration: 180, // 3 hours
    totalMarks: 100,
    sections: [
      { name: 'Biology', questions: 34, marks: 34 },
      { name: 'Chemistry', questions: 24, marks: 24 },
      { name: 'Physics', questions: 30, marks: 30 },
      { name: 'English', questions: 12, marks: 12 },
    ],
  },
  {
    id: 'bio-heavy',
    name: 'Biology Focus (60 min)',
    duration: 60,
    totalMarks: 40,
    sections: [
      { name: 'Biology', questions: 40, marks: 40 },
    ],
  },
  {
    id: 'quick',
    name: 'Quick Practice (30 min)',
    duration: 30,
    totalMarks: 25,
    sections: [
      { name: 'Mixed', questions: 25, marks: 25 },
    ],
  },
  USAT_M_FORMAT,
]

export default async function MockTestPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <PageHeader
        eyebrow="Full-length simulation"
        title="Mock Test"
        description="Timed, sectioned mock tests. The board mocks weight the PMDC MDCAT paper — Biology heaviest, then Physics and Chemistry, then English — and pull from the academy question bank; the HEC USAT-M paper runs its own scholarship pattern (100 MCQs · 100 minutes) from the dedicated USAT bank. 1 mark per MCQ."
      />
      <MockTestSetup formats={TEST_FORMATS} />
    </div>
  )
}
