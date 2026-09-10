'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PASSAGES } from '@/lib/passages'

export function PassagePractice() {
  const [selectedId, setSelectedId] = useState<string>(PASSAGES[0].id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [revealed, setRevealed] = useState(false)

  const passage = PASSAGES.find(p => p.id === selectedId) ?? PASSAGES[0]

  const selectPassage = (id: string) => {
    setSelectedId(id)
    setAnswers({})
    setRevealed(false)
  }

  const checkAnswers = () => {
    setRevealed(true)
    const el = document.getElementById('passage-results')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      {/* Passage selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PASSAGES.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => selectPassage(p.id)}
            className={[
              'px-4 py-2 rounded-[var(--radius-md)] border text-sm font-medium transition-colors',
              p.id === selectedId
                ? 'bg-[var(--color-primary)] text-[var(--color-text-inverse)] border-[var(--color-primary)]'
                : 'bg-white/[0.06]/[0.04] text-white border-white/10 hover:border-[var(--color-primary)]',
            ].join(' ')}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Passage */}
      <div className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-6">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
          {passage.title}
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Read the passage carefully, then answer the questions below.
        </p>
        <div className="space-y-3 text-[var(--color-text-secondary)] leading-relaxed">
          {passage.text.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      {/* Questions */}
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mt-8 mb-3">
        Answer the questions
      </h2>
      <div className="space-y-4">
        {passage.questions.map((q, i) => (
          <div
            key={i}
            className="glass-tile-glow rounded-[var(--radius-lg)] border border-white/10 p-5"
          >
            <p className="font-semibold text-[var(--color-text-primary)]">
              {i + 1}. {q.question}
            </p>
            <textarea
              value={answers[i] ?? ''}
              onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
              rows={2}
              className="mt-3 w-full px-4 py-2 border border-white/10 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white/[0.06]/[0.04]/[0.04] text-white"
              placeholder="Write your answer here..."
            />
            {revealed && (
              <div className="mt-3 p-3 bg-emerald-500/15 border border-emerald-500/25 rounded-[var(--radius-md)]">
                <p className="text-xs font-semibold text-green-700 mb-1">Model answer</p>
                <p className="text-sm text-green-800 leading-relaxed">{q.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div id="passage-results" className="mt-6">
        <Button variant="primary" onClick={checkAnswers} disabled={revealed}>
          Check my answers
        </Button>
        {revealed && (
          <button
            type="button"
            onClick={() => {
              setAnswers({})
              setRevealed(false)
            }}
            className="ml-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Try again
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mt-6">
        Tip: read the passage twice — once for the idea, then again to find the
        answers. Write in complete sentences, as in the real test.
      </p>
    </div>
  )
}
