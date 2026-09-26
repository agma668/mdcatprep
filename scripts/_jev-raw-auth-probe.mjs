/**
 * Raw auth probe (scratch, gitignored): bypasses the SDK to capture the
 * untouched response — status, request id header, body — plus a cheaper
 * authenticated GET (models) to separate "key rejected" from "route issue".
 * The key is read from env and never printed.
 * Run: node --env-file=.env.local scripts/_jev-raw-auth-probe.mjs
 */
const key = process.env.TYPESAFE_API_KEY;
if (!key) { console.log("no key in env"); process.exit(1); }
console.log("key length:", key.length, "| prefix:", key.slice(0, 4) + "…");

const headers = {
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

// 1. The real POST the triage path makes.
const t0 = Date.now();
const post = await fetch("https://api.typesafe.ai/v1/systemone", {
  method: "POST",
  headers,
  body: JSON.stringify({
    model: "jev-latest",
    state: "probe: is this route alive?",
    questions: {
      alive: { type: "choice", instructions: "Is the state a live probe?", criteria: { yes: null, no: null } },
    },
  }),
  signal: AbortSignal.timeout(20_000),
});
const postBody = await post.text();
console.log("POST /v1/systemone", {
  status: post.status,
  ms: Date.now() - t0,
  requestId: post.headers.get("request-id") ?? post.headers.get("x-request-id") ?? "(no request-id header)",
  body: postBody.slice(0, 500),
});

// 2. An authenticated GET on a read route, to separate key validity from the systemone route.
const g0 = Date.now();
try {
  const get = await fetch("https://api.typesafe.ai/v1/models", { headers, signal: AbortSignal.timeout(20_000) });
  const getBody = await get.text();
  console.log("GET /v1/models", {
    status: get.status,
    ms: Date.now() - g0,
    requestId: get.headers.get("request-id") ?? get.headers.get("x-request-id") ?? "(no request-id header)",
    body: getBody.slice(0, 300),
  });
} catch (e) {
  console.log("GET /v1/models failed to connect:", e?.message ?? e);
}
