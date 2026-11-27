// Answer-key reconciliation: official key letters vs the answers our bank holds.
//
// It compares the OPTION TEXT a letter points to, not the letter itself, because
// a letter only means something inside one paper's option order. Where the text
// cannot be resolved the pair is reported as not-comparable instead of agreeing.
//
// Sources (all in data/papers or data/MCQS, hashes in data/papers/manifest.json):
//   KMU 2024 Code A: official key PDF + the parsed code-A paper (200 questions).
//   UHS 2025 ID-D:   the paper PDF carries the official key dated 26-10-2025.
//
// Run: node scripts/reconcile-answer-keys.mjs [--json out.json]

import fs from "node:fs";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const jsonFlag = args.indexOf("--json");

function pdfText(file, raw = true) {
  return execFileSync("pdftotext", [...(raw ? ["-raw"] : ["-layout"]), file, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normOption = (s) => norm(s).replace(/^[a-d] /, "");

function tokens(s) {
  return new Set(normOption(s).split(" ").filter((t) => t.length > 1));
}

/** Overlap of two option texts; used because our extraction sometimes appends the
 *  next option ("…chromatids C.") or drops a digit, and the letter can still be
 *  right while the text is damaged. */
function overlap(a, b) {
  const A = tokens(a);
  const B = tokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared += 1;
  return shared / Math.max(A.size, B.size);
}

/** Signs that an option set was extracted badly: an empty option, another
 *  option's marker inside a cell, or a bare number where a decimal was lost. */
function optionIssues(q) {
  const issues = [];
  for (const letter of ["a", "b", "c", "d"]) {
    const text = q[`option_${letter}`];
    if (!text || !norm(text)) issues.push(`${letter}-empty`);
    else if (/\s[a-d]\s*[.)]\s*$/i.test(text) || /\([a-d]\)/i.test(text)) issues.push(`${letter}-merged`);
  }
  return issues;
}

// ─────────────────────────── KMU 2024 Code A ────────────────────────────────
function parseKmuKey() {
  const text = pdfText("data/papers/kmu/2024-answer-key.pdf", false);
  const key = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(\d{1,3})\s+([a-d].*)$/i);
    if (!m) continue;
    // Four code columns, separated by runs of spaces. A cell can itself hold
    // two answers ("a,b") when the board accepted either, so cells are split on
    // 2+ spaces and only the Code A column is read here.
    const cells = m[2].trim().split(/\s{2,}/);
    const codeA = (cells[0] || "")
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => /^[A-D]$/.test(c));
    if (codeA.length >= 1) key.set(Number(m[1]), codeA);
  }
  return key;
}

function reconcileKmu() {
  const key = parseKmuKey();
  const parsed = JSON.parse(fs.readFileSync("data/MCQS/_sources/extra/kmu2024_code_a.json", "utf8"));
  const rows = [];
  for (const q of parsed.questions) {
    const official = key.get(q.number);
    if (!official) {
      rows.push({ number: q.number, status: "no-key-row" });
      continue;
    }
    const ours = (q.correct_answer || "").toUpperCase();
    if (!ours) {
      rows.push({ number: q.number, status: "we-have-no-answer" });
      continue;
    }
    if (official.length > 1) {
      rows.push({
        number: q.number,
        status: "key-ambiguous",
        ours,
        official: official.join("/"),
        agree: official.includes(ours),
      });
      continue;
    }
    rows.push({
      number: q.number,
      status: "compared",
      ours,
      official: official[0],
      agree: official[0] === ours,
      text: q.question_text,
    });
  }
  const compared = rows.filter((r) => r.status === "compared");
  const ambiguous = rows.filter((r) => r.status === "key-ambiguous");
  const agree = compared.filter((r) => r.agree).length + ambiguous.filter((r) => r.agree).length;
  return {
    paper: "KMU MDCAT 2024 — Code A",
    keyRows: key.size,
    bankRows: parsed.questions.length,
    compared: compared.length,
    ambiguous: ambiguous.length,
    agree,
    disagree: compared.length + ambiguous.length - agree,
    mismatches: compared.filter((r) => !r.agree).slice(0, 40),
    missing: rows.filter((r) => r.status !== "compared" && r.status !== "key-ambiguous").slice(0, 10),
  };
}

/** Match the paper's own questions against corpus rows that did NOT come from
 *  that paper, then compare those independent answers to the official key. This
 *  is the only comparison that is not circular. */
