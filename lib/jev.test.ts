/**
 * Zero-cost contract tests for lib/jev.ts.
 * Feedback triage must never call a metered external API, even if an old
 * TYPESAFE_API_KEY remains configured in a deployment environment.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTriagePrefix, triageFeedback } from "../lib/jev.ts";

test("feedback triage stays disabled even when a legacy API key exists", async () => {
  const previousKey = process.env.TYPESAFE_API_KEY;
  process.env.TYPESAFE_API_KEY = "must-not-be-used";

  try {
    const result = await triageFeedback(
      "Biology chapter 3 has a typo in the diagram label."
    );
    assert.equal(result, null);
  } finally {
    if (previousKey === undefined) delete process.env.TYPESAFE_API_KEY;
    else process.env.TYPESAFE_API_KEY = previousKey;
  }
});

test("formatTriagePrefix renders the greppable admin label", () => {
  const prefix = formatTriagePrefix({
    category: "wrong_answer",
    severity: 2,
    aboutQuestion: true,
    confidence: 0.87,
  });
  assert.equal(prefix, "[jev m=wrong_answer sev=2 q=y c=0.87]");
});
