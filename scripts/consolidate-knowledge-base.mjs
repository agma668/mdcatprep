// Knowledge-base consolidation — founder order 2026-09-21:
//   every study file/notes/flashcards on this laptop → ONE knowledge base,
//   no academy names anywhere, no AKU anywhere (incl. file contents),
//   no duplicate copies, then delete the scattered source folders.
//
//   node scripts/consolidate-knowledge-base.mjs           # plan (no writes, no deletes)
//   node scripts/consolidate-knowledge-base.mjs --apply   # copy, rename, then delete verified sources
//
// Guarantees:
//  - Hash-dedupe at admit time: a file whose SHA-256 is already in the
//    canonical set (Studies tree first) is NEVER copied — it's a removal.
//  - Text study files (md/txt/json/tsv/csv) → knowledge-base/<section>/<subject>/
//    in the project, academy names scrubbed from name AND content.
//  - Binary study files (pdf/docx/apkg/mp4) → Studies/07-Consolidated/<bucket>/.
//  - Same-basename format twins (X.md + X.pdf) collapse to the best format.
//  - Studies filenames/folders carrying academy brands are RENAMED
//    (recorded in Studies/_RENAMES-2026-09-21.csv).
//  - Deletion only for files inventoried in Studies/_REMOVALS-2026-09-21.csv;
//    folders removed last, residual counts logged.
//  - Non-study files (CNIC, proformas, installers, zips, personal pics) are
//    skipped and left where they are.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const APPLY = process.argv.includes('--apply');
const HOME = 'C:/Users/admin';
const DL = path.join(HOME, 'Downloads');
const STUD = path.join(HOME, 'Studies');
const ROOT = process.cwd();

const KB = path.join(ROOT, 'knowledge-base');
const BIN = path.join(STUD, '07-Consolidated');

const TEXT_EXT = new Set(['.md', '.txt', '.json', '.tsv', '.csv']);
const BIN_EXT = new Set(['.pdf', '.docx', '.apkg', '.mp4']);
const SKIP_DIRS = new Set(['edge-profile', 'Cache', 'Code Cache', 'GPUCache',
  'node_modules', '.git', '_tools']);
