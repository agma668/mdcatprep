#!/usr/bin/env node
// Rebalances the MDCAT bank (lib/{biology,chemistry,physics,english}-questions.ts)
// so the correct answer sits ~25% per letter instead of skewing toward B
// (was A:43, B:112, C:18, D:2 — 64% on one letter, trivially guessable).
//
// Usage:
//   npx tsx scripts/rebalance-mdcat-questions.mjs            # rewrite the files
//   npx tsx scripts/rebalance-mdcat-questions.mjs --dry-run  # print plan only
//
// Correctness rules (deliberate, same as the cadet repo's rebalancer):
//   - Every question's correct TEXT is preserved; only its position (and the
//     letter key pointing at it) changes, together with distractor order.
//   - Questions whose explanation references an option letter are never moved.
//   - Deterministic + idempotent: target assigned in fixed question-seed
//     order; re-running a balanced bank changes nothing.
//   - Surgical rewrite: only option_a..d + correct_answer lines of moved
//     questions are touched.
//
// Layout logic: scripts/answer-shuffle.mjs (shared machinery).
// After rebalancing, run the seeder to sync the questions table:
//   npx tsx scripts/seed-mdcat-questions.mjs
//
// Never prints secrets.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MDCAT_QUESTIONS } from '../lib/mdcat.ts'
import {
  LETTERS,
  answerLetter,
  distribution,
  explanationMentionsLetter,
  letterIndex,
  questionSeed,
  rebalanceQuestionTo,
} from './answer-shuffle.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Per-file question ownership (the rewrite touches the right file per question).
const FILES = [
  { file: 'biology-questions.ts', match: (q) => q.subject === 'Biology' },
  { file: 'chemistry-questions.ts', match: (q) => q.subject === 'Chemistry' },
  { file: 'physics-questions.ts', match: (q) => q.subject === 'Physics' },
  { file: 'english-questions.ts', match: (q) => q.subject === 'English' },
]

const UUID_V5_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function isUuidV5(value) {
  return UUID_V5_RE.test(value)
}

function validateBank(questions, label) {
  const errors = []
  const seen = new Set()
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const n = i + 1
    if (!isUuidV5(String(q.key || ''))) errors.push(`#${n} key must be a uuid v5`)
    if (!q.question_text) errors.push(`#${n} missing question_text`)
    else if (seen.has(q.question_text)) errors.push(`#${n} duplicate question_text`)
    else seen.add(q.question_text)
    if (!q.subject) errors.push(`#${n} missing subject`)
    const letter = answerLetter(q)
    if (!LETTERS.includes(letter)) errors.push(`#${n} correct_answer '${letter}' not A/B/C/D`)
    else {
      const opts = [q.option_a, q.option_b, q.option_c, q.option_d]
      const at = opts[letterIndex(letter)]
      if (!at) errors.push(`#${n} correct_answer points at empty option`)
      if (!opts.includes(at)) errors.push(`#${n} correct text missing from options`)
    }
    for (const key of ['option_a', 'option_b']) {
      if (!q[key]) errors.push(`#${n} ${key} required`)
    }
    if (!q.explanation) errors.push(`#${n} missing explanation`)
  }
  if (errors.length) {
    throw new Error(`${label}: ${errors.length} problem(s):\n  - ${errors.slice(0, 12).join('\n  - ')}`)
  }
  const dist = distribution(questions)
  console.log(`${label}: ${questions.length} questions, distribution ${JSON.stringify(dist)} (max ${(Math.max(...Object.values(dist)) / questions.length * 100).toFixed(1)}%)`)
  return dist
}

function planTargets(questions) {
  const total = questions.length
  const base = Math.floor(total / 4)
  const remainder = total - base * 4
  const current = distribution(questions)
  const target = { ...Object.fromEntries(LETTERS.map((l) => [l, base])) }
  for (const l of [...LETTERS].sort((a, b) => current[a] - current[b] || (a < b ? -1 : 1)).slice(0, remainder)) {
    target[l]++
  }
  const movable = []
  const fixed = []
  for (const q of questions) {
    const cur = letterIndex(answerLetter(q))
    const opts = [q.option_a, q.option_b, q.option_c, q.option_d]
    if (cur < 0 || !opts[cur] || explanationMentionsLetter(q)) fixed.push(q)
    else movable.push(q)
  }
  const budget = { ...target }
  for (const q of fixed) budget[answerLetter(q)]--
  movable.sort((a, b) => questionSeed(a) - questionSeed(b))
  const assignments = new Map()
  for (const q of movable) {
    const cur = letterIndex(answerLetter(q))
    let targetLetter = LETTERS[cur]
    if (budget[targetLetter] <= 0) {
      targetLetter = [...LETTERS].sort((a, b) => budget[b] - budget[a] || (a < b ? -1 : 1))[0]
    }
    budget[targetLetter]--
    assignments.set(q.question_text, targetLetter)
  }
  if (Object.values(budget).some((v) => v !== 0)) {
    throw new Error(`Budget did not zero out: ${JSON.stringify(budget)}`)
  }
  return { assignments, target }
}

// ── Surgical file rewrite ─────────────────────────────────────────────────

