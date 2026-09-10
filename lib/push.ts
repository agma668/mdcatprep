/**
 * Push-notification sender — the half of the feature that was missing: the
 * client has always collected real subscriptions into `push_subscriptions`
 * (`POST /api/push`), but nothing ever sent to them. This module delivers.
 *
 * Only ever called from a deliberate trigger (the owner-only admin send
 * control, or a future scheduled send) — never from a page render, never on
 * student activity. Sends go only to real stored subscriptions.
 */

import webpush from "web-push";
import { createServiceClient } from "@/lib/supabase/service";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "";

/** All three VAPID vars must be set before any send can happen. */
export function isVapidConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_SUBJECT);
}

export interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
}

export interface PushSendResult {
  ok: boolean;
  /** True when VAPID isn't configured (the sender is inert, nothing attempted). */
  notConfigured?: boolean;
  /** Total subscriptions read from the table. */
  subscribers: number;
  /** Subscriptions that accepted the delivery (HTTP 201). */
  sent: number;
  /** Subscriptions that failed for a non-terminal reason (kept for retry). */
  failed: number;
  /** Expired/gone subscriptions deleted as the send went through. */
  removed: number;
  /** Rows that were unusable (missing p256dh/auth) and skipped. */
  skipped: number;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

function emptyResult(): PushSendResult {
  return { ok: false, subscribers: 0, sent: 0, failed: 0, removed: 0, skipped: 0 };
}

/**
 * Send one push to every stored subscription. Terminally-gone endpoints
 * (HTTP 404/410 — the browser unsubscribed or the push service dropped it)
 * are deleted as they're found, so the table never grows stale subscriptions
 * that can never be delivered to. Transient failures (network, 5xx) keep the
 * row and are counted as `failed` for the next deliberate send to retry.
 */
export async function sendPushNotification(payload: PushPayload = {}): Promise<PushSendResult> {
  if (!isVapidConfigured()) {
    return { ...emptyResult(), notConfigured: true };
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const service = createServiceClient();
  const { data: rows, error } = await service
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (error) throw new Error(`reading push subscriptions: ${error.message}`);

  const subs: SubscriptionRow[] = rows ?? [];
  const result: PushSendResult = { ...emptyResult(), ok: true, subscribers: subs.length };

  for (const row of subs) {
    // The table schema allows empty keys (older clients); those rows are
    // unusable — skip them rather than fail the whole send.
    if (!row.endpoint || !row.p256dh || !row.auth) {
      result.skipped += 1;
      continue;
    }

    try {
      await webpush.sendNotification(
        { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
        JSON.stringify({
          title: payload.title ?? "Cadet College Prep",
          body: payload.body ?? "Time to practice!",
          url: payload.url ?? "/dashboard/practice",
          icon: "/icon-192.png",
          badge: "/badge-72.png",
        })
      );
      result.sent += 1;
    } catch (err) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        // Gone / not found — the subscription is dead (unsubscribed or
        // expired). Drop it so we never try it again.
        await service.from("push_subscriptions").delete().eq("id", row.id).maybeSingle();
        result.removed += 1;
      } else {
        // Transient or unknown failure — keep the subscription for retry.
        result.failed += 1;
      }
    }
  }

  return result;
}