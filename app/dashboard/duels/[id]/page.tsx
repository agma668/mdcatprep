import type { Metadata } from "next";
import Link from "next/link";
import { Swords } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getDuelPlay } from "@/app/actions/duels";
import { DuelPlayer } from "@/components/duels/DuelPlayer";

export const metadata: Metadata = { title: "Duel" };

export const dynamic = "force-dynamic";

export default async function DuelPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getDuelPlay(id);

  if ("error" in res) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
        <div className="glass-tile-glow rounded-[var(--radius-xl)] border border-white/10 p-10 text-center">
          <Swords className="mx-auto h-10 w-10 text-white/40" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-extrabold text-white">This duel isn&apos;t available</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">
            {res.error === "Duel not found."
              ? "It may belong to another student, or it no longer exists."
              : res.error}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Link href="/dashboard/leaderboard">
              <Button variant="ghost">Find an opponent</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <DuelPlayer data={res.data} myId={res.data.myId} />
    </div>
  );
}