function independentAgreement(paperQs, key, corpus, excludeFragment) {
  let considered = 0;
  let comparable = 0;
  let agree = 0;
  const mismatches = [];
  for (const q of paperQs) {
    const near = nearest(corpus, q.stem);
    if (!near) continue;
    considered += 1;
    const official = key.get(q.number);
    if (!official) continue;
    const independent = near.rows.filter(
      (r) => !(r.past_paper_sources || []).some((s) => (s.file || "").includes(excludeFragment)),
    );
    const answers = [...new Set(independent.map((r) => (r.correct_answer || "").toUpperCase()).filter(Boolean))];
    if (answers.length !== 1) continue;
    const row = independent.find((r) => (r.correct_answer || "").toUpperCase() === answers[0]);
    const text = q.opts[official[0].toLowerCase()];
    if (!row || !text) continue;
    const ourText = row[`option_${answers[0].toLowerCase()}`];
    if (overlap(ourText, text) >= 0.6) {
      comparable += 1;
      agree += 1;
    } else {
      const best = ["a", "b", "c", "d"]
        .map((l) => ({ l: l.toUpperCase(), s: overlap(row[`option_${l}`], text) }))
        .sort((x, y) => y.s - x.s)[0];
      if (best.s >= 0.75 && best.s - overlap(ourText, text) >= 0.25) {
        comparable += 1;
        mismatches.push({ number: q.number, ours: answers[0], official: official[0], ourText, paperText: text, stem: q.stem, file: (row.past_paper_sources || [])[0]?.file });
      }
    }
  }
  return { considered, comparable, agree, mismatches };
}

// ─────────────────────────── UHS 2025 ID-D ─────────────────────────────────
function parseUhsKey() {
  const text = pdfText("data/papers/uhs/2025-paper.pdf");
  const start = text.indexOf("OFFICIAL ANSWER KEY");
  const end = text.indexOf("Count your wrong answers", start);
  const block = text.slice(start, end === -1 ? undefined : end);
  const key = new Map();
  for (const m of block.matchAll(/(\d{1,3})\.\s*([A-D])/g)) {
    key.set(Number(m[1]), m[2]);
  }
  return key;
}

function parseUhsPaper() {
  const text = pdfText("data/papers/uhs/2025-paper.pdf").replace(/\[\d+\]/g, " ");
  const lines = text.split(/\r?\n/);
  const questions = [];
  let current = null;
  for (const line of lines) {
    const qstart = line.match(/^\s*(\d{1,3})\.\s*(.*)$/);
    if (qstart && Number(qstart[1]) >= 1 && Number(qstart[1]) <= 180) {
      if (current) questions.push(current);
      current = { number: Number(qstart[1]), stem: qstart[2], opts: {} };
      // Options may share the question line.
      collectOptions(current, qstart[2]);
      continue;
    }
    if (!current) continue;
    collectOptions(current, line);
  }
  if (current) questions.push(current);
  return questions.filter((q) => Object.keys(q.opts).length === 4);
}

function collectOptions(q, line) {
  const re = /\(([a-d])\)\s*([\s\S]*?)(?=\([a-d]\)|$)/g;
  let m;
  while ((m = re.exec(line))) {
    const letter = m[1];
    const text = m[2].replace(/\s+/g, " ").trim();
    if (text && !q.opts[letter]) q.opts[letter] = text;
  }
}

function loadCorpus() {
  const dir = "data/MCQS/ALL_QUESTIONS";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const byStem = new Map();
  const all = [];
  let total = 0;
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
    for (const q of j.questions || []) {
      total += 1;
      const key = norm(q.question_text);
      if (key.length < 20) continue;
      const tokensOf = key.split(" ").filter((t) => t.length > 2);
      const row = { q, key, tokens: new Set(tokensOf) };
      const list = byStem.get(key) || [];
      list.push(q);
      byStem.set(key, list);
      all.push(row);
    }
  }
  return { byStem, all, total };
}

