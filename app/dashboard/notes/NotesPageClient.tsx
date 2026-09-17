'use client'

import { useRef, useState } from 'react'
import { fmtInt, fmtUTCDate, fmtUTCTime } from "@/lib/fmt";
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createStudentNote, deleteStudentNote } from '@/app/actions/notes'
import { CCH_SUBJECT_NAMES, subjectIcon } from '@/lib/subjects'
import { MasterPdfsSection } from '@/components/dashboard/MasterPdfsSection'

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
  uploader_name: string | null
  created_at: string
}

const badgeVariant: Record<string, 'success' | 'warning' | 'neutral' | 'error'> = {
  published: 'success',
  pending_review: 'warning',
  hidden: 'neutral',
  draft: 'neutral',
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const inputCls =
  'w-full px-4 py-2 border border-white/10 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white/[0.04] text-white'

const COLLEGES = [
  { id: 'nums', name: 'NUMS Rawalpindi', officialUrl: 'https://numspak.edu.pk/', practiceLink: '/dashboard/practice?college=NUMS' },
  { id: 'uhs', name: 'UHS Lahore', officialUrl: 'https://www.uhs.edu.pk/', practiceLink: '/dashboard/practice?college=UHS' },
  { id: 'szabmu', name: 'SZABMU Islamabad', officialUrl: 'http://www.szabmu.edu.pk/', practiceLink: '/dashboard/practice?college=SZABMU' },
]

export function NotesPageClient({
  initialOwnNotes,
  initialOfficialNotes,
  storageConfigured,
  storageReason,
  masterPdfUnlocked,
  masterPdfJoinedCount,
  masterPdfGoal,
  masterPdfCode,
  masterPdfLink,
}: {
  initialOwnNotes: Note[]
  initialOfficialNotes: Note[]
  storageConfigured: boolean
  storageReason?: string
  masterPdfUnlocked: boolean
  masterPdfJoinedCount: number
  masterPdfGoal: number
  masterPdfCode: string | null
  masterPdfLink: string
}) {
  const router = useRouter()
  const [ownNotes, setOwnNotes] = useState(initialOwnNotes)
  const [officialNotes] = useState(initialOfficialNotes)
  // Pick up fresh rows after router.refresh() re-renders this server page.
  // Reset during render (tracking the last-seen prop) instead of in an
  // effect — same result, no cascading re-render.
  const [prevOwnNotes, setPrevOwnNotes] = useState(initialOwnNotes)
  if (prevOwnNotes !== initialOwnNotes) {
    setPrevOwnNotes(initialOwnNotes)
    setOwnNotes(initialOwnNotes)
  }
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>('All')
  const formRef = useRef<HTMLFormElement>(null)

  const availableSubjects = [
    ...new Set([
      ...ownNotes.map(n => n.subject),
      ...officialNotes.map(n => n.subject),
      ...CCH_SUBJECT_NAMES,
    ].filter(Boolean) as string[]),
  ].sort()

  const visibleOwnNotes =
    selectedSubject === 'All'
      ? ownNotes
      : ownNotes.filter(n => n.subject === selectedSubject)
  const visibleOfficialNotes =
    selectedSubject === 'All'
      ? officialNotes
      : officialNotes.filter(n => n.subject === selectedSubject)

  const groupBySubject = (notes: Note[]): { subject: string; notes: Note[] }[] => {
    const map = new Map<string, Note[]>()
    for (const note of notes) {
      const key = note.subject || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(note)
    }
    return [...map.entries()]
      .map(([subject, list]) => ({ subject, notes: list }))
      .sort((a, b) => a.subject.localeCompare(b.subject))
  }

  // Deduplicate: don't show a note in "My Notes" if it's already in "Official Notes" (published)
  const officialIds = new Set(officialNotes.map(n => n.id))
  const dedupedOwnNotes = visibleOwnNotes.filter(n => !officialIds.has(n.id))
  const ownGroups = groupBySubject(dedupedOwnNotes)
  const officialGroups = groupBySubject(visibleOfficialNotes)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(form)
    const result = await createStudentNote(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(result.message || 'Note submitted.')
      form.reset()
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note? This cannot be undone.')) return
    setDeletingId(noteId)
    setError(null)
    const result = await deleteStudentNote(noteId)
    if (result?.error) {
      setError(result.error)
    } else {
      setOwnNotes(ownNotes.filter(n => n.id !== noteId))
    }
    setDeletingId(null)
  }

  const NoteCard = ({ note, canDelete }: { note: Note; canDelete: boolean }) => (
    <li className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5 flex flex-col">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="icon-tile w-10 h-10 rounded-[var(--radius-md)] text-xl bg-white/[0.06] shrink-0"
        >
          {subjectIcon(note.subject)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              {note.title}
            </h3>
            <Badge variant={badgeVariant[note.status] ?? 'neutral'}>
              {note.status === 'pending_review'
                ? 'Pending Review'
                : note.status.charAt(0).toUpperCase() + note.status.slice(1)}
            </Badge>
          </div>
          {note.topic && note.topic !== note.title && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              {note.topic}
            </p>
          )}
        </div>
      </div>
      {note.description && (
        <p className="text-sm text-[var(--color-text-muted)] mt-3 line-clamp-2 flex-1">
          {note.description}
        </p>
      )}
      {note.uploader_name && note.note_type === 'student' && (
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          by {note.uploader_name}
        </p>
      )}
      <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--color-text-muted)]">
          {fmtUTCDate(note.created_at)}
          {note.file_name ? ` · ${note.file_name}${note.file_size ? ` (${formatBytes(note.file_size)})` : ''}` : ''}
        </p>
        <div className="flex items-center gap-2 shrink-0">
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
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(note.id)}
              disabled={deletingId === note.id}
              className="text-rose-400 hover:bg-rose-500/10"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </li>
  )

  return (
    <div className="space-y-10">

      {/* Master PDFs (locked until 5 referrals) */}
      {masterPdfCode && (
        <MasterPdfsSection
          unlocked={masterPdfUnlocked}
          joinedCount={masterPdfJoinedCount}
          goal={masterPdfGoal}
          code={masterPdfCode}
          link={masterPdfLink}
          masterNotes={[
            { name: 'MDCAT Master Concept Notes (Bio · Chem · Phys · Eng)', href: '/dashboard/notes/mdcat-master-notes' },
          ]}
        />
      )}

      {/* MDCAT study materials — the PMDC MDCAT prep surface for pre-medical
          students (Biology, Chemistry, Physics, English) */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          MDCAT Preparation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/notes/mdcat-master-notes"
            className="group glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5 flex flex-col"
          >
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">
              🧬 MDCAT Master Concept Notes
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] flex-1">
              Easy-language Biology, Chemistry, Physics and English notes written from the PMDC MDCAT syllabus.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)]">
              Open notes
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
          <Link
            href="/dashboard/practice?college=MDCAT"
            className="group glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5 flex flex-col"
          >
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">
              📝 MDCAT Exam-Style Practice
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] flex-1">
              Exam-style MCQs across Biology, Chemistry, Physics and English — closest to the real paper.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)]">
              Start practising
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </Link>
        </div>
      </section>

      {/* College Cards */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          Preparing for a Specific University?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLLEGES.map(college => (
            <div
              key={college.id}
              className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5 flex flex-col"
            >
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">
                {college.name}
              </h3>
              <div className="space-y-2 flex-1">
                <a
                  href={college.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] tile-gold text-[var(--color-primary)] text-sm font-medium hover:bg-[var(--color-primary)]/20 transition-colors"
                >
                  🏛️ Official University Site ↗
                </a>
                <Link
                  href={college.practiceLink || '/dashboard/practice'}
                  className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] tile-warning text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                >
                  📝 Exam-Style Practice
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          For official dates, registration and syllabus updates, always trust the university&apos;s own site first.
        </p>
      </section>

      {/* Study Materials — exam-style notes and key facts */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          📚 Study Materials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">{subjectIcon('Biology')} Must-Know Biology Facts</h3>
            <ul className="space-y-1.5">
              {['Mitochondria = powerhouse of the cell; site of aerobic respiration.', 'Human heart: 4 chambers. Right side pumps to lungs, left to body.', 'Nephron = functional unit of the kidney (about 1 million per kidney).', 'DNA: adenine–thymine, guanine–cytosine. RNA replaces thymine with uracil.', 'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (in chloroplasts).'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"><span className="text-[var(--color-primary)] font-bold mt-0.5" aria-hidden="true">•</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">{subjectIcon('Chemistry')} Chemistry Essentials</h3>
            <ul className="space-y-1.5">
              {['pH = −log[H⁺]; pH + pOH = 14 (at 25°C).', 'Le Chatelier: a system at equilibrium shifts to oppose any change.', 'Alkanes → alkenes → alkynes: single, double, triple bonds.', 'Oxidation = loss of electrons; reduction = gain (OIL RIG).', 'First element of every period is a noble gas? No — Group 1. Period starts at Group 1.'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"><span className="text-[var(--color-primary)] font-bold mt-0.5" aria-hidden="true">•</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">{subjectIcon('Physics')} Physics Formula Families</h3>
            <ul className="space-y-1.5">
              {['F = ma. W = Fd cosθ. P = W/t.', 'SUVAT: v = u + at, s = ut + ½at², v² = u² + 2as.', 'Ohm\'s law: V = IR. Power: P = VI = I²R.', 'Snell\'s law: n₁sinθ₁ = n₂sinθ₂.', 'E = hf (photon energy); c = fλ (wave speed).'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"><span className="text-[var(--color-primary)] font-bold mt-0.5" aria-hidden="true">•</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">{subjectIcon('English')} Key Grammar Rules</h3>
            <ul className="space-y-1.5">
              {['Use "the" before superlatives: the highest, the best, the most.', 'Who = subject; Whom = object; Whose = possession.', '"Between" for two things; "among" for three or more.', 'Active: The boy kicked the ball. Passive: The ball was kicked by the boy.', '"Fewer" with countable nouns; "less" with uncountable.'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"><span className="text-[var(--color-primary)] font-bold mt-0.5" aria-hidden="true">•</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-5 md:col-span-2">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">💡 MDCAT Exam Tips</h3>
            <ul className="space-y-1.5">
              {['Biology carries the most marks (68/200) — protect it with daily fact revision.', 'No negative marking: never leave an MCQ blank — a guess costs nothing extra.', 'Chemistry and Physics share weight (56 each); alternate your revision days between them.', 'English is only 20 marks but decides merit margins — 20 minutes of grammar daily pays off.', 'Do at least one timed mock per week and review every mistake the same day.'].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"><span className="text-amber-400 font-bold mt-0.5" aria-hidden="true">★</span><span>{t}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Subject tiles */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
          Browse by Subject
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedSubject('All')}
            className={[
              'px-4 py-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors',
              selectedSubject === 'All'
                ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)]'
                : 'bg-white/[0.04] text-white border-white/10 hover:border-[var(--color-primary)]',
            ].join(' ')}
          >
            All
          </button>
          {availableSubjects.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSubject(s)}
              className={[
                'px-4 py-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors flex items-center gap-1.5',
                selectedSubject === s
                  ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)]'
                  : 'bg-white/[0.04] text-white border-white/10 hover:border-[var(--color-primary)]',
              ].join(' ')}
            >
              <span aria-hidden="true">{subjectIcon(s)}</span>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Official notes (published by the academy) */}
      {officialNotes.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Official Notes
          </h2>
          {officialGroups.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No official notes for {selectedSubject} yet.
            </p>
          ) : (
            <div className="space-y-8">
              {officialGroups.map(group => (
                <section key={group.subject}>
                  <div className="flex items-center gap-2 mb-3">
                    <span aria-hidden="true" className="text-lg">
                      {subjectIcon(group.subject)}
                    </span>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                      {group.subject}
                    </h2>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {group.notes.length} note{group.notes.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.notes.map(note => (
                      <NoteCard key={note.id} note={note} canDelete={false} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {/* My notes */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          My Notes
        </h2>
        {dedupedOwnNotes.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            You haven&apos;t uploaded any notes yet. Upload one below.
          </p>
        ) : visibleOwnNotes.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No {selectedSubject} notes from you yet.
          </p>
        ) : (
          <div className="space-y-8">
            {ownGroups.map(group => (
              <section key={group.subject}>
                <div className="flex items-center gap-2 mb-3">
                  <span aria-hidden="true" className="text-lg">
                    {subjectIcon(group.subject)}
                  </span>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {group.subject}
                  </h2>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {group.notes.length} note{group.notes.length === 1 ? '' : 's'}
                  </span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.notes.map(note => (
                    <NoteCard key={note.id} note={note} canDelete />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>

      {/* Upload sub-section */}
      <section id="upload-note">
        <div className="relative overflow-hidden glass-tile-glow rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6">
          <div
            aria-hidden="true"
            className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-primary/5 blur-3xl"
          />
          <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <span
              aria-hidden="true"
              className="icon-tile w-11 h-11 rounded-[var(--radius-md)] text-xl bg-white/[0.06]"
            >
              📤
            </span>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Upload a Note
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Share a note with the academy. It starts as &quot;Pending review&quot;
                until an admin approves it.
              </p>
            </div>
          </div>

          {!storageConfigured && (
            <div className="mb-4 p-3 bg-amber-500/10 text-amber-400 text-sm rounded-[var(--radius-md)] border border-amber-500/20">
              <p className="font-medium">File upload is not available yet.</p>
              <p className="mt-1">
                {storageReason} You can still submit a note with a Google Drive
                link below — an admin will review it.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 text-rose-400 text-sm rounded-[var(--radius-md)] border border-rose-500/20">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-400 text-sm rounded-[var(--radius-md)] border border-emerald-500/20">
              {success}
            </div>
          )}

          <form ref={formRef} className="space-y-4" onSubmit={handleUpload}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Subject *
                </label>
                <select name="subject" required className={inputCls} defaultValue="">
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
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  Topic *
                </label>
                <input
                  type="text"
                  name="topic"
                  required
                  maxLength={300}
                  className={inputCls}
                  placeholder="e.g. Battle of Badr, Tenses, Motion"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                maxLength={2000}
                className={inputCls}
                placeholder="Short summary of the note..."
              />
            </div>

            {storageConfigured && (
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  File
                </label>
                <input
                  type="file"
                  name="file"
                  className="block w-full text-sm text-[var(--color-text-secondary)] file:mr-3 file:px-4 file:py-2 file:rounded-[var(--radius-md)] file:border-0 file:bg-[var(--color-primary)] file:text-[var(--color-text-inverse)] file:text-sm file:font-medium hover:file:bg-[var(--color-primary-light)]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                {storageConfigured ? 'Or a Google Drive link (optional)' : 'Google Drive link *'}
              </label>
              <input
                type="url"
                name="drive_link"
                maxLength={2000}
                className={inputCls}
                placeholder="https://drive.google.com/file/d/..."
              />
            </div>

            <Button variant="primary" fullWidth disabled={loading}>
              {loading ? 'Uploading...' : 'Submit Note'}
            </Button>
          </form>
          </div>
        </div>
      </section>
    </div>
  )
}
