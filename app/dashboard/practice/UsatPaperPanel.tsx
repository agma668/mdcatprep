'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { USAT_SUBJECTS } from '@/lib/subjects'

const USAT_ICONS: Record<string, string> = {
  Quantitative: '🧮',
  Verbal: '📖',
  Biology: '🧬',
  Chemistry: '⚗️',
  Physics: '⚛️',
}

/**
 * The HEC USAT-M practice offer inside the medical portal. When a student
 * picks "HEC USAT-M" in the chooser they are preparing for a different paper
 * than the MDCAT boards — the HEC undergraduate scholarship test (Balochistan
 * / ex-FATA variant) — so the page switches from the MDCAT academy drill to
 * the dedicated USAT bank run at /practice/session?bank=usat.
 *
 * Counts arrive precomputed from the server (the bank itself is never pulled
 * into the client bundle). Pattern facts are from the official HEC
 * Content-Weightages for the Balochistan / ex-FATA scholarship variant
 * (100 MCQs · 100 min · 50% pass) — documented in docs/HEC-USAT-M-ANALYSIS.md.
 */
export function UsatPaperPanel({
  countsBySubject,
  collegeQuery,
}: {
  countsBySubject: Record<string, number>
  collegeQuery: string
}) {
  const bankTotal = USAT_SUBJECTS.reduce((sum, s) => sum + (countsBySubject[s] ?? 0), 0)

  // Keep this honest: the pattern line named it as the scholarship-variant
  // paper; the bank is not a 100-question mock, it is the drill bank sized 212.
  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-semibold">
        <span aria-hidden="true">🎓</span>
        HEC USAT-M paper practice — a different paper than the MDCAT boards
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-2xl">
        The Balochistan / ex-FATA scholarship paper runs{' '}
        <span className="font-bold text-[var(--color-text-primary)]">
          100 MCQs · 100 minutes — Verbal 26 · Quantitative 32 · Physics 11 · Chemistry 11 ·
          Biology 20
        </span>
        , with a 50% pass mark. Every question below comes from the dedicated USAT bank, written
        to that pattern — not to the PMDC syllabus.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {USAT_SUBJECTS.map((subject, i) => {
          const count = countsBySubject[subject] ?? 0
          if (count === 0) return null
          const query = `bank=usat&subject=${encodeURIComponent(subject)}${collegeQuery ? `&${collegeQuery}` : ''}`
          return (
            <Link
              key={subject}
              href={`/practice/session?${query}`}
              className="group glass-tile-glow border border-white/10 rounded-[var(--radius-lg)] p-6 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className={`icon-tile w-12 h-12 rounded-[var(--radius-md)] text-2xl ${
                    [
                      'bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 text-indigo-400 ring-1 ring-indigo-500/15',
                      'bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-400 ring-1 ring-purple-500/15',
                      'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-400 ring-1 ring-emerald-500/15',
                      'bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-400 ring-1 ring-amber-500/15',
                      'bg-gradient-to-br from-sky-500/10 to-sky-500/5 text-sky-400 ring-1 ring-sky-500/15',
                    ][i % 5]
                  }`}
                >
                  {USAT_ICONS[subject] ?? '📚'}
                </span>
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1">
                  {count} Qs
                </span>
              </div>
              <h3 className="mt-4 font-bold text-[var(--color-text-primary)] text-lg">{subject}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1 flex-1">
                {count} question{count === 1 ? '' : 's'} written to the USAT-M pattern
              </p>
              <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-[var(--color-primary)]">
                Practice {subject}
                <ArrowRight className="w-4 h-4 transition-transform duration-[var(--transition-fast)] group-hover:translate-x-1" />
              </span>
            </Link>
          )
        })}
      </div>

      {bankTotal === 0 && (
        <div className="glass-tile rounded-[var(--radius-lg)] border border-dashed border-white/15 p-10 text-center mt-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            No USAT questions yet
          </h2>
        </div>
      )}
    </div>
  )
}
