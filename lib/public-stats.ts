import { createServiceClient } from "@/lib/supabase/service";
import { COLLEGES } from "@/lib/college-list";
import { coveredSubjectCount } from "@/lib/subjects";
import { DEMO_EMAIL_SUFFIX } from "@/lib/demo";
import {
  finalizeLeaderboard,
  type LeaderboardEntry,
  type LeaderboardStats,
} from "@/lib/leaderboard";

/**
 * The one data seam for the landing page's numbers. Every number shown there
 * comes from here, and every number here is real:
 *
 *  - hero: colleges = the college directory (COLLEGES.length), subjects = the
 *    distinct subjects that actually have questions in the live bank,
 *    MCQs = the live count of published questions.
 *  - board: the top real students only. The demo roster is sanctioned for the
 *    in-app leaderboard; on this public page demo students (and their attempt
 *    drip) are excluded from the rows AND from the totals, so a visitor never
 *    sees an invented student or an aggregate inflated by fake activity.
 *  - analytics: community aggregates over real students' attempts only.
 *
 * Fail-open policy: the hero always renders (falling back to true static
 * floors when the DB is unreachable); the board/analytics sections hide
 * themselves rather than guess.
 */

export interface PublicHeroStats {
  colleges: number;
  subjects: number;
  mcqs: number;
  /** ISO timestamp of when these counts were computed (server render time). */
  asOf: string;
}

export interface PublicAnalyticsStats {
  /** Overall accuracy of real students, all-time (0 when no attempts yet). */
  accuracy: number;
  /** Questions answered by real students, all-time. */
  questionsAnswered: number;
  /** Questions answered by real students in the last 30 days. */
  answeredLast30Days: number;
  /** Distinct real students with at least one attempt in the last 7 days. */
  activeStudentsThisWeek: number;
  /** ISO timestamp of when these counts were computed. */
  asOf: string;
}

export interface PublicStats {
  hero: PublicHeroStats;
  board: { entries: LeaderboardEntry[]; stats: LeaderboardStats } | null;
  analytics: PublicAnalyticsStats | null;
}

const TIMEOUT_MS = 8000;

type ServiceClient = ReturnType<typeof createServiceClient>;

interface DemoAccounts {
  ids: string[];
  fullNames: Set<string>;
}

/** The demo roster — the set that must never leak into public-facing numbers. */
async function fetchDemoAccounts(service: ServiceClient): Promise<DemoAccounts | null> {
  const { data, error } = await service
    .from("profiles")
    .select("id, full_name")
    .like("email", `%${DEMO_EMAIL_SUFFIX}`);
  if (error || !data) return null;
  return {
    ids: data.map((d) => d.id),
    fullNames: new Set(
      data.map((d) => (d.full_name ?? "").trim().toLowerCase()).filter(Boolean)
    ),
  };
}

/** True, conservative floors — used only if the DB cannot be reached. */
function fallbackHero(): PublicHeroStats {
  return { colleges: COLLEGES.length, subjects: coveredSubjectCount(), mcqs: 850, asOf: new Date().toISOString() };
}

/**
 * Real community totals for the signed-in dashboard's social-proof bar.
 * Same honesty rules as the landing page: demo accounts excluded from every
 * figure, and null (bar hidden) when the data cannot be verified — a number
 * on screen is always backed by a real query.
 */
export interface CommunityProofStats {
  /** Approved real students (demos excluded). */
  studentsJoined: number;
  /** Real attempts in the last 7 days (demos excluded). */
  answeredThisWeek: number;
  /** Distinct real students with at least one attempt in the last 7 days. */
  activeStudentsThisWeek: number;
  /** ISO timestamp of when these counts were computed. */
  asOf: string;
}

