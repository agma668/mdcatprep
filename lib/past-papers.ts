// Registry of REAL papers the bank can be attributed against.
//
// Why this exists: the site could list which past papers exist and, once papers
// are ingested, how many bank questions come from each — but nothing in the
// product modelled a paper at all. This is that model, and it is deliberately
// thin. It carries NO question text: questions are attributed to a paper by id
// through `ResourceQuestion.pastPaper` / the `past_paper_*` columns, never
// copied here.
//
// TWO honesty rules this file exists to enforce.
//
// 1. A question may only claim a year if it genuinely came from that paper.
//    Everything in `lib/past-paper-bank.ts` is original exam-style writing and
//    therefore carries NO year — the fields are here so real papers can be
//    tagged without inventing anything.
//
// 2. A paper may only present itself as `official` if it is the paper as
//    actually sat. `kind` is therefore REQUIRED, and the browse page renders it
//    on every card, so a reconstructed or mock paper can never be read as the
//    paper that was sat. `year` is nullable for the same reason: when a file
//    states no year we record `null` and group it as "Undated" rather than
//    guessing one.
//
// STANDING FOUNDER RULING (2026-09, applies to BOTH sites): one private medical
// university is excluded outright — no papers, no notes, no claims, no mention.
// That is why nothing here covers it and why its paper files on disk are
// reference-only: never registered, never ingested. The ruling names the
// university and is authoritative — read the standing founder ruling in
// docs/AGENT-BOARD.md before adding any examining body to this list.
//
// Nothing here re-hosts a commercial compilation. Paid banks (KIPS, Prep
// Titans, CATPrep, Medquack, Anees Hussain, PakLearningSpot, prepdummy) are
// used only as reference for WHICH papers exist and whether a key circulates —
// never as a source of question text, and third-party compilations are not
// registered as papers because they are not single sittings.

export type PastPaperKind =
  // The paper as sat, as distributed by the examining body.
  | 'official'
  // Reconstructed from candidate recall after the sitting, usually by an
  // academy. Contents may be close to the paper but are not the paper.
  | 'recreated'
  // Questions students recalled from a sitting, with no claim to reproduce the
  // paper. Weaker provenance than `recreated`, hence a separate kind.
  | 'memory-based'
  // One of the examining body's own test-day sittings, held per campus. These
  // are not the published admission paper.
  | 'campus-test'
  // A practice test written by an academy or by us, modelled on the paper.
  | 'mock'

export type PastPaper = {
  /** Stable id used by questions to reference this paper. */
  id: string
  /** Examining body that set the paper. */
  exam: string
  /** Year the paper was sat. `null` when the file does not state one — never
   *  guessed, so undated papers group under "Undated". */
  year: number | null
  /** First year of a multi-year compilation, e.g. 2012 for a 2012–2020 set.
   *  Set only when a single item genuinely covers a span of sittings. */
  fromYear?: number
  /** How this item relates to the real sitting. Required — see rule 2 above. */
  kind: PastPaperKind
  /** Paper code / colour / campus, when the paper was printed in variants. */
  code?: string
  /** Province or region the paper belongs to, when it is region-specific. */
  region?: string
  /** Whether an answer key circulates WITH this item. Not the same as an
   *  official key — use `isOfficialKey()` / `keyLabel()` to label it. */
  hasKey: boolean
  /** Anything a reader would be misled by if we stayed silent. */
  note?: string
}