function tsEscape(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function parseTsString(raw) {
  const s = raw.trim()
  // The generator emits double-quoted strings for values containing an
  // apostrophe (e.g. "Bowman's capsule only") — handle both quote styles.
  const quote = s.length >= 2 && (s[0] === "'" || s[0] === '"') ? s[0] : null
  if (!quote) return null
  let out = ''
  for (let i = 1; i < s.length - 1; i++) {
    const c = s[i]
    if (c === '\\' && i + 1 < s.length - 1) {
      const n = s[i + 1]
      if (n === "'" || n === '"' || n === '\\') { out += n; i++ }
      else if (n === 'n') { out += '\n'; i++ }
      else if (n === 't') { out += '\t'; i++ }
      else { out += c }
    } else out += c
  }
  return out
}

function optionLine(key, value) {
  return value == null ? `    ${key}: null,` : `    ${key}: '${tsEscape(value)}',`
}

function applyToFile(filePath, questions, assignments, label) {
  const src = fs.readFileSync(filePath, 'utf8')
  const eol = src.includes('\r\n') ? '\r\n' : '\n'
  const lines = src.split(/\r?\n/)
  const byText = new Map(questions.map((q) => [q.question_text, q]))
  let replaced = 0
  let untouched = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(/^\s*question_text:\s*(.+),$/)
    if (!m) continue
    const text = parseTsString(m[1])
    if (text == null) throw new Error(`${label} line ${i + 1}: could not parse question_text`)
    const q = byText.get(text)
    if (!q) continue // question lives in another subject file
    const target = assignments.get(text)
    if (!target) { untouched++; continue }

    // A stable `key:` line may sit between question_text and the options.
    let opt = i + 1
    if (/^\s*key:\s*'[0-9a-f-]{36}',$/.test(lines[opt] || '')) opt++

    const layout = rebalanceQuestionTo(q, letterIndex(target))
    const opts = [q.option_a, q.option_b, q.option_c, q.option_d]
    const next = layout ? [layout.option_a, layout.option_b, layout.option_c, layout.option_d] : opts
    const nextAnswer = layout ? layout.correct_answer : answerLetter(q)
    const same =
      next[0] === q.option_a && next[1] === q.option_b &&
      next[2] === q.option_c && next[3] === q.option_d &&
      nextAnswer === answerLetter(q)
    if (same) { untouched++; continue }

    for (let k = 0; k < 4; k++) {
      const expect = `option_${LETTERS[k].toLowerCase()}`
      const l = lines[opt + k]
      if (!new RegExp(`^\\s*${expect}:`).test(l)) {
        throw new Error(`${label} line ${opt + k + 1}: expected ${expect} but found: ${l.trim().slice(0, 60)}`)
      }
      const parsed = parseTsString((l.match(/:\s*(.+),$/) || [])[1] || '')
      const orig = opts[k]
      if (parsed !== orig && (orig != null || parsed != null)) {
        throw new Error(`${label} line ${opt + k + 1}: ${expect} mismatch (${parsed ?? null} vs ${orig ?? null})`)
      }
    }
    const answerLine = lines[opt + 4]
    if (!/^\s*correct_answer:\s*'[ABCD]',$/.test(answerLine)) {
      throw new Error(`${label} line ${opt + 5}: expected correct_answer line, found: ${answerLine.trim().slice(0, 60)}`)
    }

    lines[opt] = optionLine('option_a', next[0])
    lines[opt + 1] = optionLine('option_b', next[1])
    lines[opt + 2] = optionLine('option_c', next[2])
    lines[opt + 3] = optionLine('option_d', next[3])
    lines[opt + 4] = `    correct_answer: '${nextAnswer}',`
    replaced++
    i = opt + 4
  }

  if (replaced === 0) {
    console.log(`${label}: already balanced — no rewrite.`)
    return 0
  }
  fs.writeFileSync(filePath, lines.join(eol), 'utf8')
  console.log(`${label}: rewrote ${replaced} questions (${untouched} already at target).`)
  return replaced
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const before = validateBank(MDCAT_QUESTIONS, 'before')
  const { assignments, target } = planTargets(MDCAT_QUESTIONS)
  console.log(`Target distribution: ${JSON.stringify(target)}`)

  if (dryRun) {
    console.log('Dry run — no files written.')
    return
  }

  let totalReplaced = 0
  for (const { file, match } of FILES) {
    const filePath = path.join(ROOT, 'lib', file)
    const questions = MDCAT_QUESTIONS.filter(match)
    totalReplaced += applyToFile(filePath, questions, assignments, file)
  }

  // Re-validate from the rewritten files (fresh import — bust the ESM cache).
  const { MDCAT_QUESTIONS: after } = await import(`../lib/mdcat.ts?t=${Date.now()}`)
  const afterDist = validateBank(after, 'after')
  console.log(
    `Distribution: ${JSON.stringify(before)} → ${JSON.stringify(afterDist)} (max ${(Math.max(...Object.values(afterDist)) / after.length * 100).toFixed(1)}%)`
  )
  console.log(`Next: npx tsx scripts/seed-mdcat-questions.mjs to sync the questions table.`)
}

main().catch((err) => {
  console.error('\n' + (err.message || err))
  process.exit(1)
})
