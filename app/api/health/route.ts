import { NextResponse } from "next/server";
import { isPublicAuthConfigured, isUsingBuiltinAuthFallback } from "@/lib/env";

// GET /api/health — cheap liveness endpoint for uptime monitors and the
// standing daily-maintenance cron. No DB dependency on purpose: it answers
// whether the host is serving, and logs the time.
//
// Also reports (booleans only — never values):
//   auth:      publishable auth config present (env vars or built-in
//              fallbacks — effectively always true now)
//   fallback:  true when the BUILT-IN publishable fallbacks are in use,
//              i.e. the host has no NEXT_PUBLIC_SUPABASE_* env vars set.
//              Everything works, but the owner should still set the env vars
//              (and SUPABASE_SERVICE_ROLE_KEY for full student/profile
//              features) and redeploy.

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "cadet-college-prep",
      auth: isPublicAuthConfigured(),
      fallback: isUsingBuiltinAuthFallback(),
      time: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
