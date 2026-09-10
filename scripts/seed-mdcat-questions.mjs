#!/usr/bin/env node
// Syncs the MDCAT exam-style bank (lib/mdcat.ts) into the Supabase questions
// table so the MED site's mock tests, adaptive quiz and subject drills serve
// real, recorded questions out of the box.
//
// Usage:
//   npx tsx scripts/seed-mdcat-questions.mjs [--dry-run]
//
// Single source of truth: reads lib/mdcat.ts (the 175 generated PMDC-pattern
// MCQs — Biology, Chemistry, Physics, English). The table is a
// materialization of the file; content edits happen in lib/*.ts, never here.
//
// Idempotent upsert keyed by question_text:
//   - rows whose question_text is NOT in the table are inserted (with their
//     stable question_key),
//   - rows whose question_text EXISTS but whose options / correct answer /
//     question_key differ from the file are UPDATED,
//   - rows that already match the file are skipped.
// Re-running always converges the table to the file and never double-inserts.
//
// NOTE (shared database): this DB also serves the cadet-college site. The
// MDCAT rows are additive (new subjects) and touched only by this script.
// Rollback if ever needed:
//   DELETE FROM questions WHERE question_key IN (the uuid keys in lib/*-questions.ts);
//
// Inserts keep source='imported' and status='published' because the mock test
// and academy quiz only serve published rows. The service role bypasses RLS;
// the student select policy (status='published') keeps working unchanged.
// 'imported' is inside the source check constraint (admin|ai|imported).
//
// Never prints secrets.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MDCAT_QUESTIONS } from '../lib/mdcat.ts'

// uuid v5 shape check (the bank's keys come from uuid5(ns, seed) at generate time).
const UUID_V5_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
function isUuidV5(value) {
  return UUID_V5_RE.test(value)
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const VALID_ANSWERS = ['A', 'B', 'C', 'D']
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard']

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error(`Missing ${envPath} — copy .env.example and fill in your values.`)
    process.exit(1)
  }
  const env = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return env
}

function requireSupabase(env) {
  const missing = []
  for (const k of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
    if (!env[k]) missing.push(k)
  }
  if (missing.length) {
    console.error('Missing Supabase env vars: ' + missing.join(', ') + ' (set them in .env.local)')
    process.exit(1)
  }
}

function clean(value, maxLen = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLen) : ''
}

function validate(question, index) {
  const errors = []
  if (!isUuidV5(clean(question.key))) errors.push('key must be a uuid v5')
  if (!clean(question.question_text)) errors.push('question_text required')
  if (!clean(question.subject)) errors.push('subject required')
  if (!clean(question.option_a)) errors.push('option_a required')
  if (!clean(question.option_b)) errors.push('option_b required')
  const answer = clean(question.correct_answer).toUpperCase()
  if (!VALID_ANSWERS.includes(answer)) errors.push('correct_answer must be A/B/C/D')
  if (question.difficulty && !VALID_DIFFICULTIES.includes(clean(question.difficulty))) {
    errors.push('difficulty must be easy|medium|hard')
  }
  if (errors.length) {
    throw new Error(`Question #${index + 1} (${clean(question.question_text, 60)}…) invalid: ${errors.join('; ')}`)
  }
}

// Normalize an option for comparison (trim, null for empty) — same shape the
// insert writes, so a stored row and the file compare fairly.
function normOption(value) {
  const v = clean(value, 500)
  return v || null
}

function rowMatchesFile(row, q) {
  return (
    normOption(row.option_a) === normOption(q.option_a) &&
    normOption(row.option_b) === normOption(q.option_b) &&
    normOption(row.option_c) === normOption(q.option_c) &&
    normOption(row.option_d) === normOption(q.option_d) &&
    (clean(row.correct_answer).toUpperCase() || null) === clean(q.correct_answer).toUpperCase()
  )
}

function distribution(questions) {
  const dist = { A: 0, B: 0, C: 0, D: 0 }
  for (const q of questions) {
    const l = clean(q.correct_answer).toUpperCase()
    if (dist[l] !== undefined) dist[l]++
  }
  return dist
}

const BASE_SELECT = 'id,question_text,option_a,option_b,option_c,option_d,correct_answer'

async function fetchPage(url, headers, select, offset) {
  const res = await fetch(
    `${url}?select=${encodeURIComponent(select)}&limit=1000&offset=${offset}`,
    { headers }
  )
  if (!res.ok) throw new Error(`Fetch existing failed (${res.status}): ${(await res.text()).slice(0, 300)}`)
  return res.json()
}

