// ingest-pipeline-bank.mjs — publish the question bank's import-ready rows to the site.
//
// Input: data/MCQS_FINAL/by_status/ready.json and needs_key.json (written by
// data/MCQS/_pipeline/build_final.mjs).
// Output: lib/pipeline-bank.ts, merged with the other banks in lib/topicals.ts.
//
// HONESTY RULES
//   * Only rows with a stem, four distinct options and (where keyed) exactly one printed key A-D.
//     A question whose source printed no key is served practice-only and is never scored; nothing
//     is ever guessed, and no key is recovered by pattern.
//   * No academy, coaching brand or university name appears in a row. Rows that still name one in the
//     stem or an option are dropped rather than reworded, and chapter labels are syllabus terms only.
//     The founder has confirmed this site is private and personal-use, which is what allows the
//     de-branded rows below to be served at all; the de-branding is the condition, not a courtesy.
//   * Every row keeps a source label describing its own provenance. A private (academy-derived) row
//     gets the generic label — "Keyed collection" / "Practice (no printed key)" — never a brand name.
//
// usage: node scripts/ingest-pipeline-bank.mjs

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const IN = path.join(ROOT, 'data/MCQS_FINAL/by_status/ready.json');
const NEEDS_KEY = path.join(ROOT, 'data/MCQS_FINAL/by_status/needs_key.json');
const OUT = path.join(ROOT, 'lib/pipeline-bank.ts');

if (!fs.existsSync(IN)) {
  console.error('missing', IN, '— run data/MCQS/_pipeline/build_final.mjs first');
  process.exit(1);
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
function hash8(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// Already published: never add the same question twice.
const onSite = new Set();
for (const f of ['lib/topicals-bank.ts', 'lib/founder-bank.ts']) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of src.matchAll(/question_text:\s*'((?:[^'\\]|\\.)*)'/g)) onSite.add(norm(m[1].replace(/\\'/g, "'")));
}

// A brand still visible in a question would defeat the de-branding, so such a row is dropped: editing
// a stem to hide a name is rewriting someone's question, and we do not do that. The bare `academy` /
// `institute` / `college` words matter: a scan header reads "VISIT NK ACADEMY YOUTUBE CHANNEL", and
// none of the named brands below would have matched it.
const BRAND = new RegExp(
  [
    'academy', 'institute', 'college', 'coaching', 'medexel', 'med\\s?excel', 'dawar', 'anees',
    '\\bkips\\b', 'aakash', 'akash', '\\bpgc\\b',
    'nearpeer', 'maqsad', 'dr\\.?\\s*shakeel', 'shakeel', 'edwardes', 'dow\\s+medical', '\\bkmu\\b',
    'horizon', 'superior\\s+group', 'scholar\\s+series', 'medic\\w*\\s+academy', 'noble\\s+academy',
    'punjab\\s+group', 'la\\s*education', 'harvard\\s+academy', 'allied\\s+academy', 'pace\\s+academy',
    '\\bgrip\\b',
  ].join('|'),
  'i'
);

// Scan furniture that is not part of the question: compiler credits, channel plugs, page numbering and
// phone numbers. A stem holding any of this is a bad extraction, not a question.
const JUNK = /compiled\s+by|visit\s+[^.]{0,40}(?:youtube|channel)|page\s+\d+\s+of\s+\d+|\b0\d{10}\b|\b03\d{2}[-\s]?\d{7}\b/i;
const WATERMARK =
  /(scanned\s+by|downloaded\s+from|www\.|https?:\/\/|facebook|whatsapp|@\w+\.(?:com|net|pk))/i;

/**
 * The quality gate. Returns the reason a row cannot be shown, or null if it can. Applied to private
 * rows; the public `ready` tier has already been through its own gate upstream.
 */
