import { createServiceClient } from "@/lib/supabase/service";
import { isAdminEmail } from "@/lib/auth";
import { communitySize } from "@/lib/stats";

/**
 * Top students by total questions attempted — cheap, exact, and never able to
 * block or break a render:
 *
 *  - Ranking happens in exactly one place: the `public.leaderboard(p_limit)`
 *    SQL aggregate (supabase/migrations/20260903000001_leaderboard_function.sql),
 *    which also applies the founder-account exclusions inside Postgres and
 *    computes streaks — the dashboard reads back exactly `p_limit` rows.
 *    There is deliberately no client-side re-ranking fallback: a second
 *    implementation of the ranking policy is how the two copies drift.
 *  - If the function is missing or anything fails, the leaderboard fails open
 *    to empty (the sidebar simply hides the "Top students" block) — it is
 *    decorative and must never take a build or a render down with it.
 *  - Site totals come from COUNT-only queries (`head: true` carries no rows).
 */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  streak: number;
  accuracy: number;
  questions: number;
  /**
   * The row's profile id when it maps to exactly ONE approved, real
   * (non-demo), non-staff student other than the signed-in viewer — the
   * challenge affordance target. Undefined for the viewer's own row, demo
   * rows, staff, and ambiguous names (the server re-validates every
   * challenge regardless; this is presentation only).
   */
  studentId?: string;
}

export interface LeaderboardStats {
  totalStudents: number;
  totalQuestions: number;
  avgStreak: number;
}

interface LeaderboardRow {
  rank: number;
  name: string;
  streak: number;
  accuracy: number;
  questions: number;
}

/** Shared by getLeaderboard (in-app, demos included) and the landing page's
 *  getPublicStats (real students only): rank by questions desc, accuracy as
 *  the tiebreak, compute the average streak over the ranked set, slice, and
 *  number the rows 1..limit. */
export function finalizeLeaderboard(rows: LeaderboardRow[], totalStudents: number, totalQuestions: number, limit: number) {
  // The headcount is floored at the community baseline here rather than at each
  // call site, because this is the single point every leaderboard surface goes
  // through — so the landing hero, the dashboard social bar and the leaderboard
  // header cannot show three different "how many students" numbers.
  const ranked = [...rows].sort(
    (a, b) => b.questions - a.questions || b.accuracy - a.accuracy
  );
  const streakSum = ranked.reduce((sum, r) => sum + r.streak, 0);
  return {
    entries: ranked.slice(0, limit).map((r, i) => ({ ...r, rank: i + 1 })),
    stats: {
      totalStudents: communitySize(totalStudents),
      totalQuestions,
      avgStreak: ranked.length > 0 ? Math.round((streakSum / ranked.length) * 10) / 10 : 0,
    },
  };
}

/** How long the leaderboard may spend on the DB before giving up. */
const LEADERBOARD_TIMEOUT_MS = 8000;

/**
 * One RPC call, one ranking definition: fetch the ranked set from the SQL
 * aggregate and normalize rows. Used by every leaderboard surface — the
 * returned rows are always ordered by the function's own row_number, so a
 * wider p_limit is just a wider window over the same ranking.
 */
async function fetchRankedRows(
  service: ReturnType<typeof createServiceClient>,
  p_limit: number
): Promise<LeaderboardRow[]> {
  const { data, error } = await service.rpc("leaderboard", { p_limit });
  if (error || !data) return [];
  return (data as LeaderboardRow[]).map((r) => ({
    rank: r.rank,
    name: r.name,
    streak: r.streak ?? 0,
    accuracy: r.accuracy ?? 0,
    questions: r.questions ?? 0,
  }));
}

export async function getLeaderboard(p_limit = 5): Promise<{
  entries: LeaderboardEntry[];
  stats: LeaderboardStats;
}> {
  try {
    // Creating the client throws when the env vars are missing — that must
    // fail open too, or the landing page's build-time prerender dies on any
    // machine without secrets (the Vercel "Error 25s" class of failure).
    const service = createServiceClient();

    const body = async () => {
      // 1. Site totals via server-side COUNTs (no payload).
      const [{ count: totalStudents }, { count: totalQuestions }] = await Promise.all([
        service.from("profiles").select("id", { count: "exact", head: true }).eq("status", "approved"),
        service.from("question_attempts").select("student_id", { count: "exact", head: true }),
      ]);

      // 2. Exact ranking from the SQL aggregate. If it's missing, fail open —
      //    no client-side re-ranking.
      const ranked = await fetchRankedRows(service, p_limit);
      return finalizeLeaderboard(ranked, totalStudents ?? 0, totalQuestions ?? 0, p_limit);
    };

    // Leaderboard is decorative — a stalled database must never hang a
    // build (or a dashboard render) behind it.
    return await Promise.race([
      body(),
      new Promise<{ entries: LeaderboardEntry[]; stats: LeaderboardStats }>((resolve) =>
        setTimeout(() => resolve({ entries: [], stats: { totalStudents: 0, totalQuestions: 0, avgStreak: 0 } }), LEADERBOARD_TIMEOUT_MS)
      ),
    ]);
  } catch {
    // Missing env, network failure, anything — fail open.
    return { entries: [], stats: { totalStudents: 0, totalQuestions: 0, avgStreak: 0 } };
  }
}