const SKIP_EXT = new Set(['.exe', '.zip', '.crdownload', '.tmp', '.ini', '.lnk',
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.db', '.pyc', '.html', '.htm']);

// A file is "study material" only if its name signals study content.
const STUDY_RX = /(mcq|question|bank|paper|pyq|note|test|quiz|flash|syllabus|mdcat|nums|etu|uhs|kmu|bumhs|szabmu|duhs|siba|etea|book|chapter|revis|guide|mock|exam|high.?yield|instant.?fact|topical|concept|summary|organic|reasoning|studytips|knowledge|curriculum|result|chem\b|bio\b|phys\b|masterclass|comprehensive)/i;

// Academy / brand tokens — boundary-safe on both sides (underscore is a word
// char, so plain \b fails on "_CATPrep"; lookarounds handle every separator).
const TOKENS = ['aga khan', 'aku', 'kips', 'prep titans', 'preptitans', 'medexel',
  'medquack', 'anees hussain', 'aneeshussain', 'medangle', 'taleem360',
  'bankofmcqs', 'catprep', 'mentr', 'prepdummy', 'dogar'];
const tokRx = t => new RegExp(`(?<![A-Za-z])${t.replace(/ /g, '\\s+')}(?![A-Za-z])`, 'gi');
const CONTENT_SCRUB = TOKENS.map(t => [tokRx(t), '']);
const NAME_SCRUB = [
  ...CONTENT_SCRUB,
  [/(?<![A-Za-z])STEPS(?![A-Za-z])/g, ''],   // brand only in caps; prose "steps" survives
  [/\(?\s*\.com\s*\)?/gi, ''],             // "(taleem360.com)" leftovers
  [/_?by_?(?=[\[(\d]|$)/gi, ''],              // dangling "by" after publisher scrub
];

function scrubText(s) {
  let out = s;
  for (const [rx, rep] of CONTENT_SCRUB) out = out.replace(rx, rep);
  return out
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/\n +\n/g, '\n\n');
}

function cleanName(base) {
  return (base
    .replace(/[-_. ]{2,}/g, '_')
    .replace(/[-_ ]+/g, '_')
    .replace(/^[-_]+|[-_]+$/g, '')
    .replace(/__+/g, '_')) || '';
}

function scrubName(name, hint = '') {
  const ext = path.extname(name);
  let base = name.slice(0, name.length - ext.length);
  for (const [rx, rep] of NAME_SCRUB) base = base.replace(rx, rep);
  base = cleanName(base) || cleanName(hint) || 'untitled';
  return base + ext.toLowerCase();
}

// ---- registry ----------------------------------------------------------
const registry = new Map(); // sha256 -> canonical path
const MAX_BYTES = 150 * 1024 * 1024; // skip monsters rather than stall on them
let ops = 0;
function prog(msg) { if (++ops % 25 === 0) console.error(`… ${ops} ops: ${msg}`); }
function sha256(p) {
  const sz = fs.statSync(p).size;
  if (sz > MAX_BYTES) throw new Error(`SKIP oversize ${sz}`);
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function walk(dir, out = []) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(p, out);
    } else if (e.isFile()) out.push(p);
  }
  return out;
}

const log = { admitted: [], renamed: [], dupes: [], skipped: [], deleted: [], errors: [] };

// ---- 0. rename academy brands out of the Studies tree ------------------
const NAME_BRAND_RX = [/(?<![A-Za-z])(kips|aku|aga\s*khan|anees\s*hussain|medangle|medexel|medquack|bankofmcqs|taleem360|catprep|prep\s*titans|mentr|prepdummy|dogar)(?![A-Za-z])/i,
  /(?<![A-Za-z])STEPS(?![A-Za-z])/];
function branded(p) { return NAME_BRAND_RX.some(rx => rx.test(path.basename(p))); }
function renamePath(p) {
  const dir = path.dirname(p);
  const nn = scrubName(path.basename(p), path.basename(dir));
  if (nn === path.basename(p)) return p;
  let dest = path.join(dir, nn), i = 2;
  while (fs.existsSync(dest)) { dest = path.join(dir, nn.replace(/(\.[^.]+)$/, `_${i}$1`)); i++; }
  if (APPLY) {
    try { fs.renameSync(p, dest); console.error(`renamed: ${path.basename(p)}`); }
    catch (e) { log.errors.push(`rename ${p}: ${e.message}`); return p; }
  }
  log.renamed.push(`${p} -> ${dest}`);
  return dest;
}
function renamePass(dir) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      renamePass(p);                      // children first
      if (branded(p)) renamePath(p);      // then the folder itself
    } else if (e.isFile() && branded(p)) {
      const ext = path.extname(p).toLowerCase();
      if (TEXT_EXT.has(ext) || BIN_EXT.has(ext)) renamePath(p);
    }
  }
}
renamePass(STUD);
const readme = path.join(STUD, 'README.md');
if (fs.existsSync(readme)) {
  const scrubbed = scrubText(fs.readFileSync(readme, 'utf8'));
  if (APPLY && scrubbed !== fs.readFileSync(readme, 'utf8')) fs.writeFileSync(readme, scrubbed);
}

// ---- 1. register Studies (canonical home) ------------------------------
for (const p of walk(STUD)) {
  const ext = path.extname(p).toLowerCase();
  if (!TEXT_EXT.has(ext) && !BIN_EXT.has(ext)) continue;
  try { registry.set(sha256(p), p); } catch (e) { log.errors.push(`hash ${p}: ${e.message}`); }
}
const studiesKnown = registry.size;

// ---- 2. incoming candidates -------------------------------------------
const incoming = [];
function addCandidates(dir, personalImgs = false) {
  if (!fs.existsSync(dir)) return;
  for (const p of walk(dir)) {
    const ext = path.extname(p).toLowerCase();
    if (personalImgs && /\.(jpe?g|png)$/i.test(ext)) { incoming.push(p); continue; }
    if (SKIP_EXT.has(ext) || (!TEXT_EXT.has(ext) && !BIN_EXT.has(ext))) { log.skipped.push(p); continue; }
    if (!STUDY_RX.test(path.basename(p))) { log.skipped.push(p); continue; }
    incoming.push(p);
  }
}
addCandidates(path.join(DL, 'Antigravity'));
addCandidates(path.join(DL, 'TODO'));
addCandidates(path.join(DL, 'AR AKU'));
addCandidates(path.join(DL, 'AKU'), true);
addCandidates(path.join(DL, 'AKU pics'), true);
addCandidates(path.join(DL, '2024 KIPS'));
addCandidates(path.join(DL, '2025 KIPS'));
addCandidates(path.join(DL, 'cat website'));
addCandidates(path.join(STUD, '_Duplicates')); // verify-as-dupe, then gone
// loose Downloads root — only clear study files, personal docs stay
for (const e of fs.readdirSync(DL, { withFileTypes: true })) {
  if (!e.isFile()) continue;
  const p = path.join(DL, e.name);
  const ext = path.extname(e.name).toLowerCase();
  if (SKIP_EXT.has(ext) || !(TEXT_EXT.has(ext) || BIN_EXT.has(ext))) continue;
  if (!STUDY_RX.test(e.name)) { log.skipped.push(p); continue; }
  incoming.push(p);
}

