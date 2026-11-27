import Link from "next/link";
import { BookOpen } from "lucide-react";

import { noteLinkFor } from "@/lib/notes-link";

/**
 * Rendered under a wrong answer's explanation so the student has a next step
 * instead of just a red verdict. Renders nothing for subjects with no notes page.
 */
export function NoteLink({
  subject,
  className = "",
}: {
  subject: string | null | undefined;
  className?: string;
}) {
  const note = noteLinkFor(subject);
  if (!note) return null;

  return (
    <Link
      href={note.href}
      className={`inline-flex items-center gap-1.5 text-sm text-[var(--signal-300)] underline decoration-[var(--signal-500)]/40 underline-offset-4 hover:text-[var(--signal-200)] ${className}`.trim()}
    >
      <BookOpen className="h-4 w-4" aria-hidden="true" />
      {note.label}
    </Link>
  );
}
