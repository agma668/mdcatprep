'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, BookOpen, ArrowRight } from 'lucide-react'

export type UsatDrillChapter = {
  name: string
  count: number
  topics: string[]
}

/**
 * Chapter-style drill navigation for the HEC USAT bank. The USAT paper rotates
 * fine categories (profit/loss, pipes, analogies, antonyms…) rather than
 * syllabus chapters, so this accordion — subject → drill chapters — is derived
 * at runtime from the bank's own topic strings (lib/usat-drill.ts); counts are
 * computed, never written down. Each chapter run is a full session of all its
 * topics' questions, never a one-question dead end.
 */
export function UsatTopicDrill({
  drill,
  collegeQuery,
}: {
  drill: Record<string, { name: string; count: number; topics: string[] }[]>
  collegeQuery: string
}) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)

  const subjects = Object.entries(drill)

  return (
    <section>
      <h2 className="text-lg font-extrabold text-[var(--color-text-primary)] mb-3">
        Chapter-wise Drill
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        The USAT paper rotates its question categories, so the bank is drilled by
        category family — each chapter runs every question in that family.
      </p>

      <div className="space-y-3">
        {subjects.map(([subject, chapters]) => {
          const total = chapters.reduce((sum, c) => sum + c.count, 0)
          const isExpanded = expandedSubject === subject
          return (
            <div key={subject} className="rounded-[var(--radius-lg)] border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSubject(prev => (prev === subject ? null : subject))}
                className="w-full glass-tile-glow flex items-center gap-4 p-5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[var(--color-text-primary)]">
                    {subject}
                  </span>
                  <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">
                    {chapters.length} chapte{chapters.length === 1 ? 'r' : 'rs'}
                  </span>
                </span>
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1 shrink-0">
                  {total} Qs
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-white/5 bg-white/[0.01]">
                  {chapters.map(chapter => {
                    const query = [
                      'bank=usat',
                      `group=${encodeURIComponent(chapter.name)}`,
                      `subject=${encodeURIComponent(subject)}`,
                      collegeQuery,
                    ]
                      .filter(Boolean)
                      .join('&')
                    return (
                      <Link
                        key={chapter.name}
                        href={`/practice/session?${query}`}
                        className="group flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-b-0"
                      >
                        <BookOpen className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                            {chapter.name}
                          </span>
                          <span className="block text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                            {chapter.topics.slice(0, 4).join(' · ')}
                            {chapter.topics.length > 4
                              ? ` +${chapter.topics.length - 4} more`
                              : ''}
                          </span>
                        </span>
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5 shrink-0">
                          {chapter.count} Qs
                        </span>
                        <ArrowRight
                          className="w-3.5 h-3.5 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