export const PAST_PAPERS: PastPaper[] = [
  // ─── MDCAT 2022 ─────────────────────────────────────────────────────────────
  { id: 'uhs-2022', exam: 'UHS MDCAT', year: 2022, kind: 'official', region: 'Punjab', hasKey: true },
  { id: 'bumhs-2022', exam: 'BUMHS MDCAT', year: 2022, kind: 'official', code: 'All codes', region: 'Balochistan', hasKey: true },
  // ─── MDCAT 2023 ─────────────────────────────────────────────────────────────
  { id: 'uhs-2023', exam: 'UHS MDCAT', year: 2023, kind: 'official', region: 'Punjab', hasKey: true },
  // ─── MDCAT 2024 ─────────────────────────────────────────────────────────────
  { id: 'uhs-2024', exam: 'UHS MDCAT', year: 2024, kind: 'official', region: 'Punjab', hasKey: true },
  { id: 'bumhs-2024-blue', exam: 'BUMHS MDCAT', year: 2024, kind: 'official', code: 'Blue', region: 'Balochistan', hasKey: true },
  { id: 'duhs-2024', exam: 'DUHS MDCAT', year: 2024, kind: 'official', region: 'Sindh', hasKey: false },
  { id: 'kmu-2024-a', exam: 'KMU MDCAT', year: 2024, kind: 'official', code: 'Code A', region: 'Khyber Pakhtunkhwa', hasKey: true },
  { id: 'kmu-2024-b', exam: 'KMU MDCAT', year: 2024, kind: 'official', code: 'Code B', region: 'Khyber Pakhtunkhwa', hasKey: true },
  { id: 'szabmu-2024-blue', exam: 'SZABMU MDCAT', year: 2024, kind: 'official', code: 'Blue', region: 'Islamabad', hasKey: false },
  { id: 'szabmu-2024-green', exam: 'SZABMU MDCAT', year: 2024, kind: 'official', code: 'Green', region: 'Islamabad', hasKey: false },
  { id: 'szabmu-2024-pink', exam: 'SZABMU MDCAT', year: 2024, kind: 'official', code: 'Pink', region: 'Islamabad', hasKey: false },
  { id: 'szabmu-2024-white', exam: 'SZABMU MDCAT', year: 2024, kind: 'official', code: 'White', region: 'Islamabad', hasKey: false },
  { id: 'szabmu-2024-yellow', exam: 'SZABMU MDCAT', year: 2024, kind: 'official', code: 'Yellow', region: 'Islamabad', hasKey: false },
  { id: 'szabmu-2024-reconduct', exam: 'SZABMU MDCAT (reconducted)', year: 2024, kind: 'official', region: 'Islamabad', hasKey: false },
  { id: 'etea-2024', exam: 'ETEA MDCAT', year: 2024, kind: 'official', region: 'Khyber Pakhtunkhwa', hasKey: false },
  // ─── MDCAT 2025 ─────────────────────────────────────────────────────────────
  { id: 'uhs-2025-d', exam: 'UHS MDCAT', year: 2025, kind: 'official', code: 'Code D', region: 'Punjab', hasKey: true },
  { id: 'bumhs-2025-blue', exam: 'BUMHS MDCAT', year: 2025, kind: 'official', code: 'Blue', region: 'Balochistan', hasKey: false },
  { id: 'kmu-2025-d', exam: 'KMU MDCAT', year: 2025, kind: 'official', code: 'Code D', region: 'Khyber Pakhtunkhwa', hasKey: true },
  { id: 'siba-2025-c', exam: 'SIBA MDCAT', year: 2025, kind: 'official', code: 'Version C', region: 'Sindh', hasKey: true },
  { id: 'szabmu-2025-2', exam: 'SZABMU MDCAT', year: 2025, kind: 'official', code: 'Code 2', region: 'Islamabad', hasKey: true },
  // ─── MDCAT 2019 — the oldest provincial sittings we hold. These were filed
  // under a NUMS folder on disk, but they are MDCAT papers, so they are recorded
  // as what they are. ─────────────────────────────────────────────────────────
  { id: 'uhs-2019', exam: 'UHS MDCAT', year: 2019, kind: 'official', region: 'Punjab', hasKey: false },
  { id: 'sindh-2019', exam: 'Sindh MDCAT', year: 2019, kind: 'official', region: 'Sindh', hasKey: false, note: 'The file names the province only; the examining body is not stated on it.' },
  { id: 'etea-2019', exam: 'ETEA MDCAT', year: 2019, kind: 'official', region: 'Khyber Pakhtunkhwa', hasKey: false },
  // ─── NUMS ───────────────────────────────────────────────────────────────────
  // Two distinct sittings, which is the honest count — the "eight NUMS papers"
  // impression came from counting scans, duplicates and third-party
  // compilations. Compilations are deliberately NOT registered here: they are
  // not single sittings, and none of the available kinds describes one, so
  // recording them would mean either inventing a year or overclaiming a kind.
  { id: 'nums-2025', exam: 'NUMS MDCAT', year: 2025, kind: 'official', hasKey: true, note: 'Two copies held — the paper with its key, and a keyed copy carrying explanations.' },
  { id: 'nums-2024', exam: 'NUMS MDCAT', year: 2024, kind: 'official', hasKey: false, note: 'Two scans of the same sitting held; no key circulates with the file.' },
]

export const PAST_PAPER_COUNT = PAST_PAPERS.length

/** Years we hold at least one dated paper for, newest first. Undated papers are
 *  excluded on purpose — they are grouped separately rather than filed under a
 *  year nobody stated. */
