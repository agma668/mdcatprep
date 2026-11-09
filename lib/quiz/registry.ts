// Verified quiz blueprints.
//
// Only blueprints confirmed against an official source belong here, and each
// carries a source note shown to students. The repo's exam audit confirms just
// one split today: NUST NET-Engineering is 50% Mathematics / 30% Physics /
// 20% English. Absolute question counts vary by sitting, so the blueprint
// stores weights only and the student chooses the total. Everything else stays
// unlisted until verified — no invented exam patterns.

import type { QuizBlueprint } from './blueprint'

export const VERIFIED_BLUEPRINTS: QuizBlueprint[] = [
  {
    id: 'nust-net-engineering',
    examId: 'nust-net',
    variantId: 'engineering',
    version: '1',
    verified: true,
    sourceNote:
      'NUST NET-Engineering subject split: 50% Mathematics, 30% Physics, 20% English.',
    sections: [
      { subject: 'Mathematics', weight: 50 },
      { subject: 'Physics', weight: 30 },
      { subject: 'English', weight: 20 },
    ],
  },
]

/** Look up a verified blueprint by id; returns null for unknown/unverified. */
export function getVerifiedBlueprint(id: string): QuizBlueprint | null {
  return VERIFIED_BLUEPRINTS.find((b) => b.id === id && b.verified) ?? null
}

/** All verified blueprints for an exam id. */
export function blueprintsForExam(examId: string): QuizBlueprint[] {
  return VERIFIED_BLUEPRINTS.filter((b) => b.examId === examId && b.verified)
}
