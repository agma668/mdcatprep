import Link from "next/link";
import { Layers, ArrowUpRight } from "lucide-react";

/**
 * The dashboard must not imply that changing a route creates a persistent
 * student goal. Goals are saved explicitly on /dashboard/goals through the
 * student_goals actions; profile.exam_target stays a separate, editable note.
 */
export function ExamPortalSwitcher() {
  return (
    <Link
      href="/dashboard/goals"
      aria-label="View and manage your preparation goals"
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-signal)] bg-[var(--tint-signal)] px-3 py-2 text-xs font-bold text-[var(--signal-200)] shadow-sm transition-colors hover:bg-[var(--signal-500)]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-300)]"
    >
      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
      My Prep Goals
      <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden="true" />
    </Link>
  );
}