function jaccard(a, b) {
  let shared = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const t of small) if (large.has(t)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/** Nearest corpus row to a paper stem. Exact normalised text wins; otherwise
 *  the best token overlap, provided it clears the floor and is clearly ahead of
 *  the runner-up (a tie is an ambiguity, not a match). */
function nearest(corpus, stem) {
  const key = norm(stem);
  const exact = corpus.byStem.get(key);
  if (exact && exact.length) return { rows: exact, score: 1, exact: true };
  const tokensOf = new Set(key.split(" ").filter((t) => t.length > 2));
  if (tokensOf.size < 4) return null;
  let best = 0;
  let second = 0;
  let bestRows = [];
  for (const row of corpus.all) {
    const score = jaccard(tokensOf, row.tokens);
    if (score > best) {
      second = best;
      best = score;
      bestRows = [row.q];
    } else if (score === best) {
      bestRows.push(row.q);
    } else if (score > second) second = score;
  }
  if (best < 0.7 || best - second < 0.05) return null;
  return { rows: bestRows, score: best, exact: false };
}

function reconcileUhs() {
  const key = parseUhsKey();
  const paper = parseUhsPaper();
  const corpus = loadCorpus();
  const total = corpus.total;
  let matched = 0;
  let fuzzy = 0;
  let comparable = 0;
  let agree = 0;
  const mismatches = [];
  const unmatched = [];
  const noAnswer = [];
  const corrupted = [];
  const bySource = new Map();

  for (const q of paper) {
    const near = nearest(corpus, q.stem);
    if (!near) {
      unmatched.push(q.number);
      continue;
    }
    const candidates = near.rows;
    if (!near.exact) fuzzy += 1;
    matched += 1;
    const official = key.get(q.number);
    if (!official) {
      unmatched.push(q.number);
      continue;
    }
    // A stem that appears twice in the bank with different answers cannot be
    // adjudicated automatically; report it instead of picking one.
    const answers = [...new Set(candidates.map((c) => (c.correct_answer || "").toUpperCase()).filter(Boolean))];
    if (answers.length === 0) {
      noAnswer.push(q.number);
      continue;
    }
    if (answers.length > 1) {
      mismatches.push({ number: q.number, status: "bank-self-conflict", answers, official, stem: q.stem });
      continue;
    }
    const ours = answers[0];
    const ourRow = candidates.find((c) => (c.correct_answer || "").toUpperCase() === ours);
    const paperText = q.opts[official.toLowerCase()];
    if (!ourRow || !paperText) {
      noAnswer.push(q.number);
      continue;
    }
    // Judge the option our stored letter actually points at first. Only when
    // that option does not match the keyed text, and another option matches it
    // clearly better, is this a real answer disagreement. A tie is ambiguous
    // option text, not a wrong answer — many stems share option wording.
    const ourText = ourRow[`option_${ours.toLowerCase()}`];
    const ourScore = overlap(ourText, paperText);
    let best = { letter: null, score: 0 };
    for (const letter of ["a", "b", "c", "d"]) {
      const score = overlap(ourRow[`option_${letter}`], paperText);
      if (score > best.score) best = { letter: letter.toUpperCase(), score };
    }
    const issues = optionIssues(ourRow);
    if (issues.length) corrupted.push(q.number);
    if (ourScore >= 0.6) {
      comparable += 1;
      agree += 1;
      const file = (ourRow.past_paper_sources || [])[0]?.file || "unknown";
      const source = `${ourRow.answer_source || "null"} @ ${file.split(/[\\/]/).pop()}`;
      const bucket = bySource.get(source) || { compared: 0, agree: 0 };
      bucket.compared += 1;
      bucket.agree += 1;
      bySource.set(source, bucket);
      continue;
    }
    if (best.score >= 0.75 && best.score - ourScore >= 0.25 && best.letter !== ours) {
      comparable += 1;
      mismatches.push({
        number: q.number,
        status: "disagree",
        ours,
        official,
        keyedOptionMatchesOur: best.letter,
        ourText,
        paperText,
        stem: q.stem,
      });
      continue;
    }
    noAnswer.push(q.number);
  }

  return {
    paper: "UHS MDCAT 2025 — Paper ID-D",
    keyRows: key.size,
    paperQuestions: paper.length,
    bankSize: total,
    matched,
    comparable,
    agree,
    disagree: comparable - agree,
    noAnswer: noAnswer.length,
    unmatched: unmatched.length,
    fuzzyMatched: fuzzy,
    optionCorrupted: corrupted.length,
    bySource: Object.fromEntries(bySource),
    mismatches: mismatches.slice(0, 40),
  };
}

// ─────────────────────────────── report ────────────────────────────────────
function pct(a, b) {
  return b === 0 ? null : Number(((a / b) * 100).toFixed(1));
}

function line(r) {
  const compared = r.compared ?? r.comparable;
  const p = pct(r.agree, compared);
  return `${r.paper}: ${r.agree}/${compared} comparable answers agree${p === null ? "" : ` (${p}%)`}; ${r.disagree} disagree.`;
}

function corpusQuality() {
  const dir = "data/MCQS/ALL_QUESTIONS";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  let total = 0;
  let answered = 0;
  let explained = 0;
  let fourOptions = 0;
  let allThree = 0;
  let explanationsEmpty = 0;
  const byStem = new Map();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
    for (const q of j.questions || []) {
      total += 1;
      const answer = /^[A-D]$/.test((q.correct_answer || "").toUpperCase());
      const explanation = typeof q.explanation === "string" && q.explanation.trim().length > 20;
      const options = ["a", "b", "c", "d"].every((l) => norm(q[`option_${l}`]).length > 0);
      if (answer) answered += 1;
      if (explanation) explained += 1;
      else if (q.explanation === null || q.explanation === "") explanationsEmpty += 1;
      if (options) fourOptions += 1;
      if (answer && explanation && options) allThree += 1;
      const key = norm(q.question_text);
      if (key.length > 20) {
        const set = byStem.get(key) || new Set();
        set.add((q.correct_answer || "").toUpperCase() || "-");
        byStem.set(key, set);
      }
    }
  }
  const conflicts = [...byStem.values()].filter((s) => s.size > 1).length;
  return { total, answered, explained, fourOptions, allThree, explanationsEmpty, conflictingStems: conflicts };
}

