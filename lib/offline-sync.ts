// The ONE recording seam every question surface funnels through — offline
// practice, the dashboard drill (McqPlayer), the daily quiz, the diagnostic,
// and the mock test's submit batch. It owns the rule "what counts, and when":
//
//   signed-out student  → answer stays purely local (guest runs are by
//                         design, and the UI never implies otherwise)
//   signed in, online   → straight through the shared recordAttempt server
//                         action (server derives the student from the
//                         session — never from the client — and recomputes
//                         correctness from the stored answer)
//   signed in, offline  → the answer is queued in the IndexedDB outbox
//                         (lib/offline.ts) and drained later by
//                         drainPendingAttempts, which re-uses that same
//                         recordAttempt path, so an offline answer lands in
//                         question_attempts exactly like an online one and
//                         moves goal / streak / analytics / rank identically.
//
// The queue is the idempotency guard: entries are claimed atomically
// (queued → syncing in one transaction), sent once, and removed only after
// the server confirms the insert — so a double-drain (two triggers racing,
// or the same trigger firing twice) can never double-record. A failed send
// releases the entry back to "queued" for the next drain.
//
// Successful drains stamp a last-synced timestamp (localStorage) so a
// returning student can tell their offline run reached the server.

import { createClient } from "@/lib/supabase/client";
import { recordAttempt, recordAttemptByQuestionKey } from "@/app/actions/practice";
import {
  claimPendingAttempts,
  enqueuePendingAttempt,
  enqueuePendingQuestionAttempt,
  newId,
  releasePendingAttempts,
  removePendingAttempts,
} from "@/lib/offline";

const LAST_SYNCED_KEY = "apex:offline:lastSynced";
const LEGACY_LAST_SYNCED_KEY = "ccp:offline:lastSynced";

/** Epoch ms of the last drain that actually synced answers, or null. */
export function getLastSyncedAt(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const current = window.localStorage.getItem(LAST_SYNCED_KEY);
    const legacy = current ? null : window.localStorage.getItem(LEGACY_LAST_SYNCED_KEY);
    const raw = current ?? legacy;
    const n = raw ? Number(raw) : NaN;
    if (!Number.isFinite(n) || n <= 0) return null;
    if (!current && legacy) window.localStorage.setItem(LAST_SYNCED_KEY, legacy);
    return n;
  } catch {
    return null;
  }
}

function stampLastSynced() {
  try {
    window.localStorage.setItem(LAST_SYNCED_KEY, String(Date.now()));
  } catch {
    /* storage unavailable — the sync still happened */
  }
}

export type DrainResult = {
  /** False when the drain skipped because no signed-in session exists. */
  checked: boolean;
  attempted: number;
  synced: number;
  /** Released back to the queue (transient failure / session expired). */
  held: number;
  /** Removed — permanent server rejection (question unpublished/deleted). */
  dropped: number;
};

/**
 * Queue-aware recording for every player. Online behavior is unchanged
 * (record through the shared server action); offline answers for signed-in
 * students queue instead of vanishing; guest answers never leave the device.
 */
export async function recordAnswer(
  questionId: string,
  selectedAnswer: string,
  timeSpentSeconds?: number
): Promise<{ success?: boolean; queued?: boolean; local?: boolean; error?: string }> {
  // Session read is pure storage access — works with no network. Guests are
  // purely local by design: nothing is queued, so nothing can ever sync.
  const session = await createClient()
    .then((supabase) => supabase.auth.getSession())
    .then(({ data }) => data.session)
    .catch(() => null);
  if (!session) return { local: true };

  // One client-unique id per submission. The direct send and any fallback
  // queue entry share it, and recordAttempt is idempotent by it — so when the
  // direct send fails mid-flight and the answer gets queued, the drain's
  // retry can never double-record (the server sees the same key).
  const attemptId = newId();

  if (!navigator.onLine) {
    await enqueuePendingAttempt(questionId, selectedAnswer, timeSpentSeconds, attemptId);
    return { queued: true };
  }

  try {
    const res = await recordAttempt(questionId, selectedAnswer, timeSpentSeconds, attemptId);
    // Session died between the storage read and the server action (expired
    // token). Queue it — the drain re-checks server-side auth, so the answer
    // still counts once the student is signed in again.
    if (res && "error" in res && res.error === "Not authenticated") {
      await enqueuePendingAttempt(questionId, selectedAnswer, timeSpentSeconds, attemptId);
      return { queued: true };
    }
    return res;
  } catch {
    // Origin unreachable or the request failed mid-flight — the attempt may
    // or may not have landed, so queue it under the SAME id; recordAttempt's
    // key idempotency means the drain records it at most once even if this
    // direct send actually landed.
    await enqueuePendingAttempt(questionId, selectedAnswer, timeSpentSeconds, attemptId);
    return { queued: true };
  }
}

