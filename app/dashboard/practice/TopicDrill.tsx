'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, BookOpen, ArrowRight } from 'lucide-react'
import { MDCAT_TAXONOMY } from '@/lib/mdcat-topics'
import { subjectIcon } from '@/lib/subjects'

type Props = {
  subjects: string[]
  bankTopicsBySubject: Record<string, Record<string, number>>
  bankCountsBySubject: Record<string, number>
}

const TINT_CYCLE = [
  'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-400 ring-1 ring-emerald-500/15',
  'bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 text-indigo-400 ring-1 ring-indigo-500/15',
  'bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-400 ring-1 ring-amber-500/15',
  'bg-gradient-to-br from-sky-500/10 to-sky-500/5 text-sky-400 ring-1 ring-sky-500/15',
  'bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-purple-400 ring-1 ring-purple-500/15',
  'bg-gradient-to-br from-rose-500/10 to-rose-500/5 text-rose-400 ring-1 ring-rose-500/15',
] as const

export function TopicDrill({ subjects, bankTopicsBySubject, bankCountsBySubject }: Props) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)

  const toggleSubject = (s: string) => {
    setExpandedSubject(prev => (prev === s ? null : s))
    setExpandedChapter(null)
  }

  const toggleChapter = (c: string) => {
    setExpandedChapter(prev => (prev === c ? null : c))
  }

  // Pre-compute chapter counts so we can display them without re-deriving on
  // every render.
  const chapterCounts = useMemo(() => {
    const map: Record<string, Record<string, number>> = {}
    for (const [subject, topics] of Object.entries(MDCAT_TAXONOMY)) {
      map[subject] = {}
      for (const chapter of topics.chapters) {
        let total = 0
        for (const topic of chapter.topics) {
          total += bankTopicsBySubject[subject]?.[topic.name] ?? 0
        }
        map[subject][chapter.name] = total
      }
    }
    return map
  }, [bankTopicsBySubject])

  return (
    <section>
      <h2 className="text-lg font-extrabold text-[var(--color-text-primary)] mb-3">
        Chapter-wise Drill
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Pick a subject, then a chapter and topic to focus your practice.
      </p>

      <div className="space-y-3">
        {subjects.map((subject, i) => {
          const taxonomy = MDCAT_TAXONOMY[subject]
          const totalQs = bankCountsBySubject[subject] ?? 0
          const isExpanded = expandedSubject === subject

          return (
            <div key={subject} className="rounded-[var(--radius-lg)] border border-white/10 overflow-hidden">
              {/* Subject tile */}
              <button
                onClick={() => toggleSubject(subject)}
                className="w-full glass-tile-glow flex items-center gap-4 p-5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <span
                  aria-hidden="true"
                  className={`icon-tile w-11 h-11 rounded-[var(--radius-md)] text-xl ${TINT_CYCLE[i % TINT_CYCLE.length]} flex items-center justify-center shrink-0`}
                >
                  {subjectIcon(subject)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[var(--color-text-primary)]">
                    {subject}
                  </span>
                  <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">
                    {taxonomy
                      ? `${taxonomy.chapters.length} chapters`
                      : 'No taxonomy data'}
                  </span>
                </span>
                <span className="text-[11px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1 shrink-0">
                  {totalQs} Qs
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Chapters */}
              {isExpanded && taxonomy && (
                <div className="border-t border-white/5 bg-white/[0.01]">
                  {taxonomy.chapters.map(chapter => {
                    const chCount = chapterCounts[subject]?.[chapter.name] ?? 0
                    const chExpanded = expandedChapter === `${subject}::${chapter.name}`

                    // If a topic within this chapter has no questions, we still
                    // show it (honest counts) so the student knows it exists.
                    return (
                      <div key={chapter.name}>
                        <button
                          onClick={() => toggleChapter(`${subject}::${chapter.name}`)}
                          className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <BookOpen className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                          <span className="flex-1 min-w-0">
                            <span className="block font-semibold text-sm text-[var(--color-text-primary)]">
                              {chapter.name}
                            </span>
                            <span className="block text-xs text-[var(--color-text-muted)]">
                              {chapter.topics.length} topic{chapter.topics.length === 1 ? '' : 's'}
                            </span>
                          </span>
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5 shrink-0">
                            {chCount} Qs
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 shrink-0 ${
                              chExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {/* Topics within the chapter */}
                        {chExpanded && (
                          <div className="bg-white/[0.015] border-b border-white/5">
                            {chapter.topics.map(topic => {
                              const tCount = bankTopicsBySubject[subject]?.[topic.name] ?? 0
                              return (
                                <Link
                                  key={topic.name}
                                  href={`/dashboard/practice/quiz?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic.name)}`}
                                  className="group flex items-center gap-3 pl-12 pr-5 py-3 text-left hover:bg-white/[0.04] transition-colors border-b border-white/5 last:border-b-0"
                                >
                                  <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                                      {topic.name}
                                    </span>
                                    {topic.subtopics && (
                                      <span className="block text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                                        {topic.subtopics.join(' · ')}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-white/[0.04] border border-white/10 rounded-full px-2 py-0.5 shrink-0">
                                    {tCount} Qs
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
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
