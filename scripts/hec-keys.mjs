#!/usr/bin/env node
// hec-keys.mjs — type HEC answer keys by hand, then attach them to the questions that OCR'd cleanly.
//
// Why this exists: the HEC scans print their answer keys as image grids that OCR cannot read (see the
// 2026-11-22 and 2026-11-23 entries in IMPROVEMENT_LOG.md). A person can read those grids in seconds.
// This turns that into keyed questions.
//
// usage:
//   node scripts/hec-keys.mjs list                 # papers, questions parsed, how many can be keyed
//   node scripts/hec-keys.mjs sheet <paper>        # write question-keys/<paper>.tsv to fill in
//   node scripts/hec-keys.mjs apply                # validate + resolve typed letters -> resolved.json
//
// The sheet is TAB separated, one question per line:
//   row <TAB> letter <TAB> in bank <TAB> page <TAB> qno <TAB> stem <TAB> options
// Put a letter (A-D) in the "letter" column and nothing else. `row` is this tool's own unique row
// number: printed question numbers restart in every section of these papers, so they cannot identify
// a question on their own. `in bank` says whether the pipeline currently holds this question as a
// servable row — a key typed on a "no" row has nothing to attach to.
// Regenerating a sheet preserves the letters you have already typed.
//
// Honesty: a letter is attached only where the paper's option text for that letter appears among the
// row's own four options, so a row whose options are ordered differently still gets the right key. A
// question that cannot be matched to exactly one bank row is reported, not guessed at.

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCAN_DIRS = ['data/MCQS/OCR_SCANS', 'data/MCQS/PDF_TEXT'];
const SHEET_DIR = path.join(ROOT, 'question-keys');
const RESOLVED = path.join(SHEET_DIR, 'resolved.json');
const STATUS_DIR = path.join(ROOT, 'data/MCQS_FINAL/by_status');
const LETTERS = ['A', 'B', 'C', 'D'];

export const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// A paper name a person can type: drop the OCR folder prefixes, keep what identifies the paper.
const slug = (name) =>
  name
    .replace(/\.txt$/i, '')
    .replace(/^raw-med-/i, '')
    .replace(/^knowledge base-/i, '')
    .replace(/^usat-m-prep-/i, '')
    .replace(/knowledge base-/gi, '')
    .replace(/with answer keys?/gi, '')
    .replace(/past paper with answer key/gi, 'past-paper')
    .replace(/\bpdf\b|filename[_-].*$/gi, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 60);

// ---------------------------------------------------------------- paper parsing

// Returns [{ row, no, page, stem, opts }]. row is unique and stable for a given file; only questions
// with four distinct options survive, because a key only means something when there are four choices.
export function parsePaper(text) {
  const out = [];
  let cur = null;
  let page = 1;
  let expect = null;

  const flush = () => {
    if (!cur) return;
    const got = Object.keys(cur.opts);
    const distinct = new Set(got.map((k) => norm(cur.opts[k]))).size;
    if (got.length === 4 && distinct === 4 && cur.stem.trim().length > 8) {
      out.push({ ...cur, row: out.length + 1 });
    }
    cur = null;
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const pageMark = line.match(/^-{1,3}\s*PDF page (\d+)/i);
    if (pageMark) {
      flush();
      page = Number(pageMark[1]);
      continue;
    }
    const q = line.match(/^(?:Q\s*)?(\d{1,3})\s*[.)]?\s+(\S.*)$/);
    const opt = line.match(/^([a-dA-D])[a-dA-D]?\s*[).:]\s*(.+)$/);

    if (opt && cur) {
      const letter = opt[1].toUpperCase();
      if (!cur.opts[letter]) cur.opts[letter] = opt[2].trim();
      continue;
    }
    if (q) {
      const n = Number(q[1]);
      const startsQuestion =
        !cur || Object.keys(cur.opts).length >= 2 || expect === null || n === expect || (n > cur.no && n <= cur.no + 3);
      if (startsQuestion) {
        flush();
        cur = { no: n, page, stem: q[2], opts: {} };
        expect = n + 1;
        continue;
      }
    }
    if (cur && !Object.keys(cur.opts).length) cur.stem += ' ' + line;
  }
  flush();
  return out;
}

function papers() {
  const found = new Map();
  for (const dir of SCAN_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (!f.endsWith('.txt') || !/hec|usat|nums/i.test(f)) continue;
      const s = slug(f);
      if (found.has(s)) continue; // OCR_SCANS is the cleaned tier and comes first
      found.set(s, { slug: s, file: path.join(dir, f), text: fs.readFileSync(path.join(abs, f), 'utf8') });
    }
  }
  return [...found.values()];
}

// ---------------------------------------------------------------- bank matching

