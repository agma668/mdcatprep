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
      "Limited MCQ practice and supporting study tools. The current custom mock is not an official-format 2026 full paper.",
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
    readiness: "content_in_progress",
    summary:
      "Separate NUMS preparation identity. Dedicated syllabus and paper rules must be reconciled before full-format claims.",
    capabilities: [],
    legacyRoute: "/dashboard",
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
    readiness: "coming_soon",
    summary:
      "Standard HEC USAT needs its own verified stream variants and Part I / Part II workflow.",
    capabilities: [],
    legacyRoute: "/usat/practice",
  },
  {
    id: "nust-net-engineering",
    slug: "nust-net-engineering",
    name: "NUST NET — Engineering",
    category: "engineering",
    readiness: "beta",
    summary:
      "Scaled NET-Engineering practice using the current verified subject weighting; not a full-length 200-question simulation.",
    capabilities: ["mcq_practice", "scaled_timed_mock"],
    legacyRoute: "/nust/practice",
  },
  {
    id: "giki-undergraduate-test",
    slug: "giki-undergraduate-test",
    name: "GIKI Undergraduate Admission Test",
    category: "engineering",
    readiness: "coming_soon",
    summary:
      "A separate exam identity; an independent GIKI blueprint and question bank are not yet established.",
    capabilities: [],
    legacyRoute: "/nust/practice",
  },
  {
    id: "lums-sbasse-lcat",
    slug: "lums-sbasse-lcat",
    name: "LUMS SBASSE — LCAT route",
    category: "engineering",
    readiness: "coming_soon",
    summary:
      "A distinct LCAT preparation route. SAT and ACT remain separate LUMS admission routes.",
    capabilities: [],
    legacyRoute: "/nust/practice",
  },
  {
    id: "pma-long-course",
    slug: "pma-long-course",
    name: "PMA Long Course",
    category: "defence",
    readiness: "beta",
    summary:
      "Limited initial-test practice with locally held progress; durable goal-scoped progress is not yet verified.",
    capabilities: ["mcq_practice", "scaled_timed_mock", "verbal_nonverbal_drills"],
    legacyRoute: "/pma/practice",
  },
  {
    id: "issb-selection",
    slug: "issb-selection",
    name: "ISSB Selection Preparation",
    category: "defence",
    readiness: "content_in_progress",
    summary:
      "Focused reasoning drills only. This is not a complete ISSB selection-preparation workflow.",
    capabilities: ["verbal_nonverbal_drills"],
    legacyRoute: "/pma/practice",
  },
] as const satisfies readonly PrepSpaceDefinition[];

export type PrepSpaceId = (typeof PREP_SPACES)[number]["id"];

const PREP_SPACE_BY_SLUG = new Map(
  PREP_SPACES.map((space) => [space.slug, space] as const),
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
