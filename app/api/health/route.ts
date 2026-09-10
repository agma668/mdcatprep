import { NextResponse } from "next/server";

// GET /api/health — cheap liveness endpoint for uptime monitors and the
// standing daily-maintenance cron. No DB dependency on purpose: it answers
// whether the host is serving, and logs the time.

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "cadet-college-prep",
      time: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
