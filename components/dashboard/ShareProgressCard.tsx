"use client";

// Dashboard "Share your progress" section — a thin wrapper over the shared
// ProgressShareCardBody (canvas draw + Web Share / download actions live in
// one place; the daily-quiz "Share today's result" control uses the same body).
import { ProgressShareCardBody, type ShareCell } from "@/components/dashboard/ProgressShareCardBody";

export function ShareProgressCard({
  name,
  rank,
  streak,
  accuracy,
  questions,
}: {
  name: string;
  /** Real leaderboard rank (same ranked rows as the board); null only if the
   *  rank lookup failed server-side — the card then shows a dash, never a guess. */
  rank: number | null;
  streak: number;
  accuracy: number;
  questions: number;
}) {
  const cells: ShareCell[] = [
    { label: "Leaderboard rank", value: rank !== null ? `#${rank}` : "#—", accent: true },
    { label: "Study streak", value: `${streak} ${streak === 1 ? "day" : "days"}` },
    { label: "Accuracy", value: `${accuracy}%` },
    { label: "Questions answered", value: questions.toLocaleString() },
  ];

  return (
    <section
      aria-label="Share your progress"
      className="glass-tile-glow rounded-[var(--radius-xl)] border border-white/10 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-white">Share your progress</h2>
          <p className="mt-1 max-w-lg text-sm text-[var(--color-text-muted)]">
            Your real stats — rank, streak, accuracy and questions answered — as a card to post
            on WhatsApp, Instagram or anywhere else.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <ProgressShareCardBody
          title="MY PROGRESS"
          name={name}
          cells={cells}
          shareText={`I've answered ${questions.toLocaleString()} questions on MED Prep.`}
        />
      </div>
    </section>
  );
}
