import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// POST /api/telemetry — receive batched client telemetry (page views +
// error reports) and store it with the service role. Server-side only;
// the table has no public insert policy. Validates shapes and lengths,
// attaches the signed-in user's id, and never throws to the caller.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITS = {
  name: 80,
  url: 500,
  message: 4000,
  stack: 8000,
  batch: 50,
};

interface TelemetryItem {
  type?: unknown;
  name?: unknown;
  url?: unknown;
  message?: unknown;
  stack?: unknown;
  meta?: unknown;
}

export async function POST(request: Request) {
  let body: TelemetryItem[];
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Bad JSON", { status: 400 });
  }
  if (!Array.isArray(body) || body.length === 0 || body.length > LIMITS.batch) {
    return new NextResponse("Expected a non-empty batch", { status: 400 });
  }

  // Resolve the session (nullable) so events can be attributed to a user.
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    /* session resolution must never break telemetry */
  }

  const rows = [];
  for (const item of body) {
    const type = item.type;
    if (type !== "page_view" && type !== "event" && type !== "error") continue;
    const name = typeof item.name === "string" ? item.name.trim().slice(0, LIMITS.name) : "";
    if (!name) continue;
    const url =
      typeof item.url === "string" && item.url.startsWith("/") ? item.url.slice(0, LIMITS.url) : null;
    const message =
      typeof item.message === "string" && item.message.trim() ? item.message.slice(0, LIMITS.message) : null;
    const stack =
      typeof item.stack === "string" && item.stack.trim() ? item.stack.slice(0, LIMITS.stack) : null;
    let meta: Record<string, unknown> = {};
    if (item.meta && typeof item.meta === "object") {
      try {
        const serialized = JSON.stringify(item.meta);
        if (serialized.length <= 2000) meta = item.meta as Record<string, unknown>;
      } catch {
        /* ignore oversized meta */
      }
    }
    rows.push({ user_id: userId, type, name, url, message, stack, meta });
  }

  if (rows.length === 0) return new NextResponse("Nothing to store", { status: 400 });

  try {
    const service = createServiceClient();
    const { error } = await service.from("client_telemetry").insert(rows);
    if (error) {
      // Do not leak details; the caller is a client, not an operator.
      return new NextResponse("Storage failed", { status: 500 });
    }
  } catch {
    // Missing SUPABASE_SERVICE_ROLE_KEY in this environment → degrade silently.
    return new NextResponse("Storage unavailable", { status: 503 });
  }

  return new NextResponse(null, { status: 204 });
}
