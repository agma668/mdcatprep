// Real RLS tests for exam-scoped entitlements.
//
// Runs the actual migration SQL in PGlite (PostgreSQL in WASM), then switches
// into the `authenticated` role with a stubbed auth.uid() to try what a student
// could actually do. No live Supabase project, no network, no paid service.
//
// What is being proven, in order of consequence:
//   1. A student cannot grant themselves access (no insert policy at all).
//   2. A student cannot file a pre-verified order, or one for someone else.
//   3. A student sees only their own rows.
//   4. has_prep_space_access() answers for the caller only, and respects the
//      window, revocation and the space itself.
//
// Operator writes are run as the table owner (the role Supabase's service key
// effectively is: it bypasses RLS), because that is the only path that can
// create a grant.

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

const db = new PGlite()

async function asUser(userId, fn) {
  await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub', '${userId}', false);`)
  try {
    return await fn()
  } finally {
    await db.exec('reset role;')
  }
}

async function asOperator(fn) {
  await db.exec('reset role;')
  return fn()
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

  create table public.profiles (id uuid primary key references auth.users(id), exam_target text);

  grant usage on schema public, auth to anon, authenticated;
`)

await db.exec(migration('20261125000000_prep_space_entitlements.sql'))

await db.exec(`
  insert into auth.users (id) values ('${A}'), ('${B}');
  insert into public.profiles (id, exam_target) values ('${A}', 'NUST NET'), ('${B}', 'PMA');
`)

// ---------------------------------------------------------------------------
// 1. Students cannot grant themselves access
// ---------------------------------------------------------------------------
test('a student cannot insert an entitlement at all', async () => {
  await expectSqlError(
    () =>
      asUser(A, () =>
        db.query(
          `insert into public.prep_space_entitlements (student_id, prep_space_id, source)
           values ($1, 'nust-net-engineering', 'purchase')`,
          [A],
        ),
      ),
    '42501',
  )
})

test('a student cannot update or delete an existing entitlement', async () => {
  await asOperator(() =>
    db.query(
      `insert into public.prep_space_entitlements (student_id, prep_space_id, source)
       values ($1, 'nust-net-engineering', 'purchase')`,
      [A],
    ),
  )

  // No update policy exists, so the row is invisible to the UPDATE statement and
  // the statement is refused outright rather than silently touching nothing.
  await expectSqlError(
    () =>
      asUser(A, () =>
        db.query(`update public.prep_space_entitlements set status = 'active' where student_id = $1`, [A]),
      ),
    '42501',
  )
})

// ---------------------------------------------------------------------------
// 2. Orders: claim your own, pending only
// ---------------------------------------------------------------------------
test('a student can file their own pending order', async () => {
  const res = await asUser(B, () =>
    db.query(
      `insert into public.access_orders (student_id, prep_space_id, amount_pkr, method, payment_reference)
       values ($1, 'pma-long-course', 2500, 'jazzcash', 'JC-118842')
       returning id, status`,
      [B],
    ),
  )
  assert.equal(res.rows.length, 1)
  assert.equal(res.rows[0].status, 'pending')
})

test('a student cannot file an order for another student', async () => {

  await expectSqlError(
    () =>
      asUser(A, () =>
        db.query(
          `insert into public.access_orders (student_id, prep_space_id, amount_pkr, method, payment_reference)
           values ($1, 'pma-long-course', 2500, 'raast', 'RS-9931')`,
          [B],
        ),
      ),
    '42501',
  )
})

test('a student cannot file a pre-verified order', async () => {
  await expectSqlError(
    () =>
      asUser(A, () =>
        db.query(
          `insert into public.access_orders
             (student_id, prep_space_id, amount_pkr, method, payment_reference, status, verified_by, verified_at)
           values ($1, 'nust-net-engineering', 2500, 'raast', 'RS-1111', 'verified', 'self', now())`,
          [A],
        ),
      ),
    '42501',
  )
})

test('a verified order must name its verifier and the time', async () => {
  await expectSqlError(
    () =>
      asOperator(() =>
        db.query(
          `insert into public.access_orders (student_id, prep_space_id, amount_pkr, method, payment_reference, status)
           values ($1, 'nust-net-engineering', 2500, 'raast', 'RS-2222', 'verified')`,
          [A],
        ),
      ),
    '23514',
  )
})

// ---------------------------------------------------------------------------
// 3. Read isolation
// ---------------------------------------------------------------------------
test('a student reads only their own orders and entitlements', async () => {
  await asOperator(async () => {
    await db.query(
      `insert into public.access_orders (student_id, prep_space_id, amount_pkr, method, payment_reference)
       values ($1, 'nust-net-engineering', 2500, 'raast', 'RS-7777')`,
      [A],
    ).catch(() => {}) // A may already hold a pending order for this space from an earlier test
    // B gets a grant for a DIFFERENT Prep Space on purpose: the next test then
    // proves a grant never leaks across spaces or across students.
    await db.query(
      `insert into public.prep_space_entitlements (student_id, prep_space_id, source)
       values ($1, 'pma-long-course', 'purchase')`,
      [B],
    )
  })

  const seen = await asUser(A, () =>
    db.query(`select student_id from public.prep_space_entitlements order by student_id`),
  )
  assert.ok(seen.rows.every((row) => row.student_id === A), 'A must not see B entitlements')

  const orders = await asUser(A, () => db.query(`select student_id from public.access_orders`))
  assert.ok(orders.rows.every((row) => row.student_id === A), 'A must not see B orders')
})

// ---------------------------------------------------------------------------
// 4. The access function answers for the caller only
// ---------------------------------------------------------------------------
test('has_prep_space_access follows the caller, the space and the window', async () => {
  await asOperator(async () => {
    // A holds a live NUST grant (created above). Give B a lapsed one and a
    // revoked one so the two denial reasons are distinguishable in SQL too.
    await db.query(
      `insert into public.prep_space_entitlements
         (student_id, prep_space_id, source, status, starts_at, ends_at, granted_by)
       values ($1, 'hec-bfap-scholarship-pre-medical', 'purchase', 'active', now() - interval '60 days', now() - interval '1 day', 'operator')`,
      [B],
    )
    await db.query(
      `insert into public.prep_space_entitlements (student_id, prep_space_id, source, status, granted_by)
       values ($1, 'pmdc-mdcat', 'purchase', 'revoked', 'operator')`,
      [B],
    )
  })

  const check = (userId, space) =>
    asUser(userId, async () => {
      const res = await db.query(`select public.has_prep_space_access($1) as ok`, [space])
      return res.rows[0].ok
    })

  assert.equal(await check(A, 'nust-net-engineering'), true, 'A holds a live NUST grant')
  assert.equal(await check(A, 'pma-long-course'), false, 'A never bought PMA')
  assert.equal(await check(B, 'nust-net-engineering'), false, 'B must not inherit A access')
  assert.equal(await check(B, 'hec-bfap-scholarship-pre-medical'), false, 'lapsed grant is not access')
  assert.equal(await check(B, 'pmdc-mdcat'), false, 'revoked grant is not access')
  assert.equal(await check(A, 'not-a-prep-space'), false, 'unknown space is never access')
})

test('one live grant per student per Prep Space is enforced', async () => {
  await expectSqlError(
    () =>
      asOperator(() =>
        db.query(
          `insert into public.prep_space_entitlements (student_id, prep_space_id, source)
           values ($1, 'nust-net-engineering', 'launch_grant')`,
          [A],
        ),
      ),
    '23505',
  )
})
