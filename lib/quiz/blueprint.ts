// Blueprint-driven quiz planning (GitHub issue #3).
//
// A quiz "blueprint" is the exam's subject/weight structure — e.g. NUST
// NET-Engineering's official 50% Mathematics / 30% Physics / 20% English.
// Blueprints are DATA, not code guesses: each carries a `verified` flag and a
// version, and only verified blueprints are offered as exam simulations. This
// module is pure (no database, no network) so allocation can be unit-tested and
// can never silently invent an exam pattern the school has not confirmed.
//
// It answers two questions:
//   1. For a chosen exam/custom mix, how many questions come from each section?
//   2. Given a pool of approved questions, which ones fill those sections?
// Both are deterministic so the same inputs always yield the same quiz.

export interface BlueprintSection {
  /** Subject label as used by the question bank (e.g. "Mathematics"). */
  subject: string
  /** Optional topic narrowing within the subject. */
  topic?: string
  /** Relative weight; weights are normalised across the blueprint. */
  weight: number
}

export interface QuizBlueprint {
  id: string
  examId: string
  variantId: string
  /** Blueprint version — bump when the official pattern changes. */
  version: string
  /** True only when the pattern is confirmed against an official source. */
  verified: boolean
  /** Human note on provenance; shown to students. */
  sourceNote?: string
  sections: BlueprintSection[]
}

export interface PlannedSection extends BlueprintSection {
  /** Questions allocated to this section for the requested total. */
  count: number
}

export interface QuizPlan {
  blueprintId: string
  version: string
  totalRequested: number
  totalAllocated: number
  /** True when every requested question could be allocated within availability. */
  complete: boolean
  sections: PlannedSection[]
}

export type Availability = Record<string, number>

export interface QuestionPoolItem {
  id: string
  subject: string
  topic?: string | null
}

/** Reasons a blueprint or custom mix is rejected. */
export type BlueprintValidation =
  | { ok: true }
  | { ok: false; error: string }

export function validateBlueprint(blueprint: QuizBlueprint): BlueprintValidation {
  if (!blueprint.id || !blueprint.examId || !blueprint.variantId) {
    return { ok: false, error: 'Blueprint is missing its identity.' }
  }
  if (blueprint.sections.length === 0) {
    return { ok: false, error: 'A blueprint needs at least one section.' }
  }
  const seen = new Set<string>()
  let weightSum = 0
  for (const section of blueprint.sections) {
    if (!section.subject) return { ok: false, error: 'Every section needs a subject.' }
    if (!(section.weight > 0)) return { ok: false, error: 'Section weights must be positive.' }
    const key = `${section.subject}::${section.topic ?? ''}`
    if (seen.has(key)) return { ok: false, error: `Duplicate section: ${key}` }
    seen.add(key)
    weightSum += section.weight
  }
  if (!Number.isFinite(weightSum) || weightSum <= 0) {
    return { ok: false, error: 'Blueprint weights must sum to a positive number.' }
  }
  return { ok: true }
}

/**
 * Allocate `total` questions across sections in proportion to their weights,
 * using the largest-remainder method so the counts always sum exactly to the
 * total (or less when availability clamps a section). Allocation is stable:
 * ties break by section order.
 */
export function allocateSections(
  sections: BlueprintSection[],
  total: number,
  availability?: Availability
): PlannedSection[] {
  const requested = Math.max(0, Math.floor(total))
  const weightSum = sections.reduce((sum, s) => sum + s.weight, 0)
  if (weightSum <= 0 || requested === 0) {
    return sections.map((s) => ({ ...s, count: 0 }))
  }

  const raw = sections.map((s) => (s.weight / weightSum) * requested)
  const base = raw.map((v) => Math.floor(v))
  let remainder = requested - base.reduce((a, b) => a + b, 0)

  // Distribute the remaining questions to the largest fractional parts.
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => (b.frac !== a.frac ? b.frac - a.frac : a.index - b.index))

  const counts = [...base]
  for (let i = 0; i < order.length && remainder > 0; i++) {
    counts[order[i].index] += 1
    remainder -= 1
  }

  return sections.map((section, index) => {
    let count = counts[index]
    if (availability) {
      const key = `${section.subject}::${section.topic ?? ''}`
      const subjectKey = section.subject
      const cap = availability[key] ?? availability[subjectKey]
      if (typeof cap === 'number') count = Math.min(count, Math.max(0, cap))
    }
    return { ...section, count }
  })
}

/** Build a plan for a blueprint, clamping to availability when provided. */
export function buildQuizPlan(
  blueprint: QuizBlueprint,
  total: number,
  availability?: Availability
): QuizPlan {
  const validation = validateBlueprint(blueprint)
  const sections = validation.ok ? allocateSections(blueprint.sections, total, availability) : []
  const totalAllocated = sections.reduce((sum, s) => sum + s.count, 0)
  return {
    blueprintId: blueprint.id,
    version: blueprint.version,
    totalRequested: Math.max(0, Math.floor(total)),
    totalAllocated,
    complete: totalAllocated >= Math.max(0, Math.floor(total)),
    sections,
  }
}

/**
 * Select concrete questions for a plan from an approved pool. Deterministic:
 * questions are walked in pool order and each section takes the first unused
 * matching questions until its count is filled. Returns the selected ids in
 * section order and any shortfall per section.
 */
export function selectQuestionsForPlan(
  plan: QuizPlan,
  pool: QuestionPoolItem[]
): { ids: string[]; shortfall: PlannedSection[] } {
  const used = new Set<string>()
  const ids: string[] = []
  const shortfall: PlannedSection[] = []

  for (const section of plan.sections) {
    let taken = 0
    for (const item of pool) {
      if (taken >= section.count) break
      if (used.has(item.id)) continue
      const matches =
        item.subject === section.subject &&
        (!section.topic || item.topic === section.topic)
      if (!matches) continue
      used.add(item.id)
      ids.push(item.id)
      taken += 1
    }
    if (taken < section.count) {
      shortfall.push({ ...section, count: section.count - taken })
    }
  }

  return { ids, shortfall }
}

/** Build a free-form custom quiz blueprint from a student's chosen sections. */
export function customBlueprint(sections: BlueprintSection[]): QuizBlueprint {
  return {
    id: 'custom',
    examId: 'custom',
    variantId: 'custom',
    version: '1',
    verified: false,
    sourceNote: 'Your own mix — not an official exam pattern.',
    sections: sections.map((s) => ({ ...s })),
  }
}

export function isBlueprintValid(blueprint: QuizBlueprint): boolean {
  return validateBlueprint(blueprint).ok
}
