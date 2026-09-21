/**
 * PUBLIC NOTES SEAM — one registry over the existing Master Notes data.
 *
 * The notes content lives in lib/mcat-notes.ts (light concept notes) and
 * lib/mcat-{biology,chemistry,physics}-notes.ts (exam-depth corpus notes).
 * Until now the only surface that rendered them was the login-walled
 * /dashboard/notes/mdcat-master-notes page, so none of it was crawlable or
 * readable without an account. This file is the data seam for the PUBLIC
 * surfaces (/notes, /notes/[subject]): it imports the existing exports and
 * derives every count at module scope from the real data — nothing is
 * duplicated, nothing is invented.
 *
 * Honesty rules carried over: no fabricated numbers (counts are computed,
 * never literals), and no exam years are claimed for the notes — they are
 * written from the PMDC MDCAT syllabus and past-paper patterns, which is
 * exactly what they say about themselves.
 */

import {
  MCAT_NOTES_PREAMBLE,
  MCAT_NOTES_SECTIONS,
  MCAT_DEEP_SECTIONS,
  type NoteBlock,
  type NoteSection,
  type NoteTopic,
} from './mcat-notes';

export type { NoteBlock, NoteSection, NoteTopic };
export { MCAT_NOTES_PREAMBLE, MCAT_NOTES_SECTIONS, MCAT_DEEP_SECTIONS };

/** One public, crawlable notes page per entry. Order = page order. */
export type PublicNotesSubject = {
  /** URL segment: /notes/biology */
  slug: string;
  /** Display name on cards and in headings. */
  name: string;
  /** PMDC MDCAT weight (marks per 200), as stated on /faq. */
  weight: string;
  emoji: string;
  /** One-line description for cards + metadata. */
  blurb: string;
  /** The light concept notes section (single-topic overview). */
  concept: NoteSection;
  /** The exam-depth corpus sections for this subject. */
  deep: NoteSection[];
};

export const PUBLIC_NOTES_SUBJECTS: PublicNotesSubject[] = [
  {
    slug: 'biology',
    name: 'Biology',
    weight: '80 marks',
    emoji: '🧬',
    blurb:
      'Acellular life, the cell, biological molecules, kingdoms, physiology, evolution and ecology — every PMDC unit, explained in easy language.',
    concept: MCAT_NOTES_SECTIONS[0],
    deep: MCAT_DEEP_SECTIONS.filter((s) => s.title.toLowerCase().startsWith('biology')),
  },
  {
    slug: 'chemistry',
    name: 'Chemistry',
    weight: '56 marks',
    emoji: '⚗️',
    blurb:
      'From moles and stoichiometry through atomic structure, bonding, equilibrium and energetics to organic chemistry — the full PMDC chemistry span.',
    concept: MCAT_NOTES_SECTIONS[1],
    deep: MCAT_DEEP_SECTIONS.filter((s) => s.title.toLowerCase().startsWith('chemistry')),
  },
  {
    slug: 'physics',
    name: 'Physics',
    weight: '56 marks',
    emoji: '⚛️',
    blurb:
      'Vectors to modern physics: measurement, motion, forces, energy, waves, electricity, magnetism and the quantum ideas — every PMDC unit.',
    concept: MCAT_NOTES_SECTIONS[2],
    deep: MCAT_DEEP_SECTIONS.filter((s) => s.title.toLowerCase().startsWith('physics')),
  },
  {
    slug: 'english',
    name: 'English',
    weight: '20 marks',
    emoji: '📖',
    blurb:
      'Grammar essentials, articles and prepositions, vocabulary and sentence patterns — the recurring MDCAT English topics, in plain language.',
    concept: MCAT_NOTES_SECTIONS[3],
    deep: [],
  },
];

/** Subject by slug (null for an unknown slug — callers render notFound()). */
export function publicNotesSubject(slug: string): PublicNotesSubject | null {
  return PUBLIC_NOTES_SUBJECTS.find((s) => s.slug === slug) ?? null;
}

/** Counted from the real data — never a literal. */
export function countTopics(sections: NoteSection[]): number {
  return sections.reduce((n, s) => n + s.topics.length, 0);
}

/** Every block a subject renders, concept + deep combined. */
export function allBlocks(subject: PublicNotesSubject): NoteBlock[] {
  const sections = [subject.concept, ...subject.deep];
  const blocks: NoteBlock[] = [];
  for (const s of sections) {
    for (const t of s.topics) {
      for (const b of t.blocks) blocks.push(b);
    }
  }
  return blocks;
}

export function countBlocks(subject: PublicNotesSubject): number {
  return allBlocks(subject).length;
}
