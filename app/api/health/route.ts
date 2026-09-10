import { NextResponse } from "next/server";
import { isPublicAuthConfigured } from "@/lib/env";

// GET /api/health — cheap liveness endpoint for uptime monitors and the
// standing daily-maintenance cron. No DB dependency on purpose: it answers
// whether the host is serving, and logs the time.
//
// Also reports (booleans only — never values) whether the auth env vars are
// present, so a deployment that was built without them is diagnosable from
// the outside: { auth: false } + working pages = the sign-in outage signature
// of 2026-09-10. Remember NEXT_PUBLIC_* vars only take effect after a rebuild.

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "cadet-college-prep",
      auth: isPublicAuthConfigured(),
      time: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
