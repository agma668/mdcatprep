# 06 — CONTENT AUTHORING (questions, notes, flashcards — the formats)

How content is authored on the cadet site so the practice UI, admin panel and
spaced-repetition engine all work. **MED: use the identical formats with MDCAT
subjects (Biology, Chemistry, Physics, English, Logical Reasoning). Do NOT port
the cadet questions/notes — they are for the other site.**

## 1. The question model

```ts
// Canonical shape (lib/questions.ts + the Supabase `questions` table)
export type QuizQuestion = {
  id?: string;          // DB row id (Supabase bank)
  key?: string;         // stable content key (bundled banks) — uuid v5
  subject: string;      // MED: "Biology" | "Chemistry" | "Physics" | "English" | "Logical Reasoning"
  topic: string | null; // e.g. "Cell Structure", "Chemical Equilibrium"
  question_text: string;
  option_a: string;     // A and B always exist
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;   // 'A' | 'B' | 'C' | 'D'
  explanation: string | null; // ALWAYS write one — it's the learning moment
  difficulty: string | null;  // 'easy' | 'medium' | 'hard'
  college: string | null;     // MED: the target registry, e.g. "UHS" | "KMU" | null for general
};
```

Bundled-bank variant (flat files so questions work offline and render without
a DB round trip):

```ts
// lib/<bank>-questions.ts
export type ResourceQuestion = {
  key: string; subject: string; topic: string;
  question_text: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;      // provenance, e.g. "MDCAT Exam-Style — Biology"
  college?: string;    // optional target tag
};
```

Combine banks in `lib/resources.ts`:

```ts
export const ALL_RESOURCE_QUESTIONS: ResourceQuestion[] = [
  ...BIOLOGY_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...PHYSICS_QUESTIONS,
  ...ENGLISH_QUESTIONS,
  ...LOGICAL_REASONING_QUESTIONS,
];
```

## 2. Deterministic question keys (the load-bearing trick)

Every question carries a **uuid v5 derived once from its question text** under
a fixed project namespace (`scripts/add-question-keys.mjs`). Why:
- Attempts record against the right question without shipping DB uuids or
  looking up by runtime text.
- Keys survive option rebalances (shuffling which letter is correct) and
  explanation edits; only rewriting the question text changes the key — which
  is exactly when it SHOULD become a new question.
- Idempotent: re-running fills only missing keys.

```js
// scripts/add-question-keys.mjs (core)
import { createHash } from 'node:crypto';
const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
function uuidv5(namespace, name) {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  const h = createHash('sha1').update(ns).update(name, 'utf8').digest();
  h[6] = (h[6] & 0x0f) | 0x50; h[8] = (h[8] & 0x3f) | 0x80;
  const hex = h.subarray(0, 16).toString('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
const PROJECT_NAMESPACE = uuidv5(DNS_NAMESPACE, 'med-prep'); // ← per-site namespace
export const questionKey = (t) => uuidv5(PROJECT_NAMESPACE, t);
```

**Answer rebalancing**: correct answers must not sit predominantly on one
letter. The cadet repo has `scripts/` utilities that permute options and fix
`correct_answer` in bulk — the key/text pair stays stable, only letters move.

## 3. Question-writing quality rules (learn from the banks)

The user-built CCH bank (620 MCQs + written bank) follows this recipe — MED
should apply the same standard to MDCAT:

1. **Syllabus-first.** Write from the official syllabus + published paper
   PATTERN (sections, marks, style) — never copy actual paper wording.
2. **Cambridge/PMDC level calibration.** State the assumed level in the bank
   header; MDCAT questions should be concept/application, not recall-only.
3. **Every question carries an explanation** that teaches the rule, not just
   the answer ("Add 5 each time: 24 + 5 = 29", "BODMAS: 15 − 6 + 4 = 13").
4. **Topic granularity that drill UI can filter**: "Intelligence — Number
   Series", "Chemical Equilibrium", "Genetics — Inheritance".
5. **Difficulty mix** per topic (~50% easy, 35% medium, 15% hard) so sessions
   build confidence then stretch.
6. **No duplicate question texts** (the generator asserts uniqueness).
7. **4 distinct options** (asserted), plausible distractors, one defensibly
   correct answer.
