import "server-only";

/**
 * Feedback triage is intentionally disabled.
 *
 * The previous implementation called TypeSafe's metered API. Apex's
 * operating rule is that no feature may create a charge, so feedback is
 * stored verbatim and reviewed by an administrator instead. This function
 * remains as a stable no-op seam so the submit action stays simple.
 *
 * Do not reconnect an external model here unless the founder explicitly
 * approves a genuinely no-cost provider with no automatic billing.
 */

export type FeedbackTriageCategory =
  | "content_bug"
  | "wrong_answer"
  | "feature_request"
  | "praise"
  | "other";

export type FeedbackTriage = {
  category: FeedbackTriageCategory;
  severity: 0 | 1 | 2;
  aboutQuestion: boolean;
  confidence: number;
};

/** No external calls; returns null so feedback is saved without a fake label. */
export async function triageFeedback(
  _message: string
): Promise<FeedbackTriage | null> {
  return null;
}
