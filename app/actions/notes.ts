'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth'
import { getStorageProvider, getStorageStatus } from '@/lib/storage'
import { cleanString } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const VALID_STATUSES = ['draft', 'published', 'hidden', 'pending_review'] as const

function isNoteStatus(value: string): value is (typeof VALID_STATUSES)[number] {
  return (VALID_STATUSES as readonly string[]).includes(value)
}

/** Handle the file/link part of a note submission. Returns note fields. */
async function resolveFileFields(formData: FormData) {
  const file = formData.get('file')
  const driveLink = cleanString(formData.get('drive_link'), 2000)

  if (file instanceof File && file.size > 0) {
    const provider = await getStorageProvider()
    if (!provider.isConfigured()) {
      throw new Error(
        'File upload is not available yet — Google Drive is not connected. Please provide a link instead.'
      )
    }
    const stored = await provider.uploadFile({
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      data: await file.arrayBuffer(),
    })
    return {
      storage_provider: 'google_drive' as const,
      drive_file_id: stored.id,
      drive_link: stored.webViewLink || stored.webContentLink,
      file_name: stored.name,
      file_type: stored.mimeType,
      file_size: stored.size,
    }
  }

  if (driveLink) {
    return {
      storage_provider: 'external' as const,
      drive_file_id: null,
      drive_link: driveLink,
      file_name: null,
      file_type: null,
      file_size: null,
    }
  }

  throw new Error('Please attach a file or provide a link to the note.')
}

async function deleteNoteFile(note: {
  drive_file_id: string | null
  storage_provider: string | null
}) {
  if (!note.drive_file_id) return
  if (note.storage_provider !== 'google_drive') return
  try {
    const provider = await getStorageProvider()
    await provider.deleteFile(note.drive_file_id)
  } catch (err) {
    // Best effort — never block the DB delete on Drive cleanup.
    console.error('Failed to delete note file from storage:', err)
  }
}

// ---------------------------------------------------------------------------
// Student actions (authenticated client + RLS: students may only touch notes
// they uploaded themselves)
// ---------------------------------------------------------------------------

export async function createStudentNote(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // The student form asks for a Topic (no separate title) — use it as the
  // display title too, so the notes table stays consistent.
  const topic = cleanString(formData.get('topic'), 100)
  const title = cleanString(formData.get('title'), 300) || topic
  const subject = cleanString(formData.get('subject'), 100)
  const description = cleanString(formData.get('description'), 2000)

  if (!title) return { error: 'Topic is required.' }
  if (!subject) return { error: 'Subject is required.' }

  let fileFields: Awaited<ReturnType<typeof resolveFileFields>>
  try {
    fileFields = await resolveFileFields(formData)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'File handling failed.' }
  }

  // Uploader display name comes from the profile (read server-side).
  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('notes').insert({
    title,
    subject,
    topic: topic || null,
    description: description || null,
    note_type: 'student',
    status: 'pending_review',
    uploaded_by: user.id,
    uploader_name: profile?.full_name?.trim() || user.email || null,
    college: null,
    ...fileFields,
  })

  if (error) {
    // Roll back the uploaded file if the row insert failed.
    if ('drive_file_id' in fileFields && fileFields.drive_file_id) {
      await deleteNoteFile(fileFields as { drive_file_id: string | null; storage_provider: string | null })
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/notes')
  return {
    success: true,
    message: 'Note submitted. It is pending admin review.',
  }
}

export async function deleteStudentNote(noteId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Ownership is enforced explicitly with the service client, scoped to the
  // session user — a student can only ever delete a note they uploaded, even
  // if the notes RLS is not (yet) isolating in the live database.
  const service = createServiceClient()
  const { data: note } = await service
    .from('notes')
    .select('id, drive_file_id, storage_provider')
    .eq('id', noteId)
    .eq('uploaded_by', user.id)
    .single()

  if (!note) return { error: 'Note not found.' }

  const { error } = await service
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('uploaded_by', user.id)
  if (error) return { error: error.message }

  await deleteNoteFile(note)
  revalidatePath('/dashboard/notes')
  return { success: true }
}

// ---------------------------------------------------------------------------
// Admin actions (service-role after verifying the allowlisted admin email)
// ---------------------------------------------------------------------------

export async function createOfficialNote(formData: FormData) {
  const admin = await requireAdmin()

  const title = cleanString(formData.get('title'), 300)
  const subject = cleanString(formData.get('subject'), 100)
  const topic = cleanString(formData.get('topic'), 100)
  const description = cleanString(formData.get('description'), 2000)

  if (!title) return { error: 'Title is required.' }
  if (!subject) return { error: 'Subject is required.' }

  let fileFields: Awaited<ReturnType<typeof resolveFileFields>>
  try {
    fileFields = await resolveFileFields(formData)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'File handling failed.' }
  }

  const service = createServiceClient()
  const { error } = await service.from('notes').insert({
    title,
    subject,
    topic: topic || null,
    description: description || null,
    note_type: 'official',
    status: 'published',
    uploaded_by: admin.id,
    uploader_name: admin.email || 'Admin',
    college: null,
    ...fileFields,
  })

  if (error) {
    if ('drive_file_id' in fileFields && fileFields.drive_file_id) {
      await deleteNoteFile(fileFields as { drive_file_id: string | null; storage_provider: string | null })
    }
    return { error: error.message }
  }

  revalidatePath('/admin/notes')
  return { success: true, message: 'Official note published.' }
}

export async function updateNoteStatus(noteId: string, status: string) {
  await requireAdmin()
  if (!isNoteStatus(status)) return { error: 'Invalid status.' }

  const service = createServiceClient()
  const { error } = await service.from('notes').update({ status }).eq('id', noteId)
  if (error) return { error: error.message }

  revalidatePath('/admin/notes')
  revalidatePath('/dashboard/notes')
  return { success: true }
}

export async function deleteNote(noteId: string) {
  await requireAdmin()

  const service = createServiceClient()
  const { data: note, error: readError } = await service
    .from('notes')
    .select('id, drive_file_id, storage_provider')
    .eq('id', noteId)
    .single()
  if (readError || !note) return { error: 'Note not found.' }

  const { error } = await service.from('notes').delete().eq('id', noteId)
  if (error) return { error: error.message }

  await deleteNoteFile(note)
  revalidatePath('/admin/notes')
  revalidatePath('/dashboard/notes')
  return { success: true }
}

/** Storage status exposed for the UI (server-side only). */
export async function getStorageStatusForUI() {
  return getStorageStatus()
}