function reject(r) {
  const stem = String(r.question_text || '').trim();
  const opts = [r.option_a, r.option_b, r.option_c, r.option_d].map((o) => String(o || '').trim());
  if (stem.length <= 14) return 'stem-too-short';
  if (opts.some((o) => !o)) return 'missing-option';
  if (new Set(opts.map(norm)).size !== 4) return 'duplicate-options';
  if (opts.some((o) => /^[A-D][).:\-]\s+/i.test(o))) return 'option-has-marker';
  // A long unbroken letter run is a dropped-space extraction, not a real word.
  if (/[a-z]{28,}/i.test(stem.replace(/\s+/g, ' '))) return 'glued-words';
  if (WATERMARK.test(stem) || opts.some((o) => WATERMARK.test(o))) return 'watermark-or-url';
  if (BRAND.test([stem, ...opts].join(' '))) return 'brand-name';
  if (JUNK.test([stem, ...opts].join(' '))) return 'scan-furniture';
  if (r.duplicate_of) return 'duplicate';
  // A stem that points at a figure the site does not serve is unanswerable as text, so it stays out
  // until images are supported. The `figure` tier is not read here at all; this catches the phrasings
  // that survive in the other tiers ("illustrated in the diagram below").
  if (/(?:diagram|figure|graph|chart|table|picture|image|circuit)s?\s+(?:below|above|shown|given)/i.test(stem))
    return 'needs-figure';
  return null;
}

const readTier = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')).questions : []);
const ready = readTier(IN);
const needsKey = readTier(NEEDS_KEY);

// Hand-typed keys (scripts/hec-keys.mjs): the HEC scans print their keys as image grids OCR cannot
// read, so a person reads the grid and types the letter. That letter is trusted only where the
// paper's own option TEXT appears among the row's options — so a row whose options are ordered
// differently still gets the correct letter, and a mismatched row is left unkeyed rather than guessed.
const MANUAL = path.join(ROOT, 'question-keys/resolved.json');
const manualKeys = new Map();
if (fs.existsSync(MANUAL)) {
  const doc = JSON.parse(fs.readFileSync(MANUAL, 'utf8'));
  for (const [paper, entry] of Object.entries(doc.papers || {})) {
    for (const k of Object.values(entry.keys || {})) {
      if (k.stem && k.answer_text) manualKeys.set(norm(k.stem), { ...k, paper });
    }
  }
}
let manualApplied = 0;
const withManualKey = (r) => {
  if (r.correct_answer || !manualKeys.size) return r;
  const m = manualKeys.get(norm(r.question_text));
  if (!m) return r;
  const opts = { A: r.option_a, B: r.option_b, C: r.option_c, D: r.option_d };
  const letter = ['A', 'B', 'C', 'D'].find((L) => opts[L] && norm(opts[L]) === norm(m.answer_text));
  if (!letter) return r;
  manualApplied += 1;
  return { ...r, correct_answer: letter, answer_status: 'manual_key' };
};

const publicReady = ready.filter((r) => r.visibility === 'public');
const privateReady = ready.filter((r) => r.visibility !== 'public');
const publicNeedKey = needsKey.filter((r) => r.visibility === 'public').map(withManualKey);
const privateNeedKey = needsKey.filter((r) => r.visibility !== 'public').map(withManualKey);

// Exactly the subjects lib/topicals.ts renders. A row for any other subject would sit in the bank and
// never reach a page, so it is counted as skipped instead of inflating the total. If a subject is
// added to either list it must be added to both.
const subjects = new Set(['Biology', 'Chemistry', 'Physics', 'English', 'Mathematics', 'Reasoning']);
// Chapter labels come from the syllabus, so they never carry a brand; "Unplaced" is filed as a mixed
// bank rather than shown to a student as if it were a named chapter. A label that does carry a brand
// (some sources name the academy in the chapter) falls back to the mixed bank.
const chapterOf = (r) => {
  const c = r.chapter && r.chapter !== 'Unplaced' ? String(r.chapter) : '';
  return c && !BRAND.test(c) && !JUNK.test(c) ? c : 'Mixed Bank';
};

const rows = [];
const skipped = {
  subject: 0, duplicate: 0, badKey: 0, gate: 0, practiceGate: 0, practice: 0,
};
const gateReasons = {};

