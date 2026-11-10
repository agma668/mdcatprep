// Real RLS tests for the student-goals foundation (GitHub issue #2).
//
// Runs the actual migration SQL in PGlite (PostgreSQL compiled to WASM), then
// switches into the `authenticated` role with a stubbed auth.uid() to exercise
// the policies as a student would. No live Supabase project, no network, no
// paid service.
//
// Run: npm test  (or node --test scripts/rls-goals.test.mjs)

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const migration = (name) => readFileSync(join(ROOT, 'supabase/migrations', name), 'utf8')

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const Q1 = '33333333-3333-4333-8333-333333333333'

const db = new PGlite()

async function asUser(userId, fn) {
  await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub', '${userId}', false);`)
  try {
    return await fn()
  } finally {
    await db.exec('reset role;')
  }
}

async function asAnon(fn) {
  await db.exec('reset role; set role anon;')
  try {
    return await fn()
  } finally {
    await db.exec('reset role;')
  }
}

async function expectSqlError(fn, code) {
  try {
    await fn()
    assert.fail(`expected SQL error ${code}, but the statement succeeded`)
  } catch (error) {
    if (error?.code === undefined) throw error
    assert.equal(error.code, code, `expected ${code}, got ${error.code}: ${error.message}`)
  }
}

const q = (sql, params) => db.query(sql, params)

// ---------------------------------------------------------------------------
// Schema bootstrap: the pieces Supabase normally provides.
// ---------------------------------------------------------------------------
await db.exec(`
  create role anon;
  create role authenticated;
  create role service_role;

  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid
    language sql stable
    as $fn$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $fn$;

  create table public.questions (id uuid primary key);
  create table public.profiles (id uuid primary key references auth.users(id), exam_target text);

  grant usage on schema public, auth to anon, authenticated;
`)

// Real dependent migrations so the goal-reference tests exercise the same
// tables the app uses.
await db.exec(migration('20260910000000_flashcards.sql'))
await db.exec(migration('20260911000000_question_bookmarks.sql'))

// Minimal attempts table (the full content-management migration drags in the
// whole authoring schema; only these columns matter for goal references).
await db.exec(`
  create table public.question_attempts (
    id uuid primary key default gen_random_uuid(),
    question_id uuid not null references public.questions(id) on delete cascade,
    student_id uuid not null references auth.users(id) on delete cascade,
    selected_answer text not null check (selected_answer in ('A','B','C','D')),
    is_correct boolean not null,
    created_at timestamptz not null default timezone('utc'::text, now())
  );
  alter table public.question_attempts enable row level security;
  create policy "Students read own attempts" on public.question_attempts
    for select to authenticated using (student_id = auth.uid());
  create policy "Students insert own attempts" on public.question_attempts
    for insert to authenticated with check (student_id = auth.uid());
  grant select, insert on public.question_attempts to authenticated;
`)

await db.exec(`
  insert into auth.users (id) values ('${A}'), ('${B}');
  insert into public.profiles (id, exam_target) values ('${A}', 'MDCAT (free text)');
`)

// The catalogue and goals table come from the first goals migration.
await db.exec(migration('20261109000000_exam_registry_and_student_goals.sql'))

await db.exec(`
  insert into public.exam_registry (id, slug, title, category, status) values
    ('nust-net', 'nust-net', 'NUST NET', 'engineering', 'active'),
    ('draft-exam', 'draft-exam', 'Draft exam', 'engineering', 'draft');

  insert into public.exam_variants (id, exam_id, slug, title, status) values
    ('nust-net-engineering', 'nust-net', 'engineering', 'Engineering', 'active'),
    ('nust-net-computing', 'nust-net', 'computing', 'Computing', 'active'),
    ('nust-net-retiring', 'nust-net', 'retiring', 'Retiring', 'active'),
    ('nust-net-draft', 'nust-net', 'draft', 'Draft paper', 'draft'),
    ('draft-exam-paper', 'draft-exam', 'paper', 'Draft paper', 'active');

  insert into public.questions (id) values ('${Q1}');
  insert into public.question_exam_map (question_id, exam_id, variant_id, review_state)
    values ('${Q1}', 'nust-net', 'nust-net-engineering', 'approved');

  -- Legacy progress created BEFORE goal columns existed. It must stay
  -- goal_id = NULL forever (no evidence-based backfill exists).
  insert into public.question_attempts (question_id, student_id, selected_answer, is_correct)
    values ('${Q1}', '${A}', 'A', true);
  insert into public.question_bookmarks (question_id, student_id) values ('${Q1}', '${A}');
  insert into public.flashcard_reviews (student_id, card_id) values ('${A}', 'bio-001');
`)

