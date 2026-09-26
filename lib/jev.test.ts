/**
 * Fail-open contract tests for lib/jev.ts — run with:
 *   npm test
 * (registered hook: scripts/_jev-serveronly-hook.mjs stubs `server-only`;
 * TYPESAFE_API_KEY is never set here, which is exactly the case under test).
 *
 * THE CONTRACT: triage must never throw and must never fake a result. Any
 * failure — missing key, bad key, timeout, rate limit — resolves null and
 * the feedback row is stored untriaged.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTriagePrefix, triageFeedback } from "../lib/jev.ts";

test("no API key → triage resolves null (fail-open)", async () => {
  assert.equal(process.env.TYPESAFE_API_KEY, undefined);
  const result = await triageFeedback("Biology chapter 3 has a typo in the diagram label.");
  assert.equal(result, null);
});

test("formatTriagePrefix renders the greppable label", () => {
  const prefix = formatTriagePrefix({
    category: "wrong_answer",
    severity: 2,
    aboutQuestion: true,
    confidence: 0.93,
  });
  assert.equal(prefix, "[jev m=wrong_answer sev=2 q=y c=0.93]");
  assert.ok(/^\[jev m=(content_bug|wrong_answer|feature_request|praise|other) sev=[0-2] q=[yn] c=[01]\.\d{2}\]$/.test(prefix));
});
