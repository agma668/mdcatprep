import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { MockTestSetup } from './MockTestSetup'

export const metadata: Metadata = { title: 'Mock Test' }
export const dynamic = 'force-dynamic'

const TEST_FORMATS = [
  {
    id: 'cch',
    name: 'CCH Hasanabdal',
    duration: 180, // 3 hours
    totalMarks: 200,
    sections: [
      { name: 'Mathematics', questions: 25, marks: 50 },
      { name: 'English', questions: 20, marks: 40 },
      { name: 'Islamiat', questions: 5, marks: 10 },
      { name: 'General Science', questions: 25, marks: 50 },
      { name: 'Urdu', questions: 25, marks: 50 },
    ],
  },
  {
    id: 'paf',
    name: 'PAF College Sargodha',
    duration: 180,
    totalMarks: 200,
    sections: [
      { name: 'Mathematics', questions: 25, marks: 50 },
      { name: 'English', questions: 25, marks: 50 },
      { name: 'General Knowledge', questions: 25, marks: 50 },
      { name: 'Intelligence Test', questions: 25, marks: 50 },
    ],
  },
  {
    id: 'mcj',
    name: 'Military College Jhelum',
    duration: 180,
    totalMarks: 200,
    sections: [
      { name: 'Mathematics', questions: 25, marks: 50 },
      { name: 'English', questions: 25, marks: 50 },
      { name: 'General Science', questions: 25, marks: 50 },
      { name: 'General Knowledge', questions: 25, marks: 50 },
    ],
  },
  {
    id: 'quick',
    name: 'Quick Practice (30 min)',
    duration: 30,
    totalMarks: 50,
    sections: [
      { name: 'Mixed', questions: 25, marks: 50 },
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
        description="Full-length practice exams matching real college entry test patterns. Timed, sectioned, and scored exactly like the real thing."
      />
      <MockTestSetup formats={TEST_FORMATS} />
    </div>
  )
}
