// The per-test preparation chooser — one choice a student makes once ("which
// test am I preparing for inside this portal?") that every prep surface then
// honours. The sidebar renders it top-left inside each portal; practice,
// notes and flashcards read the same stored choice so the portal always talks
// about the student's actual paper.
//
// Pure data + tiny localStorage helpers — imported by client components on
// every surface, so no bank imports and no heavy deps. Real tests only: a test
// gets a chooser card when mapped content actually exists for it. Where tests
// share a bank (GIKI/LUMS under the NET-pattern bank) the entry says so in its
// own `note` instead of pretending at a separate question set — the honesty
// rule applies to the chooser too.

export type PrepFamily = 'medical' | 'engineering' | 'military'

export type PrepTest = {
  /**
   * Stable id — the value stored in localStorage and (for the medical
   * boards) reused as the practice page's ?college= value, which already
   * means "which PMDC/HEC paper to filter to".
   */
  id: string
  /** Chooser display label + one line of what the paper actually is. */
  label: string
  note: string
  mark: string
  /**
   * The test's own subject list — literal strings that match the bundled
   * banks' `subject` values (and the flashcard deck subjects), because these
   * drive the practice/notes/flashcards filters. HEC carries Quantitative
   * (and its deck Mathematics); the PMDC boards do not — that difference is
   * the point of the chooser.
   */
  subjects: readonly string[]
  /**
   * Tests whose students should see the PMDC-family practice bank and its
   * PMDC-syllabus notes/decks. The USAT paper is its own bank entirely.
   */
  pmdcFamily?: boolean
}

/**
 * Medical portal — the family the dashboard sidebar serves. Every entry is a
 * real medical-family test with mapped content: the PMDC boards share the
 * PMDC syllabus (NUMS adds its Logical Reasoning section); the HEC USAT-M
 * scholarship paper runs the dedicated USAT bank (lib/usat-comprehensive-bank).
 */
export const MEDICAL_PREP_TESTS: PrepTest[] = [
  {
    id: 'MDCAT',
    label: 'MDCAT',
    note: 'PMDC syllabus — all Pakistan',
    mark: '🩺',
    subjects: ['Biology', 'Chemistry', 'Physics', 'English'],
    pmdcFamily: true,
  },
  {
    id: 'NUMS',
    label: 'NUMS',
    note: 'National University of Medical Sciences',
    mark: '🎖️',
    subjects: ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'],
    pmdcFamily: true,
  },
  {
    id: 'UHS',
    label: 'UHS',
    note: 'University of Health Sciences, Lahore',
    mark: '🧬',
    subjects: ['Biology', 'Chemistry', 'Physics', 'English'],
    pmdcFamily: true,
  },
  {
    id: 'SZABMU',
    label: 'SZABMU',
    note: 'Shaheed Zulfiqar Ali Bhutto Medical University',
    mark: '⚕️',
    subjects: ['Biology', 'Chemistry', 'Physics', 'English'],
    pmdcFamily: true,
  },
  {
    id: 'ETEA',
    label: 'KMU ETEA',
    note: 'Khyber Pakhtunkhwa entry test',
    mark: '🏔️',
    subjects: ['Biology', 'Chemistry', 'Physics', 'English'],
    pmdcFamily: true,
  },
  {
    id: 'Shifa',
    label: 'Shifa (STMU)',
    note: 'Shifa Tameer-e-Millat — PMDC-aligned paper',
    mark: '🛡️',
    subjects: ['Biology', 'Chemistry', 'Physics', 'English'],
    pmdcFamily: true,
  },
  {
    id: 'HEC USAT-M',
    label: 'HEC USAT-M',
    note: 'HEC scholarship test — Balo/FATA, own bank',
    mark: '🎓',
    subjects: ['Quantitative', 'Verbal', 'Biology', 'Chemistry', 'Physics'],
  },
]

/**
 * Engineering portal (/nust/practice). NUST NET, GIKI and LUMS panels share
 * the one NET-pattern bank — the chooser switches the page's framing and
 * copy, and the entries say the share out loud rather than implying three
 * question sets that do not exist.
 */
export const ENGINEERING_PREP_TESTS: PrepTest[] = [
  {
    id: 'NUST NET',
    label: 'NUST NET',
    note: 'NET Engineering & CS — own pattern bank',
    mark: '🧮',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
  },
  {
    id: 'GIKI',
    label: 'GIKI',
    note: 'Calculus-heavy entrance — shares the NET bank',
    mark: '⚙️',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
    pmdcFamily: false,
  },
  {
    id: 'LUMS',
    label: 'LUMS SBASSE',
    note: 'Quant + analytical — shares the NET bank',
    mark: '🏛️',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'English'],
  },
]

/**
 * Military portal (/pma/practice). PMA Long Course initials test every
 * section; ISSB screening drills the intelligence sections only — a real
 * filter, not a label.
 */
export const MILITARY_PREP_TESTS: PrepTest[] = [
  {
    id: 'PMA',
    label: 'PMA Long Course',
    note: 'Verbal + Non-Verbal + Academic initials test',
    mark: '🎖️',
    subjects: ['Verbal', 'Non-Verbal', 'Academic'],
  },
  {
    id: 'ISSB',
    label: 'ISSB',
    note: 'Psychological & intelligence screening',
    mark: '🪖',
    subjects: ['Verbal', 'Non-Verbal'],
  },
]

export const PREP_TESTS: Record<PrepFamily, PrepTest[]> = {
  medical: MEDICAL_PREP_TESTS,
  engineering: ENGINEERING_PREP_TESTS,
  military: MILITARY_PREP_TESTS,
}

// ── The shared store ────────────────────────────────────────────────────────
//
// One localStorage slot per family. The chooser writes it; every surface
// (practice, notes, flashcards, the portal practice pages) reads it and
// re-reads on PREP_CHANGE_EVENT, so a single sidebar choice re-threads the
// whole portal without a router dance.

export const PREP_STORAGE_PREFIX = 'prep-choice-'

/** Fired on window whenever any surface changes the family's choice. */
export const PREP_CHANGE_EVENT = 'prep-test-change'

function storageKey(family: PrepFamily): string {
  return `acma-${PREP_STORAGE_PREFIX}${family}`
}

/** The saved choice id, or null when nothing/invalid was saved (SSR-safe). */
export function readPrepChoice(family: PrepFamily): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(family))
    if (!raw) return null
    return PREP_TESTS[family].some((t) => t.id === raw) ? raw : null
  } catch {
    return null
  }
}

/** Persist the choice (null clears it) and tell every listening surface. */
export function writePrepChoice(family: PrepFamily, id: string | null): void {
  try {
    if (id) localStorage.setItem(storageKey(family), id)
    else localStorage.removeItem(storageKey(family))
  } catch {
    /* storage unavailable — chooser still works for the session */
  }
  try {
    window.dispatchEvent(new Event(PREP_CHANGE_EVENT))
  } catch {
    /* no listeners — fine */
  }
}

/** The entry for a stored choice id (invalid ids resolve to null). */
export function getPrepTest(family: PrepFamily, id: string | null | undefined): PrepTest | null {
  if (!id) return null
  return PREP_TESTS[family].find((t) => t.id === id) ?? null
}
