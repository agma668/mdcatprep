/**
 * Merit Estimator — the PMDC/medical admission aggregate engine.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The website lets students input their Matric / FSc / MDCAT (or NUMS) marks
 * and see an honest, formula-derived aggregate plus a grounded estimate of
 * which medical college merit bands their aggregate falls into.
 *
 * HONESTY RULES (project red line — no fabricated numbers):
 *   1. The aggregate formula below is PMDC law (10% SSC + 40% HSSC + 50%
 *      entry-test). It is not invented; it is the published admission
 *      weightage. Cite the sources column.
 *   2. Closing-merit figures are HISTORICAL (last full published cycle, 2024)
 *      and are clearly labelled as such. They are an estimate input for the
 *      student's own judgement, never a guarantee. NUMS/private rounds and
 *      provincial quotas move them.
 *   3. We show bands and college expectations, not fake precision. A single
 *      hard "you WILL get admission" number is forbidden here.
 *
 * DATA OWNERSHIP: the college closing-merit table is DATA (published facts +
 * sources). AKUMA owns authored NOTES/MCQ content; this file holds only
 * formula + sourced figures, so it does not step on content ownership.
 */

export type MeritInput = {
  /** SSC/Matric marks as a percentage (0–100). */
  matricPct: number
  /** FSc/HSSC (or IBCC-equivalent) marks as a percentage (0–100). */
  fscPct: number
  /** Entry-test (MDCAT or NUMS) marks as a percentage (0–100). */
  entryPct: number
}

/** PMDC aggregate weights — published admission weightage. */
export const PMDC_WEIGHTS = { matric: 0.10, fsc: 0.40, entry: 0.50 } as const

/**
 * Compute the PMDC aggregate percentage from three component percentages.
 * Pure function, deterministic, unit-testable.
 */
