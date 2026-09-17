'use client'

import { TrackedLink } from '@/components/TrackedLink';
import { useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpenCheck,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { MistakesDrill, type DrillQuestion } from '@/components/dashboard/MistakesDrill'

type Mistake = {
  id: string
  selected_answer: string
  created_at: string
  subject: string
  topic: string | null
  question_text: string
  option_a: string | null
  option_b: string | null
  option_c: string | null
  option_d: string | null
  correct_answer: string
  explanation: string | null
  difficulty: string | null
  question_id: string
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Mathematics: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500' },
  English: { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-500' },
  'General Science': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
  'General Knowledge': { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', dot: 'bg-sky-500' },
  Islamiat: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500' },
  Urdu: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-500' },
  'Intelligence Test': { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' },
}

const DEFAULT_COLORS = { bg: 'bg-white/[0.06]', text: 'text-white/70', border: 'border-white/10', dot: 'bg-gray-400' }

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function MistakeNotebookClient({
  mistakes,
  drill,
}: {
  mistakes: Mistake[]
  drill: DrillQuestion[]
}) {
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showExplanations, setShowExplanations] = useState<Set<string>>(new Set())
  const [mastered, setMastered] = useState<Set<string>>(new Set())
  // Redo mode swaps the read-only review list for the interactive re-answer
  // drill (MistakesDrill): answer each missed question again; a correct
  // re-answer retires it. Same data, active practice instead of reading.
  const [redoMode, setRedoMode] = useState(false)

  const subjects = ['All', ...Array.from(new Set(mistakes.map(m => m.subject)))]

  const filtered = mistakes.filter(m => {
    const matchesSubject = selectedSubject === 'All' || m.subject === selectedSubject
    const matchesSearch =
      searchQuery === '' ||
      m.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.topic && m.topic.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSubject && matchesSearch
  })

  // Stats
  const totalMistakes = mistakes.length
  const uniqueQuestions = new Set(mistakes.map(m => m.question_id)).size
  const subjectCounts = new Map<string, number>()
  for (const m of mistakes) {
    subjectCounts.set(m.subject, (subjectCounts.get(m.subject) ?? 0) + 1)
  }
  const weakestSubject = [...subjectCounts.entries()].sort((a, b) => b[1] - a[1])[0]
  const masteredCount = mastered.size
  const activeMistakes = totalMistakes - masteredCount

  const toggleExplanation = (id: string) => {
    setShowExplanations(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMastered(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ─── Empty state ──────────────────────────────────────
  if (mistakes.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-white/10 rounded-[var(--radius-xl)] p-12 text-center shadow-[var(--shadow-card)]">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[var(--radius-lg)] bg-gradient-to-br from-emerald-50 to-emerald-100 mb-5">
          <BookOpenCheck className="w-9 h-9 text-emerald-600" />
        </div>
        <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] mb-2">
          No mistakes yet! 🎉
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mb-8 leading-relaxed">
          You haven&apos;t gotten any questions wrong yet — great job! When you do,
          every wrong answer will automatically appear here so you can review and learn from them.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <TrackedLink
            to="/dashboard/practice"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-sm font-bold hover:bg-[var(--color-primary-dark)] transition-colors shadow-[var(--glow-signal-md)]"
           label="mistake-notebook">
            <Sparkles className="w-4 h-4" />
            Start Practicing
          </TrackedLink>
          <TrackedLink
            to="/daily-quiz"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] border border-white/10 text-[var(--color-text-secondary)] text-sm font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
           label="mistake-notebook">
            Try Daily Quiz
          </TrackedLink>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ─── Stats cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-[var(--radius-lg)] p-4 text-center shadow-[var(--shadow-sm)]">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/15 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-400">{totalMistakes}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">
            Total Mistakes
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-[var(--radius-lg)] p-4 text-center shadow-[var(--shadow-sm)]">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/15 mb-2">
            <Filter className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600">{uniqueQuestions}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">
            Unique Questions
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-[var(--radius-lg)] p-4 text-center shadow-[var(--shadow-sm)]">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{masteredCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">
            Mastered
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-[var(--radius-lg)] p-4 text-center shadow-[var(--shadow-sm)]">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/15 mb-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-extrabold text-amber-600 truncate">{weakestSubject?.[0] ?? '—'}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">
            Most Mistakes
          </p>
        </div>
      </div>

      {/* ─── Mode toggle ───────────────────────────────── */}
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={() => setRedoMode(v => !v)}
          aria-pressed={redoMode}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold border transition-all cursor-pointer ${
            redoMode
              ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)] shadow-[var(--glow-signal-sm)]'
              : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-white/10 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {redoMode ? 'Back to review' : 'Redo mistakes'}
        </button>
      </div>

      {/* ─── Filters (review mode) ─────────────────────── */}
      {!redoMode && (
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search questions, topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-white/10 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent shadow-[var(--shadow-sm)]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {subjects.map(s => {
            const colors = s === 'All' ? null : (SUBJECT_COLORS[s] ?? DEFAULT_COLORS)
            return (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                  selectedSubject === s
                    ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)] shadow-[var(--glow-signal-sm)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-white/10 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                }`}
              >
                {s !== 'All' && colors && (
                  <span className={`inline-block w-2 h-2 rounded-full ${colors.dot} mr-1.5 -mb-px`} />
                )}
                {s}
              </button>
            )
          })}
        </div>
      </div>

      )}

      {/* ─── Mistakes list (review mode) ────────────────── */}
      {!redoMode && (
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-[var(--color-surface)] border border-white/10 rounded-[var(--radius-lg)] p-10 text-center shadow-[var(--shadow-sm)]">
            <Filter className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
            <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">No matches found</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Try adjusting your search or subject filter.
            </p>
          </div>
        ) : (
          filtered.map(mistake => {
            const isExpanded = expandedId === mistake.id
            const showExplanation = showExplanations.has(mistake.id)
            const isMastered = mastered.has(mistake.id)
            const colors = SUBJECT_COLORS[mistake.subject] ?? DEFAULT_COLORS

            return (
              <div
                key={mistake.id}
                className={`bg-[var(--color-surface)] border rounded-[var(--radius-lg)] overflow-hidden transition-all duration-200 ${
                  isMastered
                    ? 'border-emerald-500/30 bg-emerald-500/10 opacity-75'
                    : 'border-white/10 shadow-[var(--shadow-card)]'
                }`}
              >
                {/* Question header */}
                <button
                  onClick={() => toggleExpand(mistake.id)}
                  className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
                >
                  <span
                    className={`shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center ${
                      isMastered ? 'bg-emerald-500/15' : 'bg-rose-500/15'
                    }`}
                  >
                    {isMastered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {mistake.subject}
                      </span>
                      {mistake.topic && (
                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                          {mistake.topic}
                        </span>
                      )}
                      {mistake.difficulty && (
                        <span className="text-[10px] text-[var(--color-text-muted)] font-medium capitalize">
                          · {mistake.difficulty}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm font-semibold text-[var(--color-text-primary)] leading-relaxed line-clamp-2 ${
                        isMastered ? 'line-through decoration-emerald-400' : ''
                      }`}
                    >
                      {mistake.question_text}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--color-text-muted)]">
                      <span>
                        Your answer:{' '}
                        <span className="text-red-500 font-bold">{mistake.selected_answer}</span>
                      </span>
                      <span className="text-[var(--color-border-dark)]">·</span>
                      <span>
                        Correct:{' '}
                        <span className="text-emerald-600 font-bold">{mistake.correct_answer}</span>
                      </span>
                      <span className="text-[var(--color-border-dark)]">·</span>
                      <span>{formatDate(mistake.created_at)}</span>
                    </div>
                  </div>
                  <span className="shrink-0 mt-1 text-[var(--color-text-muted)]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/10">
                    {/* Options */}
                    <div className="space-y-2 mt-4">
                      {(['A', 'B', 'C', 'D'] as const).map(key => {
                        const value =
                          key === 'A'
                            ? mistake.option_a
                            : key === 'B'
                              ? mistake.option_b
                              : key === 'C'
                                ? mistake.option_c
                                : mistake.option_d
                        if (!value) return null
                        const isStudentPick = key === mistake.selected_answer
                        const isCorrect = key === mistake.correct_answer
                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border text-sm transition-colors ${
                              isCorrect
                                ? 'border-emerald-500/30 bg-emerald-500/10'
                                : isStudentPick
                                  ? 'border-rose-500/30 bg-rose-500/15'
                                  : 'border-white/10 bg-white/[0.04]'
                            }`}
                          >
                            <span
                              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCorrect
                                  ? 'bg-emerald-500 text-white'
                                  : isStudentPick
                                    ? 'bg-red-400 text-white'
                                    : 'bg-white/[0.06] text-white/40'
                              }`}
                            >
                              {key}
                            </span>
                            <span className="text-[var(--color-text-primary)]">{value}</span>
                            {isCorrect && (
                              <span className="ml-auto text-emerald-600 font-bold text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            )}
                            {isStudentPick && !isCorrect && (
                              <span className="ml-auto text-red-500 font-bold text-xs flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Your pick
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Explanation */}
                    {mistake.explanation && (
                      <div className="mt-4">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            toggleExplanation(mistake.id)
                          }}
                          className="text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                        </button>
                        {showExplanation && (
                          <div className="mt-2 text-sm text-[var(--color-text-secondary)] bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/25 rounded-[var(--radius-md)] p-4 leading-relaxed">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">
                              Explanation
                            </p>
                            {mistake.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      <button
                        onClick={e => toggleMastered(mistake.id, e)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                          isMastered
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-white/[0.04] text-white/60 border-white/10 hover:border-emerald-400 hover:text-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isMastered ? 'Mastered' : 'Mark as mastered'}
                      </button>
                      <TrackedLink
                        to={`/dashboard/practice/quiz?subject=${encodeURIComponent(mistake.subject)}&count=10`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
                       label="mistake-notebook">
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retry similar
                      </TrackedLink>
                      <TrackedLink
                        to="/dashboard/practice"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:underline"
                       label="mistake-notebook">
                        All practice <ExternalLink className="w-3 h-3" />
                      </TrackedLink>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      )}

      {/* ─── Redo drill (redo mode) ─────────────────────── */}
      {redoMode && <MistakesDrill questions={drill} />}

      {/* ─── Bottom CTA (review mode only) ──────────────── */}
      {!redoMode && filtered.length > 0 && (
        <div className="mt-8 rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] p-8 text-center text-[var(--color-text-inverse)] shadow-[var(--shadow-lg)]">
          <TrendingUp className="mx-auto mb-3 h-8 w-8 opacity-80" />
          <p className="mb-1 text-sm font-bold">
            {activeMistakes > 0
              ? `You have ${activeMistakes} active mistake${activeMistakes === 1 ? '' : 's'} to review`
              : 'All mistakes mastered! Keep it up!'}
          </p>
          <p className="mb-5 text-xs opacity-70">
            Focus on your weakest areas to improve faster.
          </p>
          <TrackedLink
            to={`/dashboard/practice/quiz?subject=${weakestSubject ? encodeURIComponent(weakestSubject[0]) : ''}&count=10`}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[#0a0a0a] px-6 py-3 text-sm font-bold text-[var(--color-primary-light)] shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-colors hover:bg-black"
           label="mistake-notebook">
            <RotateCcw className="h-4 w-4" />
            Practice Weakest Subject
          </TrackedLink>
        </div>
      )}
    </div>
  )
}
