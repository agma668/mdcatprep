import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSiteUrl } from "@/lib/site";
import { SEO_PAGES, seoPageUrls } from "@/lib/seo-pages";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * IndexNow pinger — the instant-indexing door into Bing and the IndexNow
 * partner engines (Yandex, Seznam). GET with ?key= verifies host ownership
 * per the IndexNow spec; POST tells the engines to come crawl now.
 *
 * WHY THIS EXISTS: the site's live host (elite-cadet-prep.vercel.app) is
 * invisible on Bing — a site: search returns other people's vercel.app
 * pages, not this one. Google discovers by crawling; Bing honours IndexNow
 * pings, which can cut days-to-weeks of discovery down to hours. This route
 * is wired as a daily Vercel cron so every new/changed page is re-pinged
 * without anyone remembering to do it.
 *
 * Key management per IndexNow spec (https://www.indexnow.org/documentation):
 *  - INDEXNOW_KEY env var overrides; otherwise a stable key is derived from
 *    a local secret file so it survives redeploys without manual setup.
 *  - The key MUST be served at /<KEY>.txt (spec default location) — that
 *    static file lives in public/ and is what the engines' verifier fetches.
 *    Submissions omit keyLocation so the verifier uses that default.
 *  - GET /api/seo/indexnow?key=<key> also returns the bare key (belt and
 *    braces; the static file is the one the verifier honours).
 *  - POST /api/seo/indexnow (Authorization: Bearer CRON_SECRET, mirroring
 *    the other /api/cron routes) pings ALL public pages in one submission.
 *
 * Fail-soft: a failed ping logs and returns ok:false — it must never throw
 * a 500 into the cron log or a page render.
 */

function keyMaterial(): string {
  const fromEnv = process.env.INDEXNOW_KEY?.trim();
  if (fromEnv) return fromEnv;
  // Deterministic fallback: stable per-deployment, 32 hex chars, derived
  // from the site URL so redeploys keep the same key (engines remember it).
  return crypto
    .createHash("sha256")
    .update(`indexnow:${getSiteUrl()}`)
    .digest("hex")
    .slice(0, 32);
}

/** Cron auth — mirrors /api/cron/*: CRON_SECRET required only if configured. */
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return !secret || request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  // Ownership verification: the engines fetch this URL and compare the body
  // to the key used in submissions. Anything else is 403 — never leak.
  if (key && key === keyMaterial()) {
    return new Response(keyMaterial(), {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  // Vercel crons fire GETs (no query param), so an authorized GET also pings.
  if (authorized(request)) return pingAll();
  return NextResponse.json(
    {
      ok: false,
      error: "invalid or missing key",
      hint: "GET ?key=<INDEXNOW_KEY> verifies ownership; authorized GET/POST pings all pages.",
    },
    { status: 403 },
  );
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return pingAll();
}

async function pingAll(): Promise<Response> {
  const siteUrl = getSiteUrl();
  const key = keyMaterial();
  const host = new URL(siteUrl).host;
  // IndexNow accepts up to 10,000 URLs per request — one batch is plenty for
  // this site; ordered by priority so a truncated log still shows what matters.
  const urlList = seoPageUrls(siteUrl);

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        urlList,
      }),
      // A slow engine must never hold the cron: bounded wait, fail soft.
      signal: AbortSignal.timeout(20_000),
    });

    // 200/202 = accepted. 422 with keyLocation = the verifier rejected the
    // NON-DEFAULT key location (this route's old bug: it announced a
    // query-string keyLocation while the static /KEY.txt file sat unused —
    // the engines' verifier only reliably honours the spec default, so the
    // route now omits keyLocation entirely and the /KEY.txt file at the site
    // root does the proving. Deterministic: if the key file is ever deleted,
    // every ping 422s again.)
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      submitted: urlList.length,
      siteUrl,
    });
  } catch (err) {
    console.error("[indexnow] ping failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "ping failed" },
      { status: 502 },
    );
  }
}