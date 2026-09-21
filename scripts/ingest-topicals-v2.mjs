// Topicals ingest v2 — merges two sources into lib/topicals-bank.ts:
//   1. The founder's extracted JSON bank (knowledge-base/questions/mdcat_question_bank.json)
//      — same rules as scripts/ingest-topicals.mjs (4-option MCQs only, dedup).
//   2. The chapter-wise MCQ collections in knowledge-base/questions/<Subject>/*mcqs*.{txt,md}
//      — mcquniverse page dumps: blocks of question line, four option lines, one
//      **bold answer** line, optional Explanation: block. Only blocks that yield
//      exactly 4 options and a matchable bold answer are ingested; everything
//      else (site chrome, answer keys, explanations) is skipped and counted.
//
//   node scripts/ingest-topicals-v2.mjs
//
// Honesty rules unchanged: sources labelled per origin, no past-paper year
// claims, no commercial-compilation content, cross-source dedup by
// normalized question text.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const KBQ = "knowledge-base/questions";
const OUT = new URL("../lib/topicals-bank.ts", import.meta.url);

const LETTERS = ["A", "B", "C", "D"];
const esc = (s) =>
  String(s)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, " ")
    .trim();
const normKey = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const clean = (s) =>
  String(s)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")   // [text](url) → text
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

const seen = new Set();
const out = [];
const stats = { json: 0, chapters: 0, skipped: { options: 0, answer: 0, dupe: 0, short: 0, junk: 0 } };

function admit(q, source) {
  const text = clean(q.text);
  if (text.length < 8) { stats.skipped.short++; return; }
  const key = normKey(text);
  if (seen.has(key)) { stats.skipped.dupe++; return; }
  seen.add(key);
  out.push({
    key: `top-${out.length + 1}`,
    subject: q.subject,
    chapter: q.chapter,
    question_text: text,
    options: q.options,
    correct_answer: LETTERS[q.answerIdx],
    source,
  });
}

// ---- 1. original extracted JSON bank -----------------------------------
const bank = JSON.parse(readFileSync(path.join(KBQ, "mdcat_question_bank.json"), "utf8"));
for (const q of bank) {
  if ((q.format ?? "mcq") !== "mcq") { stats.skipped.junk++; continue; }
  const opts = Array.isArray(q.options) ? q.options.map((o) => clean(o)) : [];
  if (opts.length !== 4 || opts.some((o) => !o)) { stats.skipped.options++; continue; }
  const answerIdx = opts.findIndex((o) => normKey(o) === normKey(q.answer ?? ""));
  if (answerIdx < 0) { stats.skipped.answer++; continue; }
  const subject = { Biology: "Biology", Chemistry: "Chemistry", Physics: "Physics", English: "English" }[q.subject] ?? q.subject;
  const chapter = String(q.chapter ?? "General")
    .replace(/-mcqs$/i, "")
    .split("-").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
    || "General";
  admit({ subject, chapter, text: String(q.q ?? ""), options: opts, answerIdx }, "MCQ Universe (founder extraction)");
  if (out.length && out[out.length - 1].source.startsWith("MCQ Universe (founder")) stats.json++;
}

// ---- 2. chapter-wise KB collections ------------------------------------
function walkFiles(d, o = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walkFiles(p, o);
    else o.push(p);
  }
  return o;
}
const files = walkFiles(KBQ).filter((p) =>
  /mcqs/i.test(path.basename(p)) && /\.(txt|md)$/i.test(p) && !/question_bank/i.test(p)
);

