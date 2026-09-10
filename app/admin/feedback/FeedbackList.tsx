'use client'

import { useMemo, useState } from 'react'
import { Inbox, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { deleteFeedback } from '@/app/actions/feedback'
import type { FeedbackRow } from '@/lib/feedback'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ` · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
}

export function FeedbackList({ initialFeedback }: { initialFeedback: FeedbackRow[] }) {
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState(initialFeedback)
  const [pendingDelete, setPendingDelete] = useState<FeedbackRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return feedback
    return feedback.filter((f) => {
      const haystack = [
        f.message,
        f.profile?.full_name,
        f.profile?.email,
        f.page,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [feedback, query])

  const handleConfirmDelete = async () => {
    if (!pendingDelete || deleting) return
    setDeleting(true)
    setError(null)
    const result = await deleteFeedback(pendingDelete.id)
    setDeleting(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setFeedback(feedback.filter((f) => f.id !== pendingDelete.id))
    setPendingDelete(null)
  }

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search feedback, student name, email…"
        aria-label="Search feedback"
        className="w-full sm:w-80 mb-4 px-4 py-2 text-sm border border-white/10 rounded-[var(--radius-md)] bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />

      {filtered.length === 0 ? (
        <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-10 text-center">
          <Inbox className="w-8 h-8 mx-auto text-white/45" aria-hidden="true" />
          <p className="mt-3 text-sm text-white/70">
            {feedback.length === 0
              ? 'No feedback yet. Once students submit feedback, it will appear here.'
              : 'No feedback matches your search.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((f) => (
            <li
              key={f.id}
              className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-white text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                  “{f.message}”
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setPendingDelete(f)
                  }}
                  aria-label="Delete this feedback"
                  title="Delete"
                  className="shrink-0 rounded-md p-1.5 text-white/45 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
                <span className="font-medium text-white/70">
                  {f.profile?.full_name || f.profile?.email || 'Anonymous'}
                </span>
                <span aria-hidden="true">·</span>
                <time dateTime={f.created_at}>{formatDate(f.created_at)}</time>
                {f.page && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center rounded-full bg-[var(--color-surface-3)] px-2 py-0.5 font-mono text-[11px]">
                      {f.page}
                    </span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Confirm delete */}
      <Modal open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} size="sm">
        <ModalHeader
          title="Delete this feedback?"
          description="This permanently removes the feedback. This action cannot be undone."
        />
        <ModalBody>
          {error && (
            <p className="mb-3 text-sm text-[var(--color-error)]" role="alert">
              {error}
            </p>
          )}
          {pendingDelete && (
            <div className="rounded-[var(--radius-md)] bg-white/[0.04] p-4 text-sm">
              <p className="text-white leading-relaxed whitespace-pre-wrap break-words line-clamp-4">
                “{pendingDelete.message}”
              </p>
              <p className="mt-2 text-xs text-white/45">
                {pendingDelete.profile?.full_name || pendingDelete.profile?.email || 'Anonymous'}
                {' · '}
                {formatDate(pendingDelete.created_at)}
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Deleting…' : 'Delete Feedback'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
