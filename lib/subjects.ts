/**
 * Canonical subject list for the PMDC MDCAT syllabus, used by the notes
 * upload dropdown and the subject tiles on the student practice/notes pages.
 */
export const CCH_SUBJECTS = [
  { name: 'Biology', icon: '🧬' },
  { name: 'Chemistry', icon: '⚗️' },
  { name: 'Physics', icon: '⚛️' },
  { name: 'English', icon: '📖' },
  { name: 'Logical Reasoning', icon: '🧠' },
] as const

export const CCH_SUBJECT_NAMES: readonly string[] = CCH_SUBJECTS.map(s => s.name)

/** Best-effort icon for a subject name (falls back to a generic book icon). */
export function subjectIcon(name: string | null | undefined): string {
  const match = CCH_SUBJECTS.find(
    s => s.name.toLowerCase() === (name ?? '').trim().toLowerCase()
  )
  return match?.icon ?? '📚'
}


/**
 * Exam-specific subject mappings. Each entry test covers specific subjects.
 * Students should only see subjects relevant to their target exam. MDCAT and
 * NUMS share the PMDC syllabus, except that NUMS Paper-I also carries a Logical
 * Reasoning section — that bank now exists (lib/past-paper-bank.ts), which is
 * why NUMS lists it and the national MDCAT does not.
 */
export const COLLEGE_SUBJECTS: Record<string, readonly string[]> = {
  'MDCAT': ['Biology', 'Chemistry', 'Physics', 'English'],
  'NUMS': ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'],
  'UHS': ['Biology', 'Chemistry', 'Physics', 'English'],
  'SZABMU': ['Biology', 'Chemistry', 'Physics', 'English'],
  'ETEA': ['Biology', 'Chemistry', 'Physics', 'English'],
  'BIOLOGY': ['Biology'],
  'CHEMISTRY': ['Chemistry'],
  'PHYSICS': ['Physics'],
  'ENGLISH': ['English'],
}

/**
 * The full subject taxonomy the product covers — the union of every exam's
 * subject mapping (the honest source for subject counts; today it is 4:
 * Biology, Chemistry, Physics, English).
 */
export function coveredSubjectCount(): number {
  const all = new Set<string>()
  for (const subjects of Object.values(COLLEGE_SUBJECTS)) {
    for (const s of subjects) all.add(s)
  }
  return all.size
}

/**
 * Given a student's exam_target (free text), return the relevant subjects.
 * Falls back to showing all subjects if no exam match is found.
 */
export function getSubjectsForCollege(
  examTarget: string | null | undefined,
  allSubjects: string[]
): string[] {
  if (!examTarget) return allSubjects

  const target = examTarget.toLowerCase()

  // Find matching exam keywords
  const matchedSubjects = new Set<string>()
  for (const [keyword, subjects] of Object.entries(COLLEGE_SUBJECTS)) {
    if (target.includes(keyword.toLowerCase())) {
      for (const s of subjects) matchedSubjects.add(s)
    }
  }

  // If we matched at least one subject, filter; otherwise show all
  if (matchedSubjects.size === 0) return allSubjects

  // Return only subjects that exist in the database, preserving order
  return allSubjects.filter(s => matchedSubjects.has(s))
}
