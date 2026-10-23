import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server";
import { getStudentProfile } from "@/lib/student";
import { MDCAT_QUESTIONS } from "@/lib/mdcat";
import { USAT_ELITE_BANK } from "@/lib/usat-comprehensive-bank";
import { deriveUsatDrill } from "@/lib/usat-drill";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { PracticeClient } from './PracticeClient'

export const metadata: Metadata = { title: 'Practice' }

export const dynamic = 'force-dynamic'

/**
 * Count a bank's questions by subject (and subject → topic for the drill
 * navigator). Extracted so the two bundled banks — MDCAT and HEC USAT-M —
 * are counted by the one helper and can never render from two different
 * derivation styles drifting apart.
 */
function bankCounts(bank: readonly { subject?: string; topic?: string }[]) {
  const countsBySubject: Record<string, number> = {}
  const topicsBySubject: Record<string, Record<string, number>> = {}
  for (const row of bank) {
    if (!row.subject) continue
    countsBySubject[row.subject] = (countsBySubject[row.subject] ?? 0) + 1
    if (row.topic) {
      if (!topicsBySubject[row.subject]) topicsBySubject[row.subject] = {}
      topicsBySubject[row.subject][row.topic] =
        (topicsBySubject[row.subject][row.topic] ?? 0) + 1
    }
  }
  return { countsBySubject, topicsBySubject }
}

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
  // Bundled bank sizes per subject — one set per bank, all derived from the
  // real arrays. The client switches between them when the student picks which
  // test inside the medical portal they are preparing for (MDCAT boards vs the
  // HEC USAT-M scholarship test, which run different papers entirely).
  const mdcat = bankCounts(MDCAT_QUESTIONS)
  const usat = bankCounts(USAT_ELITE_BANK)
  const usatDrill = deriveUsatDrill(USAT_ELITE_BANK)

  const { profile } = await getStudentProfile()
  const params = await searchParams
  const queryCollege = params.college || null

  // The URL param and the profile target are passed separately: the client
  // ranks URL > stored sidebar choice > profile (see PracticeClient).

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
        queryCollege={queryCollege}
        profileCollege={profile?.exam_target || null}
        bankCountsBySubject={mdcat.countsBySubject}
        bankTopicsBySubject={mdcat.topicsBySubject}
        usatCountsBySubject={usat.countsBySubject}
        usatDrill={usatDrill}
      />
    </div>
  )
}
