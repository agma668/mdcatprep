#!/usr/bin/env node
// extract-hec-official.mjs — pull the questions whose answers HEC actually printed into a tier the
// bank can serve, using the PDF text layer only. No OCR, no key invented.
//
// Two sources, both already on disk and both text-layer clean:
//   1. The five official USAT sample papers in RAW/Med/EDWEB KNOWLEDGE BASE/USAT-M-Prep/
//      Official_HEC_Samples/. Each ends with an "ANSWER KEY" table ("1 A 7 A 13 C 19 C").
//   2. The 48-page HEC past-paper compilation (RAW/Med/HEC PAST PAPER BY NK ACADEMY.pdf): first half
//      prints questions with A-D options, second half prints worked solutions ending "Answer: <value>".
//
// HONESTY RULES
//   * A sample question is emitted only when its number appears in that file's printed key table.
//   * A compilation question is emitted only when its worked answer EXACTLY equals one of its four
//     options (normalised for spacing/punctuation/currency). A near miss is dropped, not rounded.
//   * Four distinct options, no brand name, no scan furniture. Anything else is counted as rejected.
//
// usage: node scripts/extract-hec-official.mjs [--dry]
// Output: data/MCQS_INBOX/parsed/hec_official.json (read by scripts/ingest-pipeline-bank.mjs)

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'data/MCQS_INBOX/parsed/hec_official.json');
const DRY = process.argv.includes('--dry');

const SAMPLES_DIR = 'C:/Users/admin/Downloads/RAW/Med/EDWEB KNOWLEDGE BASE/USAT-M-Prep/Official_HEC_Samples';
const COMPILATION = 'C:/Users/admin/Downloads/RAW/Med/HEC PAST PAPER BY NK ACADEMY.pdf';

// pdfjs lives outside the repo (the pipeline's OCR toolchain dir, then the throwaway local install).
const PDFJS_CANDIDATES = [
  path.join(ROOT, 'node_modules/pdfjs-dist'),
  path.join(ROOT, 'data/MCQS/_pipeline/pdfjs/node_modules/pdfjs-dist'),
  'C:/Users/admin/AppData/Local/Temp/kips-ocr/node/node_modules/pdfjs-dist',
];

const pdfDir = PDFJS_CANDIDATES.find((p) => fs.existsSync(path.join(p, 'legacy/build/pdf.mjs')));
if (!pdfDir) {
  console.error('pdfjs-dist not found. Install it once with:\n  npm install --prefix data/MCQS/_pipeline/pdfjs pdfjs-dist@4');
  process.exit(1);
}
const pdfjs = await import('file:///' + path.join(pdfDir, 'legacy/build/pdf.mjs').replace(/\\/g, '/'));
pdfjs.GlobalWorkerOptions.workerSrc = 'file:///' + path.join(pdfDir, 'legacy/build/pdf.worker.min.mjs').replace(/\\/g, '/');

const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/\brs\.?\b|₹/g, ' ')
    .replace(/[^a-z0-9. ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const BRAND =
  /(?:kips|medexel|medquack|dogar|taleem360|resultpedia|wisegot|prep\s*titans|dhw\s*academy|nk\s*academy|dawar|anees|edweb|camscanner)/i;

// A question that points at a passage or a paragraph cannot be answered from its own text, so it is
// dropped rather than served with no way to read the material it asks about.
const NEEDS_PASSAGE =
  /this (?:pa\s*ra\s*graph|pass\s*age)|the (?:above|adjoining|given) (?:pass\s*age|pa\s*ra\s*graph)|read the (?:following|pass\s*age)|according to the (?:pass\s*age|author|pa\s*ra\s*graph)|in the (?:above|following) (?:pass\s*age|pa\s*ra\s*graph)/i;
const FURNITURE = /^(?:compiled by|page \d+ of \d+|hec preparation\s+\d{4}|sample paper\s*-|answer key|www\.|https?:)/i;

const pages = async (file) => {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)), useSystemFonts: true }).promise;
  const out = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const tc = await (await doc.getPage(p)).getTextContent();
    let buf = '';
    for (const it of tc.items) buf += it.str + (it.hasEOL ? '\n' : ' ');
    out.push(buf.split('\n').map((l) => l.trim()).filter(Boolean));
  }
  await doc.destroy();
  return out;
};

