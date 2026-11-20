// Regression tests for trigger-only SECURITY DEFINER functions (Issue #21).
//
// Runs the real historical migrations and the hardening migration in PGlite.
// No live Supabase project, network access, or paid service is used.
//
// Run: node --test scripts/security-definer-triggers.test.mjs

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const migration = (name) => readFileSync(join(ROOT, 'supabase/migrations', name), 'utf8')
const db = new PGlite()

const REFERRER = '10000000-0000-4000-8000-000000000001'
const CHILD_IDS = Array.from({ length: 10 }, (_, i) =>
  `20000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`
)

await db.exec(`
  create role anon;
  create role authenticated;
  create role service_role;
  create role supabase_auth_admin;

  create schema auth;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );

  create function auth.uid() returns uuid
    language sql stable
    as $fn$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
    $fn$;

  grant usage on schema public, auth to anon, authenticated, service_role, supabase_auth_admin;
  grant insert on auth.users to supabase_auth_admin;
`)

// Apply the actual migration sequence that creates the functions and triggers.
await db.exec(migration('20260811000000_init_auth.sql'))
await db.exec(migration('20260818000000_referral_system.sql'))
await db.exec(migration('20260903000002_referral_auto_approve.sql'))
await db.exec(migration('20260903000003_referral_signup_count.sql'))
await db.exec(migration('20261121000000_harden_referral_trigger_functions.sql'))

async function insertAuthUser(id, fullName) {
  await db.exec('set role supabase_auth_admin')
  try {
    await db.query(
      'insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3::jsonb)',
      [id, `${id}@example.test`, JSON.stringify({ full_name: fullName })]
    )
  } finally {
    await db.exec('reset role')
  }
}

test('trigger-only functions have pinned empty search_path and no API-role EXECUTE grants', async () => {
  const { rows } = await db.query(`
    select
      p.proname,
      p.prosecdef,
      p.proconfig,
      has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
      has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
      has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_can_execute,\n      has_function_privilege('supabase_auth_admin', p.oid, 'EXECUTE') as auth_admin_can_execute
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('handle_new_user', 'generate_referral_code', 'count_referral_on_signup')
    order by p.proname
  `)

  assert.equal(rows.length, 3)
  for (const row of rows) {
    assert.equal(row.prosecdef, true, `${row.proname} must remain SECURITY DEFINER for its trigger operation`)
    assert.ok(row.proconfig?.some((setting) => setting === 'search_path=""'), `${row.proname} must use an empty search_path`)
    assert.equal(row.anon_can_execute, false)
    assert.equal(row.authenticated_can_execute, false)
    assert.equal(row.service_role_can_execute, false)\n    assert.equal(row.auth_admin_can_execute, false)
  }
})

test('auth signup trigger still creates a profile and generates a referral code', async () => {
  await insertAuthUser(REFERRER, 'Referral owner')

  const { rows } = await db.query(
    'select id, full_name, email, role, status, referral_code, referred_signups from public.profiles where id = $1',
    [REFERRER]
  )
  assert.equal(rows.length, 1)
  assert.equal(rows[0].full_name, 'Referral owner')
  assert.equal(rows[0].role, 'student')
  assert.equal(rows[0].status, 'pending')
  assert.match(rows[0].referral_code, /^[A-F0-9]{8}$/)
  assert.equal(rows[0].referred_signups, 0)
})

test('referral attribution counts distinct signups and auto-approves at ten', async () => {
  // The auth.users trigger creates each child profile; attribution is applied
  // afterward, matching the signup flow that updates profiles.referred_by.
  for (let i = 0; i < CHILD_IDS.length; i += 1) {
    await insertAuthUser(CHILD_IDS[i], `Referral child ${i + 1}`)
    await db.query(
      'update public.profiles set referred_by = $1 where id = $2',
      [REFERRER, CHILD_IDS[i]]
    )
  }

  const { rows } = await db.query(
    'select referred_signups, status, auto_approved_at from public.profiles where id = $1',
    [REFERRER]
  )
  assert.equal(rows[0].referred_signups, 10)
  assert.equal(rows[0].status, 'approved')
  assert.ok(rows[0].auto_approved_at)

  // Re-applying the same attribution must not increment the counter.
  await db.query(
    'update public.profiles set referred_by = $1 where id = $2',
    [REFERRER, CHILD_IDS[0]]
  )
  const repeated = await db.query(
    'select referred_signups from public.profiles where id = $1',
    [REFERRER]
  )
  assert.equal(repeated.rows[0].referred_signups, 10)
})

test('all three trigger attachments remain installed', async () => {
  const { rows } = await db.query(`
    select t.tgname, p.proname
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_proc p on p.oid = t.tgfoid
    where not t.tgisinternal
      and (
        (n.nspname = 'auth' and c.relname = 'users' and p.proname = 'handle_new_user')
        or
        (n.nspname = 'public' and c.relname = 'profiles' and p.proname in ('generate_referral_code', 'count_referral_on_signup'))
      )
    order by p.proname
  `)
  assert.deepEqual(rows.map((row) => row.proname), [
    'count_referral_on_signup',
    'generate_referral_code',
    'handle_new_user',
  ])
})
