import type { Metadata } from 'next'
import { resolveAdminContext, MissingServiceKeyNotice } from '@/lib/admin-context'
import { getStorageStatus } from '@/lib/storage'
import { AdminNotesManager } from './AdminNotesManager'

export const metadata: Metadata = { title: 'Notes' }

export const dynamic = 'force-dynamic'

export default async function AdminNotesPage() {
  const ctx = await resolveAdminContext()
  if (ctx.kind === 'missing-service-key') return <MissingServiceKeyNotice />
  const service = ctx.service
  const { data: notes, error } = await service
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load notes: {error.message}
      </div>
    )
  }

  const allNotes = notes ?? []
  const officialNotes = allNotes.filter(n => n.note_type === 'official')
  const studentNotes = allNotes.filter(n => n.note_type === 'student')

  const storage = await getStorageStatus()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notes</h1>
        <p className="text-white/70 mt-1">
          Publish official notes and review notes submitted by students.
        </p>
      </div>

      <AdminNotesManager
        initialOfficialNotes={officialNotes}
        initialStudentNotes={studentNotes}
        storageConfigured={storage.configured}
        storageReason={storage.reason}
      />
    </div>
  )
}
