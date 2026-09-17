'use client'

import { TrackedLink } from '@/components/TrackedLink';
import Link from 'next/link'
import { NotebookPen } from 'lucide-react'
import { subjectIcon } from '@/lib/subjects'
import { ArrowRight } from 'lucide-react'

const TINT_CYCLE = [
    "bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-400 ring-1 ring-emerald-500/15",
    "bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 text-indigo-400 ring-1 ring-indigo-500/15",
    "bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-400 ring-1 ring-amber-500/15",
    "bg-gradient-to-br from-sky-500/10 to-sky-500/5 text-sky-400 ring-1 ring-sky-500/15",
    "bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-400 ring-1 ring-purple-500/15",
    "bg-gradient-to-br from-rose-500/10 to-rose-500/5 text-rose-400 ring-1 ring-rose-500/15",
  ] as const

export function PracticeSetup({
  subjects,
  countsBySubject,
  totalCount,
  collegeName,
}: {
  subjects: string[]
  countsBySubject: Record<string, number>
  totalCount: number
  collegeName?: string
}) {
  return (
    <div>
      {collegeName && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-semibold">
          <span aria-hidden="true">🎯</span>
          Showing subjects for {collegeName}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s, i) => {
          const count = countsBySubject[s] ?? 0
          return (
            <TrackedLink
              key={s}
              to={`/dashboard/practice/${encodeURIComponent(s)}`}
              className="group glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6 flex flex-col"
             label="practice-setup-subject">
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className={`icon-tile w-12 h-12 rounded-[var(--radius-md)] text-2xl ${TINT_CYCLE[i % TINT_CYCLE.length]} transition-transform duration-[var(--transition-fast)] group-hover:scale-105`}
                >
                  {subjectIcon(s)}
                </span>
                {count > 0 && (
                  <span className="text-[11px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1">
                    {count} Qs
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-bold text-[var(--color-text-primary)] text-lg">
                {s}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1 flex-1">
                {count > 0
                  ? `${count} question${count === 1 ? '' : 's'} ready to practice`
                  : 'No questions yet'}
              </p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-[var(--color-primary)]">
                {count > 0 ? 'Choose a topic' : 'Coming soon'}
                <ArrowRight className="w-4 h-4 transition-transform duration-[var(--transition-fast)] group-hover:translate-x-1" />
              </span>
            </TrackedLink>
          )
        })}
      </div>

      {totalCount === 0 && (
        <div className="glass-tile rounded-[var(--radius-lg)] border border-dashed border-white/15  p-10 text-center mt-4">
          <NotebookPen
            className="w-9 h-9 mx-auto mb-3 block text-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            No questions published yet
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">
            Practice questions will appear here once the academy publishes them.
          </p>
        </div>
      )}
    </div>
  )
}
