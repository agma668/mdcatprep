// The per-test start page: one table of what the front door of each exam looks
// like. Every picker tile on the homepage now lands on its own test's page —
// demo questions from that test's bank, the flashcard decks whose subjects that
// paper actually examines, a focus block, and the signup form already pointed at
// the right exam.
//
// Nothing here invents reach: a test with no written deck says so, and the
// engineering/defence entries borrow the shared subject decks only where the
// paper really examines that subject.

import type { FlashcardDeck } from "@/lib/flashcards/flashcards-data";

export type TestSlug = "mdcat" | "nums" | "nust" | "giki" | "lums" | "usat" | "pma" | "issb";

export type StartTest = {
  slug: TestSlug;
  /** Shown in headings and the demo header. */
  label: string;
  /** Must match the option labels the signup form's select uses. */
  signupExam: string;
  headline: string;
  blurb: string;
  /** Which bundled bank the demo draws from. */
  bank: "medical" | "nust" | "usat" | "pma";
  /** How that bank is described to the student, honestly. */
  bankLabel: string;
  /** Which subject decks apply. Empty means none are written yet. */
  deckSubjects: FlashcardDeck["subject"][];
  /** lib/prep-tests ids whose decks may be shown (a deck's own tests list still wins). */
  deckTests: string[];
  decksNote: string;
  drill: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export const TEST_SLUGS: TestSlug[] = [
  "mdcat",
  "nums",
  "nust",
  "giki",
  "lums",
  "usat",
  "pma",
  "issb",
];

export const START_TESTS: Record<TestSlug, StartTest> = {
  mdcat: {
    slug: "mdcat",
    label: "MDCAT",
    signupExam: "MDCAT",
    deckTests: ["MDCAT"],
    headline: "Your MDCAT preparation, all in one place",
    blurb:
      "Try five questions from the medical bank, flip a few cards on the topics that repeat, and set a focus block — then keep the run, the streak and the mistakes with an account.",
    bank: "medical",
    bankLabel: "MDCAT bank",
    deckSubjects: ["Biology", "Chemistry", "Physics", "English"],
    decksNote: "Biology, Chemistry, Physics and English decks, scheduled by spaced repetition.",
    drill: { href: "/topicals", label: "Open the topical drills" },
    secondary: { href: "/past-papers", label: "Released board papers" },
  },
  nums: {
    slug: "nums",
    label: "NUMS",
    signupExam: "NUMS",
    deckTests: ["NUMS"],
    headline: "NUMS practice built from the medical syllabus",
    blurb:
      "The NUMS paper follows the national medical syllabus and the same no-calculator rules. Start with a five-question demo and the decks, then work the released papers.",
    bank: "medical",
    bankLabel: "medical bank",
    deckSubjects: ["Biology", "Chemistry", "Physics", "English"],
    decksNote: "The same medical decks used for MDCAT revision.",
    drill: { href: "/past-papers", label: "Open the released papers" },
    secondary: { href: "/topicals", label: "Chapter-wise drills" },
  },
  nust: {
    slug: "nust",
    label: "NUST NET",
    signupExam: "NUST (NET)",
    deckTests: ["NUST NET"],
    headline: "NET practice that matches the paper",
    blurb:
      "Mathematics 50%, Physics 30%, English 20% — the NET-Engineering paper has no chemistry section. The demo below is drawn from the NET bank; the cards are subject decks, not NET-specific.",
    bank: "nust",
    bankLabel: "NET bank",
    deckSubjects: ["Mathematics", "Physics", "English"],
    decksNote:
      "Subject decks, not NET-specific — the maths, physics and English cards cover the ground the paper does.",
    drill: { href: "/nust/practice", label: "Open the NET drill" },
  },
  giki: {
    slug: "giki",
    label: "GIKI",
    signupExam: "GIKI",
    deckTests: ["GIKI"],
    headline: "GIKI preparation without a second account",
    blurb:
      "GIKI runs its own admission test — intermediate physics, maths and English, carrying 85% of merit. The demo draws from the shared engineering bank; GIKI publishes no MCQ count or duration, so this is not a timed GIKI simulation.",
    bank: "nust",
    bankLabel: "shared engineering bank",
    deckSubjects: ["Mathematics", "Physics", "English"],
    decksNote: "Subject decks shared with the engineering papers.",
    drill: { href: "/giki/practice", label: "Open the GIKI drill" },
  },
  lums: {
    slug: "lums",
    label: "LUMS",
    signupExam: "LUMS",
    deckTests: ["LUMS"],
    headline: "LUMS SBASSE practice, one place",
    blurb:
      "LUMS sets no subject paper: SBASSE applicants submit SAT, ACT or LCAT. Our engineering questions are useful maths and English ground, but they are not an LCAT simulation — the guide explains what is published and what is not.",
    bank: "nust",
    bankLabel: "shared engineering bank",
    deckSubjects: ["Mathematics", "English"],
    decksNote: "Subject decks shared with the engineering papers — not LCAT-format items.",
    drill: { href: "/lums/practice", label: "Read the LUMS test guide" },
  },
  usat: {
    slug: "usat",
    label: "HEC USAT",
    signupExam: "HEC USAT-M",
    deckTests: ["HEC USAT-M"],
    headline: "USAT-M practice with the maths in it",
    blurb:
      "Quantitative, verbal and subject sections, with trap distractors and a worked rationale on every answer. No calculator is permitted at USAT centres, and the practice does not pretend otherwise.",
    bank: "usat",
    bankLabel: "USAT-M bank",
    deckSubjects: ["Mathematics", "English", "Biology", "Chemistry", "Physics"],
    decksNote: "Includes the USAT-M mathematics deck.",
    drill: { href: "/usat/practice", label: "Open the USAT-M drill" },
  },
  pma: {
    slug: "pma",
    label: "PMA",
    signupExam: "PMA Long Course",
    deckTests: ["PMA"],
    headline: "PMA initial test practice",
    blurb:
      "Verbal intelligence, non-verbal reasoning and the academic section, written in the initial-test style. The demo below is a sample of the reasoning the paper asks for — not an official PMA paper.",
    bank: "pma",
    bankLabel: "PMA-style bank",
    deckSubjects: [],
    decksNote:
      "No defence deck is written yet. The intelligence drills are the revision surface for now — nothing here pretends a deck exists.",
    drill: { href: "/pma/practice", label: "Open the intelligence drill" },
  },
  issb: {
    slug: "issb",
    label: "ISSB",
    signupExam: "ISSB Intelligence",
    deckTests: ["ISSB"],
    headline: "ISSB intelligence screening practice",
    blurb:
      "ISSB screens on verbal and non-verbal reasoning only, so that is what this demo shows. Selection itself runs over four days and is not something a website can simulate.",
    bank: "pma",
    bankLabel: "reasoning bank",
    deckSubjects: [],
    decksNote:
      "No defence deck is written yet. The reasoning drills are the revision surface for now.",
    drill: { href: "/pma/practice", label: "Open the reasoning drill" },
  },
};

export function isTestSlug(value: string): value is TestSlug {
  return (TEST_SLUGS as string[]).includes(value);
}