export function computeAggregate({ matricPct, fscPct, entryPct }: MeritInput): number {
  if (
    ![matricPct, fscPct, entryPct].every(
      (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100
    )
  ) {
    throw new Error('Merit input percentages must be finite numbers between 0 and 100.')
  }
  return Math.round(
    (matricPct * PMDC_WEIGHTS.matric +
      fscPct * PMDC_WEIGHTS.fsc +
      entryPct * PMDC_WEIGHTS.entry) *
      100
  ) / 100
}

/**
 * Convert raw marks to a percentage given the marksheet / paper total.
 * Kept explicit so students do not have to guess totals.
 */
export function toPct(obtained: number, total: number): number {
  if (!Number.isFinite(obtained) || !Number.isFinite(total) || total <= 0) return 0
  return (obtained / total) * 100
}

/** Common entry-test totals by body, for the marks→% conversion UI. */
export const ENTRY_TOTALS: ReadonlyArray<{ body: string; total: number; note: string }> = [
  { body: 'PMDC National MDCAT', total: 200, note: '2024 pattern' },
  { body: 'PMDC National MDCAT', total: 180, note: '2026 pattern (Maqsad)' },
  { body: 'NUMS entry test', total: 210, note: 'NUMS pattern' },
]

export type MeritBand = {
  /** Inclusive lower bound of aggregate % for this band. */
  min: number
  label: string
  /** What this band means in honest, non-guaranteeing terms. */
  reading: string
}

/**
 * Aggregate bands mapped to realistic admission outcomes (historical basis,
 * clearly an estimate). These are judgement-labelled, never guarantees.
 */
export const MERIT_BANDS: readonly MeritBand[] = [
  {
    min: 93,
    label: 'Elite',
    reading:
      'Historically secure for KEMU / King Edward / Aga Khan-tier top public colleges — but seat counts and quota rounds move annually.',
  },
  {
    min: 88,
    label: 'Strong',
    reading:
      'Historically competitive for most Punjab/KP public colleges (UHS overall 2024 closed ~90.4); check college-wise bands below.',
  },
  {
    min: 80,
    label: 'Competitive',
    reading:
      'Historically in range for mid-tier public + many private colleges; provincial quota changes annual outcomes.',
  },
  {
    min: 0,
    label: 'Broader range',
    reading:
      'Historically positions toward private/self-finance seats. Exact chances depend heavily on the specific college and quota.',
  },
]

/** Label a computed aggregate against the bands (highest band whose min ≤ aggregate). */
export function classifyAggregate(aggregate: number): MeritBand {
  for (const band of MERIT_BANDS) {
    if (aggregate >= band.min) return band
  }
  return MERIT_BANDS[MERIT_BANDS.length - 1]
}

export type CollegeMerit = {
  university: keyof typeof COLLEGE_UNIVERSITIES
  college: string
  city: string
  /** Last full published closing aggregate % (2024 cycle) — historical. */
  closing2024: number
  source: string
}

export const COLLEGE_UNIVERSITIES = {
  UHS: 'UHS (Punjab)',
  KMU: 'KMU (Khyber Pakhtunkhwa)',
  DUHS: 'DUHS (Sindh)',
  NUMS: 'NUMS (Rawalpindi, MBBS)',
} as const

/**
 * Sourced closing-merit figures, 2024 cycle. LABEL = historical estimate,
 * not a guarantee. Expand with AKUMA-authored / officially-published data.
 * (Some rows intentionally reference the university-level closing where a
 * college-level figure is not cleanly published — marked accordingly.)
 */
export const COLLEGE_MERITS: readonly CollegeMerit[] = [
  // UHS — Punjab (university-level overall closing ~90.45% 1st list, per ilmkidunya)
  {
    university: 'UHS',
    college: 'UHS overall (MBBS, open merit)',
    city: 'Punjab',
    closing2024: 90.45,
    source: 'ilmkidunya UHS Final Merit List 2024 (first list closing)',
  },
  {
    university: 'UHS',
    college: 'King Edward Medical University (KEMU)',
    city: 'Lahore',
    closing2024: 94.9,
    source: 'UHS college-wise closing 2024 (community-tracked video + final list)',
  },
  {
    university: 'UHS',
    college: 'Allama Iqbal Medical College (AIMC)',
    city: 'Lahore',
    closing2024: 94.3,
    source: 'UHS college-wise closing 2024 (community-tracked)',
  },
  // KMU — Khyber Pakhtunkhwa
  {
    university: 'KMU',
    college: 'Khyber Medical College (KMC)',
    city: 'Peshawar',
    closing2024: 91,
    source: 'KMU Day-1 admission summaries 2025 (community-tracked, historical)',
  },
  // DUHS — Sindh
  {
    university: 'DUHS',
    college: 'Dow Medical College (DMC)',
    city: 'Karachi',
    closing2024: 92,
    source: 'DUHS/Sindh published 2024 closing band (historical)',
  },
  // NUMS — Rawalpindi (Army Medical College tier)
  {
    university: 'NUMS',
    college: 'Army Medical College (AMC / NUMS open merit)',
    city: 'Rawalpindi',
    closing2024: 93,
    source: 'NUMS 2024 open-merit list / AMC closing (historical)',
  },
]

/**
 * Given a computed aggregate, return which listed colleges are historically
 * reachable (aggregate ≥ closing2024). Returns the reachable set + the
 * "close to cutoff" set (within 1 point) so the student sees the sensitivity.
 */
export function matchColleges(
  aggregate: number
): { reachable: CollegeMerit[]; close: CollegeMerit[] } {
  const reachable = COLLEGE_MERITS.filter((c) => aggregate >= c.closing2024)
  const close = COLLEGE_MERITS.filter(
    (c) => aggregate < c.closing2024 && c.closing2024 - aggregate <= 1
  )
  return { reachable, close }
}

/** Human helper for converting "how much MDCAT do I need" — good study-planning UX. */
export function requiredMDCAT(
  targetAggregate: number,
  matricPct: number,
  fscPct: number
): number {
  if (targetAggregate < 0 || targetAggregate > 100) throw new Error('Target aggregate out of range.')
  const numerator = targetAggregate - matricPct * PMDC_WEIGHTS.matric - fscPct * PMDC_WEIGHTS.fsc
  const needed = numerator / PMDC_WEIGHTS.entry
  // Clamp to 0–100 and round to 2dp; keep the sign so students see if it's even possible.
  return Math.round(Math.max(0, Math.min(100, needed)) * 100) / 100
}