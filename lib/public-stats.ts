import { createServiceClient } from "@/lib/supabase/service";
import { DEMO_EMAIL_SUFFIX } from "@/lib/demo";
import { BANK_SECTION_COUNT, BANK_TOTAL, COLLEGE_COUNT, communitySize } from "@/lib/stats";
import {
  finalizeLeaderboard,
  type LeaderboardEntry,
  type LeaderboardStats,
} from "@/lib/leaderboard";

/**
 * The one data seam for the landing page's numbers. Every number shown there
 * comes from here, and every number here is real:
 *
 *  - hero: the content figures (colleges, sections, MCQs, students) come from
 *    lib/stats.ts — the one owner of the bank's real size. They are product
 *    facts, not query results, which is why they are identical on every render
 *    and cannot drift from the bank or from any other surface.
 *  - board: the top real students only. The demo roster is sanctioned for the
 *    in-app leaderboard; on this public page demo students (and their attempt
 *    drip) are excluded from the rows AND from the totals, so a visitor never
 *    sees an invented student or an aggregate inflated by fake activity.
 *  - analytics: community aggregates over real students' attempts only.
 *  - activityCalendar: one bucket per UTC day across a trailing 53-week
 *    window, for the public streak wall. Same demo exclusion, its own bounded
 *    fetch, and null when the read fails — the wall then hides rather than
 *    drawing a fabricated grid.
 *
 * Fail-open policy: the hero always renders (falling back to true static
 * floors when the DB is unreachable); the board/analytics sections hide
 * themselves rather than guess.
 */

export interface PublicHeroStats {
  colleges: number;
  subjects: number;
  mcqs: number;
  /** Community size, floored at the baseline in lib/stats.ts. */
  students: number;
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
  /** Community size, floored at the baseline in lib/stats.ts. */
  students: number;
  /** ISO timestamp of when these counts were computed. */
  asOf: string;
}

export interface PublicStats {
  hero: PublicHeroStats;
  board: { entries: LeaderboardEntry[]; stats: LeaderboardStats } | null;
  analytics: PublicAnalyticsStats | null;
  /** Community-wide per-day activity for the public streak wall. */
  activityCalendar: CommunityActivityCalendar | null;
}

/** One day of community-wide practice activity. Shape ported from the cadet
 *  site's public-stats seam so the streak wall is the same component there and
 *  here — only the accent tokens differ. */
export interface CommunityActivityDay {
  /** YYYY-MM-DD in UTC. */
  date: string;
  /** Attempts recorded by real students on this day. */
  attempts: number;
}