function bankFileQuality() {
  const out = [];
  for (const file of ["lib/topicals-bank.ts", "lib/founder-bank.ts", "lib/pipeline-bank.ts"]) {
    const text = fs.readFileSync(file, "utf8");
    const rows = (text.match(/\bkey: '/g) || []).length;
    const explanations = (text.match(/\bexplanation:\s*'/g) || []).length;
    const answers = (text.match(/correct_answer:\s*'[A-D]'/g) || []).length;
    out.push({ file, rows, explanations, answers });
  }
  return out;
}

const kmu = reconcileKmu();
const uhs = reconcileUhs();

// Independent (non-circular) checks: the same stems answered by a DIFFERENT
// document than the key under test.
const kmuParsed = JSON.parse(fs.readFileSync("data/MCQS/_sources/extra/kmu2024_code_a.json", "utf8"));
const kmuIndependent = independentAgreement(
  kmuParsed.questions.map((q) => ({
    number: q.number,
    stem: q.question_text,
    opts: { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d },
  })),
  parseKmuKey(),
  loadCorpus(),
  "kmu_mdcat_2024_code_a",
);
const uhsIndependent = independentAgreement(
  parseUhsPaper(),
  parseUhsKey(),
  loadCorpus(),
  "uhs/2025-paper",
);
const quality = corpusQuality();
const banks = bankFileQuality();

console.log(line(kmu));
console.log(`  key rows parsed: ${kmu.keyRows}; bank rows: ${kmu.bankRows}; ambiguous key rows: ${kmu.ambiguous}`);
console.log(line(uhs));
console.log(
  `  paper questions parsed: ${uhs.paperQuestions}; key rows: ${uhs.keyRows}; stems matched in bank: ${uhs.matched}; not comparable: ${uhs.noAnswer}; unmatched stems: ${uhs.unmatched}; matched rows with corrupted options: ${uhs.optionCorrupted}`,
);
console.log("\nKMU mismatches:", kmu.mismatches.length);
for (const m of kmu.mismatches.slice(0, 8)) console.log(`  Q${m.number} ours=${m.ours} official=${m.official} :: ${m.text}`);
console.log("\nUHS mismatches:", uhs.mismatches.length);
for (const m of uhs.mismatches.slice(0, 8)) {
  console.log(`  Q${m.number} ${m.status} ours=${m.ours ?? "-"} official=${m.official ?? "-"} :: ${m.stem}`);
}

console.log("\nIndependent (answer came from a different document than the key):");
console.log(`  KMU 2024 Code A: ${kmuIndependent.agree}/${kmuIndependent.comparable} agree · stems seen elsewhere: ${kmuIndependent.considered}`);
for (const m of kmuIndependent.mismatches.slice(0, 10)) console.log(`    Q${m.number} ours=${m.ours} official=${m.official} :: ${m.stem} [${m.file}]`);
console.log(`  UHS 2025 ID-D: ${uhsIndependent.agree}/${uhsIndependent.comparable} agree · stems seen elsewhere: ${uhsIndependent.considered}`);
for (const m of uhsIndependent.mismatches.slice(0, 10)) console.log(`    Q${m.number} ours=${m.ours} official=${m.official} :: ${m.stem} [${m.file}]`);

console.log("\nUHS agreement by where our answer came from:");
for (const [source, b] of Object.entries(uhs.bySource)) console.log(`  ${source}: ${b.agree}/${b.compared}`);

console.log("\nCorpus quality (data/MCQS/ALL_QUESTIONS):");
console.log(
  `  ${quality.total} questions · answer letter: ${quality.answered} (${pct(quality.answered, quality.total)}%) · explanation: ${quality.explained} (${pct(quality.explained, quality.total)}%) · four non-empty options: ${quality.fourOptions} (${pct(quality.fourOptions, quality.total)}%) · all three: ${quality.allThree} (${pct(quality.allThree, quality.total)}%)`,
);
console.log(`  stems carrying conflicting answers: ${quality.conflictingStems}`);
console.log("\nPublished bank files:");
for (const b of banks) console.log(`  ${b.file}: ${b.rows} rows · answers ${b.answers} · explanations ${b.explanations}`);

if (jsonFlag !== -1) {
  const out = args[jsonFlag + 1] || "docs/answer-key-reconciliation.json";
  fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), kmu, uhs, quality, banks }, null, 2));
  console.log(`\nwrote ${out}`);
}