async function fetchExisting(url, headers) {
  let rows = []
  let hasKeyColumn = true
  try {
    for (let offset = 0; ; offset += rows.length) {
      const page = await fetchPage(url, headers, `${BASE_SELECT},question_key`, offset)
      rows.push(...page)
      if (page.length < 1000) break
    }
  } catch (err) {
    if (!/question_key/.test(err.message)) throw err
    hasKeyColumn = false
    rows = []
    console.warn(
      '\n  question_key column is missing on the live table. Apply ' +
        'supabase/migrations/20260902000003_add_question_key.sql via the ' +
        'Supabase SQL Editor and re-run to backfill keys; until then the ' +
        'attempt action falls back to exact question_text resolution.\n'
    )
    for (let offset = 0; ;) {
      const page = await fetchPage(url, headers, BASE_SELECT, offset)
      rows.push(...page)
      if (page.length < 1000) break
      offset += page.length
    }
  }
  return { rows, hasKeyColumn }
}

async function patchRows(url, headers, updates) {
  let ok = 0
  const failures = []
  for (const { id, body } of updates) {
    const res = await fetch(`${url}?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify(body),
    })
    if (res.ok) ok++
    else failures.push({ id, status: res.status })
  }
  return { ok, failures }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const env = loadEnv()
  requireSupabase(env)

  const url = `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/rest/v1/questions`
  const authHeaders = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  const questions = MDCAT_QUESTIONS
  console.log(`Bank: ${questions.length} questions from lib/mdcat.ts`)
  const dist = distribution(questions)
  console.log(`Answer distribution: ${JSON.stringify(dist)} (max ${(Math.max(...Object.values(dist)) / questions.length * 100).toFixed(1)}%)`)
  questions.forEach((q, i) => validate(q, i))

  console.log('Fetching existing rows…')
  const { rows: existing, hasKeyColumn } = await fetchExisting(url, authHeaders)
  const byText = new Map(existing.map((r) => [r.question_text, r]))
  console.log(`Existing rows in questions table: ${existing.length}${hasKeyColumn ? '' : ' (question_key column MISSING)'}`)

  const toInsert = []
  const toUpdate = []
  let unchanged = 0
  for (const q of questions) {
    const row = byText.get(q.question_text)
    if (!row) {
      toInsert.push(q)
    } else if (rowMatchesFile(row, q) && (!hasKeyColumn || row.question_key === q.key)) {
      unchanged++
    } else {
      toUpdate.push({ id: row.id, q, needsKey: hasKeyColumn && row.question_key !== q.key })
    }
  }
  console.log(`Plan — insert: ${toInsert.length}, update: ${toUpdate.length}, unchanged: ${unchanged}`)

  if (dryRun) {
    console.log('Dry run — no rows written.')
    return
  }

  // ── Insert genuinely new rows ──────────────────────────────────────────
  let inserted = 0
  for (const q of toInsert) {
    const body = {
      question_key: q.key,
      subject: clean(q.subject, 100),
      topic: clean(q.topic, 100) || null,
      question_text: clean(q.question_text, 2000),
      option_a: clean(q.option_a, 500),
      option_b: clean(q.option_b, 500),
      option_c: clean(q.option_c, 500) || null,
      option_d: clean(q.option_d, 500) || null,
      correct_answer: clean(q.correct_answer).toUpperCase(),
      explanation: clean(q.explanation, 2000) || null,
      difficulty: clean(q.difficulty, 50) || null,
      college: 'MDCAT',
      source: 'imported',
      status: 'published',
    }
    const res = await fetch(url, { method: 'POST', headers: authHeaders, body: JSON.stringify(body) })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Insert failed (#${inserted + 1}, ${res.status}): ${text.slice(0, 300)}`)
    }
    inserted++
    process.stdout.write(`\rInserted ${inserted}/${toInsert.length}…`)
  }
  if (toInsert.length) console.log(`\nInserted ${inserted} new rows.`)

  // ── Update rows whose answer/options/key changed in the file ──────────
  let updated = 0
  if (toUpdate.length) {
    const updates = toUpdate.map(({ id, q, needsKey }) => {
      const body = {
        option_a: clean(q.option_a, 500),
        option_b: clean(q.option_b, 500),
        option_c: clean(q.option_c, 500) || null,
        option_d: clean(q.option_d, 500) || null,
        correct_answer: clean(q.correct_answer).toUpperCase(),
      }
      if (needsKey) body.question_key = q.key
      return { id, body }
    })
    const { ok, failures } = await patchRows(url, authHeaders, updates)
    updated = ok
    if (failures.length) {
      console.error(`\nFAILED row updates: ${failures.length}`, failures.slice(0, 10))
      process.exit(1)
    }
    console.log(`Updated ${ok}/${updates.length} rows (option letters, correct_answer${hasKeyColumn ? ', question_key' : ''}).`)
  }

  console.log(`Done — inserted ${inserted}, updated ${updated}, unchanged ${unchanged}.`)

  // ── Verify against the live table AFTER the writes ────────────────────
  const subjects = [...new Set(questions.map((q) => q.subject))]
  for (const subject of subjects) {
    const res = await fetch(
      `${url}?select=count&status=eq.published&subject=eq.${encodeURIComponent(subject)}`,
      { headers: { ...authHeaders, Prefer: 'count=exact' } }
    )
    const count = Number(res.headers.get('content-range')?.split('/')[1] ?? '0')
    console.log(`  published ${subject}: ${count}`)
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
