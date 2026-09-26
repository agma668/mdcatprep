/**
 * The editorial catalog — the ONE place that decides which content pages the
 * llms catalogs advertise, in what order, with which one-line blurb.
 *
 * app/llms.txt/route.ts and app/llms-full.txt/route.ts render from here, so a
 * new post or college page joins the AI-search surface by adding ONE entry
 * (next to its BLOG_POSTS/SEO_PAGES entries) — the catalogs cannot drift from
 * the codebase because they are generated, not hand-edited.
 *
 * Entries with `key: true` also appear in the short /llms.txt; the rest only
 * enrich /llms-full.txt. The pillar and hub pages are always listed manually
 * in the route templates (they are structural, not catalog members).
 *
 * The prose blocks of both files (offer, answer-ready extracts, contact) live
 * verbatim in the route files — this module owns only the per-page entries.
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

/** Blog guides + hub pages, in /llms-full.txt order. */
export const GUIDE_ENTRIES: CatalogEntry[] = [
  {
    path: "/blog/3-month-study-plan",
    title: "3-Month Study Plan",
    blurb: "Week-by-week cadet college preparation plan with daily routine and mock schedule",
    key: true,
  },
  {
    path: "/blog/cadet-college-interview-questions",
    title: "Cadet College Interview Questions",
    blurb: "The recurring cadet college interview questions by theme, with answer frameworks",
    key: true,
  },
  {
    path: "/blog/iq-section-guide",
    title: "Intelligence Test Guide",
    blurb: "The six reasoning question families with worked examples and a daily practice method",
    key: true,
  },
  {
    path: "/blog/cch-syllabus-2027",
    title: "CCH Syllabus 2027",
    blurb: "Every topic in the CCH Hasanabdal entry test, subject-wise, with the 200-mark structure",
    key: true,
  },
  {
    path: "/blog/class-7-vs-class-8-entry",
    title: "Class 7 vs Class 8 Entry",
    blurb: "Which entry gate to target: competition, syllabus depth and second chances compared",
    key: true,
  },
  {
    path: "/blog/cadet-college-age-limit",
    title: "Cadet College Age Limit",
    blurb: "The real age windows (12–14, after Class 7 or 8), why colleges differ, and what to do if your child falls outside",
    key: true,
  },
  {
    path: "/registration-deadlines-2027",
    title: "Registration Deadlines 2027",
    blurb:
      "The expected Dec–Jan registration window for all 12 colleges, and what to prepare before the window opens",
    key: true,
  },
  {
    path: "/blog/cadet-college-fees-scholarships",
    title: "Fees & Scholarships",
    blurb: "What the fee bundle actually covers, the concession routes that exist, and how to get each college's real numbers",
    key: true,
  },
  {
    path: "/blog/cadet-vs-military-college",
    title: "Cadet vs Military College",
    blurb: "admission route, fees, career paths compared",
  },
  {
    path: "/blog/cch-preparation-guide",
    title: "CCH Preparation Guide",
    blurb: "step-by-step CCH Hasanabdal preparation",
  },
  {
    path: "/blog/paf-sargodha-preparation-tips",
    title: "PAF Sargodha Preparation Tips",
    blurb: "200-mark pattern incl. Analytical Reasoning",
  },
  {
    path: "/blog/mcj-preparation-guide",
    title: "MCJ Jhelum Guide",
    blurb: "MCJ pattern and section-wise preparation",
  },
  {
    path: "/blog/kohat-preparation-guide",
    title: "Kohat Guide",
    blurb: "four-section Kohat paper and subject-wise plan",
  },
  {
    path: "/blog/petaro-preparation-guide",
    title: "Petaro Guide",
    blurb: "the five-section Petaro paper and a four-week plan",
  },
  {
    path: "/blog/burn-hall-preparation-guide",
    title: "Burn Hall Guide",
    blurb: "Burn Hall Abbottabad's five-section written test",
  },
  {
    path: "/blog/larkana-preparation-guide",
    title: "Larkana Guide",
    blurb: "the five-section Larkana paper and a four-week plan",
  },
  {
    path: "/blog/swat-preparation-guide",
    title: "Swat Guide",
    blurb: "Cadet College Swat written-test sections",
  },
  {
    path: "/blog/mardan-preparation-guide",
    title: "Mardan Guide",
    blurb: "the five-section Mardan written test",
  },
  {
    path: "/blog/sanghar-preparation-guide",
    title: "Sanghar Guide",
    blurb: "the five-section Sanghar written test",
  },
  {
    path: "/blog/wana-preparation-guide",
    title: "Wana Guide",
    blurb: "Wana's four-section paper, incl. General Knowledge with Islamiat",
  },
  {
    path: "/blog/lower-topa-preparation-guide",
    title: "Lower Topa Guide",
    blurb: "the reasoning-heavy Lower Topa paper and how to build the Intelligence section",
  },
];

/** College pages, in directory order. All 12 are key (the short catalog lists every college). */
export const COLLEGE_ENTRIES: CatalogEntry[] = [
  {
    path: "/colleges/cch",
    title: "CCH Hasanabdal",
    blurb: "Cadet College Hasanabdal preparation guide and syllabus",
    key: true,
    extra: { path: "/colleges/cch/syllabus", label: "syllabus" },
  },
  {
    path: "/colleges/paf-sargodha",
    title: "PAF College Sargodha",
    blurb: "PAF Sargodha entry test preparation",
    key: true,
  },
  {
    path: "/colleges/mcj",
    title: "Military College Jhelum",
    blurb: "MCJ Jhelum entry test preparation",
    key: true,
  },
  {
    path: "/colleges/kohat",
    title: "Kohat Cadet College",
    blurb: "Kohat cadet college entry test preparation",
    key: true,
  },
  {
    path: "/colleges/petaro",
    title: "Cadet College Petaro",
    blurb: "Petaro entry test preparation",
    key: true,
    extra: { path: "/colleges/petaro/syllabus", label: "syllabus" },
  },
  {
    path: "/colleges/burn-hall",
    title: "Burn Hall College",
    blurb: "Burn Hall Abbottabad admission preparation",
    key: true,
  },
  {
    path: "/colleges/larkana",
    title: "Cadet College Larkana",
    blurb: "Larkana entry test preparation",
    key: true,
  },
  {
    path: "/colleges/swat",
    title: "Cadet College Swat",
    blurb: "Swat cadet college preparation",
    key: true,
  },
  {
    path: "/colleges/mardan",
    title: "Cadet College Mardan",
    blurb: "Mardan entry test preparation",
    key: true,
  },
  {
    path: "/colleges/sanghar",
    title: "Cadet College Sanghar",
    blurb: "Sanghar entry test preparation",
    key: true,
  },
  {
    path: "/colleges/wana",
    title: "Cadet College Wana",
    blurb: "Wana cadet college preparation",
    key: true,
  },
  {
    path: "/colleges/lower-topa",
    title: "PAF Lower Topa",
    blurb: "PAF Public School Murree preparation",
    key: true,
  },
];
