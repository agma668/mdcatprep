import "server-only";

import { choice, score, TypeSafeClient } from "@typesafe-ai/sdk";

/**
 * Jev (TypeSafe "System One") triage for student feedback — the wrapper the
 * rest of the site is allowed to see. Everything here is SERVER-ONLY: the
 * `server-only` import makes any accidental client import a build error, so
 * TYPESAFE_API_KEY can never reach a browser bundle.
 *
 * THE CONTRACT IS FAIL-OPEN: no key, bad key, timeout, rate limit, or any
 * other error returns `null` and the caller stores the message untriaged.
 * The student's submit never fails because of triage — the founder's honesty
 * rule applied to features: it must never pretend to have run.
 *
 * API contract (verified against @typesafe-ai/sdk 0.6.0 types):
 *  - `new TypeSafeClient()` reads TYPESAFE_API_KEY; constructor THROWS when
 *    it is missing/empty, so client creation is lazy and guarded.
 *  - One `systemOne` call answers ALL questions against one shared state
 *    (state cost is paid once; 1200 req/min limit is per-request).
 *  - Per-call `timeout` is per attempt; `maxRetries: 0` makes the deadline a
 *    real wall-clock bound (retries off, so no 3×5s surprise in a submit).
 */

/** Bounded deadline for one triage attempt: feedback submit must stay fast. */
const TRIAGE_TIMEOUT_MS = 5_000;

/**
 * The triage vocabulary. Choice labels name the branch admin code takes; the
 * score rubric is ordered 0,1,2 with a description per level so Jev knows
 * what "blocked" means. Kept small and stable per the Jev API guidance.
 */
export type FeedbackTriageCategory = "content_bug" | "wrong_answer" | "feature_request" | "praise" | "other";

const CATEGORY_CRITERIA = {
  content_bug: "A problem with study content: unclear explanation, typo, missing topic, or broken page",
  wrong_answer: "The student believes a specific question's marked answer is incorrect",
  feature_request: "The student asks for something new to be built or added",
  praise: "Positive feedback: thanks, compliments, or that the site helped them",
  other: "Anything that fits none of the listed categories",
} as const;

const SEVERITY_LEGEND = [
  "Not blocked: minor nitpick, question, or comment",
  "Inconvenienced: workaround exists or progress is slowed",
  "Blocked: cannot continue studying or the content is wrong",
] as const;

export type FeedbackTriage = {
  category: FeedbackTriageCategory;
  /** 0–2, how blocked the student is (rubric in SEVERITY_LEGEND). */
  severity: 0 | 1 | 2;
  /** Whether the message points at one specific question. */
  aboutQuestion: boolean;
  /** Jev's reported confidence for the category choice, 0–1. */
  confidence: number;
};

/** Rendered as a greppable prefix on the stored feedback row. */
export function formatTriagePrefix(t: FeedbackTriage): string {
  const parts = [
    `m=${t.category}`,
    `sev=${t.severity}`,
    `q=${t.aboutQuestion ? "y" : "n"}`,
    `c=${t.confidence.toFixed(2)}`,
  ];
  return `[jev ${parts.join(" ")}]`;
}

/**
 * Server singleton. Created on first triage attempt, not at module scope:
 * the constructor throws when TYPESAFE_API_KEY is absent, and a missing key
 * is a normal, permanent configuration on this site (fail-open) — not an
 * error to crash the module over.
 */
let client: TypeSafeClient | null = null;

function getClient(): TypeSafeClient {
  if (client === null) {
    // Throws TypeSafeError when TYPESAFE_API_KEY is missing/empty — caught
    // by the triage guard below, never by the submit path.
    client = new TypeSafeClient({
      retry: { maxRetries: 0 },
      timeout: TRIAGE_TIMEOUT_MS,
    });
  }
  return client;
}

/**
 * Triage one feedback message. Resolves `null` for ANY failure — missing
 * key, 401, timeout, rate limit, whatever — so the caller can store the
 * message untriaged and move on. Never throws.
 */
export async function triageFeedback(message: string): Promise<FeedbackTriage | null> {
  try {
    const c = getClient();
    const response = await c.systemOne({
      state: message,
      questions: {
        category: choice("What is this feedback about?", CATEGORY_CRITERIA),
        severity: score("How blocked is the student by this?", SEVERITY_LEGEND),
        aboutQuestion: choice(
          "Does the message point at one specific question or item?",
          { yes: null, no: null },
        ),
      },
    });

    const a = response.answers;
    const category = a.category.choice;
    const about = a.aboutQuestion.choice;

    // Defense in depth on the score rounding: severity is a bounded integer
    // label on the row, not a free-form value from the API.
    const severity = Math.min(2, Math.max(0, Math.round(a.severity.score))) as 0 | 1 | 2;

    return {
      category,
      severity,
      aboutQuestion: about === "yes",
      confidence: a.category.confidence,
    };
  } catch (err) {
    // Fail-open, loudly enough to debug: one warn line with the error class.
    console.warn(
      "[jev] triage skipped:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
