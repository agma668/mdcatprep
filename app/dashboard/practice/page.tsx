import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/student";
import { MDCAT_QUESTIONS } from "@/lib/mdcat";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PracticeClient } from './PracticeClient'

export const metadata: Metadata = { title: 'Practice' }

export const dynamic = 'force-dynamic'

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ college?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Gather the available subjects / topics / difficulties from published
  // questions so the student only sees real options (and a clear message when
  // there is nothing to practice yet).
  const { data: published } = await supabase
    .from('questions')
    .select('subject, topic, difficulty')
    .eq('status', 'published')

  const rows = published ?? []
  const allSubjects = [...new Set(rows.map(r => r.subject).filter(Boolean))].sort()
  const countsBySubject: Record<string, number> = {}
  for (const row of rows) {
    if (row.subject) countsBySubject[row.subject] = (countsBySubject[row.subject] ?? 0) + 1
  }

  // Get student's initial college from profile or URL query param
  // Exam-style bank sizes per subject (for the chooser cards — the questions
  // themselves render on the dedicated /practice/session route).
  const bankCountsBySubject: Record<string, number> = {}
  for (const row of MDCAT_QUESTIONS) {
    if (row.subject) bankCountsBySubject[row.subject] = (bankCountsBySubject[row.subject] ?? 0) + 1
  }

  const { profile } = await getStudentProfile()
  const params = await searchParams
  const queryCollege = params.college || null

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="Sharpen your skills"
        title="Practice"
        description="Practice exam-style questions modelled on real entry tests, or pick a subject to drill academy questions. Every answer is recorded to your analytics."
      />

      <PracticeClient
        allSubjects={allSubjects}
        countsBySubject={countsBySubject}
        totalCount={rows.length}
        initialCollege={queryCollege || profile?.exam_target || null}
        bankCountsBySubject={bankCountsBySubject}
      />
    </div>
  )
}
