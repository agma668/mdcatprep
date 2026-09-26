#!/usr/bin/env node
// Gives every question in lib/resources.ts a stable string key so client
// components (ExamStylePractice) can record attempts against the right DB
// row without shipping database uuids or looking rows up by question text.
//
// The key is a uuid v5 derived once from the question text under a fixed
// project namespace: deterministic (the same question always gets the same
// key) yet decoupled from any runtime text lookup — the key is stored in the
// file and in the questions.question_key column, and it survives answer
// rebalances (which never touch the text or the key). It does NOT change when
// an explanation or option wording changes, and it only changes if the
// question text itself is rewritten, which is exactly when a question should
// be treated as a new one.
//
// Idempotent: questions that already carry a key are left untouched, so
// re-running (or running on a file with hand-added questions) only fills in
// missing keys.
//
// Usage:
//   node scripts/add-question-keys.mjs            # write missing keys
//   node scripts/add-question-keys.mjs --dry-run  # report what would change
//
// Never prints secrets.

import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { ALL_RESOURCE_QUESTIONS } from '../lib/resources.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RESOURCES_FILE = path.join(ROOT, 'lib', 'resources.ts')

// Fixed project namespace: uuid v5 of "elite-cadet-prep" under the DNS
// namespace. Keys derived under it are stable across machines and re-runs.
const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

function uuidv5(namespace, name) {
  const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex')
  const hash = createHash('sha1').update(ns).update(name, 'utf8').digest()
  hash[6] = (hash[6] & 0x0f) | 0x50 // version 5
  hash[8] = (hash[8] & 0x3f) | 0x80 // variant 10xx
  const hex = hash.subarray(0, 16).toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const PROJECT_NAMESPACE = uuidv5(DNS_NAMESPACE, 'elite-cadet-prep')

export function questionKey(questionText) {
  return uuidv5(PROJECT_NAMESPACE, questionText)
}

export function isUuidV5(key) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(key)
}

// ── Surgical line insertion (same technique as the rebalance script) ──────

function parseTsString(raw) {
  const s = raw.trim()
  if (s.length < 2 || s[0] !== "'" || s[s.length - 1] !== "'") return null
  let out = ''
  for (let i = 1; i < s.length - 1; i++) {
    const c = s[i]
    if (c === '\\' && i + 1 < s.length - 1) {
      const n = s[i + 1]
      if (n === "'" || n === '\\') { out += n; i++ }
      else if (n === 'n') { out += '\n'; i++ }
      else if (n === 't') { out += '\t'; i++ }
      else { out += c }
    } else out += c
  }
  return out
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const byText = new Map(ALL_RESOURCE_QUESTIONS.map((q) => [q.question_text, q]))
  const src = fs.readFileSync(RESOURCES_FILE, 'utf8')
  const eol = src.includes('\r\n') ? '\r\n' : '\n'
  const lines = src.split(/\r?\n/)
  let already = 0
  let missing = 0
  const out = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    out.push(line)
    const m = line.match(/^\s*question_text:\s*(.+),$/)
    if (!m) continue
    const text = parseTsString(m[1])
    if (text == null) throw new Error(`line ${i + 1}: could not parse question_text`)
    const q = byText.get(text)
    if (!q) throw new Error(`line ${i + 1}: question_text not in imported bank: ${text.slice(0, 60)}`)

    // Does this question already carry a key on the next line?
    const next = lines[i + 1] || ''
    if (/^\s*key:\s*'[0-9a-f-]{36}',$/.test(next)) {
      const existing = (next.match(/'([0-9a-f-]{36})'/) || [])[1]
      if (q.key && existing !== q.key) {
        throw new Error(`line ${i + 2}: key in file (${existing}) differs from imported bank key (${q.key})`)
      }
      already++
      continue // the key line is pushed on the next iteration
    }
    if (q.key) {
      throw new Error(`line ${i + 1}: bank has key ${q.key} but the line after question_text is not a key line`)
    }
    if (dryRun) {
      missing++
      continue
    }
    const key = questionKey(text)
    if (!isUuidV5(key)) throw new Error(`generated invalid key for: ${text.slice(0, 60)}`)
    out.push(`    key: '${key}',`)
    missing++
  }

  console.log(`Questions: ${ALL_RESOURCE_QUESTIONS.length} (${already} already have keys, ${missing} missing)`)

  if (missing === 0) {
    console.log('All questions already have keys — nothing to do.')
    return
  }

  if (!dryRun) {
    fs.writeFileSync(RESOURCES_FILE, out.join(eol), 'utf8')
    console.log(`Wrote ${missing} keys to lib/resources.ts`)
  } else {
    console.log('Dry run — file not written.')
  }
}

main().catch((err) => {
  console.error('\n' + (err.message || err))
  process.exit(1)
})