8. **Never "past paper" wording claims.** Source strings say "Exam-Style",
   with honest provenance like "written from the official syllabus scope and
   the published paper pattern — NOT extracted from any actual paper".

## 4. Notes format (the renderer contract)

Notes are structured data, not markdown files, so they render consistently and
the gated-pages system can protect them:

```ts
// lib/master-notes.ts
export type NoteBlock = { type: "para" | "bullet"; text: string };
export type NoteTopic = { title: string; blocks: NoteBlock[] };
export type NoteSection = { title: string; topics: NoteTopic[] };

export const KOHAT_PREAMBLE: NoteBlock[] = [
  { type: "para", text: "CADET COLLEGE KOHAT (CCK) — MASTER CONCEPT NOTES" },
  { type: "para", text: "Easy-language notes for Class 8 entry-test preparation" },
  // …
];
export const KOHAT_SECTIONS: NoteSection[] = [
  { title: "1. MATHEMATICS", topics: [
    { title: "Numbers and operations", blocks: [
      { type: "bullet", text: "HCF: largest common factor; LCM: smallest common multiple." },
      // …
    ]},
  ]},
];
export const KOHAT_META = { title: "…", subtitle: "…", badge: "…" } as const;
```

The notes page (`app/dashboard/notes/<college>-master-notes/page.tsx`) renders
preamble → anchor nav of sections → TopicCards; a block whose text starts with
`Think like this:` gets a highlighted callout treatment. Copy that renderer
pattern for MED's MDCAT notes (`lib/mcat-notes.ts` already exists — same
shape).

**Notes voice rules:** easy language first, one idea per bullet, "common trap"
callouts, and the study loop: read → cover the example → explain aloud → solve
3–5 questions → return to traps.

## 5. The notes access gate (monetization without paywalls)

`lib/master-notes-access.ts` — three ways in, checked in order, fail-soft to
LOCKED server-side (the UI lock mirrors it, never replaces it):
1. Admin/staff (`isAdminEmail`).
2. **Referral champion** — invited 5+ joined students (the founder's growth
   unlock; referral codes counted live from signup attribution).
3. **Leaderboard Top 3** — the CURRENT top three hold access while they hold
   rank (a rotating skill perk computed live from the shared ranking RPC).

Copy this gate for MED's premium notes. It converts study-drive into growth
instead of blocking students who can't pay.

## 6. Flashcards + FSRS-lite spaced repetition

`lib/flashcards.ts` is client-safe (zero server imports) — copy whole:

- Four-grade ladder: **Again → <10 min, Hard → 1 day, Good → 3 days, Easy →
  7 days** (seed intervals; per-grade growth multipliers 1.2/2.2/2.9 on
  existing intervals; lapse resets to seed; cap ~6 months).
- `nextSchedule(prev, grade)` is a pure function (unit-testable) — DB writes go
  through `gradeCard` in `flashcards-server.ts`.
- `isMissingTable(err)` detects the honest "not set up yet" failure so the UI
  can branch instead of crashing when migrations haven't run.
- Cards are built FROM questions (question → flashcard) plus a formula deck
  (`lib/formula-deck.ts` — MED: MDCAT formulas as cards).
- Keyboard 1–4 grades the card; the UI shows short interval labels
  (<10m / 1d / 3d / 7d) on the buttons.

The MED repo already has `lib/flashcards/` with a scheduler test — keep that
test green when porting any cadet scheduler improvements.

## 7. DB surfaces the content plugs into

- `questions` table: `status` draft/published/archived, `source`
  admin/ai/imported — AI-generated questions insert as `source='ai',
  status='draft'` and NEVER auto-publish; an admin reviews and publishes.
- `question_attempts` — every answer recorded by `question_key`; powers
  leaderboard, streak wall, analytics, per-topic weakness.
- `notes` table — official vs student notes, `pending_review` queue in admin.
- Offline: the published bank syncs into IndexedDB (service-worker cached) so
  practice works with zero internet; attempts sync back when online
  (`lib/offline-sync.ts`, `components/OfflineSyncHarness.tsx`).

## 8. Admin content management

`app/admin/questions/` — filters by subject/topic/difficulty/status/college,
publish/hide/edit in place, plus coverage panels on the dashboard (by-subject
share bars, by-college split, difficulty spread). Port it as-is; it's what
makes the bank maintainable without SQL.