/**
 * The student's own spot inside the ranked window, wherever it is. Rank,
 * questions and accuracy are always present; the gap fields appear only when
 * another ranked student sits directly above. Built from the SAME rows as
 * the board (the SQL `leaderboard` RPC) and the SAME identity matching — the
 * RPC deliberately carries no student ids, so the row is found by matching
 * the returned (name, questions, accuracy) against the student's profile and
 * their own attempt counts. Never a second computation.
 */
export interface SelfRankSpot {
  rank: number;
  questions: number;
  accuracy: number;
  /** Rank directly above the student — the next one to overtake. */
  aboveRank?: number;
  /** Honest minimum additional questions needed to pass aboveRank under the
   *  board's own ordering (questions desc, accuracy tiebreak): overtaking
   *  needs a strictly higher question count, unless a question-count tie
   *  already flips the accuracy tiebreak in the student's favour. */
  questionsNeeded?: number;
}

/** The board's "Your rank" card — always carries the gap to the row above. */
export interface SelfRankInfo extends SelfRankSpot {
  aboveRank: number;
  questionsNeeded: number;
}

/**
 * Identity-resolve the student's own row inside the ranked window — the one
 * shared rule for every surface that shows the student's own rank (the
 * board's "Your rank" card and the share-progress card). Students with no
 * attempts are not ranked at all.
 */
function findSelfRow(
  ranked: LeaderboardRow[],
  myTotal: number,
  myCorrect: number,
  myName: string | null
): { rank: number; questions: number; accuracy: number } | null {
  if (ranked.length === 0 || myTotal <= 0 || !myName) return null;
  const accuracy = Math.round((myCorrect / myTotal) * 100);
  const row = ranked.find(
    (r) => r.name === myName && r.questions === myTotal && r.accuracy === accuracy
  );
  return row ? { rank: row.rank, questions: row.questions, accuracy: row.accuracy } : null;
}

/** The gap to the rank directly above — one computation, shared by every
 *  surface that shows it. Returns null only when nobody ranks above (rank 1). */
function gapToAbove(
  myRow: { rank: number; questions: number; accuracy: number },
  ranked: LeaderboardRow[]
): { aboveRank: number; questionsNeeded: number } | null {
  const above = ranked.find((r) => r.rank === myRow.rank - 1);
  if (!above) return null;
  const diff = Math.max(0, above.questions - myRow.questions);
  const questionsNeeded = Math.max(1, diff + (myRow.accuracy > above.accuracy ? 0 : 1));
  return { aboveRank: above.rank, questionsNeeded };
}

// Wide enough that any ranked student is inside the returned set. The RPC
// returns only rows that exist (one per ranked student with >= 1 attempt),
// so the response is bounded by the student population, never by this number.
const SELF_RANK_WINDOW = 500;

const EMPTY_RANK_RESULT = {
  entries: [] as LeaderboardEntry[],
  stats: { totalStudents: 0, totalQuestions: 0, avgStreak: 0 } as LeaderboardStats,
  self: null as SelfRankInfo | null,
};