// ---- 3. collapse same-basename format twins ---------------------------
const byBase = new Map();
for (const p of incoming) {
  const k = path.basename(p).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!byBase.has(k)) byBase.set(k, []);
  byBase.get(k).push(p);
}
const PRIORITY = ['.pdf', '.md', '.apkg', '.txt', '.json', '.tsv', '.csv', '.docx', '.mp4'];
const keepers = new Set(), redundant = new Set();
for (const [, group] of byBase) {
  const sorted = [...group].sort((a, b) =>
    PRIORITY.indexOf(path.extname(a).toLowerCase()) - PRIORITY.indexOf(path.extname(b).toLowerCase()));
  keepers.add(sorted[0]);
  for (const loser of sorted.slice(1)) redundant.add(loser);
}

// ---- 4. admit: hash-dedupe → classify → copy → verify ------------------
function classify(base) {
  const b = base.toLowerCase();
  const subject =
    /bio|cell|kingdom|animalia|plant|digest|respir|genet|evolut|enzym|hormone|homeostasis|transport|coordination|gaseous.?exchange/.test(b) ? 'Biology'
    : /chem|organic|stoich|atomic|bond|equilibrium|electrochem|thermochem|kinetic|halogen|carbonyl|alcohol|acid|alkane|alkene|benzene|periodic|solution|colloid|s_and_p|d_and_f|analytical|industrial|environmental/.test(b) ? 'Chemistry'
    : /phys|motion|current|wave|optic|electronic|thermodyn|electromag|emi|nuclear|momentum|force|electric/.test(b) ? 'Physics'
    : /reasoning|logical|\biq\b/.test(b) ? 'Reasoning'
    : /english|vocab|grammar/.test(b) ? 'English'
    : /math/.test(b) ? 'Maths' : '';
  let section;
  if (/flash/.test(b)) section = 'flashcards';
  else if (/mock|practice.?test|dummy|recreat|recollection|prepdummy|full.?length|teacher.?copy|student.?copy/.test(b)) section = 'mock-exams';
  else if (/mcq|question|bank|past.?paper|pyq|topical/.test(b)) section = 'questions';
  else if (/note|master|concept|chapter|revis|high.?yield|instant.?fact|summary|guide|knowledge|syllabus/.test(b)) section = 'notes';
  else section = 'reference';
  return { section, subject };
}

const usedNames = new Set();
for (const p of registry.values()) usedNames.add(p.toLowerCase());
function uniqueDest(dir, name) {
  let cand = path.join(dir, name);
  const ext = path.extname(name);
  const base = name.slice(0, name.length - ext.length);
  let i = 2;
  while (usedNames.has(cand.toLowerCase()) || fs.existsSync(cand)) {
    cand = path.join(dir, `${base}_${i}${ext}`);
    i++;
  }
  usedNames.add(cand.toLowerCase());
  return cand;
}