await db.exec(migration('20261112000000_student_goals_foundation.sql'))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function createGoal(studentId, variantId, extra = {}) {
  const examId = variantId.startsWith('draft-exam') ? 'draft-exam' : 'nust-net'
  const cols = ['student_id', 'exam_id', 'variant_id']
  const vals = [`'${studentId}'`, `'${examId}'`, `'${variantId}'`]
  for (const [key, value] of Object.entries(extra)) {
    cols.push(key)
    vals.push(typeof value === 'string' ? `'${value}'` : String(value))
  }
  return q(
    `insert into public.student_goals (${cols.join(', ')}) values (${vals.join(', ')})
     returning id, is_primary, status`
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test('student can create a goal for an active variant they own', async () => {
  const result = await asUser(A, () => createGoal(A, 'nust-net-engineering', { target_date: '2027-01-31' }))
  assert.equal(result.rows.length, 1)
  assert.equal(result.rows[0].status, 'active')
  assert.equal(result.rows[0].is_primary, false)
})

test('one student cannot read another student\'s goals', async () => {
  const own = await asUser(A, () => q('select id from public.student_goals'))
  assert.ok(own.rows.length >= 1)
  const other = await asUser(B, () => q('select id from public.student_goals'))
  assert.equal(other.rows.length, 0)
})

test('one student cannot update another student\'s goal', async () => {
  const goal = (await asUser(A, () => q('select id from public.student_goals limit 1'))).rows[0]
  const result = await asUser(B, () =>
    q(`update public.student_goals set target_date = '2028-01-01' where id = $1 returning id`, [goal.id])
  )
  assert.equal(result.rows.length, 0)
})

test('a student cannot create a goal owned by someone else', async () => {
  await expectSqlError(() => asUser(A, () => createGoal(B, 'nust-net-engineering')), '42501')
})

test('duplicate active goals for the same variant are rejected', async () => {
  await expectSqlError(
    () => asUser(A, () => createGoal(A, 'nust-net-engineering')),
    '23505'
  )
})

test('a student cannot hold two active primary goals', async () => {
  await asUser(A, () => q('select public.set_primary_goal((select id from public.student_goals limit 1))'))
  await expectSqlError(
    () => asUser(A, () => createGoal(A, 'nust-net-computing', { is_primary: true })),
    '23505'
  )
})

test('set_primary_goal switches atomically and is scoped to the caller', async () => {
  const goal = (await asUser(A, () => q('select id from public.student_goals limit 1'))).rows[0]
  // B cannot make A's goal primary.
  await expectSqlError(
    () => asUser(B, () => q('select public.set_primary_goal($1)', [goal.id])),
    'P0002'
  )
  const primaries = await asUser(A, () =>
    q('select id from public.student_goals where is_primary')
  )
  assert.equal(primaries.rows.length, 1)
})

test('archiving the primary goal clears is_primary and frees the variant', async () => {
  const goal = (await asUser(A, () => q('select id from public.student_goals where is_primary'))).rows[0]
  const archived = await asUser(A, () =>
    q(`update public.student_goals set status = 'archived' where id = $1
       returning status, is_primary`, [goal.id])
  )
  assert.equal(archived.rows[0].status, 'archived')
  assert.equal(archived.rows[0].is_primary, false)

  // The same variant can be started again as a NEW active goal.
  const recreated = await asUser(A, () => createGoal(A, 'nust-net-engineering'))
  assert.equal(recreated.rows.length, 1)

  // The archived row is preserved, not deleted.
  const still = await asUser(A, () => q('select status from public.student_goals where id = $1', [goal.id]))
  assert.equal(still.rows[0].status, 'archived')
})

test('goals cannot target inactive exam variants or exams', async () => {
  await expectSqlError(() => asUser(A, () => createGoal(A, 'nust-net-draft')), '42501')
  await expectSqlError(() => asUser(A, () => createGoal(A, 'draft-exam-paper')), '42501')
})

test('a retired variant cannot be re-activated or made primary', async () => {
  const goal = (await asUser(A, () => createGoal(A, 'nust-net-retiring'))).rows[0]
  await db.exec(`update public.exam_variants set status = 'retired' where id = 'nust-net-retiring'`)

  await expectSqlError(
    () => asUser(A, () => q(`update public.student_goals set status = 'active' where id = $1`, [goal.id])),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => q('select public.set_primary_goal($1)', [goal.id])),
    'P0002'
  )
  // Pausing is still allowed: the goal must be retired by the student too.
  const paused = await asUser(A, () =>
    q(`update public.student_goals set status = 'paused' where id = $1 returning status`, [goal.id])
  )
  assert.equal(paused.rows[0].status, 'paused')
})

test('students may change only lifecycle fields, never identity', async () => {
  const goal = (await asUser(A, () => q(`select id from public.student_goals where status = 'active' limit 1`))).rows[0]

  await expectSqlError(
    () => asUser(A, () => q(`update public.student_goals set exam_id = 'draft-exam' where id = $1`, [goal.id])),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => q(`update public.student_goals set variant_id = 'nust-net-computing' where id = $1`, [goal.id])),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => q(`update public.student_goals set student_id = '${B}' where id = $1`, [goal.id])),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => q(`update public.student_goals set created_at = now() where id = $1`, [goal.id])),
    '42501'
  )

  const safe = await asUser(A, () =>
    q(`update public.student_goals set target_date = '2027-06-30', status = 'paused'
       where id = $1 returning target_date, status`, [goal.id])
  )
  assert.equal(safe.rows[0].status, 'paused')
  assert.equal(new Date(safe.rows[0].target_date).toISOString().slice(0, 10), '2027-06-30')
})

