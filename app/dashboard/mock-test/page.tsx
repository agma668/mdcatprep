import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { MockTestSetup } from './MockTestSetup'

export const metadata: Metadata = { title: 'Mock Test' }
export const dynamic = 'force-dynamic'

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
        description="Timed, sectioned mock tests weighted like the PMDC MDCAT paper — Biology heaviest, then Physics and Chemistry, then English. 1 mark per MCQ, from our own question bank."
      />
      <MockTestSetup formats={TEST_FORMATS} />
    </div>
  )
}