// ---------------------------------------------------------------- official USAT samples

const SUBJECT_OF = [
  [/VERBAL REASONING|ENGLISH/i, 'English'],
  [/QUANTITATIVE|MATHEMATIC/i, 'Mathematics'],
  [/LOGICAL|REASONING/i, 'Reasoning'],
  [/BIOLOGY/i, 'Biology'],
  [/PHYSICS/i, 'Physics'],
  [/CHEMISTRY/i, 'Chemistry'],
];

// A section header is a short all-caps line; instruction paragraphs are sentence case. An all-caps
// header that names no subject the site serves (GENERAL KNOWLEDGE, ISLAMIAT, …) still ENDS the
// previous section: its questions are then dropped rather than inherited into the section above,
// which used to file a capital-city question under Mathematics.
function sectionOf(line) {
  if (line.length > 42 || line !== line.toUpperCase() || !/[A-Z]{4}/.test(line)) return null;
  if (/^[A-Z][A-Z &,'/\-]{3,}$/.test(line)) {
    const hit = SUBJECT_OF.find(([re]) => re.test(line));
    return hit ? hit[1] : 'Unserved';
  }
  return null;
}

function parseSample(pageLines, label) {
  const questions = [];
  const key = new Map();
  let subject = null;
  let cur = null;
  let inKey = false;

  for (const line of pageLines.flat()) {
    if (/^ANSWER KEY/i.test(line)) { inKey = true; continue; }
    if (inKey) {
      for (const m of line.matchAll(/(\d{1,3})\s*[.)]?\s*([A-D])\b/g)) key.set(Number(m[1]), m[2]);
      continue;
    }
    const sec = sectionOf(line);
    if (sec) { subject = sec; continue; }
    if (/^SAMPLE PAPER/i.test(line) || FURNITURE.test(line)) continue;

    const q = line.match(/^(?:Q\s*)?(\d{1,3})\s*[.)]\s+(.+)$/);
    if (q) {
      if (cur) questions.push(cur);
      cur = { n: Number(q[1]), stem: q[2], opts: {}, subject, label };
      continue;
    }
    const o = line.match(/^([A-D])[.)]\s+(.+)$/);
    if (o && cur && !cur.opts[o[1]]) { cur.opts[o[1]] = o[2]; continue; }
    if (cur) {
      if (Object.keys(cur.opts).length === 4) { questions.push(cur); cur = null; }
      else if (Object.keys(cur.opts).length === 0) cur.stem += ' ' + line;
      else {
        // an option's text that wrapped onto the next line
        const last = Object.keys(cur.opts).pop();
        cur.opts[last] += ' ' + line;
      }
    }
  }
  if (cur) questions.push(cur);
  return { questions, key };
}

// ---------------------------------------------------------------- past-paper compilation

function parseCompilation(pageLines) {
  const blocks = [];
  let cur = null;
  for (const line of pageLines.flat()) {
    if (FURNITURE.test(line) || BRAND.test(line) || /^\d{1,2}$/.test(line)) continue;
    const q = line.match(/^(?:Q\s*)?(\d{1,3})\s*[.)]\s+(.+)$/);
    if (q) {
      if (cur) blocks.push(cur);
      cur = { stem: q[2], opts: {}, answer: null, lines: [] };
      continue;
    }
    if (!cur) continue;
    const o = line.match(/^([A-D])[.)]\s*(.+)$/);
    if (o && !cur.opts[o[1]] && !cur.answer) { cur.opts[o[1]] = o[2]; continue; }
    const a = line.match(/^Answer\s*[:.]\s*(.+)$/i);
    if (a) { cur.answer = a[1]; continue; }
    // Before the options start, a line is the question sentence wrapping. After that it is working.
    if (!Object.keys(cur.opts).length && !cur.answer) cur.stem += ' ' + line;
    cur.lines.push(line);
  }
  if (cur) blocks.push(cur);

  // Questions are the blocks with four options and no worked answer; solutions are the rest.
  const questions = blocks.filter((b) => Object.keys(b.opts).length === 4 && !b.answer);
  const solutions = blocks.filter((b) => b.answer && Object.keys(b.opts).length === 0);
  return { questions, solutions };
}

