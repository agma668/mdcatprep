/**
 * Canonical subject list for the CCH entry test, used by the notes upload
 * dropdown and the subject tiles on the student practice/notes pages.
 */
export const CCH_SUBJECTS = [
  { name: 'Islamiat', icon: '🕌' },
  { name: 'English', icon: '📖' },
  { name: 'Urdu', icon: '📝' },
  { name: 'Mathematics', icon: '📐' },
  { name: 'General Science', icon: '🔬' },
  { name: 'General Knowledge', icon: '🌍' },
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
 * College-specific subject mappings.
 * Each college entry test covers specific subjects. Students should only
 * see subjects relevant to their target college.
 */
export const COLLEGE_SUBJECTS: Record<string, readonly string[]> = {
  'CCH': ['Mathematics', 'English', 'General Science', 'Islamiat', 'Urdu'],
  'Hasanabdal': ['Mathematics', 'English', 'General Science', 'Islamiat', 'Urdu'],
  'PAF': ['Mathematics', 'English', 'General Knowledge', 'Intelligence Test'],
  'Sargodha': ['Mathematics', 'English', 'General Knowledge', 'Intelligence Test'],
  'MCJ': ['Mathematics', 'English', 'General Knowledge', 'Islamiat', 'Urdu'],
  'Jhelum': ['Mathematics', 'English', 'General Knowledge', 'Islamiat', 'Urdu'],
  'Kohat': ['Mathematics', 'English', 'General Knowledge', 'Islamiat', 'Urdu'],
  'Petaro': ['Mathematics', 'English', 'General Science', 'Islamiat'],
  'Razmak': ['Mathematics', 'English', 'General Knowledge', 'Islamiat'],
  'Murree': ['Mathematics', 'English', 'General Knowledge', 'Islamiat'],
}

/**
 * The full subject taxonomy the product covers — the union of every college's
 * subject mapping (the honest source for the landing page's "Subjects" count;
 * today it is 7: Mathematics, English, General Science, General Knowledge,
 * Islamiat, Urdu, Intelligence Test).
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
 * Falls back to showing all subjects if no college match is found.
 */
export function getSubjectsForCollege(
  examTarget: string | null | undefined,
  allSubjects: string[]
): string[] {
  if (!examTarget) return allSubjects

  const target = examTarget.toLowerCase()

  // Find matching college keywords
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
