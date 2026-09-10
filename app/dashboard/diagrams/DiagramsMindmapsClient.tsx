'use client'

import { useMemo, useState } from 'react'
import type { Diagram, DiagramHotspot } from '@/lib/diagrams/diagrams-data'
import type { Mindmap, MindmapNode } from '@/lib/diagrams/mindmaps-data'

// Diagrams & Mindmaps UI.
//
// Diagrams: each SVG figure renders its hotspots as numbered dots. Two modes:
//   explore — tap a dot to reveal its label + function note.
//   quiz    — the app asks for a part ("Tap the Left ventricle"); the student
//             must find and tap it. Answer-tracking is session-local on
//             purpose: mastery of diagrams is practiced here, measured where
//             every other attempt is measured (Practice/Mock analytics).

type Props = { diagrams: Diagram[]; mindmaps: Mindmap[] }

type QuizPrompt = { hotspot: DiagramHotspot; done: boolean; correct: boolean | null }

export function DiagramsMindmapsClient({ diagrams, mindmaps }: Props) {
  const [tab, setTab] = useState<'diagrams' | 'mindmaps'>('diagrams')
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeDiagram = diagrams.find((d) => d.id === activeId) ?? null
  const activeMindmap = mindmaps.find((m) => m.id === activeId) ?? null

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6" role="tablist" aria-label="Diagram sections">
        {(['diagrams', 'mindmaps'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              setTab(t)
              setActiveId(null)
            }}
            className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-bold transition-colors cursor-pointer ${
              tab === t
                ? 'bg-[var(--signal-500)] text-[var(--on-cta)]'
                : 'bg-white/[0.06] text-[var(--steel-300)] hover:bg-white/[0.12] hover:text-white ring-1 ring-white/10'
            }`}
          >
            {t === 'diagrams' ? '🔲 Labeled Diagrams' : '🧠 Mindmaps'}
          </button>
        ))}
      </div>

      {tab === 'diagrams' ? (
        activeDiagram ? (
          <DiagramDetail diagram={activeDiagram} onBack={() => setActiveId(null)} />
        ) : (
          <DiagramGrid diagrams={diagrams} onOpen={setActiveId} />
        )
      ) : activeMindmap ? (
        <MindmapDetail mindmap={activeMindmap} onBack={() => setActiveId(null)} />
      ) : (
        <MindmapGrid mindmaps={mindmaps} onOpen={setActiveId} />
      )}
    </div>
  )
}

// ── Diagrams: grid ────────────────────────────────────────────────────────

function DiagramGrid({ diagrams, onOpen }: { diagrams: Diagram[]; onOpen: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {diagrams.map((d) => (
        <button
          key={d.id}
          onClick={() => onOpen(d.id)}
          className="group glass-tile-glow rounded-[var(--radius-lg)] p-5 text-left hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
        >
          {/* Miniature static preview */}
          <div
            className="rounded-[var(--radius-md)] bg-[var(--srf-2)] ring-1 ring-white/10 mb-4 overflow-hidden"
            aria-hidden="true"
          >
            <svg viewBox={d.viewBox} className="w-full h-32 opacity-80 group-hover:opacity-100 transition-opacity" role="img" aria-label={`${d.title} preview`}>
              <g dangerouslySetInnerHTML={{ __html: d.svg }} />
              {d.hotspots.map((h) => (
                <circle key={h.id} cx={h.x} cy={h.y} r="7" fill="var(--signal-400)" opacity="0.85" />
              ))}
            </svg>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">{d.chapter}</p>
          <h3 className="mt-1 font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
            {d.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">{d.description}</p>
          <span className="mt-3 inline-block text-xs font-bold text-[var(--signal-200)]">
            {d.hotspots.length} parts to master →
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Diagrams: detail with explore + quiz ──────────────────────────────────

function DiagramDetail({ diagram, onBack }: { diagram: Diagram; onBack: () => void }) {
  const [mode, setMode] = useState<'explore' | 'quiz'>('explore')
  const [selected, setSelected] = useState<DiagramHotspot | null>(null)

  // Quiz state: shuffled prompts over every hotspot.
  const [quiz, setQuiz] = useState<QuizPrompt[] | null>(null)
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizPicked, setQuizPicked] = useState<string | null>(null)

  const quizCurrent = quiz?.[quizIdx] ?? null
  const quizDone = quiz !== null && quizIdx >= quiz.length
  const quizCorrectCount = quiz?.filter((q) => q.correct === true).length ?? 0

  const startQuiz = () => {
    const shuffled = [...diagram.hotspots]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setQuiz(shuffled.map((h) => ({ hotspot: h, done: false, correct: null })))
    setQuizIdx(0)
    setQuizPicked(null)
    setSelected(null)
    setMode('quiz')
  }

  const tapHotspot = (h: DiagramHotspot) => {
    if (mode === 'explore') {
      setSelected(h)
      return
    }
    if (!quizCurrent || quizCurrent.done) return
    setQuizPicked(h.id)
    setQuiz((prev) =>
      prev
        ? prev.map((q, i) =>
            i === quizIdx ? { ...q, done: true, correct: h.id === quizCurrent.hotspot.id } : q
          )
        : prev
    )
  }

  const nextQuiz = () => {
    setQuizPicked(null)
    setQuizIdx((i) => i + 1)
  }

  const exitQuiz = () => {
    setQuiz(null)
    setQuizPicked(null)
    setMode('explore')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-[var(--steel-300)] hover:text-white transition-colors cursor-pointer"
        >
          ← All diagrams
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">
          {diagram.chapter}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-extrabold text-gradient-brand">{diagram.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('explore')
              setQuiz(null)
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              mode === 'explore'
                ? 'bg-[var(--signal-500)] text-[var(--on-cta)]'
                : 'bg-white/[0.06] text-[var(--steel-300)] hover:bg-white/[0.12] ring-1 ring-white/10'
            }`}
          >
            Explore
          </button>
          {mode === 'quiz' && !quizDone ? (
            <button
              onClick={exitQuiz}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-500/15 ring-1 ring-red-500/40 text-red-300 hover:bg-red-500/25 transition-colors cursor-pointer"
            >
              End quiz
            </button>
          ) : (
            <button
              onClick={startQuiz}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--signal-500)]/15 ring-1 ring-[var(--signal-500)]/40 text-[var(--signal-200)] hover:bg-[var(--signal-500)]/25 transition-colors cursor-pointer"
            >
              {quizDone ? 'Quiz again' : 'Label quiz'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Figure */}
        <div className="lg:col-span-3 glass-tile-glow rounded-[var(--radius-xl)] p-4 sm:p-6">
          <svg
            viewBox={diagram.viewBox}
            className="w-full select-none"
            role="img"
            aria-label={`${diagram.title} — interactive figure with ${diagram.hotspots.length} labeled parts`}
          >
            <g dangerouslySetInnerHTML={{ __html: diagram.svg }} />
            {diagram.hotspots.map((h) => {
              const isAnswer = quizCurrent && quizPicked && h.id === quizCurrent.hotspot.id
              const isWrongPick = quizPicked === h.id && !isAnswer
              const isNextTarget = quizCurrent && !quizCurrent.done && h.id === quizCurrent.hotspot.id
              return (
                <g
                  key={h.id}
                  onClick={() => tapHotspot(h)}
                  className="cursor-pointer"
                  role="button"
                  aria-label={mode === 'explore' ? `Reveal ${h.label}` : `Guess: ${h.label}`}
                >
                  {/* generous touch target behind the visible dot */}
                  <circle cx={h.x} cy={h.y} r="16" fill="transparent" />
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r="9"
                    fill={
                      isAnswer
                        ? '#34d399'
                        : isWrongPick
                          ? '#f87171'
                          : isNextTarget
                            ? 'transparent'
                            : 'var(--signal-400)'
                    }
                    stroke={isNextTarget ? 'var(--signal-400)' : 'none'}
                    strokeWidth={isNextTarget ? 2.5 : 0}
                    opacity={isNextTarget && !quizPicked ? 0.55 : 1}
                    className="transition-all duration-200"
                  />
                </g>
              )
            })}
          </svg>

          {/* Explore mode: selected part */}
          {mode === 'explore' && (
            <div className="mt-4 min-h-[64px]" aria-live="polite">
              {selected ? (
                <div className="rounded-[var(--radius-md)] bg-white/[0.05] ring-1 ring-white/10 p-4">
                  <p className="font-bold text-[var(--color-primary-light)]">{selected.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">{selected.note}</p>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-4">
                  Tap any glowing dot to reveal the part and its function.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="lg:col-span-2">
          {mode === 'explore' ? (
            <div className="glass-tile-glow rounded-[var(--radius-xl)] p-5">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">All parts</h3>
              <ul className="space-y-1.5">
                {diagram.hotspots.map((h) => (
                  <li key={h.id}>
                    <button
                      onClick={() => setSelected(h)}
                      className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                        selected?.id === h.id
                          ? 'bg-[var(--signal-500)]/15 text-[var(--signal-200)] ring-1 ring-[var(--signal-500)]/40'
                          : 'text-[var(--color-text-secondary)] hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      {h.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : quizDone ? (
            <div className="glass-tile-glow rounded-[var(--radius-xl)] p-8 text-center">
              <p className="text-4xl mb-3">{quizCorrectCount === quiz!.length ? '🏆' : '📈'}</p>
              <h3 className="text-lg font-extrabold text-gradient-brand">
                {quizCorrectCount}/{quiz!.length} correct
              </h3>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                {quizCorrectCount === quiz!.length
                  ? 'Perfect — this diagram is exam-ready.'
                  : 'Run it again — the missed parts will feel familiar next time.'}
              </p>
              <div className="mt-5 flex gap-2 justify-center flex-wrap">
                <button
                  onClick={startQuiz}
                  className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--signal-500)]/15 border border-[var(--signal-500)]/40 text-[var(--signal-200)] text-xs font-bold hover:bg-[var(--signal-500)]/25 transition-colors cursor-pointer"
                >
                  Quiz again
                </button>
                <button
                  onClick={exitQuiz}
                  className="px-4 py-2 rounded-[var(--radius-md)] bg-white/[0.06] border border-white/10 text-white text-xs font-bold hover:bg-white/[0.12] transition-colors cursor-pointer"
                >
                  Explore instead
                </button>
              </div>
            </div>
          ) : quizCurrent ? (
            <div className="glass-tile-glow rounded-[var(--radius-xl)] p-5" aria-live="polite">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)] mb-2">
                Question {quizIdx + 1} of {quiz!.length}
              </p>
              <p className="text-base font-bold text-white">Tap the: {quizCurrent.hotspot.label}</p>

              {quizCurrent.done ? (
                <>
                  <div
                    className={`mt-4 rounded-[var(--radius-md)] p-4 ring-1 ${
                      quizPicked === quizCurrent.hotspot.id
                        ? 'bg-emerald-500/10 ring-emerald-500/40'
                        : 'bg-red-500/10 ring-red-500/40'
                    }`}
                  >
                    <p className={`text-sm font-extrabold ${quizPicked === quizCurrent.hotspot.id ? 'text-emerald-300' : 'text-red-300'}`}>
                      {quizPicked === quizCurrent.hotspot.id ? 'Correct!' : 'Not quite.'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      {quizCurrent.hotspot.label} — {quizCurrent.hotspot.note}
                    </p>
                  </div>
                  <button
                    onClick={nextQuiz}
                    className="mt-4 w-full px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--signal-500)]/15 border border-[var(--signal-500)]/40 text-[var(--signal-200)] text-sm font-bold hover:bg-[var(--signal-500)]/25 transition-colors cursor-pointer"
                  >
                    {quizIdx + 1 >= quiz!.length ? 'See results' : 'Next part →'}
                  </button>
                </>
              ) : (
                <p className="mt-4 text-xs text-[var(--color-text-muted)]">
                  Find it on the figure and tap that spot.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ── Mindmaps ──────────────────────────────────────────────────────────────

function MindmapGrid({ mindmaps, onOpen }: { mindmaps: Mindmap[]; onOpen: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {mindmaps.map((m) => {
        const topicCount = countLeaves(m.root)
        return (
          <button
            key={m.id}
            onClick={() => onOpen(m.id)}
            className="group glass-tile-glow rounded-[var(--radius-lg)] p-5 text-left hover:translate-y-[-2px] transition-all duration-300 cursor-pointer"
          >
            <span className="icon-tile w-11 h-11 text-xl bg-[var(--srf-2)] ring-1 ring-white/10 flex items-center justify-center">
              {m.icon}
            </span>
            <h3 className="mt-4 font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
              {m.subject}
            </h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {m.root.length} chapters · {topicCount} key points
            </p>
            <span className="mt-3 inline-block text-xs font-bold text-[var(--signal-200)]">Open map →</span>
          </button>
        )
      })}
    </div>
  )
}

function countLeaves(nodes: MindmapNode[]): number {
  return nodes.reduce((n, node) => n + (node.children?.length ? countLeaves(node.children) : 1), 0)
}

function MindmapDetail({ mindmap, onBack }: { mindmap: Mindmap; onBack: () => void }) {
  // Expanded state keyed by path ("0.2.1"); chapters start expanded, deeper
  // nodes start collapsed.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(mindmap.root.map((_, i) => String(i)))
  )
  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  const totalLeaves = useMemo(() => countLeaves(mindmap.root), [mindmap])
  // Ticked = leaves the student marks off as revised (session-local).
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const toggleTick = (path: string) =>
    setTicked((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-[var(--steel-300)] hover:text-white transition-colors cursor-pointer"
        >
          ← All mindmaps
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--steel-400)]">
          {ticked.size}/{totalLeaves} revised this session
        </span>
      </div>

      <h2 className="text-xl font-extrabold text-gradient-brand mb-4">
        {mindmap.icon} {mindmap.title}
      </h2>

      <div className="space-y-2.5">
        {mindmap.root.map((node, i) => (
          <MindmapBranch
            key={String(i)}
            node={node}
            path={String(i)}
            depth={0}
            expanded={expanded}
            ticked={ticked}
            onToggle={toggle}
            onTick={toggleTick}
          />
        ))}
      </div>
    </div>
  )
}

function MindmapBranch({
  node,
  path,
  depth,
  expanded,
  ticked,
  onToggle,
  onTick,
}: {
  node: MindmapNode
  path: string
  depth: number
  expanded: Set<string>
  ticked: Set<string>
  onToggle: (path: string) => void
  onTick: (path: string) => void
}) {
  const hasChildren = Boolean(node.children?.length)
  const isOpen = expanded.has(path)

  return (
    <div style={{ marginLeft: depth > 0 ? `${Math.min(depth, 4) * 14}px` : 0 }}>
      <div className="flex items-center gap-2">
        {hasChildren ? (
          <button
            onClick={() => onToggle(path)}
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse ${node.title}` : `Expand ${node.title}`}
            className="w-6 h-6 shrink-0 flex items-center justify-center rounded-md bg-white/[0.06] ring-1 ring-white/10 text-[var(--steel-300)] hover:bg-white/[0.12] hover:text-white transition-colors cursor-pointer text-xs"
          >
            {isOpen ? '−' : '+'}
          </button>
        ) : (
          <button
            onClick={() => onTick(path)}
            role="checkbox"
            aria-checked={ticked.has(path)}
            aria-label={`Mark ${node.title} as revised`}
            className={`w-5 h-5 shrink-0 flex items-center justify-center rounded-md ring-1 transition-colors cursor-pointer text-[10px] font-bold ${
              ticked.has(path)
                ? 'bg-emerald-500/25 ring-emerald-500/50 text-emerald-300'
                : 'bg-white/[0.04] ring-white/15 text-transparent hover:ring-white/30'
            }`}
          >
            ✓
          </button>
        )}
        {hasChildren ? (
          <button
            onClick={() => onToggle(path)}
            className={`text-left font-bold transition-colors cursor-pointer truncate ${
              depth === 0
                ? 'text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary-light)]'
                : 'text-xs text-[var(--color-text-secondary)] hover:text-white'
            }`}
          >
            {node.title}
          </button>
        ) : (
          <span
            className={`text-left text-xs cursor-default truncate ${
              ticked.has(path) ? 'text-[var(--steel-400)] line-through' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {node.title}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="mt-1.5 space-y-1.5 border-l border-white/[0.08] pl-2 ml-[11px]">
          {node.children!.map((child, i) => (
            <MindmapBranch
              key={`${path}.${i}`}
              node={child}
              path={`${path}.${i}`}
              depth={depth + 1}
              expanded={expanded}
              ticked={ticked}
              onToggle={onToggle}
              onTick={onTick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