/**
 * Queue-aware recorder for bundled questions identified by stable question_key.
 * The same id is reused for direct sends and offline retries, so a response
 * lost in transit cannot create a duplicate attempt when the queue drains.
 */
export async function recordBundledAnswer(
  questionKey: string,
  questionText: string,
  selectedAnswer: string,
  timeSpentSeconds?: number
): Promise<{ success?: boolean; queued?: boolean; local?: boolean; error?: string }> {
  const session = await createClient()
    .then((supabase) => supabase.auth.getSession())
    .then(({ data }) => data.session)
    .catch(() => null);
  if (!session) return { local: true };

  const attemptId = newId();
  if (!navigator.onLine) {
    await enqueuePendingQuestionAttempt(questionKey, questionText, selectedAnswer, timeSpentSeconds, attemptId);
    return { queued: true };
  }

  try {
    const result = await recordAttemptByQuestionKey(
      questionKey,
      selectedAnswer,
      questionText,
      timeSpentSeconds,
      attemptId
    );
    if (
      "error" in result &&
      (result.error === "Not authenticated" || result.error === "Question not found.")
    ) {
      // The canonical row may not have been ingested yet. Preserve the answer
      // under this same id so a later content sync can record it exactly once.
      await enqueuePendingQuestionAttempt(questionKey, questionText, selectedAnswer, timeSpentSeconds, attemptId);
      return { queued: true };
    }
    return result;
  } catch {
    await enqueuePendingQuestionAttempt(questionKey, questionText, selectedAnswer, timeSpentSeconds, attemptId);
    return { queued: true };
  }
}

let activeDrain: Promise<DrainResult> | null = null;

/**
 * Send every pending answer through the shared recordAttempt path. Single-
 * flight: concurrent callers share one run instead of racing the queue.
 */
export function drainPendingAttempts(): Promise<DrainResult> {
  if (!activeDrain) {
    activeDrain = runDrain().finally(() => {
      activeDrain = null;
    });
  }
  return activeDrain;
}

async function runDrain(): Promise<DrainResult> {
  const result: DrainResult = { checked: false, attempted: 0, synced: 0, held: 0, dropped: 0 };
  const supabase = await createClient();

  // Gate on a real, server-validated session (getUser also refreshes an
  // expired token when online). Signed out → nothing drains; the entries wait.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return result;
  result.checked = true;

  const queued = await claimPendingAttempts();
  result.attempted = queued.length;

  for (const entry of queued) {
    try {
      // entry.id is the client-unique key the entry was queued with — the
      // server is idempotent by it, so a re-sent entry (crashed drain between
      // server confirm and local remove) can never double-record.
      const res = entry.questionKey
        ? await recordAttemptByQuestionKey(
            entry.questionKey,
            entry.selectedAnswer,
            entry.questionText,
            entry.timeSpentSeconds,
            entry.id
          )
        : entry.questionId
          ? await recordAttempt(entry.questionId, entry.selectedAnswer, entry.timeSpentSeconds, entry.id)
          : { error: "Queued attempt has no question identity." };
      if (res && "success" in res && res.success) {
        await removePendingAttempts([entry.id]);
        result.synced++;
      } else if (
        res &&
        "error" in res &&
        (res.error === "Not authenticated" || res.error === "Question not found.")
      ) {
        // Auth may need refreshing, or bundled content may not be ingested yet.
        // Keep the answer; never discard a valid student response for missing content.
        await releasePendingAttempts([entry.id]);
        result.held++;
      } else {
        // Permanent: question unpublished/deleted or answer invalid. The
        // offline bank snapshot is stale; nothing to retry.
        await removePendingAttempts([entry.id]);
        result.dropped++;
      }
    } catch {
      // Transient — leave it queued for the next drain.
      await releasePendingAttempts([entry.id]);
      result.held++;
    }
  }
  if (result.synced > 0) stampLastSynced();
  return result;
}
