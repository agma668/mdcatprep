'use client'

import { TrackedLink } from "@/components/TrackedLink";
import { useState } from 'react'
import Link from 'next/link'
import { Clock, FileText, ArrowRight, AlertTriangle } from 'lucide-react'

interface Section {
  name: string
  questions: number
  marks: number
}

interface TestFormat {
  id: string
  name: string
  duration: number
  totalMarks: number
  sections: Section[]
}

export function MockTestSetup({ formats }: { formats: TestFormat[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  const selectedFormat = formats.find(f => f.id === selected)

  return (
    <div className="space-y-6">
      {/* Test format cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {formats.map(format => (
          <button
            key={format.id}
            onClick={() => setSelected(format.id)}
            className={`text-left p-5 rounded-[var(--radius-lg)] border transition-all ${
              selected === format.id
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                : 'border-white/10 bg-white/[0.04] hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-bold ${selected === format.id ? 'text-[var(--color-primary-light)]' : 'text-white'}`}>
                {format.name}
              </h3>
              <span className="text-xs text-white/40 bg-white/[0.06] px-2 py-1 rounded-full">
                {format.duration >= 60 ? `${format.duration / 60}h` : `${format.duration}m`}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                {format.sections.reduce((s, sec) => s + sec.questions, 0)} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {format.totalMarks} marks
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected format details */}
      {selectedFormat && (
        <div className="glass-tile-glow rounded-[var(--radius-lg)] p-6">
          <h3 className="font-bold text-white mb-4">{selectedFormat.name} — Test Structure</h3>
          
          <div className="space-y-2 mb-6">
            {selectedFormat.sections.map(section => (
              <div key={section.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-white/80">{section.name}</span>
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span>{section.questions} questions</span>
                  <span className="font-bold text-[var(--color-primary-light)]">{section.marks} marks</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-[var(--radius-md)] mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-sm text-amber-300">
              <p className="font-semibold">Important:</p>
              <p className="text-amber-400/80">Once started, the timer cannot be paused. Make sure you have {selectedFormat.duration >= 60 ? `${selectedFormat.duration / 60} hours` : `${selectedFormat.duration} minutes`} of uninterrupted time.</p>
            </div>
          </div>

          <TrackedLink
            to={`/dashboard/mock-test/test?format=${selected}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
           label="mock-setup-start">
            Start Mock Test <ArrowRight className="w-4 h-4" />
          </TrackedLink>
        </div>
      )}
    </div>
  )
}