export async function getCommunityProofStats(): Promise<CommunityProofStats | null> {
  let service;
  try {
    service = createServiceClient();
  } catch {
    return null;
  }
  const demos = await fetchDemoAccounts(service);
  if (!demos) return null;
  const excludeDemos = <T extends { not: (col: string, op: string, value: string) => T }>(q: T): T =>
    demos.ids.length > 0 ? q.not("student_id", "in", `(${demos.ids.join(",")})`) : q;

  try {
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const [{ count: approved }, { count: weekAnswers }, weekRows] = await Promise.all([
      service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      excludeDemos(
        service
          .from("question_attempts")
          .select("student_id", { count: "exact", head: true })
          .gte("created_at", since)
      ),
      excludeDemos(
        service.from("question_attempts").select("student_id").gte("created_at", since).limit(2000)
      ).then((r) => r.data ?? []),
    ]);
    if (approved === null || weekAnswers === null) return null;
    return {
      studentsJoined: Math.max(0, approved - demos.ids.length),
      answeredThisWeek: weekAnswers,
      activeStudentsThisWeek: new Set(
        (weekRows ?? []).map((r: { student_id: string | null }) => r.student_id)
      ).size,
      asOf: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getPublicStats(): Promise<PublicStats> {
  let service;
  try {
    service = createServiceClient();
  } catch {
    return { hero: fallbackHero(), board: null, analytics: null };
  }

  const body = async (): Promise<PublicStats> => {
    // The demo roster drives everything else: rows we must never show publicly
    // and totals we must never inflate. If this read fails, we cannot safely
    // build a public board — hide those sections rather than guess.
    const demos = await fetchDemoAccounts(service);
    if (!demos) {
      return { hero: fallbackHero(), board: null, analytics: null };
    }
    const demoIds = demos.ids;
    const demoNameSet = demos.fullNames;

    const [boardRes, subjectsRes, mcqsRes] = await Promise.all([
      service.rpc("leaderboard", { p_limit: 60 }),
      service.from("questions").select("subject"),
      service
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
    ]);
    if (boardRes.error) {
      return { hero: fallbackHero(), board: null, analytics: null };
    }

    const realRows = ((boardRes.data ?? []) as Array<{
      rank: number;
      name: string;
      streak: number | null;
      accuracy: number | null;
      questions: number;
    }>).filter((r) => !demoNameSet.has((r.name ?? "").trim().toLowerCase()));

    const excludeDemo = <T extends { not: (col: string, op: string, value: string) => T }>(q: T): T =>
      demoIds.length > 0 ? q.not("student_id", "in", `(${demoIds.join(",")})`) : q;

    const [{ count: approvedCount }, { count: realTotal }, { count: realCorrect }, { count: realMonth }] =
      await Promise.all([
        service
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
        excludeDemo(
          service.from("question_attempts").select("student_id", { count: "exact", head: true })
        ),
        excludeDemo(
          service
            .from("question_attempts")
            .select("student_id", { count: "exact", head: true })
            .eq("is_correct", true)
        ),
        excludeDemo(
          service
            .from("question_attempts")
            .select("student_id", { count: "exact", head: true })
            .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString())
        ),
      ]);

    // Distinct real students active in the last 7 days (the attempt rows are
    // few enough to fetch and de-duplicate client-side).
    const weekIds = excludeDemo(
      service
        .from("question_attempts")
        .select("student_id")
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
        .limit(2000)
    );
    const { data: weekRows } = await weekIds;
    const activeThisWeek = new Set((weekRows ?? []).map((r) => r.student_id)).size;

    const distinctSubjects = new Set((subjectsRes.data ?? []).map((q) => q.subject).filter(Boolean));
    const publishedCount = mcqsRes.count ?? 0;

    const hero: PublicHeroStats = {
      colleges: COLLEGES.length,
      subjects: distinctSubjects.size > 0 ? distinctSubjects.size : coveredSubjectCount(),
      mcqs: publishedCount > 0 ? publishedCount : 850,
      asOf: new Date().toISOString(),
    };

    const realStudents = approvedCount !== null ? approvedCount - demoIds.length : demoIds.length;
    const board =
      realRows.length > 0
        ? finalizeLeaderboard(
            realRows.map((r) => ({
              rank: r.rank,
              name: r.name,
              streak: r.streak ?? 0,
              accuracy: r.accuracy ?? 0,
              questions: r.questions,
            })),
            realStudents,
            realTotal ?? 0,
            5
          )
        : null;

    const analytics: PublicAnalyticsStats | null =
      realTotal === null || realCorrect === null
        ? null
        : {
            accuracy: realTotal > 0 ? Math.round(((realCorrect ?? 0) / realTotal) * 100) : 0,
            questionsAnswered: realTotal,
            answeredLast30Days: realMonth ?? 0,
            activeStudentsThisWeek: activeThisWeek,
            asOf: new Date().toISOString(),
          };

    return { hero, board, analytics };
  };

  try {
    return await Promise.race([
      body(),
      new Promise<PublicStats>((resolve) =>
        setTimeout(
          () => resolve({ hero: fallbackHero(), board: null, analytics: null }),
          TIMEOUT_MS
        )
      ),
    ]);
  } catch {
    return { hero: fallbackHero(), board: null, analytics: null };
  }
}