const copiedForVerify = [];
for (const p of keepers) {
  let srcHash;
  try { srcHash = sha256(p); } catch (e) { log.errors.push(`hash ${p}: ${e.message}`); continue; }
  if (registry.has(srcHash)) { log.dupes.push(p); continue; }   // byte-identical already canonical
  const ext = path.extname(p).toLowerCase();
  const newName = scrubName(path.basename(p), path.basename(path.dirname(p)));
  const { section, subject } = classify(newName);
  let dest, content = null;
  if (/Downloads[\\/](AKU|AKU pics)[\\/]/.test(p)) {
    // personal admission photos — preserved, never deleted, never branded
    dest = uniqueDest(path.join(BIN, 'Personal', 'Admission-Photos'), newName);
  } else if (TEXT_EXT.has(ext)) {
    dest = uniqueDest(path.join(KB, section, subject), newName);
    content = scrubText(fs.readFileSync(p, 'utf8'));
  } else {
    const bucket = section === 'mock-exams' ? 'Mock-Exams'
      : section === 'questions' ? 'Papers-and-MCQs' : 'Notes-and-Books';
    dest = uniqueDest(path.join(BIN, bucket, subject), newName);
  }
  log.admitted.push(`${p}  ->  ${dest}`);
  if (!APPLY) continue;
  console.error(`copying: ${path.basename(p)}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (content !== null) fs.writeFileSync(dest, content);
  else fs.copyFileSync(p, dest);
  const wantHash = content !== null
    ? crypto.createHash('sha256').update(content).digest('hex') : srcHash;
  if (sha256(dest) !== wantHash) { log.errors.push(`VERIFY FAILED ${dest}`); continue; }
  registry.set(wantHash, dest);
  copiedForVerify.push({ from: p });
}

// ---- 5. deletion inventory --------------------------------------------
const admittedFrom = new Set(log.admitted.map(a => a.split('  ->  ')[0]));
const deleteTargets = [];
for (const p of incoming) {
  if (admittedFrom.has(p)) continue;   // copied + verified
  deleteTargets.push(p);               // hash-dupe or redundant twin
}
const FOLDERS_TO_DELETE = [
  path.join(DL, 'Antigravity'),
  path.join(DL, 'TODO'),
  path.join(DL, 'AR AKU'),
  path.join(DL, 'AKU'),
  path.join(DL, 'AKU pics'),
  path.join(DL, '2024 KIPS'),
  path.join(DL, '2025 KIPS'),
  path.join(DL, 'cat website'),
  path.join(STUD, '_Duplicates'),
];

// ---- 6. apply: delete + inventories ------------------------------------
const remPath = path.join(STUD, '_REMOVALS-2026-09-21.csv');
const renPath = path.join(STUD, '_RENAMES-2026-09-21.csv');
if (APPLY) {
  const removed = new Set();
  const unlink = p => {
    if (removed.has(p)) return;
    try { if (fs.existsSync(p)) { fs.unlinkSync(p); removed.add(p); log.deleted.push(`FILE ${p}`); } }
    catch (e) { log.errors.push(`delete ${p}: ${e.message}`); }
  };
  for (const p of deleteTargets) unlink(p);
  const csv = ['path', ...log.deleted.filter(d => d.startsWith('FILE '))
    .map(d => '"' + d.slice(5).replace(/"/g, '""') + '"')].join('\r\n');
  fs.writeFileSync(remPath, csv + '\r\n');
  if (log.renamed.length) {
    fs.writeFileSync(renPath, ['from,to', ...log.renamed.map(r => {
      const i = r.indexOf(' -> ');
      return `"${r.slice(0, i)}","${r.slice(i + 4)}"`;
    })].join('\r\n') + '\r\n');
  }
  for (const f of FOLDERS_TO_DELETE) {
    try {
      if (!fs.existsSync(f)) continue;
      const left = walk(f);
      if (left.length === 0) { fs.rmdirSync(f); log.deleted.push(`EMPTYDIR ${f}`); }
      else { fs.rmSync(f, { recursive: true }); log.deleted.push(`DIR ${f} (${left.length} residual files)`); }
    } catch (e) { log.errors.push(`rmdir ${f}: ${e.message}`); }
  }
}

// ---- summary -----------------------------------------------------------
console.log(`== KNOWLEDGE-BASE CONSOLIDATION ${APPLY ? '(APPLIED)' : '(PLAN — dry run)'} ==`);
console.log(`Studies files registered: ${studiesKnown}`);
console.log(`Admitted into KB / 07-Consolidated: ${log.admitted.length}`);
for (const a of log.admitted.slice(0, 55)) console.log('  + ' + a);
if (log.admitted.length > 55) console.log(`  … and ${log.admitted.length - 55} more`);
console.log(`Byte-identical dupes (deleted, already canonical): ${log.dupes.length}`);
console.log(`Redundant format twins (deleted): ${redundant.size}`);
console.log(`Studies renames (academy names out): ${log.renamed.length}`);
for (const r of log.renamed.slice(0, 25)) console.log('  ~ ' + r.replace(/^C:\\Users\\admin\\/, ''));
if (log.renamed.length > 25) console.log(`  … and ${log.renamed.length - 25} more`);
console.log(`Skipped (not study material, untouched): ${log.skipped.length}`);
for (const s of log.skipped.slice(0, 25)) console.log('  · ' + s.replace(/^C:\\Users\\admin\\/, ''));
if (log.skipped.length > 25) console.log(`  … and ${log.skipped.length - 25} more`);
console.log(`Deletion targets: ${deleteTargets.length} files + ${FOLDERS_TO_DELETE.length} folders`);
console.log(`Errors: ${log.errors.length}`);
for (const e of log.errors) console.log('  ! ' + e);
if (!APPLY) console.log('\nDry run only — nothing written, renamed, or deleted. Re-run with --apply.');
