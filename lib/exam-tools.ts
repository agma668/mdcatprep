// What each practice surface is allowed to offer, in one table.
//
// The calculator rule is copied from what the boards actually publish, because
// presenting a calculator as "allowed" in a test where it is banned would be
// the exact kind of lie this product refuses. Two states only:
//
//   banned      — the board says calculators are prohibited in the hall
//   unconfirmed — the board publishes no rule, which is NOT permission
//
// There is deliberately no "allowed" state until a board we serve says so. The
// calculator still ships as a practice aid, labelled as one.

export type ExamToolsId = "mdcat" | "nums" | "nust" | "usat" | "pma";

export type ExamToolkit = {
  /** Header label used inside the tools panel. */
  label: string;
  calculator: {
    status: "banned" | "unconfirmed";
    /** Shown under the calculator, always. */
    note: string;
  };
  flashcards: {
    /** null when no deck exists for this exam — never a dead link. */
    href: string | null;
    note: string;
  };
};

export const EXAM_TOOLKITS: Record<ExamToolsId, ExamToolkit> = {
  mdcat: {
    label: "MDCAT",
    calculator: {
      status: "banned",
      note: "UHS and PMDC prohibit calculators and phones in the MDCAT hall. Use this to check your own arithmetic while practising, not as exam practice for the real paper.",
    },
    flashcards: {
      href: "/flashcards",
      note: "Biology, Chemistry, Physics and English decks, spaced repetition.",
    },
  },
  nums: {
    label: "NUMS",
    calculator: {
      status: "banned",
      note: "NUMS follows the national MDCAT rules: no calculators in the hall. This is a practice aid for checking arithmetic only.",
    },
    flashcards: {
      href: "/flashcards",
      note: "The same medical decks used for MDCAT revision.",
    },
  },
  nust: {
    label: "NUST NET",
    calculator: {
      status: "unconfirmed",
      note: "NUST does not publish a calculator rule for NET. Assume it is not allowed and practise the way you will sit it — this is a checking aid.",
    },
    flashcards: {
      href: null,
      note: "Engineering decks are not written yet. The NET bank below is the revision surface for now.",
    },
  },
  usat: {
    label: "HEC USAT",
    calculator: {
      status: "banned",
      note: "HEC's candidate instructions list calculators among the prohibited items at USAT centres. Use this to check arithmetic while practising.",
    },
    flashcards: {
      href: "/flashcards",
      note: "Includes the USAT-M mathematics deck.",
    },
  },
  pma: {
    label: "PMA / ISSB",
    calculator: {
      status: "unconfirmed",
      note: "PMA and ISSB publish no calculator rule, and the reasoning paper has no sums that need one. Assume it is not allowed.",
    },
    flashcards: {
      href: null,
      note: "No defence deck yet. The intelligence drills below are the revision surface.",
    },
  },
};

/** One-line status for the calculator header. */
export function calculatorStatusLabel(status: ExamToolkit["calculator"]["status"]): string {
  return status === "banned" ? "Not permitted in the real paper" : "No published rule";
}