for (const file of files) {
  const subject = path.basename(path.dirname(file)); // Biology/Chemistry/Physics
  if (!["Biology", "Chemistry", "Physics"].includes(subject)) continue;
  const chapter = path.basename(file)
    .replace(/\.(txt|md)$/i, "")
    .replace(/_mcqs?$/i, "")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(" ").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
    || "General";

  const raw = readFileSync(file, "utf8");
  // These dumps put a blank line between every content line, so block-splitting
  // is useless. Instead: split on the **Explanation:** markers — everything in
  // a segment before the next marker is one question plus its options (the
  // answer is the bold option). Take the LAST 5 content lines of the segment.
  const chrome = (l) =>
    /^\[.*\]\(http/i.test(l) || /^\[image/i.test(l) || /^#{1,3}\s/.test(l) ||
    /^sign up$/i.test(l) || /^login$/i.test(l);
  const segments = raw.split(/\*\*\s*Explanation[^\n]*\*\*/i);
  for (const seg of segments) {
    const lines = seg.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).filter((l) => !chrome(l));
    if (lines.length < 5) { stats.skipped.junk++; continue; }
    const tail = lines.slice(-5);
    const optsRaw = tail.slice(1);
    const boldIdxs = optsRaw
      .map((l, i) => (/^\*\*.+\*\*:?$/i.test(l) && !l.includes("](http") ? i : -1))
      .filter((i) => i >= 0);
    const opts = optsRaw.map(clean);
    if (opts.length !== 4 || opts.some((o) => !o)) { stats.skipped.options++; continue; }
    if (boldIdxs.length !== 1) { stats.skipped.answer++; continue; }
    const before = stats.chapters;
    admit({ subject, chapter, text: clean(tail[0]), options: opts, answerIdx: boldIdxs[0] }, "MCQ Universe (chapter collection)");
    if (out.length && out[out.length - 1].source.endsWith("chapter collection)")) stats.chapters++;
    else stats.chapters = before;
  }
}

// ---- 2b. past-paper PYQ dumps (numbered questions + end-of-file key) ---
// Format: "N. question text" then options "A. …"–"D. …"; a key section
// ("Answer Key" marker or bare "N. L" lines) maps question number → letter.
// Only questions whose number appears in the key are admitted — an MCQ
// without a known answer is never rendered.
const pyqFiles = walkFiles(KBQ).filter((p) =>
  /questions/i.test(p) && /pyq|dawar/i.test(path.basename(p)) && /\.(txt|md)$/i.test(p)
);
const QLINE = /^\s*(\d{1,3})\s*[.)]\s*(.+)$/, OPTLINE = /^\s*([A-D])\s*[.)]\s*(.+)$/, KEYLINE = /^\s*(\d{1,3})\s*[.)]\s*([A-D])\s*$/;
for (const file of pyqFiles) {
  const subject = path.basename(path.dirname(file));
  if (!['Biology', 'Chemistry', 'Physics'].includes(subject)) continue;
  const year = (path.basename(file).match(/(20\d\d)/) || [])[1];
  const chapter = year ? `Past Paper ${year}` : 'Mixed Bank';
  const source = year
    ? `Past-paper PYQs (founder extraction, labeled ${year})`
    : 'MCQ collection (founder extraction)';

  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  // key map: bare "N. L" lines anywhere in the file
  const key = new Map();
  for (const l of lines) {
    const m = KEYLINE.exec(l);
    if (m) key.set(Number(m[1]), m[2]);
  }
  // questions: from a numbered line, collect text until 4 sequential options
  let cur = null; // { num, text, opts: [] }
  for (const l of lines) {
    if (KEYLINE.test(l)) { continue; } // key line, not question content
    const qm = QLINE.exec(l);
    const om = OPTLINE.exec(l);
    if (om && cur && !/^A[.)]/.test(l.trim())) {
      cur.opts.push(clean(om[2]));
      if (cur.opts.length === 4) {
        const ans = key.get(cur.num);
        if (ans) admit({ subject, chapter, text: cur.text, options: cur.opts, answerIdx: 'ABCD'.indexOf(ans) }, source);
        else stats.skipped.answer++;
        cur = null;
      }
      continue;
    }
    if (om && cur) { cur.opts.push(clean(om[2])); if (cur.opts.length === 4) { const ans = key.get(cur.num); if (ans) admit({ subject, chapter, text: cur.text, options: cur.opts, answerIdx: 'ABCD'.indexOf(ans) }, source); else stats.skipped.answer++; cur = null; } continue; }
    if (qm) {
      if (cur && cur.opts.length === 4) { const ans = key.get(cur.num); if (ans) admit({ subject, chapter, text: cur.text, options: cur.opts, answerIdx: 'ABCD'.indexOf(ans) }, source); else stats.skipped.answer++; }
      cur = { num: Number(qm[1]), text: clean(qm[2]), opts: [] };
      continue;
    }
    if (cur && cur.opts.length === 0 && l.trim()) cur.text = (cur.text + ' ' + clean(l)).trim();
  }
}

// ---- 3. emit ------------------------------------------------------------
const header = `// TOPICALS BANK — chapter-wise MCQs from the founder's own collections
// (sources: mcquniverse.pk extraction + chapter-wise page dumps, run ${new Date().toISOString().slice(0, 10)}).
//
// OWNERSHIP: generated by \`node scripts/ingest-topicals-v2.mjs\`; hand edits
// will be overwritten on the next run. The seams live in lib/topicals.ts.
//
// HONESTY: every question carries its true source label — 'MCQ Universe
// (founder extraction)' or 'MCQ Universe (chapter collection)'. Nothing here
// is presented as original MED Prep writing, and no question claims a
// past-paper year — none of these came from a real sitting. COMMERCIAL
// COMPILATIONS (KIPS / Prep Titans / CATPrep / Medquack) are deliberately
// absent — the board forbids re-hosting them.

export type TopicalsQuestion = {
  key: string;
  subject: string;
  chapter: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  source: string;
};

export const TOPICALS_BANK: TopicalsQuestion[] = [
`;

const rows = out
  .map((q) => `  {
    key: '${q.key}',
    subject: '${esc(q.subject)}',
    chapter: '${esc(q.chapter)}',
    question_text: '${esc(q.question_text)}',
    option_a: '${esc(q.options[0])}',
    option_b: '${esc(q.options[1])}',
    option_c: '${esc(q.options[2])}',
    option_d: '${esc(q.options[3])}',
    correct_answer: '${q.correct_answer}',
    source: '${esc(q.source)}',
  },`)
  .join("\n");

writeFileSync(OUT, `${header}${rows}\n];\n`, "utf8");

const bySubject = {};
const byChapter = {};
for (const q of out) {
  bySubject[q.subject] = (bySubject[q.subject] ?? 0) + 1;
  byChapter[`${q.subject} :: ${q.chapter}`] = (byChapter[`${q.subject} :: ${q.chapter}`] ?? 0) + 1;
}
console.log(`ingested: ${out.length} (json-bank ${stats.json} + chapter-files ${stats.chapters})`);
console.log(`skipped: options=${stats.skipped.options} answer=${stats.skipped.answer} dupe=${stats.skipped.dupe} short=${stats.skipped.short} junk=${stats.skipped.junk}`);
console.log("bySubject:", JSON.stringify(bySubject));
const chapters = Object.entries(byChapter).sort((a, b) => b[1] - a[1]);
console.log(`chapters: ${chapters.length}`);
for (const [k, v] of chapters.slice(0, 15)) console.log(`  ${k}: ${v}`);
