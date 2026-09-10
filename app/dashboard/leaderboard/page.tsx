import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeaderboardForStudent } from "@/lib/leaderboard";
import type { SelfRankInfo } from "@/lib/leaderboard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";

export const metadata: Metadata = { title: "Leaderboard" };

export const dynamic = "force-dynamic";

const EMPTY = {
  entries: [],
  stats: { totalStudents: 0, totalQuestions: 0, avgStreak: 0 },
  self: null as SelfRankInfo | null,
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Decorative page: never let a slow/stalled DB hang the render. The board
  // shows whatever ranked within budget or an honest warm-up state. Top 15
  // only — the community board shows the leaders, not everyone. One call
  // returns both the board and (when the signed-in student is ranked below
  // it) their own rank card data from the same ranked rows.
  const data = await Promise.race([
    getLeaderboardForStudent(user.id).catch(() => EMPTY),
    new Promise<typeof EMPTY>((resolve) => setTimeout(() => resolve(EMPTY), 6000)),
  ]);

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <PageHeader
        eyebrow="Rise through the ranks"
        title="Leaderboard"
        description="Top students by questions solved. Practise every day to protect your streak and climb the board."
      />
      <LeaderboardTable entries={data.entries} stats={data.stats} self={data.self} />
    </div>
  );
}