function admit(r, { idPrefix, source, keyed }) {
  if (!subjects.has(r.subject)) { skipped.subject += 1; return; }
  if (keyed && !['A', 'B', 'C', 'D'].includes(r.correct_answer)) { skipped.badKey += 1; return; }
  if (!keyed && ['A', 'B', 'C', 'D'].includes(r.correct_answer)) { skipped.badKey += 1; return; }
  if (r.visibility !== 'public') {
    const why = reject(r);
    if (why) {
      gateReasons[why] = (gateReasons[why] || 0) + 1;
      if (keyed) skipped.gate += 1; else skipped.practiceGate += 1;
      return;
    }
  } else if (keyed) {
    if (!r.option_a || !r.option_b || !r.option_c || !r.option_d) { skipped.badKey += 1; return; }
  } else if (
    !(
      r.option_a && r.option_b && r.option_c && r.option_d &&
      String(r.question_text || '').length > 14 &&
      new Set([r.option_a, r.option_b, r.option_c, r.option_d].map((x) => norm(x))).size === 4
    )
  ) {
    skipped.practiceGate += 1;
    return;
  }

  const k = norm(r.question_text);
  if (onSite.has(k) || seen.has(k)) { skipped.duplicate += 1; if (!keyed) skipped.practice += 1; return; }
  seen.add(k);

  rows.push({
    id: `${idPrefix}-${hash8(r.subject + '|' + r.question_text)}`,
    subject: r.subject,
    chapter: chapterOf(r),
    question_text: r.question_text,
    option_a: r.option_a,
    option_b: r.option_b,
    option_c: r.option_c,
    option_d: r.option_d,
    correct_answer: keyed ? r.correct_answer : null,
    source: typeof source === 'function' ? source(r) : source,
  });
}

const seen = new Set();

// Public, import-ready rows: exactly as before, so their ids and labels do not churn.
for (const r of publicReady) {
  admit(r, {
    keyed: true,
    idPrefix: 'pipe',
    source: (row) =>
      row.past_paper_sources && row.past_paper_sources.length
        ? 'Question bank — past-paper provenance'
        : 'Question bank — keyed collection',
  });
}

// Private (academy-derived) keyed rows — de-branded, generic label.
for (const r of privateReady) {
  admit(r, { keyed: true, idPrefix: 'acad', source: 'Keyed collection' });
}

// Official sources whose answers the exam body itself printed (scripts/extract-hec-official.mjs): the
// USAT sample answer-key tables, and the past-paper compilation's worked answers where the printed
// answer equals an option exactly. Admitted BEFORE the practice rows so a keyed official version of a
// question claims the stem, instead of being skipped as a duplicate of the unkeyed copy.
const OFFICIAL = path.join(ROOT, 'data/MCQS_INBOX/parsed/hec_official.json');
let officialAdmitted = 0;
if (fs.existsSync(OFFICIAL)) {
  for (const r of JSON.parse(fs.readFileSync(OFFICIAL, 'utf8'))) {
    if (!r.question_text || !['A', 'B', 'C', 'D'].includes(r.correct_answer)) continue;
    const before = rows.length;
    admit(
      { ...r, visibility: 'public' },
      {
        keyed: true,
        idPrefix: r.answer_status === 'official_key' ? 'usat' : 'wick',
        source: r.source_label,
      },
    );
    if (rows.length > before) officialAdmitted += 1;
  }
}

// Unkeyed rows: four real options, no printed key. Served unscored, never guessed — unless a person
// typed the key from a paper that printed one, in which case the row is served scored.
for (const r of publicNeedKey) {
  const keyed = !!r.correct_answer;
  admit(r, {
    keyed,
    idPrefix: keyed ? 'heckey' : 'prac',
    source: keyed ? 'Question bank — printed key, typed from the paper' : 'Question bank — practice (no printed key)',
  });
}
for (const r of privateNeedKey) {
  const keyed = !!r.correct_answer;
  admit(r, {
    keyed,
    idPrefix: keyed ? 'acadkey' : 'acadprac',
    source: keyed ? 'Printed key, typed from the paper' : 'Practice (no printed key)',
  });
}

// The inbox's second extraction (`questions_e.json`): rows from the founder's other MED material. They
// were held back only because their file names marked them as an academy compilation; under the
// private-use ruling they are admitted when they pass the same gate, de-branded like the rest.
const EXTRA = path.join(ROOT, 'data/MCQS_INBOX/parsed/questions_e.json');
if (fs.existsSync(EXTRA)) {
  for (const r of JSON.parse(fs.readFileSync(EXTRA, 'utf8'))) {
    if (!r.question_text) continue;
    const keyed = ['A', 'B', 'C', 'D'].includes(r.correct_answer);
    // These rows carry no `visibility`, so they must be treated as private: the gate runs on all of
    // them, and their id prefix says where they came from.
    const asPrivate = { ...r, visibility: 'private' };
    admit(asPrivate, {
      keyed,
      idPrefix: keyed ? 'ext' : 'extprac',
      source: keyed ? 'Keyed collection' : 'Practice (no printed key)',
    });
  }
}

