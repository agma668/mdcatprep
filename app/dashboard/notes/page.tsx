import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStorageStatus } from '@/lib/storage'
import { getSiteUrl } from '@/lib/site'
import { getReferralInfo } from '@/app/actions/referral'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { NotesPageClient } from './NotesPageClient'

export const metadata: Metadata = { title: 'Important Notes' }

export const dynamic = 'force-dynamic'

export default async function StudentNotesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Students see: their own student notes (any status — they must know if a
  // note is pending review) and published official notes. RLS enforces that a
  // student can never read another student's private notes; the explicit
  // filters below are defense in depth.
  // Fetch ALL published notes (official + approved student notes) for everyone,
  // and the user's own notes (any status) for "My Notes".
  const [publishedResult, ownResult] = await Promise.all([
    supabase
      .from('notes')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false }),
    supabase
      .from('notes')
      .select('*')
      .eq('note_type', 'student')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false }),
  ])

  const officialNotes = publishedResult.error ? [] : (publishedResult.data ?? [])
  const ownNotes = ownResult.error ? [] : (ownResult.data ?? [])

  const storage = await getStorageStatus()
  // Server-side referral gate for the locked Master PDFs section. Fail-open to
  // a locked state if the referral feature is unavailable (pre-migration).
  const referral = await getReferralInfo()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <PageHeader
        eyebrow="Study material"
        title="Important Notes"
        description="Official syllabus, sample papers, and study materials for each college — plus subject-wise practice notes."
      />

      <NotesPageClient
        initialOwnNotes={ownNotes}
        initialOfficialNotes={officialNotes}
        storageConfigured={storage.configured}
        storageReason={storage.reason}
        masterPdfUnlocked={referral?.masterPdfUnlocked ?? false}
        masterPdfJoinedCount={referral?.joinedCount ?? 0}
        masterPdfGoal={referral?.masterPdfGoal ?? 5}
        masterPdfCode={referral?.code ?? null}
        masterPdfLink={referral?.code ? `${getSiteUrl()}/signup?ref=${referral.code}` : ''}
      />
    </div>
  )
}
