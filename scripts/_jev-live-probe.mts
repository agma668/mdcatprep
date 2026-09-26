/**
 * One-off live probe (scratch, gitignored like the other scripts/_* files):
 * the REAL triage path — real env key, real TypeSafe API, the real wrapper.
 * Run: node --import ./scripts/_jev-serveronly-hook.mjs --env-file=.env.local scripts/_jev-live-probe.mts
 */
import { triageFeedback, formatTriagePrefix } from "../lib/jev.ts";

const messages = [
  // Should classify wrong_answer, about a specific question, elevated severity
  "The answer marked correct for the Bernoulli question is wrong, option B is the right one, I checked the formula in the notes.",
  // Should classify praise, not about a question, low severity
  "Amazing site bhai, the topical MCQs helped me a lot in my college test. Thank you!",
];

for (const msg of messages) {
  const t0 = Date.now();
  const t = await triageFeedback(msg);
  const ms = Date.now() - t0;
  console.log(JSON.stringify({ probe: msg.slice(0, 42) + "…", ms, triage: t, prefix: t ? formatTriagePrefix(t) : null }));
}
