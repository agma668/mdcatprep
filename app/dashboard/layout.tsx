import type { Metadata } from "next";
import { getStudentProfile } from "@/lib/student";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getLeaderboard } from "@/lib/leaderboard";
import { SummerCampNotification } from "@/components/dashboard/SummerCampNotification";
import { SWRegistrar } from "@/components/dashboard/SWRegistrar";

// The sidebar leaderboard is decorative — if the shared DB stalls, render
// the dashboard without it rather than hanging every page on the skeleton.
const EMPTY_LEADERBOARD = { entries: [], stats: { totalStudents: 0, totalQuestions: 0, avgStreak: 0 } };
const LEADERBOARD_TIMEOUT_MS = 6000;

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | MED Prep Dashboard",
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ profile }, leaderboard] = await Promise.all([
    getStudentProfile(),
    Promise.race([
      getLeaderboard().catch(() => EMPTY_LEADERBOARD),
      new Promise<typeof EMPTY_LEADERBOARD>((resolve) =>
        setTimeout(() => resolve(EMPTY_LEADERBOARD), LEADERBOARD_TIMEOUT_MS)
      ),
    ]),
  ]);

  return (
    <div className="min-h-screen flex bg-dashboard">
      <SWRegistrar />
      <SummerCampNotification />
      <Sidebar
        profile={{
          full_name: profile?.full_name ?? null,
          email: profile?.email ?? null,
          exam_target: profile?.exam_target ?? null,
          status: profile?.status ?? null,
        }}
        leaderboard={leaderboard}
      />

      <main
        id="main-content"
        className="flex-1 min-w-0 pt-14 md:pt-0 pb-20 md:pb-0"
      >
        {children}
      </main>
    </div>
  )
}
