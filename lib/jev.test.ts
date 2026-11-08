/**
 * Zero-cost contract tests for lib/jev.ts.
 * Feedback triage must never call a metered external API, even if an old
 * TYPESAFE_API_KEY remains configured in a deployment environment.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { triageFeedback } from "../lib/jev.ts";

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
