// MDCAT bank aggregator for the MED Prep site.
// Combines the four PMDC MDCAT question banks (Biology, Chemistry, Physics,
// English) into a single export served by the practice session, plus a
// canonical subject list for the practice chooser.
//
// Same ResourceQuestion shape as lib/resources.ts so the shared practice UI
// renders these identically — no schema change needed at the data seam.

import type { ResourceQuestion } from './resources'
import { BIOLOGY_QUESTIONS } from './biology-questions'
import { CHEMISTRY_QUESTIONS } from './chemistry-questions'
import { PHYSICS_QUESTIONS } from './physics-questions'
import { ENGLISH_QUESTIONS } from './english-questions'

export const MDCAT_QUESTIONS: ResourceQuestion[] = [
  ...BIOLOGY_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...PHYSICS_QUESTIONS,
  ...ENGLISH_QUESTIONS,
]

/** Canonical MDCAT subject list for the practice chooser and notes pages. */
export const MDCAT_SUBJECTS = [
  { name: 'Biology', icon: '🧬' },
  { name: 'Chemistry', icon: '⚗️' },
  { name: 'Physics', icon: '⚛️' },
  { name: 'English', icon: '📖' },
] as const

export const MDCAT_SUBJECT_NAMES: readonly string[] = MDCAT_SUBJECTS.map(s => s.name)

/** Counts of the bundled MDCAT bank per subject (for honest chooser cards). */
export const MDCAT_BANK_COUNTS: Record<string, number> = MDCAT_QUESTIONS.reduce(
  (acc, q) => {
    const s = q.subject
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  },
  {} as Record<string, number>
)