// The compilation prints no section headers, so its subject is decided by a stated rule rather than
// assumed: a word-pair analogy is verbal (English), anything carrying arithmetic is Mathematics, and
// the rest is verbal reasoning. The label is never allowed to change the key, only where it is filed.
function subjectOfCompilation(stem) {
  const s = String(stem);
  if (/\s::\s|\s:\s\w+\s*::/.test(s)) return 'English';
  if (/[0-9]|percent|ratio|average|area|volume|profit|loss|speed|age|probability/i.test(s)) return 'Mathematics';
  return 'Reasoning';
}

// ---------------------------------------------------------------- row building

const rows = [];
const rejected = { noKey: 0, answerNotAnOption: 0, noOptions: 0, brand: 0, short: 0, passage: 0, noSubject: 0, duplicate: 0 };
const SUBJECTS = new Set(['Biology', 'Chemistry', 'Physics', 'English', 'Mathematics', 'Reasoning']);
const seen = new Set();

function push({ stem, opts, letter, label, subject, sourceFile, examTag, answerStatus, page }) {
  const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
  const q = clean(stem);
  const o = ['A', 'B', 'C', 'D'].map((L) => clean(opts[L]));
  if (o.filter(Boolean).length !== 4) { rejected.noOptions++; return; }
  if (new Set(o.map(norm)).size !== 4) { rejected.noOptions++; return; }
  if (q.length < 12) { rejected.short++; return; }
  if (NEEDS_PASSAGE.test(q)) { rejected.passage++; return; }
  if (BRAND.test([q, ...o].join(' '))) { rejected.brand++; return; }
  if (!['A', 'B', 'C', 'D'].includes(letter)) { rejected.noKey++; return; }
  // A section the site does not serve (Pakistan Studies, General Knowledge, Computer Science) keeps its
  // row in this file but is marked unserved: ingest's subject gate skips it, so nothing is mislabelled
  // and nothing is thrown away if those subjects are ever added.
  const served = SUBJECTS.has(subject);
  if (!served) rejected.noSubject++;
  const k = norm(q);
  if (seen.has(k)) { rejected.duplicate++; return; }
  seen.add(k);
  rows.push({
    subject: served ? subject : 'Unserved',
    ...(served ? {} : { needs_subject: true, section: subject }),
    chapter: 'Unplaced',
    question_text: q,
    option_a: o[0],
    option_b: o[1],
    option_c: o[2],
    option_d: o[3],
    correct_answer: letter,
    answer_status: answerStatus,
    visibility: 'public',
    readiness: 'ready',
    tier: 'official',
    source_file: sourceFile,
    source_label: label,
    past_paper_sources: [{ file: label, exam_tag: examTag, year: null, page: page ?? null }],
  });
}

