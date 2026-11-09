// Pure card-organization rules (GitHub issue #5, section B).
//
// Tags are student-authored, so they are normalised to a small, safe vocabulary
// before storage: lowercase, hyphenated, bounded in length and count. Suspended
// cards are excluded from study permanently until unsuspended; buried cards are
// hidden only until their bury window expires.

export interface CardMeta {
  card_id: string
  starred: boolean
  suspended: boolean
  /** ISO timestamp; null = not buried. */
  buried_until: string | null
  tags: string[]
}

export const MAX_TAGS_PER_CARD = 12
export const MAX_TAG_LENGTH = 32

/** Accepts a comma-separated string or an array; returns a clean unique list. */
export function normaliseTags(input: string[] | string): string[] {
  const raw = Array.isArray(input) ? input : input.split(',')
  const seen = new Set<string>()
  const tags: string[] = []
  for (const item of raw) {
    const tag = item
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, MAX_TAG_LENGTH)
      .replace(/-$/, '')
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    tags.push(tag)
    if (tags.length >= MAX_TAGS_PER_CARD) break
  }
  return tags
}

/** A bury is active only while its timestamp is in the future. */
export function isBuryActive(buriedUntil: string | null | undefined, now: Date = new Date()): boolean {
  if (!buriedUntil) return false
  const until = new Date(buriedUntil).getTime()
  if (Number.isNaN(until)) return false
  return until > now.getTime()
}

/** Whether a card should appear in a study queue right now. */
export function isStudyable(meta: CardMeta | undefined, now: Date = new Date()): boolean {
  if (!meta) return true
  if (meta.suspended) return false
  return !isBuryActive(meta.buried_until, now)
}