export async function getLeaderboardForStudent(
  studentId: string,
  visibleTop = 15
): Promise<{
  entries: LeaderboardEntry[];
  stats: LeaderboardStats;
  self: SelfRankInfo | null;
}> {
  try {
    const service = createServiceClient();

    const body = async () => {
      const [
        meRes,
        myTotalRes,
        myCorrectRes,
        studentsRes,
        attemptsRes,
      ] = await Promise.all([
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
        service.from("profiles").select("id", { count: "exact", head: true }).eq("status", "approved"),
        service.from("question_attempts").select("student_id", { count: "exact", head: true }),
      ]);

      // ONE windowed RPC serves both the visible board and the student's own
      // spot — the exact same ranking, one call.
      const ranked = await fetchRankedRows(service, Math.max(visibleTop, SELF_RANK_WINDOW));

      const totalStudents = studentsRes.count ?? 0;
      const totalQuestions = attemptsRes.count ?? 0;
      // The board itself: the top rows only (avgStreak over the top set, as
      // before), numbered 1..visibleTop by the shared finalizer.
      const board = finalizeLeaderboard(
        ranked.slice(0, visibleTop),
        totalStudents,
        totalQuestions,
        visibleTop
      );

      let self: SelfRankInfo | null = null;
      const myTotal = myTotalRes.count ?? 0;
      const myName = meRes.data?.full_name ?? null;
      const myRow = findSelfRow(ranked, myTotal, myCorrectRes.count ?? 0, myName);
      // Shown only when the board itself does not show the student.
      if (myRow && myRow.rank > visibleTop) {
        const gap = gapToAbove(myRow, ranked);
        if (gap) self = { ...myRow, ...gap };
      }

      // Challenge affordance: the RPC deliberately carries no student ids, so
      // map the visible rows to profiles via an approved-profiles name lookup.
      // Ranking stays 100% in the SQL function; this only attaches a target.
      const entries = await attachChallengeTargets(service, board.entries, studentId);

      return { entries, stats: board.stats, self };
    };

    return await Promise.race([
      body(),
      new Promise<typeof EMPTY_RANK_RESULT>((resolve) =>
        setTimeout(() => resolve(EMPTY_RANK_RESULT), LEADERBOARD_TIMEOUT_MS)
      ),
    ]);
  } catch {
    // Missing env, network failure, anything — fail open (no card rather
    // than a guessed card).
    return EMPTY_RANK_RESULT;
  }
}

/**
 * The signed-in student's own spot in the ranking, wherever it is — the
 * share-progress card reads this. Same windowed RPC and same identity
 * matching as the board; fails open to null (no card rather than a guessed
 * rank).
 */
export async function getSelfRank(studentId: string): Promise<SelfRankSpot | null> {
  try {
    const service = createServiceClient();

    const body = async () => {
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

      const ranked = await fetchRankedRows(service, SELF_RANK_WINDOW);
      const row = findSelfRow(ranked, myTotalRes.count ?? 0, myCorrectRes.count ?? 0, meRes.data?.full_name ?? null);
      if (!row) return null;
      const gap = gapToAbove(row, ranked);
      return gap ? { ...row, ...gap } : row;
    };

    return await Promise.race([
      body(),
      new Promise<SelfRankSpot | null>((resolve) =>
        setTimeout(() => resolve(null), LEADERBOARD_TIMEOUT_MS)
      ),
    ]);
  } catch {
    return null;
  }
}

/**
 * Attach a challenge target (profile id) to each visible row. A row maps to
 * a student only when exactly one approved, non-staff profile matches its
 * name and it isn't the signed-in viewer — duplicate names stay buttonless
 * rather than guessing, and staff/self rows never get the affordance. Demo
 * roster rows DO get it: races/duels are not live yet, so every challenge
 * today ends at the same honest 'not live yet' state, and a demo row
 * visibly missing the button is what would out the roster. The server gates
 * (validateOpponent / validateRaceOpponent) still refuse real challenges to
 * demo accounts — the affordance is cosmetic, the refusal is authoritative.
 */
async function attachChallengeTargets(
  service: ReturnType<typeof createServiceClient>,
  entries: LeaderboardEntry[],
  viewerId: string
): Promise<LeaderboardEntry[]> {
  if (entries.length === 0) return entries;
  const names = [...new Set(entries.map((e) => e.name))];
  const { data } = await service
    .from("profiles")
    .select("id, email, full_name")
    .in("full_name", names)
    .eq("status", "approved");
  if (!data) return entries;

  const byName = new Map<string, { id: string; challengeable: boolean }[]>();
  for (const p of data) {
    const challengeable =
      p.id !== viewerId &&
      !isAdminEmail(p.email);
    const list = byName.get(p.full_name) ?? [];
    list.push({ id: p.id, challengeable });
    byName.set(p.full_name, list);
  }

  return entries.map((e) => {
    const matches = byName.get(e.name);
    // Ambiguous (0 or 2+) profiles with this name → no affordance.
    if (!matches || matches.length !== 1) return e;
    const m = matches[0];
    if (!m.challengeable) return e;
    return { ...e, studentId: m.id };
  });
}