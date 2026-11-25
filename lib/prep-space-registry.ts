/**
 * Canonical product catalogue for exam-specific Prep Spaces.
 *
 * Metadata only: no question arrays, counts, auth state, entitlements, or DB
 * access. Stable IDs are intended to be shared by routing, onboarding,
 * navigation and future student_goals.
 *
 * Legacy routes remain aliases until each consumer is migrated. A route or
 * bundled question bank alone never makes a Prep Space "Available".
 */
export type PrepSpaceReadiness = "beta" | "content_in_progress" | "coming_soon";

export type PrepSpaceCapability =
  | "mcq_practice"
  | "scaled_timed_mock"
  | "flashcards"
  | "concept_notes"
  | "released_past_papers"
  | "verbal_nonverbal_drills";

export interface PrepSpaceDefinition {
  /** Stable ID persisted in student_goals; never derive it from display text. */
  id: string;
  slug: string;
  name: string;
  category: "medical" | "engineering" | "defence" | "scholarship";
  readiness: PrepSpaceReadiness;
  summary: string;
  capabilities: readonly PrepSpaceCapability[];
  /** Existing route kept as a compatibility alias during migration. */
  legacyRoute: string | null;
}

export const PREP_SPACES = [
  {
    id: "pmdc-mdcat",
    slug: "pmdc-mdcat",
    name: "PMDC MDCAT",
    category: "medical",
    readiness: "beta",
    summary:
      "Chapter-wise practice, whole-paper sets and released board papers with their keys. The current custom mock is not an official-format 2026 full paper.",
    capabilities: [
      "mcq_practice",
      "scaled_timed_mock",
      "flashcards",
      "concept_notes",
      "released_past_papers",
    ],
    legacyRoute: "/dashboard",
  },
  {
    id: "nums-mdcat",
    slug: "nums-mdcat",
    name: "NUMS MDCAT",
    category: "medical",
    // NUMS has a live practice surface (the shared medical bank) and its own
    // released papers in the library. It said "Not open for practice" next to a
    // working link, which is the contradiction a visitor notices first.
    readiness: "beta",
    summary:
      "Practises on the shared medical bank, and its released papers are in the paper library. A separately weighted NUMS bank is not split out yet.",
    capabilities: ["mcq_practice", "released_past_papers"],
    legacyRoute: "/topicals",
  },
  {
    id: "hec-bfap-scholarship-pre-medical",
    slug: "hec-bfap-scholarship",
    name: "HEC Balochistan & Ex-FATA Scholarship — Pre-Medical",
    category: "scholarship",
    readiness: "beta",
    summary:
      "Limited practice for the distinct scholarship-test pattern. This is not standard HEC USAT-M.",
    capabilities: ["mcq_practice", "scaled_timed_mock"],
    legacyRoute: "/usat/practice",
  },
  {
    id: "hec-usat",
    slug: "hec-usat",
    name: "HEC USAT",
    category: "scholarship",
    // A 417-question USAT drill is live at /usat/practice. Calling it "Coming
    // soon" was the single worst contradiction on this page.
    readiness: "beta",
    summary:
      "Quantitative, verbal and science practice on the USAT pattern. No released USAT papers exist, so every question is written from the syllabus.",
    capabilities: ["mcq_practice"],
    legacyRoute: "/usat/practice",
  },
  {
    id: "nust-net-engineering",
    slug: "nust-net-engineering",
    name: "NUST NET — Engineering",
    category: "engineering",
    readiness: "beta",
    summary:
      "Maths, physics, chemistry and English on the NET pattern, using the verified subject weighting. Not a full-length 200-question simulation.",
    capabilities: ["mcq_practice", "scaled_timed_mock"],
    legacyRoute: "/nust/practice",
  },
  {
    id: "giki-undergraduate-test",
    slug: "giki-undergraduate-test",
    name: "GIKI Undergraduate Admission Test",
    category: "engineering",
    readiness: "beta",
    summary:
      "Runs on the shared engineering bank today. GIKI's own blueprint and weighting are not split out yet, so treat it as engineering practice rather than a GIKI simulation.",
    capabilities: ["mcq_practice"],
    legacyRoute: "/nust/practice",
  },
  {
    id: "lums-sbasse-lcat",
    slug: "lums-sbasse-lcat",
    name: "LUMS SBASSE — LCAT route",
    category: "engineering",
    readiness: "beta",
    summary:
      "LCAT-route practice on the shared engineering bank. SAT and ACT remain separate LUMS admission routes with no practice here yet.",
    capabilities: ["mcq_practice"],
    legacyRoute: "/nust/practice",
  },
  {
    id: "pma-long-course",
    slug: "pma-long-course",
    name: "PMA Long Course",
    category: "defence",
    readiness: "beta",
    summary:
      "Initial-test practice across verbal, non-verbal and academic questions, timed at 20 seconds a question. Full PMA selection is not simulated.",
    capabilities: ["mcq_practice", "scaled_timed_mock", "verbal_nonverbal_drills"],
    legacyRoute: "/pma/practice",
  },
  {
    id: "issb-selection",
    slug: "issb-selection",
    name: "ISSB Selection Preparation",
    category: "defence",
    readiness: "beta",
    summary:
      "Verbal and non-verbal reasoning drills inside the defence practice surface. The multi-day ISSB selection process itself is not simulated.",
    capabilities: ["verbal_nonverbal_drills"],
    legacyRoute: "/pma/practice",
  },
] as const satisfies readonly PrepSpaceDefinition[];

export type PrepSpaceId = (typeof PREP_SPACES)[number]["id"];

const PREP_SPACE_BY_SLUG = new Map<string, (typeof PREP_SPACES)[number]>(
  PREP_SPACES.map((space) => [space.slug, space]),
);

export function getPrepSpaceBySlug(
  slug: string,
): (typeof PREP_SPACES)[number] | undefined {
  return PREP_SPACE_BY_SLUG.get(slug);
}

export function getPrepSpacesByCategory(
  category: PrepSpaceDefinition["category"],
): readonly (typeof PREP_SPACES)[number][] {
  return PREP_SPACES.filter((space) => space.category === category);
}
