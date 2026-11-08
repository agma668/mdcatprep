import { NextResponse } from "next/server";
import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily maintenance cron — the standing mission's 03:00 UTC heartbeat.
 *
 * Each run (read-only except one log append, no user data touched):
 *  1. Checks the site is up: HTTP status of the homepage and two key public
 *     routes (cheap /api/health liveness, DB-backed /daily-quiz).
 *  2. Checks the prod env vars the shipped features depend on (presence only —
 *     names are reported, values never leave the process).
 *  3. Appends one dated status line to IMPROVEMENT_LOG.md — but only when the
 *     host filesystem allows it. On Vercel the filesystem is read-only, so
 *     there the append reports `appended: false` and the run's heartbeat is
 *     its response / function log instead. The response always says plainly
 *     what it could and could not check.
 *
 *  Idempotent: one line per UTC day — a double-fire (Vercel crons are
 *  best-effort, or a manual re-run) is detected and skipped.
 *
 *  Auth: mirrors /api/cron/demo-activity — if CRON_SECRET is configured it
 *  must be sent as `Authorization: Bearer <CRON_SECRET>`; without it the
 *  endpoint accepts (it only reads statuses and appends one log line).
 *
 *  Base URL the route probes: MAINTENANCE_BASE_URL if set, else
 *  NEXT_PUBLIC_SITE_URL if the host sets it, else the Vercel deployment URL,
 *  else http://127.0.0.1:<PORT> (local runs).
 *
 *  Schedule lives in vercel.json (03:00 UTC daily).
 */

const PROBE_PATHS = ["/", "/api/health", "/daily-quiz"];

const ENV_GROUPS: { name: string; keys: string[] }[] = [
  { name: "Cron auth", keys: ["CRON_SECRET"] },
  { name: "Supabase", keys: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] },
  { name: "Push (VAPID)", keys: ["NEXT_PUBLIC_VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"] },
  {
    name: "Email (EmailJS)",
    keys: [
      "EMAILJS_SERVICE_ID",
      "EMAILJS_PUBLIC_KEY",
      "EMAILJS_PRIVATE_KEY",
      "EMAILJS_TEMPLATE_ID_ENROLLMENT",
      "EMAILJS_TEMPLATE_ID_APPROVAL",
      "EMAILJS_TEMPLATE_ID_REJECTION",
    ],
  },
];

function resolveBaseUrl(): string {
  const explicit = process.env.MAINTENANCE_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  // Only trust NEXT_PUBLIC_SITE_URL when the host explicitly set it — the
  // getSiteUrl()'s fallback (medprep.pk) is a placeholder, not a live domain.
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) return site.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://127.0.0.1:${process.env.PORT || "3000"}`;
}

async function probe(baseUrl: string, routePath: string): Promise<number | string> {
  try {
    const res = await fetch(`${baseUrl}${routePath}`, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    return res.status;
  } catch (err) {
    return err instanceof Error ? err.message : "unreachable";
  }
}

async function appendHeartbeatLine(line: string, day: string, hour: string) {
  const stamp = `${day} ${hour}`;
  const logPath = path.join(process.cwd(), "IMPROVEMENT_LOG.md");
  try {
    let existing = "";
    try {
      existing = await readFile(logPath, "utf8");
    } catch {
      return { appended: false as const, reason: "IMPROVEMENT_LOG.md not found at repo root" };
    }
    // Skip when today's heartbeat line is already present (double-fire guard).
    const lastHeader = existing.lastIndexOf("## Maintenance heartbeat");
    const tail = lastHeader >= 0 ? existing.slice(lastHeader) : existing.slice(-4000);
    if (tail.includes(`\`${day} `)) {
      return { appended: false as const, reason: "already logged today" };
    }
    const block = `${existing.endsWith("\n") ? "" : "\n"}\n## Maintenance heartbeat\n\nAuto-appended by the 03:00 UTC cron (app/api/cron/maintenance/route.ts). On Vercel the filesystem is read-only, so appends happen only on hosts that allow file writes — elsewhere the run's heartbeat is the cron's own log line.\n\n- \`${stamp} UTC\` — ${line}\n`;
    await appendFile(logPath, block, "utf8");
    return { appended: true as const, file: "IMPROVEMENT_LOG.md" };
  } catch (err) {
    return {
      appended: false as const,
      reason: err instanceof Error ? `write failed: ${err.message}` : "write failed",
    };
  }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const baseUrl = resolveBaseUrl();
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const hour = now.toISOString().slice(11, 16);

  // 1. Site-up probes.
  const routeResults: Record<string, number | string> = {};
  await Promise.all(
    PROBE_PATHS.map(async (p) => {
      routeResults[p] = await probe(baseUrl, p);
    })
  );

  // 2. Env presence (names only — never values).
  const missing: Record<string, string[]> = {};
  const presentSummary: string[] = [];
  for (const group of ENV_GROUPS) {
    const absent = group.keys.filter((k) => !(process.env[k] ?? "").trim());
    if (absent.length > 0) missing[group.name] = absent;
    else presentSummary.push(`${group.name} (${group.keys.length}/${group.keys.length})`);
  }
  if (Object.keys(missing).length === 0) presentSummary.push("all present");

  // 3. One dated status line.
  const routeSummary = PROBE_PATHS.map((p) => `${p} ${routeResults[p]}`).join(", ");
  const missingFlat = Object.values(missing).flat();
  const envSummary =
    missingFlat.length > 0
      ? `env missing: ${missingFlat.join(", ")}`
      : "env: all present";
  const line = `routes: ${routeSummary} · ${envSummary} · checked ${baseUrl}`;

  const log = await appendHeartbeatLine(line, day, hour);

  // `ok` reports the health checks. The log append has its own field: on
  // read-only hosts (Vercel) a healthy run legitimately reports appended:false.
  const allUp = PROBE_PATHS.every((p) => routeResults[p] === 200);
  return NextResponse.json(
    {
      ok: allUp,
      service: "Apex Pakistan maintenance cron",
      utc: `${day} ${hour}`,
      baseUrl,
      routes: routeResults,
      env: {
        present: presentSummary,
        missing,
        note: "presence check only — values never read or logged",
      },
      log,
      line,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