const toks = (s) =>
  new Set(
    String(s ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

// Unkeyed rows that could take a typed key: four real options and no printed key yet.
function buildBank() {
  if (!fs.existsSync(STATUS_DIR)) throw new Error('data/MCQS_FINAL/by_status is missing — run the pipeline first');
  const exact = new Map();
  const fuzzy = [];
  for (const f of fs.readdirSync(STATUS_DIR)) {
    if (!f.endsWith('.json')) continue;
    const parsed = JSON.parse(fs.readFileSync(path.join(STATUS_DIR, f), 'utf8'));
    for (const r of Array.isArray(parsed) ? parsed : parsed.questions || []) {
      const opts = [r.option_a, r.option_b, r.option_c, r.option_d];
      if (opts.filter(Boolean).length !== 4) continue;
      const k = norm(r.question_text);
      exact.set(k, [...(exact.get(k) ?? []), r]);
      if (!r.correct_answer) fuzzy.push({ row: r, tokens: toks(r.question_text) });
    }
  }
  return { exact, fuzzy };
}

// A parsed question -> the bank row it names, if exactly one does. Exact stem first; then a unique
// token-overlap match with a clear margin over the runner-up. Anything less is left unmatched.
function matchRow(q, bank, cache) {
  const hit = bank.exact.get(norm(q.stem));
  if (hit && hit.length) return { rows: hit, how: 'exact' };
  if (cache.has(q.stem)) return cache.get(q.stem);
  const t = toks(q.stem);
  const scored = bank.fuzzy
    .map((b) => ({ row: b.row, score: jaccard(t, b.tokens) }))
    .filter((x) => x.score >= 0.85)
    .sort((a, b) => b.score - a.score);
  let result = { rows: [], how: 'none' };
  if (scored.length === 1) result = { rows: [scored[0].row], how: 'fuzzy ' + scored[0].score.toFixed(2) };
  else if (scored.length > 1 && scored[0].score - scored[1].score > 0.08)
    result = { rows: [scored[0].row], how: 'fuzzy ' + scored[0].score.toFixed(2) };
  else if (scored.length > 1) result = { rows: [], how: 'ambiguous' };
  cache.set(q.stem, result);
  return result;
}

// ---------------------------------------------------------------- sheets

const sheetPath = (s) => path.join(SHEET_DIR, `${s}.tsv`);

function readSheet(s) {
  const p = sheetPath(s);
  if (!fs.existsSync(p)) return null;
  const map = new Map();
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [row, letter] = line.split('\t');
    if (!/^\d+$/.test(String(row ?? '').trim())) continue;
    const L = String(letter ?? '').trim().toUpperCase();
    if (LETTERS.includes(L)) map.set(Number(row), L);
  }
  return map;
}

function cmdList() {
  fs.mkdirSync(SHEET_DIR, { recursive: true });
  const bank = buildBank();
  const cache = new Map();
  const rows = papers().map((p) => {
    const qs = parsePaper(p.text);
    const typed = readSheet(p.slug);
    const reachable = qs.filter((q) => (matchRow(q, bank, cache).rows || []).length > 0).length;
    return { ...p, qs, reachable, filled: typed ? qs.filter((q) => typed.has(q.row)).length : 0, hasSheet: !!typed };
  });
  rows.sort((a, b) => b.reachable - a.reachable || b.qs.length - a.qs.length);
  console.log('paper'.padEnd(42), 'parsed', 'keyable', 'filled');
  for (const r of rows) {
    console.log(
      r.slug.padEnd(42),
      String(r.qs.length).padStart(6),
      String(r.reachable).padStart(7),
      r.hasSheet ? `${r.filled}/${r.qs.length}` : '—  run: sheet ' + r.slug,
    );
  }
  const total = rows.reduce((n, r) => n + r.reachable, 0);
  const parsed = rows.reduce((n, r) => n + r.qs.length, 0);
  console.log(`\n${rows.length} papers, ${parsed} questions parsed, ${total} of them reachable as bank rows today.`);
}

function cmdSheet(arg) {
  if (!arg) throw new Error('usage: node scripts/hec-keys.mjs sheet <paper>   (see: list)');
  const all = papers();
  const p = all.find((x) => x.slug === arg) ?? all.find((x) => x.slug.includes(arg));
  if (!p) throw new Error(`no paper matching "${arg}". Run: node scripts/hec-keys.mjs list`);

  const qs = parsePaper(p.text);
  if (!qs.length) throw new Error(`${p.slug} parsed no four-option questions; there is nothing to key by hand`);

  const bank = buildBank();
  const cache = new Map();
  fs.mkdirSync(SHEET_DIR, { recursive: true });
  const existing = readSheet(p.slug) ?? new Map();
  const opts = (q) => LETTERS.map((L) => (q.opts[L] ? `${L}) ${q.opts[L]}` : '')).filter(Boolean).join(' | ');
  const lines = [
    '# Put a letter (A-D) in the "letter" column for each question whose key you can read in the PDF.',
    '# "in bank" = yes means the site already holds this question and the key will score it.',
    '# Save this file, then run: node scripts/hec-keys.mjs apply',
    `# paper ${p.slug} | source ${p.file} | ${qs.length} questions`,
    'row\tletter\tin bank\tpage\tqno\tstem\toptions',
    ...qs.map((q) => {
      const m = matchRow(q, bank, cache);
      return `${q.row}\t${existing.get(q.row) ?? ''}\t${m.rows.length ? 'yes' : 'no'}\t${q.page}\t${q.no}\t${q.stem
        .replace(/\s+/g, ' ')
        .slice(0, 130)}\t${opts(q).slice(0, 200)}`;
    }),
  ];
  fs.writeFileSync(sheetPath(p.slug), lines.join('\n') + '\n', 'utf8');
  const keyable = qs.filter((q) => matchRow(q, bank, cache).rows.length).length;
  console.log(
    `wrote question-keys/${p.slug}.tsv — ${qs.length} questions (${keyable} keyable), ${existing.size} letters already filled`,
  );
}

// ---------------------------------------------------------------- apply

function cmdApply() {
  fs.mkdirSync(SHEET_DIR, { recursive: true });
  const bank = buildBank();
  const cache = new Map();

  const resolved = { generated_at: new Date().toISOString(), papers: {} };
  const stemToKey = new Map(); // guards against two papers claiming different keys for one stem
  let attached = 0;
  let identical = 0;
  const notes = [];

  for (const p of papers()) {
    const typed = readSheet(p.slug);
    if (!typed || !typed.size) continue;
    const qs = new Map(parsePaper(p.text).map((q) => [q.row, q]));
    const keys = {};

    for (const [row, letter] of [...typed.entries()].sort((a, b) => a[0] - b[0])) {
      const q = qs.get(row);
      if (!q) { notes.push(`${p.slug} row ${row}: no four-option question at that row`); continue; }
      const answerText = q.opts[letter];
      if (!answerText) { notes.push(`${p.slug} row ${row} (Q${q.no}, p${q.page}): no option ${letter} in the paper text`); continue; }

      const stem = norm(q.stem);
      const previous = stemToKey.get(stem);
      if (previous && previous.letter !== letter) {
        notes.push(`${p.slug} row ${row} (Q${q.no}): another paper already says ${previous.letter} for this stem — left untouched`);
        continue;
      }

      const m = matchRow(q, bank, cache);
      if (!m.rows.length) {
        notes.push(
          m.how === 'ambiguous'
            ? `${p.slug} row ${row} (Q${q.no}): matches more than one bank row — key not used`
            : `${p.slug} row ${row} (Q${q.no}, p${q.page}): question is not a servable bank row, key not used`,
        );
        continue;
      }
      const optionsOf = (r) => [r.option_a, r.option_b, r.option_c, r.option_d];
      const usable = m.rows.filter((r) => optionsOf(r).map(norm).includes(norm(answerText)));
      if (!usable.length) {
        notes.push(`${p.slug} row ${row} (Q${q.no}): answer "${answerText.slice(0, 45)}" matches none of the bank row's options`);
        continue;
      }
      const target = usable[0];
      const bankLetter = LETTERS[optionsOf(target).map(norm).indexOf(norm(answerText))];
      if (target.correct_answer && target.correct_answer !== bankLetter) {
        notes.push(`${p.slug} row ${row} (Q${q.no}): bank row already keyed ${target.correct_answer}, paper says ${bankLetter} — left untouched`);
        continue;
      }
      if (target.correct_answer === bankLetter) identical++;
      if (m.how !== 'exact' || bankLetter !== letter) {
        notes.push(`${p.slug} row ${row} (Q${q.no}): attached via ${m.how}${bankLetter !== letter ? `, option order differs (typed ${letter}, bank ${bankLetter})` : ''}`);
      }

      stemToKey.set(stem, { letter: bankLetter, answer_text: answerText });
      keys[row] = { qno: q.no, page: q.page, letter: bankLetter, stem, answer_text: answerText };
      attached++;
    }

    if (Object.keys(keys).length) resolved.papers[p.slug] = { file: p.file, keys };
  }

  fs.writeFileSync(RESOLVED, JSON.stringify(resolved, null, 1) + '\n', 'utf8');
  console.log(`resolved ${attached} keys across ${Object.keys(resolved.papers).length} papers (${identical} already keyed identically)`);
  console.log('wrote question-keys/resolved.json — now run: node scripts/ingest-pipeline-bank.mjs');
  if (notes.length) {
    console.log(`\n${notes.length} row(s) not attached or attached with a note:`);
    notes.slice(0, 40).forEach((n) => console.log('  ' + n));
    if (notes.length > 40) console.log(`  … ${notes.length - 40} more`);
  }
}

// ---------------------------------------------------------------- cli

const [cmd, ...rest] = process.argv.slice(2);
const runDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename);
if (runDirectly)
  try {
    if (cmd === 'list') cmdList();
    else if (cmd === 'sheet') cmdSheet(rest[0]);
    else if (cmd === 'apply') cmdApply();
    else {
      console.log('usage:\n  node scripts/hec-keys.mjs list\n  node scripts/hec-keys.mjs sheet <paper>\n  node scripts/hec-keys.mjs apply');
      process.exit(cmd ? 1 : 0);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
