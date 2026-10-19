/**
 * The editorial catalog — the ONE place that decides which content pages the
 * llms catalogs advertise, in what order, with which one-line blurb.
 *
 * app/llms.txt/route.ts and app/llms-full.txt/route.ts render from here, so a
 * new post or subject page joins the AI-search surface by adding ONE entry —
 * the catalogs cannot drift from the codebase because they are generated,
 * not hand-edited.
 *
 * Entries with `key: true` also appear in the short /llms.txt; the rest only
 * enrich /llms-full.txt. The homepage and the practice surfaces are always
 * listed manually in the route templates (they are structural, not catalog
 * members).
 *
 * The prose blocks of both files (offer, answer-ready extracts, contact) live
 * verbatim in the route files — this module owns only the per-page entries.
 * Honesty rule: one real sentence per page, no invented counts.
 */

export type CatalogEntry = {
  path: string;
  title: string;
  blurb: string;
  /** Also show in the short /llms.txt. */
  key?: boolean;
  /** Optional sub-page rendered as `(+ [label](url))` next to the entry. */
  extra?: { path: string; label: string };
};

/** Practice surfaces, in /llms-full.txt order. */
export const PRACTICE_ENTRIES: CatalogEntry[] = [
  {
    path: "/topicals",
    title: "Topical MCQ Bank",
    blurb: "Chapter-wise MDCAT practice questions for Biology, Chemistry and Physics, playable by guests with instant verdicts",
    key: true,
  },
  {
    path: "/topicals/biology",
    title: "Biology Topical MCQs",
    blurb: "Biology chapter drills from cell structure to coordination and control",
  },
  {
    path: "/topicals/chemistry",
    title: "Chemistry Topical MCQs",
    blurb: "Chemistry chapter drills from atomic structure to organic chemistry",
  },
  {
    path: "/topicals/physics",
    title: "Physics Topical MCQs",
    blurb: "Physics chapter drills from measurement to modern physics",
  },
  {
    path: "/flashcards",
    title: "MDCAT Flashcards",
    blurb: "Spaced-repetition flashcards across all four subjects, no signup required",
    key: true,
  },
  {
    path: "/daily-quiz",
    title: "Daily MCQ Challenge",
    blurb: "One fresh MDCAT-style question every day, free and without an account",
  },
  {
    path: "/diagnostic",
    title: "Diagnostic Quiz",
    blurb: "A short mixed quiz that shows which subjects need the most work before MDCAT",
  },
  {
    path: "/past-papers",
    title: "Past Papers by Board",
    blurb: "MDCAT and NUMS papers grouped by examining body and year, with keys and per-board pages",
    key: true,
  },
];

/** Study notes, in /llms-full.txt order. */
export const NOTES_ENTRIES: CatalogEntry[] = [
  {
    path: "/notes",
    title: "MDCAT Master Notes",
    blurb: "Concept-plus-exam-depth notes covering every PMDC MDCAT unit, free to read online",
    key: true,
  },
  {
    path: "/notes/biology",
    title: "Biology Notes",
    blurb: "Every PMDC biology unit, written for MDCAT depth rather than textbook length",
  },
  {
    path: "/notes/chemistry",
    title: "Chemistry Notes",
    blurb: "Every PMDC chemistry unit, from atomic structure to organic reactions",
  },
  {
    path: "/notes/physics",
    title: "Physics Notes",
    blurb: "Every PMDC physics unit with the formulas and derivations MDCAT actually tests",
  },
  {
    path: "/notes/english",
    title: "English Notes",
    blurb: "Grammar, vocabulary and comprehension coverage for the MDCAT English section",
  },
];

/** Guides and reference pages, in /llms-full.txt order. */
export const GUIDE_ENTRIES: CatalogEntry[] = [
  {
    path: "/blog/mdcat-guide",
    title: "MDCAT Preparation Guide",
    blurb: "The full PMDC MDCAT preparation walkthrough: syllabus, weighting, study plan and practice strategy",
    key: true,
  },
  {
    path: "/faq",
    title: "MDCAT FAQ",
    blurb: "Direct answers to the questions students ask about MDCAT preparation and this platform",
  },
  {
    path: "/resources",
    title: "Study Resources",
    blurb: "Curated free resources including official PMDC links, plus everything hosted here",
  },
];