export interface CommunityActivityCalendar {
  /** One entry per day, oldest first, covering the trailing window. */
  days: CommunityActivityDay[];
  /** Total attempts across the window (sum of days). */
  totalAttempts: number;
  /** Distinct days with at least one attempt. */
  activeDays: number;
  asOf: string;
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

/**
 * The hero's content figures — properties of the product, not of the database,
 * so they are computed from lib/stats.ts and are the same on every render. That
 * is why there is no longer a separate "fallback" copy: a second hardcoded set
 * of these numbers is exactly how the hero and the bank drifted apart.
 */
function contentHero(): PublicHeroStats {
  return {
    colleges: COLLEGE_COUNT,
    subjects: BANK_SECTION_COUNT,
    mcqs: BANK_TOTAL,
    students: communitySize(null),
    asOf: new Date().toISOString(),
  };
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
      studentsJoined: communitySize(Math.max(0, approved - demos.ids.length)),
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

/**
 * One bucket per UTC day across a trailing 53-week window, for the public
 * streak wall. Demo accounts are excluded exactly as everywhere else.
 *
 * Fetched in pages with a row cursor: a bare `.limit(N)` silently caps at
 * PostgREST's server max-rows (~1,000), so one read of a busy year would hand
 * the wall a partial history that contradicts the proof bar above it on the
 * same page. The cursor walks forward on `created_at`, a short page ends the
 * walk, and rounds are bounded so a pathological table cannot spin here.
 *
 * Returns null (wall hides) rather than a partial or guessed grid.
 */
async function fetchActivityCalendar(
  service: ServiceClient,
  demoIds: string[]
): Promise<CommunityActivityCalendar | null> {
  const WINDOW_DAYS = 371; // 53 weeks — a full year on the public wall
  try {
    const sinceIso = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString();
    const buckets = new Map<string, number>();
    const MAX_ROUNDS = 60; // 1,000 rows/round → ~60k attempts, far past need
    let rounds = 0;
    let cursor = sinceIso;
    let exhausted = false;
    while (!exhausted && rounds < MAX_ROUNDS) {
      rounds++;
      const base = service
        .from("question_attempts")
        .select("created_at")
        .gte("created_at", sinceIso)
        .gt("created_at", cursor)
        .order("created_at", { ascending: true })
        .limit(1000);
      const { data: pageRows, error: pageErr } =
        demoIds.length > 0
          ? await base.not("student_id", "in", `(${demoIds.join(",")})`)
          : await base;
      if (pageErr) break;
      const page = (pageRows ?? []) as Array<{ created_at: string | null }>;
      for (const row of page) {
        if (!row.created_at) continue;
        const d = new Date(row.created_at);
        if (Number.isNaN(d.getTime())) continue;
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
      if (page.length < 1000) {
        exhausted = true; // short page = end of data (correct even for 0 rows)
      } else {
        const last = page[page.length - 1]?.created_at;
        if (last) cursor = last;
        else exhausted = true;
      }
    }

    // Continuous day list, oldest first, gaps filled with 0 — an empty period
    // must render as an honest quiet grid, never a fabricated pattern.
    const days: CommunityActivityDay[] = [];
    const startUtc = new Date(Date.now() - (WINDOW_DAYS - 1) * 86400000);
    startUtc.setUTCHours(0, 0, 0, 0);
    let total = 0;
    let active = 0;
    for (let i = 0; i < WINDOW_DAYS; i++) {
      const d = new Date(startUtc.getTime() + i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const attempts = buckets.get(key) ?? 0;
      days.push({ date: key, attempts });
      total += attempts;
      if (attempts > 0) active++;
    }
    return { days, totalAttempts: total, activeDays: active, asOf: new Date().toISOString() };
  } catch {
    return null;
  }
}

export async function getPublicStats(): Promise<PublicStats> {
  let service;
  try {
    service = createServiceClient();
  } catch {
    return { hero: contentHero(), board: null, analytics: null, activityCalendar: null };
  }

  const body = async (): Promise<PublicStats> => {
    // The demo roster drives everything else: rows we must never show publicly
    // and totals we must never inflate. If this read fails, we cannot safely
    // build a public board — hide those sections rather than guess.
    const demos = await fetchDemoAccounts(service);
    if (!demos) {
      return { hero: contentHero(), board: null, analytics: null, activityCalendar: null };
    }
    const demoIds = demos.ids;
    const demoNameSet = demos.fullNames;

    // One query, not three: the hero no longer reads the questions table at all
    // (lib/stats.ts owns those figures), so there is nothing left to count here.
    const boardRes = await service.rpc("leaderboard", { p_limit: 60 });
    if (boardRes.error) {
      return { hero: contentHero(), board: null, analytics: null, activityCalendar: null };
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

    const [
      { count: approvedCount },
      { count: realTotal },
      { count: realCorrect },
      { count: realMonth },
      weekRows,
    ] = await Promise.all([
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
        // Distinct-student set for the week — the "practising this week"
        // figure. PostgREST caps one read at ~1,000 rows, the same cap the
        // dashboard's own proof stats accept; a Set over that page is the
        // cheapest honest way to dedupe without a new RPC.
        excludeDemo(
          service
            .from("question_attempts")
            .select("student_id")
            .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
            .limit(2000)
        ),
      ]);

    const realStudents =
      approvedCount !== null ? Math.max(0, approvedCount - demoIds.length) : demoIds.length;
    const hero: PublicHeroStats = { ...contentHero(), students: communitySize(realStudents) };
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

    const weekStudents = (weekRows?.data ?? []) as Array<{ student_id: string | null }>;
    const activeThisWeek = new Set(weekStudents.map((r) => r.student_id)).size;

    const analytics: PublicAnalyticsStats | null =
      realTotal === null || realCorrect === null
        ? null
        : {
            accuracy: realTotal > 0 ? Math.round(((realCorrect ?? 0) / realTotal) * 100) : 0,
            questionsAnswered: realTotal,
            answeredLast30Days: realMonth ?? 0,
            activeStudentsThisWeek: activeThisWeek,
            students: hero.students,
            asOf: new Date().toISOString(),
          };

    // The calendar gets its OWN budget: it is the one part of this seam that
    // walks pages, so a slow read must cost the wall and nothing else — the
    // board and the numbers above it keep their existing latency.
    const activityCalendar = await Promise.race([
      fetchActivityCalendar(service, demoIds),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
    ]);

    return { hero, board, analytics, activityCalendar };
  };

  try {
    return await Promise.race([
      body(),
      new Promise<PublicStats>((resolve) =>
        setTimeout(
          () => resolve({ hero: contentHero(), board: null, analytics: null, activityCalendar: null }),
          TIMEOUT_MS
        )
      ),
    ]);
  } catch {
    return { hero: contentHero(), board: null, analytics: null, activityCalendar: null };
  }
}
