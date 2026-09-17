'use client'

import { useMemo, useState } from 'react'
import { fmtInt, fmtUTCDate, fmtUTCTime } from "@/lib/fmt";
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import {
  approveStudent,
  rejectStudent,
  suspendStudent,
  unsuspendStudent,
  removeStudent,
} from '@/app/actions/admin'

type Profile = {
  id: string
  full_name: string
  email: string
  phone: string | null
  exam_target: string | null
  role: string
  status: string
  created_at: string
}

const badgeVariant: Record<string, 'success' | 'error' | 'warning' | 'neutral'> = {
  approved: 'success',
  rejected: 'error',
  pending: 'warning',
  suspended: 'neutral',
}

const PAGE_SIZE = 10

type PendingAction =
  | { kind: 'reject'; profile: Profile }
  | { kind: 'suspend'; profile: Profile }
  | { kind: 'remove'; profile: Profile }
  | null

export function StudentTable({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Search + filters
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return profiles.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (!q) return true
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q)
      )
    })
  }, [profiles, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const updateStatus = (id: string, status: string) => {
    setProfiles(profiles.map((p) => (p.id === id ? { ...p, status } : p)))
  }

  const run = async (id: string, fn: (id: string) => Promise<{ success?: boolean; error?: string }>) => {
    setLoadingId(id)
    setError(null)
    const result = await fn(id)
    setLoadingId(null)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  const handleApprove = async (id: string) => {
    if (await run(id, approveStudent)) updateStatus(id, 'approved')
  }

  const handleConfirm = async () => {
    if (!pendingAction) return
    const { kind, profile } = pendingAction
    setPendingAction(null)

    if (kind === 'reject') {
      if (await run(profile.id, rejectStudent)) updateStatus(profile.id, 'rejected')
    } else if (kind === 'suspend') {
      if (await run(profile.id, suspendStudent)) updateStatus(profile.id, 'suspended')
    } else if (kind === 'remove') {
      if (await run(profile.id, removeStudent)) {
        setProfiles(profiles.filter((p) => p.id !== profile.id))
      }
    }
  }

  const handleUnsuspend = async (id: string) => {
    if (await run(id, unsuspendStudent)) updateStatus(id, 'approved')
  }

  // ── Confirmation dialog copy ──────────────────────────────────
  const confirmCopy =
    pendingAction?.kind === 'remove'
      ? {
          title: 'Remove student?',
          description:
            'This permanently deletes the account and profile. This action cannot be undone.',
          confirmLabel: 'Remove Student',
          tone: 'danger' as const,
        }
      : pendingAction?.kind === 'suspend'
        ? {
            title: 'Suspend student?',
            description:
              'The student will immediately lose access to the dashboard until you unsuspend them.',
            confirmLabel: 'Suspend',
            tone: 'warning' as const,
          }
        : {
            title: 'Reject application?',
            description:
              'The student will be routed to the rejected page and cannot access the dashboard.',
            confirmLabel: 'Reject Application',
            tone: 'danger' as const,
          }

  const summary = {
    total: filtered.length,
    approved: filtered.filter((p) => p.status === 'approved').length,
    pending: filtered.filter((p) => p.status === 'pending').length,
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b border-[var(--color-border)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search name, email, phone…"
            aria-label="Search students"
            className="w-full sm:w-64 px-4 py-2 text-sm border border-white/10 rounded-[var(--radius-md)] bg-white/[0.04] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            aria-label="Filter by status"
            className="px-4 py-2 text-sm border border-white/10 rounded-[var(--radius-md)] bg-white/[0.04] text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {summary.total} shown · {summary.approved} approved · {summary.pending} pending
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/15 text-rose-400 text-sm border-b border-rose-500/25">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-white/60">
          {profiles.length === 0
            ? 'No students found.'
            : 'No students match your search or filter.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/10">
                <th className="p-4 font-semibold text-sm text-white/60">Name</th>
                <th className="p-4 font-semibold text-sm text-white/60">Email</th>
                <th className="p-4 font-semibold text-sm text-white/60">Phone</th>
                <th className="p-4 font-semibold text-sm text-white/60">Exam Target</th>
                <th className="p-4 font-semibold text-sm text-white/60">Joined</th>
                <th className="p-4 font-semibold text-sm text-white/60">Status</th>
                <th className="p-4 font-semibold text-sm text-white/60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((profile) => (
                <tr key={profile.id} className="border-b border-white/10 hover:bg-white/[0.04] transition-colors">
                  <td className="p-4 font-medium text-white">{profile.full_name}</td>
                  <td className="p-4 text-white/60">{profile.email}</td>
                  <td className="p-4 text-white/60">{profile.phone || '—'}</td>
                  <td className="p-4 text-white/60">{profile.exam_target || '—'}</td>
                  <td className="p-4 text-white/60">
                    {fmtUTCDate(profile.created_at)}
                  </td>
                  <td className="p-4">
                    <Badge variant={badgeVariant[profile.status] ?? 'neutral'}>
                      {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {profile.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(profile.id)}
                            disabled={loadingId === profile.id}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPendingAction({ kind: 'reject', profile })}
                            disabled={loadingId === profile.id}
                            className="text-rose-400 border-rose-500/25 hover:bg-rose-500/10"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {profile.status === 'approved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingAction({ kind: 'suspend', profile })}
                          disabled={loadingId === profile.id}
                          className="text-amber-400 border-amber-500/25 hover:bg-amber-500/10"
                        >
                          Suspend
                        </Button>
                      )}
                      {profile.status === 'suspended' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnsuspend(profile.id)}
                          disabled={loadingId === profile.id}
                          className="text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/10"
                        >
                          Unsuspend
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingAction({ kind: 'remove', profile })}
                        disabled={loadingId === profile.id}
                        className="text-rose-400 hover:bg-rose-500/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-muted)]">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
            >
              ← Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      <Modal
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        size="sm"
      >
        <ModalHeader
          title={confirmCopy.title}
          description={confirmCopy.description}
        />
        <ModalBody>
          {pendingAction && (
            <div className="rounded-[var(--radius-md)] bg-white/[0.06] p-4 text-sm">
              <p className="font-semibold text-white">
                {pendingAction.profile.full_name}
              </p>
              <p className="text-[var(--color-text-muted)] mt-0.5">
                {pendingAction.profile.email}
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setPendingAction(null)}>
            Cancel
          </Button>
          <Button
            variant={confirmCopy.tone === 'danger' ? 'primary' : 'secondary'}
            onClick={handleConfirm}
            disabled={loadingId !== null}
            className={
              confirmCopy.tone === 'danger'
                ? 'bg-rose-500 hover:bg-rose-600'
                : confirmCopy.tone === 'warning'
                  ? 'bg-amber-500 hover:bg-amber-600 text-[#0a0a0a]'
                  : ''
            }
          >
            {confirmCopy.confirmLabel}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
