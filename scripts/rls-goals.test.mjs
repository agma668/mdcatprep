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

// Real dependent migrations. These already contain the older exam_goal_id
// columns that the ownership follow-up hardens.
await db.exec(migration('20261110000000_mistake_recovery_mastery.sql'))
await db.exec(migration('20261111000000_flashcard_fsrs_engine.sql'))

await db.exec(`
  insert into public.exam_registry (id, slug, title, category, status) values
    ('nust-net', 'nust-net', 'NUST NET', 'engineering', 'active'),
    ('draft-exam', 'draft-exam', 'Draft exam', 'engineering', 'draft');

  insert into public.exam_variants (id, exam_id, slug, title, status) values
    ('nust-net-engineering', 'nust-net', 'engineering', 'Engineering', 'active'),
    ('nust-net-computing', 'nust-net', 'computing', 'Computing', 'active'),
    ('nust-net-retiring', 'nust-net', 'retiring', 'Retiring', 'active'),
    ('nust-net-ownership', 'nust-net', 'ownership', 'Ownership paper', 'active'),
    ('nust-net-stale', 'nust-net', 'stale', 'Stale primary paper', 'active'),
    ('nust-net-switch', 'nust-net', 'switch', 'Primary switch paper', 'active'),
    ('nust-net-life-a', 'nust-net', 'life-a', 'Lifecycle A', 'active'),
    ('nust-net-life-b', 'nust-net', 'life-b', 'Lifecycle B', 'active'),
    ('nust-net-delete', 'nust-net', 'delete', 'Delete detach paper', 'active'),
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
// Applied twice on purpose: the seed must be safe to re-run.
await db.exec(migration('20261113000000_prep_space_catalogue_seed.sql'))
await db.exec(migration('20261113000000_prep_space_catalogue_seed.sql'))
await db.exec(migration('20261114000000_student_goals_ownership_and_primary_fix.sql'))

// flashcard_decks intentionally has no explicit grants in its engine migration;
// production Supabase supplies defaults. The test grants them so the ownership
// FK can be exercised through the same authenticated role.
await db.exec(`
  grant select, insert, update, delete on public.flashcard_decks to authenticated;
  grant all on public.flashcard_decks to service_role;
`)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function ensureGoal(studentId, variantId) {
  const existing = await asUser(studentId, () =>
    q('select id from public.student_goals where student_id = $1 and variant_id = $2 limit 1', [
      studentId,
      variantId,
    ])
  )
  if (existing.rows[0]) return existing.rows[0]
  return (await asUser(studentId, () => createGoal(studentId, variantId))).rows[0]
}

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
  const ids = visible.rows.map((r) => r.id)
  assert.ok(ids.includes('nust-net'))
  assert.ok(!ids.includes('draft-exam'))
  const anonVisible = await asAnon(() => q('select id from public.exam_registry'))
  assert.ok(anonVisible.rows.some((r) => r.id === 'nust-net'))
  assert.ok(!anonVisible.rows.some((r) => r.id === 'draft-exam'))
})

test('catalogue seed exposes only beta Prep Spaces and supports a real goal', async () => {
  const visible = await asAnon(() => q('select id from public.exam_registry order by id'))
  assert.deepEqual(
    visible.rows.map((r) => r.id),
    ['hec-bfap-scholarship', 'nust-net', 'pma-long-course', 'pmdc-mdcat']
  )

  const created = await asUser(A, () =>
    q(`insert into public.student_goals (student_id, exam_id, variant_id, target_date)
       values ('${A}', 'pmdc-mdcat', 'pmdc-mdcat-national', '2027-09-30')
       returning id, status`)
  )
  assert.equal(created.rows[0].status, 'active')

  // An in-progress Prep Space is seeded as draft and cannot carry a goal yet.
  await expectSqlError(
    () => asUser(A, () =>
      q(`insert into public.student_goals (student_id, exam_id, variant_id)
         values ('${A}', 'nums-mdcat', 'nums-mdcat-mdcat')`)),
    '42501'
  )
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

test('multiple goals support pause, resume, archive, and primary switching', async () => {
  const first = (await asUser(A, () => createGoal(A, 'nust-net-life-a'))).rows[0]
  const second = (await asUser(A, () => createGoal(A, 'nust-net-life-b'))).rows[0]

  const active = await asUser(A, () =>
    q(`select count(*)::int as n from public.student_goals
       where variant_id in ('nust-net-life-a', 'nust-net-life-b')
         and status = 'active'`)
  )
  assert.equal(active.rows[0].n, 2)

  await asUser(A, () => q('select public.set_primary_goal($1)', [first.id]))
  let primaries = await asUser(A, () => q('select id from public.student_goals where is_primary'))
  assert.deepEqual(primaries.rows.map((row) => row.id), [first.id])

  await asUser(A, () => q('select public.set_primary_goal($1)', [second.id]))
  primaries = await asUser(A, () => q('select id from public.student_goals where is_primary'))
  assert.deepEqual(primaries.rows.map((row) => row.id), [second.id])

  const paused = await asUser(A, () =>
    q(`update public.student_goals set status = 'paused' where id = $1
       returning status, is_primary`, [second.id])
  )
  assert.equal(paused.rows[0].status, 'paused')
  assert.equal(paused.rows[0].is_primary, false)

  const resumed = await asUser(A, () =>
    q(`update public.student_goals set status = 'active' where id = $1
       returning status, is_primary`, [second.id])
  )
  assert.equal(resumed.rows[0].status, 'active')
  assert.equal(resumed.rows[0].is_primary, false)

  await asUser(A, () => q('select public.set_primary_goal($1)', [first.id]))
  const archived = await asUser(A, () =>
    q(`update public.student_goals set status = 'archived' where id = $1
       returning status, is_primary`, [first.id])
  )
  assert.equal(archived.rows[0].status, 'archived')
  assert.equal(archived.rows[0].is_primary, false)

  // Archiving frees the variant for a new active goal while preserving history.
  const recreated = await asUser(A, () => createGoal(A, 'nust-net-life-a'))
  assert.equal(recreated.rows[0].status, 'active')
  const preserved = await asUser(A, () =>
    q('select status from public.student_goals where id = $1', [first.id])
  )
  assert.equal(preserved.rows[0].status, 'archived')
})

test('a stale primary on a retired variant can be demoted by switching goals', async () => {
  const stale = (await asUser(A, () => createGoal(A, 'nust-net-stale'))).rows[0]
  await asUser(A, () => q('select public.set_primary_goal($1)', [stale.id]))

  await db.exec(`update public.exam_variants set status = 'retired' where id = 'nust-net-stale'`)

  const next = (await asUser(A, () => createGoal(A, 'nust-net-switch'))).rows[0]
  await asUser(A, () => q('select public.set_primary_goal($1)', [next.id]))

  const staleRow = await asUser(A, () =>
    q('select is_primary, status from public.student_goals where id = $1', [stale.id])
  )
  assert.equal(staleRow.rows[0].is_primary, false)
  assert.equal(staleRow.rows[0].status, 'active')

  const nextRow = await asUser(A, () =>
    q('select is_primary from public.student_goals where id = $1', [next.id])
  )
  assert.equal(nextRow.rows[0].is_primary, true)

  // A retired goal can be paused, but it can never be reactivated.
  await asUser(A, () =>
    q(`update public.student_goals set status = 'paused' where id = $1`, [stale.id])
  )
  await expectSqlError(
    () => asUser(A, () =>
      q(`update public.student_goals set status = 'active' where id = $1`, [stale.id])
    ),
    '42501'
  )
})

test('older goal references reject another student goal', async () => {
  const own = await ensureGoal(A, 'nust-net-ownership')
  const other = await ensureGoal(B, 'nust-net-computing')

  await expectSqlError(
    () => asUser(A, () =>
      q(`insert into public.mistake_reviews
           (student_id, question_id, classification, exam_goal_id)
         values ($1, $2, 'incorrect', $3)`, [A, Q1, other.id])
    ),
    '23503'
  )
  const mistake = await asUser(A, () =>
    q(`insert into public.mistake_reviews
         (student_id, question_id, classification, exam_goal_id)
       values ($1, $2, 'incorrect', $3) returning id`, [A, Q1, own.id])
  )
  await expectSqlError(
    () => asUser(A, () =>
      q('update public.mistake_reviews set exam_goal_id = $1 where id = $2', [other.id, mistake.rows[0].id])
    ),
    '23503'
  )

  await expectSqlError(
    () => asUser(A, () =>
      q(`insert into public.review_flashcards
           (student_id, front, back, exam_goal_id)
         values ($1, 'front', 'back', $2)`, [A, other.id])
    ),
    '23503'
  )
  const review = await asUser(A, () =>
    q(`insert into public.review_flashcards
         (student_id, front, back, exam_goal_id)
       values ($1, 'front', 'back', $2) returning id`, [A, own.id])
  )
  await expectSqlError(
    () => asUser(A, () =>
      q('update public.review_flashcards set exam_goal_id = $1 where id = $2', [other.id, review.rows[0].id])
    ),
    '23503'
  )

  await expectSqlError(
    () => asUser(A, () =>
      q(`insert into public.flashcard_decks (student_id, name, exam_goal_id)
         values ($1, 'deck', $2)`, [A, other.id])
    ),
    '23503'
  )
  const deck = await asUser(A, () =>
    q(`insert into public.flashcard_decks (student_id, name, exam_goal_id)
       values ($1, 'deck', $2) returning id`, [A, own.id])
  )
  await expectSqlError(
    () => asUser(A, () =>
      q('update public.flashcard_decks set exam_goal_id = $1 where id = $2', [other.id, deck.rows[0].id])
    ),
    '23503'
  )
})

test('deleting a goal detaches references without deleting progress', async () => {
  const goal = (await asUser(A, () => createGoal(A, 'nust-net-delete'))).rows[0]

  const attempt = await asUser(A, () =>
    q(`insert into public.question_attempts
         (question_id, student_id, selected_answer, is_correct, goal_id)
       values ($1, $2, 'A', true, $3) returning id`, [Q1, A, goal.id])
  )
  const mistake = await asUser(A, () =>
    q(`insert into public.mistake_reviews
         (student_id, question_id, attempt_id, classification, exam_goal_id)
       values ($1, $2, $3, 'incorrect', $4) returning id`, [A, Q1, attempt.rows[0].id, goal.id])
  )
  const review = await asUser(A, () =>
    q(`insert into public.review_flashcards
         (student_id, front, back, exam_goal_id)
       values ($1, 'front', 'back', $2) returning id`, [A, goal.id])
  )
  const deck = await asUser(A, () =>
    q(`insert into public.flashcard_decks (student_id, name, exam_goal_id)
       values ($1, 'deck', $2) returning id`, [A, goal.id])
  )

  await q('delete from public.student_goals where id = $1', [goal.id])

  const attemptRow = await q('select goal_id from public.question_attempts where id = $1', [attempt.rows[0].id])
  const mistakeRow = await q('select exam_goal_id from public.mistake_reviews where id = $1', [mistake.rows[0].id])
  const reviewRow = await q('select exam_goal_id from public.review_flashcards where id = $1', [review.rows[0].id])
  const deckRow = await q('select exam_goal_id from public.flashcard_decks where id = $1', [deck.rows[0].id])

  assert.equal(attemptRow.rows[0].goal_id, null)
  assert.equal(mistakeRow.rows[0].exam_goal_id, null)
  assert.equal(reviewRow.rows[0].exam_goal_id, null)
  assert.equal(deckRow.rows[0].exam_goal_id, null)
})

test('goal creation rejects missing and mismatched exam or variant references', async () => {
  // The insert policy checks catalogue visibility before the FK is reached, so
  // student-facing attempts are denied by RLS.
  await expectSqlError(
    () => asUser(A, () => createGoal(A, 'nust-net-missing')),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () =>
      q(`insert into public.student_goals (student_id, exam_id, variant_id)
         values ($1, 'nust-net', 'nust-net-missing')`, [A])
    ),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () =>
      q(`insert into public.student_goals (student_id, exam_id, variant_id)
         values ($1, 'missing-exam', 'nust-net-engineering')`, [A])
    ),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () =>
      q(`insert into public.student_goals (student_id, exam_id, variant_id)
         values ($1, 'draft-exam', 'nust-net-engineering')`, [A])
    ),
    '42501'
  )
  await expectSqlError(
    () => asUser(A, () => createGoal(A, 'nust-net-draft')),
    '42501'
  )

  // The composite (variant_id, exam_id) FK also rejects a mismatch when RLS is
  // bypassed by an owner/service task.
  await expectSqlError(
    () => q(`insert into public.student_goals (student_id, exam_id, variant_id)
            values ('${A}', 'draft-exam', 'nust-net-engineering')`),
    '23503'
  )
})
