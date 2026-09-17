'use client'

import { useState } from 'react'
import { fmtInt, fmtUTCDate, fmtUTCTime } from "@/lib/fmt";
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  createOfficialNote,
  updateNoteStatus,
  deleteNote,
} from '@/app/actions/notes'
import { CCH_SUBJECT_NAMES } from '@/lib/subjects'

type Note = {
  id: string
  title: string
  subject: string | null
  topic: string | null
  description: string | null
  note_type: string
  status: string
  drive_link: string | null
  file_name: string | null
  file_type: string | null
  file_size: number | null
  storage_provider: string | null
  uploader_name: string | null
  uploaded_by: string | null
  created_at: string
}

const statusVariant: Record<string, 'success' | 'warning' | 'neutral' | 'error'> = {
  published: 'success',
  pending_review: 'warning',
  draft: 'neutral',
  hidden: 'neutral',
}

function statusLabel(status: string): string {
  switch (status) {
    case 'pending_review':
      return 'Pending Review'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const inputCls =
  'w-full px-4 py-2 border border-white/10 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white/[0.06] text-white placeholder:text-white/30'

export function AdminNotesManager({
  initialOfficialNotes,
  initialStudentNotes,
  storageConfigured,
  storageReason,
}: {
  initialOfficialNotes: Note[]
  initialStudentNotes: Note[]
  storageConfigured: boolean
  storageReason?: string
}) {
  const router = useRouter()
  const [officialNotes, setOfficialNotes] = useState(initialOfficialNotes)
  const [studentNotes, setStudentNotes] = useState(initialStudentNotes)
  // Pick up fresh rows after router.refresh() re-renders this server page.
  // Reset during render (tracking the last-seen props) instead of in an
  // effect — same result, no cascading re-render.
  const [prevOfficial, setPrevOfficial] = useState(initialOfficialNotes)
  const [prevStudent, setPrevStudent] = useState(initialStudentNotes)
  if (prevOfficial !== initialOfficialNotes) {
    setPrevOfficial(initialOfficialNotes)
    setOfficialNotes(initialOfficialNotes)
  }
  if (prevStudent !== initialStudentNotes) {
    setPrevStudent(initialStudentNotes)
    setStudentNotes(initialStudentNotes)
  }
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [driveLink, setDriveLink] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)

    const formData = new FormData()
    const fileInput = (e.currentTarget.elements.namedItem('file') as HTMLInputElement | null)
    const file = fileInput?.files?.[0]
    if (file) formData.append('file', file)
    formData.append('title', title)
    formData.append('subject', subject)
    formData.append('topic', topic)
    formData.append('description', description)
    formData.append('drive_link', driveLink)

    const result = await createOfficialNote(formData)
    setBusy(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setSuccess(result.message || 'Official note published.')
    setTitle('')
    setSubject('')
    setTopic('')
    setDescription('')
    setDriveLink('')
    if (fileInput) fileInput.value = ''
    router.refresh()
  }

  const runStatus = async (id: string, status: string) => {
    setBusyId(id)
    const result = await updateNoteStatus(id, status)
    setBusyId(null)
    if (result?.error) alert(result.error)
    else router.refresh()
  }

  const runDelete = async (id: string) => {
    if (!confirm('Delete this note permanently? This cannot be undone.')) return
    setBusyId(id)
    const result = await deleteNote(id)
    setBusyId(null)
    if (result?.error) alert(result.error)
    else router.refresh()
  }

  const NoteCard = ({ note }: { note: Note }) => (
    <li className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white truncate">
              {note.title}
            </h3>
            <Badge variant={statusVariant[note.status] ?? 'neutral'}>
              {statusLabel(note.status)}
            </Badge>
            {note.note_type === 'official' && (
              <Badge variant="primary">Official</Badge>
            )}
          </div>
          <p className="text-sm text-white/70 mt-1">
            {[note.subject, note.topic].filter(Boolean).join(' · ')}
          </p>
          {note.description && (
            <p className="text-sm text-white/45 mt-1 line-clamp-2">
              {note.description}
            </p>
          )}
          <p className="text-xs text-white/45 mt-2">
            Uploaded by {note.uploader_name || '—'} on{' '}
            {fmtUTCTime(note.created_at)}
            {note.file_name
              ? ` · ${note.file_name}${note.file_size ? ` (${formatBytes(note.file_size)})` : ''}`
              : note.drive_link
                ? ' · external link'
                : ''}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {note.drive_link && (
            <a
              href={note.drive_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Open ↗
            </a>
          )}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {note.note_type === 'official' && note.status !== 'published' && (
              <Button variant="primary" size="sm" onClick={() => runStatus(note.id, 'published')} disabled={busyId === note.id}>
                Publish
              </Button>
            )}
            {note.status === 'published' && (
              <Button variant="secondary" size="sm" onClick={() => runStatus(note.id, 'hidden')} disabled={busyId === note.id}>
                Hide
              </Button>
            )}
            {note.status === 'hidden' && (
              <Button variant="secondary" size="sm" onClick={() => runStatus(note.id, 'draft')} disabled={busyId === note.id}>
                Set Draft
              </Button>
            )}
            {note.note_type === 'student' && note.status === 'pending_review' && (
              <>
                <Button variant="primary" size="sm" onClick={() => runStatus(note.id, 'published')} disabled={busyId === note.id}>
                  Approve
                </Button>
                <Button variant="outline" size="sm" onClick={() => runStatus(note.id, 'hidden')} disabled={busyId === note.id} className="text-amber-400 border-amber-500/25 hover:bg-amber-500/10">
                  Hide
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runDelete(note.id)}
              disabled={busyId === note.id}
              className="text-rose-400 hover:bg-rose-500/10"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </li>
  )

  return (
    <div className="space-y-8">
      {/* Upload official note */}
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Upload Official Note
        </h2>

        {!storageConfigured && (
          <div className="mb-4 p-3 bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <p className="font-medium">File upload is not available yet.</p>
            <p className="mt-1">
              {storageReason} You can still publish a note with a Google Drive link.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 text-rose-400 text-sm rounded-[var(--radius-md)] border border-rose-500/25">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-400 text-sm rounded-[var(--radius-md)] border border-emerald-500/25">
            {success}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={300}
                className={inputCls}
                placeholder="Physics — Motion Notes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Subject *
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                className={inputCls}
              >
                <option value="" disabled>
                  Select a subject…
                </option>
                {CCH_SUBJECT_NAMES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                maxLength={100}
                className={inputCls}
                placeholder="Motion"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              maxLength={2000}
              className={inputCls}
              placeholder="Short summary of the note..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storageConfigured && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  File
                </label>
                <input
                  type="file"
                  name="file"
                  className="block w-full text-sm text-white/70 file:mr-3 file:px-4 file:py-2 file:rounded-[var(--radius-md)] file:border-0 file:bg-[var(--color-primary)] file:text-[var(--color-text-inverse)] file:text-sm file:font-medium hover:file:bg-[var(--color-primary-light)]"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {storageConfigured ? 'Or Google Drive link (optional)' : 'Google Drive link *'}
              </label>
              <input
                type="url"
                value={driveLink}
                onChange={e => setDriveLink(e.target.value)}
                maxLength={2000}
                className={inputCls}
                placeholder="https://drive.google.com/file/d/..."
              />
            </div>
          </div>
          <Button variant="primary" disabled={busy}>
            {busy ? 'Publishing...' : 'Publish Official Note'}
          </Button>
        </form>
      </div>

      {/* Student submissions */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">
          Student Submissions ({studentNotes.length})
        </h2>
        {studentNotes.length === 0 ? (
          <p className="text-sm text-white/45">
            No student notes yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {studentNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </ul>
        )}
      </section>

      {/* Official notes */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">
          Official Notes ({officialNotes.length})
        </h2>
        {officialNotes.length === 0 ? (
          <p className="text-sm text-white/45">
            No official notes yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {officialNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
