/**
 * The public notes pages are subject-level and hand-written in `lib/mcat-*-notes.ts`.
 * A wrong answer should lead somewhere the student can actually fix the gap, so we
 * point at the subject page's core-concepts section instead of importing the whole
 * notes corpus into the client bundle.
 *
 * Subjects we have no notes page for deliberately return null: a dead link would be
 * worse than no link.
 */
export type NoteLink = {
  href: string;
  label: string;
};

const NOTES_BY_SUBJECT: Record<string, NoteLink> = {
  biology: {
    href: "/notes/biology#concepts",
    label: "Read the biology notes",
  },
  chemistry: {
    href: "/notes/chemistry#concepts",
    label: "Read the chemistry notes",
  },
  physics: {
    href: "/notes/physics#concepts",
    label: "Read the physics notes",
  },
  english: {
    href: "/notes/english#concepts",
    label: "Read the English notes",
  },
};

export function noteLinkFor(subject: string | null | undefined): NoteLink | null {
  if (!subject) return null;
  return NOTES_BY_SUBJECT[subject.trim().toLowerCase()] ?? null;
}
