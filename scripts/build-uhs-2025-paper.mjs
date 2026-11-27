// Build lib/uhs-2025-paper.ts from the official UHS MDCAT 2025 Paper ID-D PDF.
//
// The paper file carries its own official key (dated 26-10-2025), so question
// text and the answer letter come from one document. Nothing is invented: if a
// question cannot be parsed with four options, or the key has no row for it,
// the build fails instead of shipping a gap.
//
// Run: node scripts/build-uhs-2025-paper.mjs

import fs from "node:fs";
import { execFileSync } from "node:child_process";

const PDF = "data/papers/uhs/2025-paper.pdf";
const OUT = "lib/uhs-2025-paper.ts";
const text = execFileSync("pdftotext", ["-raw", PDF, "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const SECTIONS = [
  { marker: "BIOLOGY", subject: "Biology", count: 81 },
  { marker: "CHEMISTRY", subject: "Chemistry", count: 45 },
  { marker: "PHYSICS", subject: "Physics", count: 36 },
  { marker: "ENGLISH", subject: "English", count: 9 },
  { marker: "LOGICAL REASONING", subject: "Logical Reasoning", count: 9 },
];

// ── key ────────────────────────────────────────────────────────────────────
const start = text.indexOf("OFFICIAL ANSWER KEY");
const end = text.indexOf("Count your wrong answers", start);
const key = new Map();
for (const m of text.slice(start, end === -1 ? undefined : end).matchAll(/(\d{1,3})\.\s*([A-D])/g)) {
  const n = Number(m[1]);
  if (n >= 1 && n <= 180 && !key.has(n)) key.set(n, m[2]);
}

// ── questions ──────────────────────────────────────────────────────────────
const lines = text
  .slice(0, start)
  .split(/\r?\n/)
  .map((l) => l.replace(/\s+/g, " ").trim())
  .filter(Boolean);

const questions = [];
let subject = null;
let current = null;

function flush() {
  if (current) questions.push(current);
  current = null;
}

for (const line of lines) {
  const section = SECTIONS.find((s) => line.startsWith(s.marker));
  if (section) {
    flush();
    subject = section.subject;
    continue;
  }
  if (!subject) continue;
  if (/^mdcatguide|^MDCAT Past Paper|^All MDCAT past papers|^dcatguide/.test(line)) continue;

  const qStart = line.match(/^(\d{1,3})\.\s*(.*)$/);
  if (qStart) {
    const n = Number(qStart[1]);
    const expected = (questions.length + (current ? 1 : 0)) + 1;
    if (n === expected && n >= 1 && n <= 180) {
      flush();
      current = { number: n, subject, stem: qStart[2], opts: {} };
      collect(current, qStart[2]);
      continue;
    }
  }
  if (!current) continue;
  // Option rows can hold a-d; anything before the first option is still stem.
  if (!/\([a-d]\)/.test(line) && Object.keys(current.opts).length === 0) {
    current.stem = `${current.stem} ${line}`.trim();
    continue;
  }
  collect(current, line);
}

function collect(q, line) {
  for (const m of line.matchAll(/\(([a-d])\)\s*([\s\S]*?)(?=\([a-d]\)|$)/g)) {
    const letter = m[1];
    const value = m[2].trim();
    if (value && !q.opts[letter]) q.opts[letter] = value;
  }
}
flush();

// ── assertions ─────────────────────────────────────────────────────────────
const problems = [];
for (let n = 1; n <= 180; n++) {
  const q = questions.find((x) => x.number === n);
  if (!q) problems.push(`Q${n}: missing`);
  else if (Object.keys(q.opts).length !== 4) problems.push(`Q${n}: ${Object.keys(q.opts).length} options`);
  if (!key.has(n)) problems.push(`Q${n}: no key row`);
}
for (const s of SECTIONS) {
  const got = questions.filter((q) => q.subject === s.subject).length;
  if (got !== s.count) problems.push(`${s.subject}: ${got} questions, header says ${s.count}`);
}
const total = questions.length;
console.log(`parsed ${total} questions, ${key.size} key rows`);
if (problems.length) {
  console.error(problems.slice(0, 30).join("\n"));
  console.error(`${problems.length} problems — nothing written`);
  process.exit(1);
}

// ── emit ───────────────────────────────────────────────────────────────────
// pdftotext puts a line break between a formula and its subscript ("CO 2"),
// which reads as a typo on screen. Join only element symbols to their digits;
// ordinary numbers elsewhere ("Rs. 500") never precede a one/two-letter symbol,
// so the pattern cannot eat them.
const ELEMENTS = "CO|H|C|N|O|S|P|F|Cl|Br|I|Na|K|Ca|Mg|Al|Fe|Cu|Zn|Ag";
// Order matters: joining a symbol to its subscript creates new "H2 O" pairs, so
// the symbol-to-symbol merge runs AFTER the subscripts are joined.
const clean = (s) =>
  s
    // "CO 2" -> "CO2"
    .replace(new RegExp(`\\b(${ELEMENTS})\\s(\\d)\\b`, "g"), "$1$2")
    // "H2 O" -> "H2O": a symbol carrying a subscript, then the next symbol
    .replace(/\b(\d?[A-Z][a-z]?\d)\s([A-Z][a-z]?\d?)\b/g, "$1$2")
    // "2H 2" -> "2H2"
    .replace(/\b(\d)([A-Z][a-z]?)\s(\d)\b/g, "$1$2$3")
    // ...which can create a fresh "2H2 O": merge once more to fixpoint.
    .replace(/\b(\d?[A-Z][a-z]?\d)\s([A-Z][a-z]?\d?)\b/g, "$1$2");
const esc = (s) => clean(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const rows = questions
  .sort((a, b) => a.number - b.number)
  .map((q) => `  {
    key: 'uhs2025-d-${String(q.number).padStart(3, "0")}',
    number: ${q.number},
    subject: '${q.subject}',
    question_text: '${esc(q.stem)}',
    option_a: '${esc(q.opts.a)}',
    option_b: '${esc(q.opts.b)}',
    option_c: '${esc(q.opts.c)}',
    option_d: '${esc(q.opts.d)}',
    correct_answer: '${key.get(q.number)}',
  },`)
  .join("\n");

const file = `// UHS MDCAT 2025 — Paper ID-D, as sat: ${total} questions in the printed order.
//
// Source: data/papers/uhs/2025-paper.pdf, which carries the official answer key
// dated 26-10-2025 in the same file. Generated by
// scripts/build-uhs-2025-paper.mjs — do not hand-edit; rerun the script.
//
// No explanations accompany this paper. The bank's hand-written explanations
// cover other questions; inventing one per item here would be worse than
// showing the official key alone.

export type Uhs2025Question = {
  key: string
  number: number
  subject: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  /** Letter from the official key dated 26-10-2025. */
  correct_answer: 'A' | 'B' | 'C' | 'D'
}

export const UHS_2025_PAPER: Uhs2025Question[] = [
${rows}
]

/** The paper's own section split, printed on the paper itself. */
export const UHS_2025_SECTIONS = [
${SECTIONS.map((s) => `  { name: '${s.subject}', questions: ${s.count} },`).join("\n")}
] as const

export const UHS_2025_DURATION_MINUTES = 180
`;

fs.writeFileSync(OUT, file);
console.log(`wrote ${OUT}`);
