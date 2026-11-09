import Link from "next/link";
import { Layers, ArrowUpRight } from "lucide-react";

/**
 * The dashboard must not imply that changing a route creates a persistent
 * student goal. Until student_goals is safely implemented, send students to
 * the canonical Prep Space catalogue and keep profile.exam_target as a
 * separate, editable profile hint.
 */
export function ExamPortalSwitcher() {
  return (
    <Link
      href="/exams"
      aria-label="Browse and choose a preparation space"
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-signal)] bg-[var(--tint-signal)] px-3 py-2 text-xs font-bold text-[var(--signal-200)] shadow-sm transition-colors hover:bg-[var(--signal-500)]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-300)]"
    >
      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
      Choose Prep Space
      <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden="true" />
    </Link>
  );
}
