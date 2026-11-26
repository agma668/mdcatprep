/**
 * Dated claims — the sentences on this site that stop being true on their own.
 *
 * Exam dates, sittings that have already happened and "not announced yet"
 * statements rot silently: the page keeps rendering, the copy keeps sounding
 * confident, and nothing in the build notices. This register makes each one
 * carry the day it was checked and the day it must be checked again, so a stale
 * claim can be found by reading one file instead of re-reading the site.
 *
 * Rules:
 *  - `claim` is the sentence the site stands behind — no paraphrase drift.
 *  - `verifiedOn` is the day the source was opened, not the day the copy was
 *    written.
 *  - `reviewBy` is the next date the fact could plausibly change (a notice, a
 *    registration window), never a year away.
 *  - Official sources only. A preparation site quoting another preparation site
 *    is how a wrong date becomes consensus.
 *
 * The example this exists for: on 26 November 2026 /faq still said the 2026
 * MDCAT "will be held on" 20 September 2026 — a sitting two months in the past,
 * rendered in the future tense, on the page built to answer exactly that query.
 */

export type DatedClaim = {
  id: string
  /** The sentence the site stands behind. */
  claim: string
  /** ISO date the claim was last checked against its source. */
  verifiedOn: string
  /** ISO date by which it must be re-checked. Past it, the claim is stale. */
  reviewBy: string
  /** Where a reader can check it themselves — official bodies only. */
  source: string
}

/**
 * The day this site's time-sensitive copy was last checked. Bump this in the
 * same commit as a content change.
 *
 * The sitemap reads it instead of `new Date()`: stamping every URL as changed on
 * every build is how a crawler learns to ignore `lastmod` altogether.
 */
export const CONTENT_REVIEWED_ON = '2026-11-26'

export const DATED_CLAIMS: DatedClaim[] = [
  {
    id: 'mdcat-2026-held',
    claim:
      'MDCAT 2026 was held on Sunday, 20 September 2026, after PMDC rescheduled it on 6 August 2026.',
    verifiedOn: '2026-11-26',
    reviewBy: '2027-06-30',
    source: 'pmdc.pk (MDCAT 2026 rescheduled — public alert)',
  },
  {
    id: 'nums-2026-held',
    claim: 'NUMS MDCAT 2026 was held on Sunday, 13 September 2026.',
    verifiedOn: '2026-11-26',
    reviewBy: '2027-06-30',
    source: 'numspak.edu.pk',
  },
  {
    id: 'mdcat-2027-unannounced',
    claim:
      'Neither PMDC nor NUMS had published a date, a fee or a syllabus for a 2027 sitting.',
    verifiedOn: '2026-11-26',
    reviewBy: '2027-03-31',
    source: 'pmdc.pk · numspak.edu.pk',
  },
]

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

/**
 * '2026-11-26' → '26 November 2026'. Pure string arithmetic, so the output
 * cannot shift with the build machine's timezone.
 */
export function formatReviewedOn(iso: string = CONTENT_REVIEWED_ON): string {
  const [year, month, day] = iso.split('-')
  const name = MONTHS[Number(month) - 1]
  if (!year || !name || !day) return iso
  return `${Number(day)} ${name} ${year}`
}

/**
 * Claims whose review date has passed. Exported for the maintenance cron; until
 * that is wired, the FAQ prints its own check date so a reader can see the age.
 */
export function staleClaims(todayIso: string = new Date().toISOString().slice(0, 10)): DatedClaim[] {
  return DATED_CLAIMS.filter((claim) => claim.reviewBy < todayIso)
}
