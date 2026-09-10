import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { isVapidConfigured, sendPushNotification } from "@/lib/push";

export const dynamic = "force-dynamic";

/**
 * POST /api/push/send — the deliberate trigger that delivers to every stored
 * push subscription. Owner-only, two ways:
 *
 *  1. An allowlisted admin session (cookie) — the founder's "Send" button on
 *     /admin/push.
 *  2. `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is configured —
 *     so a future scheduled send (e.g. a daily practice reminder cron) can
 *     call it. Without CRON_SECRET set, session-auth is the only path.
 *
 * Never open to the public, never called from a render — sends only happen
 * when the owner deliberately triggers one. Dead/expired subscriptions are
 * removed as the send goes through (see lib/push.ts).
 */
export async function POST(request: NextRequest) {
  // Owner check: CRON_SECRET bearer first (cheap), admin session second.
  const secret = process.env.CRON_SECRET;
  let isOwner = false;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth === `Bearer ${secret}`) isOwner = true;
  }
  if (!isOwner) {
    const admin = await getAdminUser().catch(() => null);
    isOwner = Boolean(admin);
  }
  if (!isOwner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isVapidConfigured()) {
    return NextResponse.json(
      { error: "VAPID keys are not configured (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT)." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    title?: unknown;
    body?: unknown;
    url?: unknown;
  };

  const title = typeof body.title === "string" && body.title.trim() ? body.title.trim().slice(0, 80) : undefined;
  const text = typeof body.body === "string" && body.body.trim() ? body.body.trim().slice(0, 240) : undefined;
  // Only same-origin paths are allowed as the click-through target.
  const url =
    typeof body.url === "string" &&
    body.url.startsWith("/") &&
    !body.url.startsWith("//")
      ? body.url.slice(0, 200)
      : undefined;

  const result = await sendPushNotification({ title, body: text, url });
  return NextResponse.json(result);
}