export const PAST_PAPER_YEARS: number[] = [
  ...new Set(PAST_PAPERS.map((p) => p.year).filter((y): y is number => y !== null)),
].sort((a, b) => b - a)

export const PAST_PAPER_UNDATED_COUNT = PAST_PAPERS.filter((p) => p.year === null).length

const KIND_LABELS: Record<PastPaperKind, string> = {
  official: 'Official paper',
  recreated: 'Recreated paper',
  'memory-based': 'Memory-based',
  'campus-test': 'Campus test',
  mock: 'Mock paper',
}

export function kindLabel(kind: PastPaperKind): string {
  return KIND_LABELS[kind]
}

/** What separates the kinds, in the words the page shows. Kept next to the type
 *  so the legend on /past-papers can never drift from the enum. */
export const KIND_DESCRIPTIONS: Record<PastPaperKind, string> = {
  official: 'The paper as sat, as the examining body distributed it.',
  recreated: 'Reconstructed from candidate recall after the sitting — close to the paper, but not the paper.',
  'memory-based': 'Questions students recalled from a sitting, with no claim to reproduce the paper.',
  'campus-test': "The examining body's own test-day sittings, held per campus — not the published admission paper.",
  mock: 'A practice test written by an academy or by us, modelled on the paper.',
}

/** Counts per kind, in the enum's own order, with zero-count kinds omitted so
 *  the page never renders an empty legend row. */
export function paperCountsByKind(): Array<{ kind: PastPaperKind; label: string; count: number }> {
  return (Object.keys(KIND_LABELS) as PastPaperKind[])
    .map((kind) => ({ kind, label: KIND_LABELS[kind], count: PAST_PAPERS.filter((p) => p.kind === kind).length }))
    .filter((entry) => entry.count > 0)
}

export const OFFICIAL_PAPER_COUNT = PAST_PAPERS.filter((p) => p.kind === 'official').length

/** Only a paper that is itself official can carry an official key. A key that
 *  ships with a reconstruction or a mock is the author's key, and labelling it
 *  "official" would be a claim we cannot support. */
export function isOfficialKey(paper: Pick<PastPaper, 'kind' | 'hasKey'>): boolean {
  return paper.hasKey && paper.kind === 'official'
}

export function keyLabel(paper: Pick<PastPaper, 'kind' | 'hasKey'>): string | null {
  if (!paper.hasKey) return null
  return isOfficialKey(paper) ? 'Official key' : 'Answer key'
}

/** Human label for a paper, e.g. "UHS MDCAT 2025 · Code D", "NUMS MDCAT 2024",
 *  or "NUMS MDCAT 2012–2020" when a single item covers a span of sittings. */
export function pastPaperLabel(paper: Pick<PastPaper, 'exam' | 'year' | 'fromYear' | 'code'>): string {
  const when =
    paper.year === null
      ? ''
      : paper.fromYear && paper.fromYear < paper.year
        ? ` ${paper.fromYear}–${paper.year}`
        : ` ${paper.year}`
  return `${paper.exam}${when}${paper.code ? ` · ${paper.code}` : ''}`
}

export function findPastPaper(id: string): PastPaper | undefined {
  return PAST_PAPERS.find((p) => p.id === id)
}

export type PastPaperGroup = { key: string; papers: PastPaper[] }

/** Papers grouped by year, newest year first, papers alphabetical within a year.
 *  Undated papers form the last group instead of being filed under a guess. */
export function papersByYear(): PastPaperGroup[] {
  const dated = PAST_PAPER_YEARS.map((year) => ({
    key: String(year),
    papers: PAST_PAPERS.filter((p) => p.year === year).sort((a, b) => a.exam.localeCompare(b.exam)),
  }))
  const undated = PAST_PAPERS.filter((p) => p.year === null)
  return undated.length
    ? [...dated, { key: 'Undated', papers: [...undated].sort((a, b) => a.exam.localeCompare(b.exam)) }]
    : dated
}

/** Papers grouped by examining body, alphabetical, newest paper first within a
 *  body (undated last). */
export function papersByExam(): PastPaperGroup[] {
  const exams = [...new Set(PAST_PAPERS.map((p) => p.exam))].sort((a, b) => a.localeCompare(b))
  return exams.map((exam) => ({
    key: exam,
    papers: PAST_PAPERS.filter((p) => p.exam === exam).sort(
      (a, b) => (b.year ?? -1) - (a.year ?? -1),
    ),
  }))
}