// 1. Official samples
const sampleReport = [];
if (fs.existsSync(SAMPLES_DIR)) {
  for (const f of fs.readdirSync(SAMPLES_DIR).filter((x) => /Sample\.pdf$/i.test(x))) {
    const { questions, key } = parseSample(await pages(path.join(SAMPLES_DIR, f)), f);
    const withKey = questions.filter((q) => key.has(q.n) && Object.keys(q.opts).length === 4);
    const subjectMissing = withKey.filter((q) => !q.subject).length;
    let used = 0;
    for (const q of withKey) {
      const before = rows.length;
      push({
        stem: q.stem,
        opts: q.opts,
        letter: key.get(q.n),
        label: 'Official USAT sample paper (HEC)',
        subject: q.subject,
        sourceFile: `Official_HEC_Samples/${f}`,
        examTag: 'USAT',
        answerStatus: 'official_key',
      });
      if (rows.length > before) used++;
    }
    sampleReport.push({ file: f, parsed: questions.length, keyed: key.size, used, subjectMissing });
    console.log(`${f}: ${questions.length} questions parsed, ${key.size} keys, ${used} rows emitted`);
    if (subjectMissing) console.log(`  note: ${subjectMissing} keyed questions had no section header, filed as Mixed Bank`);
  }
} else {
  console.log('sample directory missing:', SAMPLES_DIR);
}

// 2. Compilation worked answers — only where the printed answer equals an option exactly
const compReport = { questions: 0, solutions: 0, joined: 0, used: 0 };
if (fs.existsSync(COMPILATION)) {
  const { questions, solutions } = parseCompilation(await pages(COMPILATION));
  // The two halves reprint the same question sentence, but the first half wraps it differently from
  // the worked solution, so the join uses the first 60 normalised characters and requires uniqueness.
  // The two halves wrap the same question sentence differently, so several keys are tried in order and
  // the match must be unique at that key. Matching only decides WHICH question is meant; the answer is
  // still accepted only on an exact option match below.
  const index = new Map();
  const addKey = (k, q) => index.set(k, [...(index.get(k) ?? []), q]);
  for (const q of questions) {
    const n = norm(q.stem);
    addKey('full:' + n, q);
    addKey('p60:' + n.slice(0, 60), q);
    addKey('p40:' + n.slice(0, 40), q);
  }
  const lookup = (stem) => {
    const n = norm(stem);
    for (const k of ['full:' + n, 'p60:' + n.slice(0, 60), 'p40:' + n.slice(0, 40)]) {
      const hit = index.get(k) ?? [];
      if (hit.length === 1) return hit[0];
      if (hit.length > 1) return null;
    }
    return null;
  };
  compReport.questions = questions.length;
  compReport.solutions = solutions.length;
  for (const s of solutions) {
    const q = lookup(s.stem);
    if (!q) continue;
    compReport.joined++;
    const want = norm(s.answer);
    const exact = ['A', 'B', 'C', 'D'].filter((L) => q.opts[L] && norm(q.opts[L]) === want);
    if (exact.length !== 1) {
      rejected.answerNotAnOption++;
      if (process.argv.includes('--debug'))
        console.log('  miss:', JSON.stringify({ stem: q.stem.slice(0, 60), answer: s.answer, opts: q.opts }));
      continue;
    }
    const before = rows.length;
    push({
      stem: q.stem,
      opts: q.opts,
      letter: exact[0],
      label: 'HEC past-paper compilation (worked answer)',
      subject: subjectOfCompilation(q.stem),
      sourceFile: path.basename(COMPILATION),
      examTag: 'HEC',
      answerStatus: 'worked_answer',
    });
    if (rows.length > before) compReport.used++;
  }
  console.log(
    `compilation: ${compReport.questions} questions with options, ${compReport.solutions} worked solutions, ` +
      `${compReport.joined} join by stem, ${compReport.used} rows emitted`,
  );
} else {
  console.log('compilation missing:', COMPILATION);
}

console.log('rejected', JSON.stringify(rejected));
const servedRows = rows.filter((r) => !r.needs_subject);
console.log(
  `TOTAL ${rows.length} official rows (${rows.filter((r) => r.answer_status === 'official_key').length} printed key tables, ` +
    `${rows.filter((r) => r.answer_status === 'worked_answer').length} worked answers)`,
);
console.log(`  servable now: ${servedRows.length} | held back for an unserved subject: ${rows.length - servedRows.length}`);

if (!DRY) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1) + '\n', 'utf8');
  console.log('wrote', path.relative(ROOT, OUT));
} else {
  console.log('dry run — nothing written');
}