test('student-facing roles cannot write the exam catalogue or question map', async () => {
  await expectSqlError(
    () => asUser(A, () => q(`update public.exam_registry set title = 'Hacked' where id = 'nust-net'`)),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => q(`insert into public.exam_registry (id, slug, title, category, status)
                             values ('evil-exam', 'evil-exam', 'Evil', 'x', 'active')`)),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => q(`insert into public.exam_variants (id, exam_id, slug, title, status)
                             values ('evil-paper', 'nust-net', 'evil', 'Evil', 'active')`)),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => q('select * from public.question_exam_map')),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => q(`update public.question_exam_map set review_state = 'rejected'
                             where question_id = '${Q1}'`)),
    '42501'
  )

  // Read-only catalogue access still works, and draft records stay hidden.
  const visible = await asUser(A, () => q('select id from public.exam_registry'))
  assert.deepEqual(visible.rows.map((r) => r.id), ['nust-net'])
  const anonVisible = await asAnon(() => q('select id from public.exam_registry'))
  assert.deepEqual(anonVisible.rows.map((r) => r.id), ['nust-net'])
})

test('progress rows may reference only the student\'s own goal', async () => {
  const ownGoal = (await asUser(A, () => q('select id from public.student_goals limit 1'))).rows[0]
  const bGoal = (await asUser(B, () => createGoal(B, 'nust-net-computing'))).rows[0]

  const ownAttempt = await asUser(A, () =>
    q(`insert into public.question_attempts (question_id, student_id, selected_answer, is_correct, goal_id)
       values ('${Q1}', '${A}', 'B', false, $1) returning goal_id`, [ownGoal.id])
  )
  assert.equal(ownAttempt.rows[0].goal_id, ownGoal.id)

  await expectSqlError(
    () => asUser(A, () =>
      q(`insert into public.question_attempts (question_id, student_id, selected_answer, is_correct, goal_id)
         values ('${Q1}', '${A}', 'B', false, $1)`, [bGoal.id])),
    '23503'
  )
})

test('legacy progress is never backfilled with a goal', async () => {
  const attempts = await q('select goal_id from public.question_attempts where goal_id is null')
  const bookmarks = await q('select goal_id from public.question_bookmarks where goal_id is null')
  const reviews = await q('select goal_id from public.flashcard_reviews where goal_id is null')
  assert.ok(attempts.rows.length >= 1)
  assert.ok(bookmarks.rows.length >= 1)
  assert.ok(reviews.rows.length >= 1)
})

test('profiles.exam_target stays free text and does not create a goal', async () => {
  const profile = await q(`select exam_target from public.profiles where id = '${A}'`)
  assert.equal(profile.rows[0].exam_target, 'MDCAT (free text)')
  const count = await q(`select count(*)::int as n from public.student_goals where student_id = '${A}'`)
  assert.ok(count.rows[0].n >= 1)
})