// TypeScript refuses to infer a union from one huge array literal (TS2590), so the rows are emitted as
// fixed-size typed chunks that are spread once. The published shape is a single array either way.
// Explanations the SOURCE itself carries. Very few rows have one (~100 of 16k): the field is attached
// only when the source wrote it, and nothing is generated. A missing explanation stays missing rather
// than being filled with a plausible-sounding guess.
const EXP = new Map();
const allSubjects = (() => {
  const p = path.join(ROOT, 'data/MCQS/ALL_QUESTIONS/ALL_SUBJECTS.json');
  if (!fs.existsSync(p)) return [];
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  return Array.isArray(j) ? j : j.questions ?? [];
})();
for (const src of [ready, needsKey, allSubjects]) {
  for (const r of src) {
    const e = typeof r.explanation === 'string' ? r.explanation.trim() : '';
    if (e.length > 20 && !EXP.has(norm(r.question_text))) EXP.set(norm(r.question_text), e);
  }
}
let withExplanation = 0;
for (const row of rows) {
  const e = EXP.get(norm(row.question_text));
  if (e) {
    row.explanation = e;
    withExplanation += 1;
  }
}

const CHUNK_SIZE = 500;
const rowText = (r) => `  {
    key: ${q(r.id)},
    subject: ${q(r.subject)},
    chapter: ${q(r.chapter)},
    question_text: ${q(r.question_text)},
    option_a: ${q(r.option_a)},
    option_b: ${q(r.option_b)},
    option_c: ${q(r.option_c)},
    option_d: ${q(r.option_d)},
    correct_answer: ${r.correct_answer ? q(r.correct_answer) : 'null'},
    source: ${q(r.source)},
${r.explanation ? `    explanation: ${q(r.explanation)},\n` : ''}  },`;

const chunks = [];
for (let i = 0; i < rows.length; i += CHUNK_SIZE) chunks.push(rows.slice(i, i + CHUNK_SIZE));
const chunkDecls = chunks
  .map((c, i) => `const CHUNK_${i}: TopicalsQuestion[] = [\n${c.map(rowText).join('\n')}\n];`)
  .join('\n\n');
const body = chunks.map((_, i) => `  ...CHUNK_${i},`).join('\n');

fs.writeFileSync(
  OUT,
  `// PIPELINE BANK — import-ready rows from the question bank, ingested ${new Date().toISOString().slice(0, 10)}.
//
// OWNERSHIP: generated by \`node scripts/ingest-pipeline-bank.mjs\` from
// data/MCQS_FINAL/by_status/ready.json and needs_key.json; hand edits are overwritten. Merged into the
// pages by lib/topicals.ts.
//
// HONESTY: only rows with a stem, four distinct options and (where keyed) a key printed in the source
// are here. A question whose paper printed no key is served practice-only and scores nothing. Rows
// that still name an academy or coaching brand are excluded rather than reworded, and every private
// row carries the generic source label so no brand name reaches a page.

import type { TopicalsQuestion } from './topicals-bank';

${chunkDecls}

export const PIPELINE_BANK: TopicalsQuestion[] = [
${body}
];
`,
);

const byChapter = {};
for (const r of rows) {
  const k = `${r.subject} / ${r.chapter}`;
  byChapter[k] = (byChapter[k] || 0) + 1;
}
const keyed = rows.filter((r) => r.correct_answer).length;
console.log('written', path.relative(ROOT, OUT));
console.log(`published ${rows.length} | keyed ${keyed} | practice-only ${rows.length - keyed} | with source explanation ${withExplanation} | hand-typed keys applied ${manualApplied} | official keyed rows admitted ${officialAdmitted}`);
console.log('skipped', JSON.stringify(skipped));
console.log('gate reasons', JSON.stringify(gateReasons));
console.log(JSON.stringify(byChapter, null, 1));
