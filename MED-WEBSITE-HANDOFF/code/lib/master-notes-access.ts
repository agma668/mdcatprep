/**
 * Master Notes access — the ONE gate behind every Master Notes surface.
 *
 * Three ways in, checked in order:
 *   1. Admin/staff (isAdminEmail) — always.
 *   2. Referral champion (5+ friends joined) — the founder's growth unlock.
 *   3. Leaderboard Top 3 — the rotating skill perk: the CURRENT top three
 *      students on the all-time board hold access for as long as they hold
 *      the rank. Computed live from the same shared RPC + identity rule as
 *      the board's "Your rank" card (findSelfRow), so there is no second
 *      ranking to drift.
 *
 * Every check fails soft to LOCKED (no access rather than guessed access),
 * and the page guard enforces this server-side — the UI lock is a mirror,
 * not the gate.
 */

import { createServiceClient } from "@/lib/supabase/service";
import { isAdminEmail } from "@/lib/auth";
import { fetchRankedRows, SELF_RANK_WINDOW, LEADERBOARD_TIMEOUT_MS } from "@/lib/leaderboard";
import type { LeaderboardRow } from "@/lib/leaderboard";

export const MASTER_NOTES_TOP_N = 3;

export interface MasterNotesAccess {
  granted: boolean;
  /** Which rule admitted the student — for the badge copy. */
  via: "admin" | "referral" | "top3" | null;
  /** The student's current rank when they are on the board (1-based). */
  currentRank: number | null;
  /** Cut-off rank that holds the perk right now (MASTER_NOTES_TOP_N). */
  topN: number;
}

interface GateInput {
  studentId: string;
  email: string | null | undefined;
  referralUnlocked: boolean;
}

/**
 * Identity-resolve the caller's row inside the ranked window — the exact
 * same matching rule as the board's "Your rank" card: same full_name, same
 * attempt count, same accuracy. Students with no attempts are unranked.
 */
async function resolveOwnRank(
  service: ReturnType<typeof createServiceClient>,
  studentId: string
): Promise<number | null> {
  const [meRes, myTotalRes, myCorrectRes] = await Promise.all([
    service.from("profiles").select("full_name").eq("id", studentId).maybeSingle(),
    service
      .from("question_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId),
    service
      .from("question_attempts")
      .select("id", { count: "exact", head: true })
      .eq("student_id", studentId)
      .eq("is_correct", true),
  ]);

  const myName: string | null = meRes.data?.full_name ?? null;
  const myTotal = myTotalRes.count ?? 0;
  if (!myName || myTotal <= 0) return null;

  const ranked: LeaderboardRow[] = await fetchRankedRows(service, SELF_RANK_WINDOW);
  const accuracy = Math.round(((myCorrectRes.count ?? 0) / myTotal) * 100);
  const row = ranked.find(
    (r) => r.name === myName && r.questions === myTotal && r.accuracy === accuracy
  );
  return row ? row.rank : null;
}

/** Full access resolution for a signed-in student. */
export async function getMasterNotesAccess({
  studentId,
  email,
  referralUnlocked,
}: GateInput): Promise<MasterNotesAccess> {
  const locked: MasterNotesAccess = {
    granted: false,
    via: null,
    currentRank: null,
    topN: MASTER_NOTES_TOP_N,
  };

  try {
    // 1. Staff always in.
    if (isAdminEmail(email)) return { ...locked, granted: true, via: "admin" };

    // 2. Referral champions in.
    if (referralUnlocked) return { ...locked, granted: true, via: "referral" };

    // 3. The rotating top-3 perk, live from the shared ranking.
    const service = createServiceClient();
    const rank = await Promise.race([
      resolveOwnRank(service, studentId),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), LEADERBOARD_TIMEOUT_MS)),
    ]);
    if (rank !== null && rank <= MASTER_NOTES_TOP_N) {
      return { ...locked, granted: true, via: "top3", currentRank: rank };
    }
    return { ...locked, currentRank: rank };
  } catch {
    return locked;
  }
}

/** Slim guard result for the note pages: in, or out with redirect copy. */
export interface NotesPageGate {
  allowed: boolean;
  /** Why the student was let in (null when not allowed). */
  via: MasterNotesAccess["via"];
  currentRank: number | null;
  topN: number;
}

export async function gateMasterNotes(input: GateInput): Promise<NotesPageGate> {
  const access = await getMasterNotesAccess(input);
  return {
    allowed: access.granted,
    via: access.via,
    currentRank: access.currentRank,
    topN: access.topN,
  };
}
