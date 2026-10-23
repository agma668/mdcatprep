import { NextResponse } from "next/server";
import {
  getSupabaseProjectRef,
  isPublicAuthConfigured,
} from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";

// GET /api/health — cheap liveness endpoint for uptime monitors and the
// standing daily-maintenance cron. No DB dependency on purpose: it answers
// whether the host is serving, and logs the time.
//
// Also reports (booleans only — never values):
//   auth:        a complete, well-formed publishable env pair is configured
//                (no embedded fallback exists since 2026-10-23)
//   serviceKey:  true when SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)
//                is present in the environment.
//
// GET /api/health?deep=1 additionally arbitrates the service key against the
// Supabase gateway (a present-but-wrong value only fails on first use), and
// reports serviceKeyOk. When the gateway answers "schema cache / table not
// found" the keys WORK but point at a project without the app's tables — a
// wrong-project misconfiguration — reported as schema:false alongside the
// resolved project ref so the mismatch is visible from outside.
// Latency: one COUNT-limited query — not for hot uptime monitors, for diagnosis.

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const deep = new URL(request.url).searchParams.get("deep") === "1";

  let serviceKeyOk: boolean | undefined;
  let schemaOk: boolean | undefined;
  if (deep) {
    try {
      const service = createServiceClient();
      const { error } = await service.from("profiles").select("id").limit(1);
      const message = error?.message ?? "";
      if (!error) {
        serviceKeyOk = true;
        schemaOk = true;
      } else if (/invalid api key/i.test(message)) {
        serviceKeyOk = false;
        schemaOk = undefined; // key rejected before any table was touched
      } else if (/schema cache|could not find the table/i.test(message)) {
        serviceKeyOk = true; // gateway accepted the key
        schemaOk = false; // …but the project has no `profiles` table
      } else {
        serviceKeyOk = true;
        schemaOk = undefined; // unrelated error — not diagnosable here
      }
    } catch (err) {
      serviceKeyOk = !(err as { message?: string })?.message
        ?.toLowerCase()
        .includes("not configured");
    }
  }

  return NextResponse.json(
    {
      status: "ok",
      service: "med-prep",
      auth: isPublicAuthConfigured(),
      project: getSupabaseProjectRef(),
      serviceKey: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
          process.env.SUPABASE_SECRET_KEY?.trim()
      ),
      ...(serviceKeyOk !== undefined && { serviceKeyOk }),
      ...(schemaOk !== undefined && { schemaOk }),
      time: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
