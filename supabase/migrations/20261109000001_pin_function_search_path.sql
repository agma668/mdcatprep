-- =============================================================================
-- DRAFT — DO NOT APPLY TO PRODUCTION UNTIL REVIEWED.
--
-- Addresses the Supabase Security Advisor WARNs recorded in
-- EXAM-READINESS-AUDIT.md (2026-11-08):
--   public.duels_guard_update   — mutable search_path
--   public.races_guard_insert   — mutable search_path
--   public.leaderboard(integer) — mutable search_path
--
-- Scope: this migration ONLY pins search_path. It does not rewrite any function
-- body, so runtime behaviour is unchanged — every object reference in these
-- three bodies is already schema-qualified (`public.…`) or a pg_catalog
-- builtin/keyword, which is why an empty search_path is safe here.
--
-- Deliberately NOT included:
--   * EXECUTE revokes on the SECURITY DEFINER trigger functions
--     (handle_new_user, generate_referral_code, count_referral_on_signup).
--     They are trigger-only and the earlier audit flagged them as needing
--     individual review, not a blanket revoke.
--   * Index creation for unindexed foreign keys. The advisor reported six, but
--     the check-in SQL cannot prove which are still missing on the live
--     project. Run the read-only query below there first, then add one
--     CREATE INDEX per confirmed gap in a separate migration.
--
-- Read-only discovery query (safe in the Supabase SQL editor, writes nothing):
--
--   select conrelid::regclass as table_name, conname as foreign_key,
--          a.attname as column_name
--   from pg_constraint c
--   join unnest(c.conkey) as k(attnum) on true
--   join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum
--   where c.contype = 'f'
--     and c.connamespace = 'public'::regnamespace
--     and not exists (
--       select 1 from pg_index i
--       where i.indrelid = c.conrelid
--         and a.attnum = any (i.indkey)
--     )
--   order by 1, 2;
--
-- Safe test plan (no paid branch, no production write):
--   1. Run the three ALTERs inside a transaction on a disposable/local database
--      or a psql session on a scratch schema, then ROLLBACK.
--   2. Re-run the Supabase security advisor and confirm the three WARNs clear.
--   3. Regression test the actual behaviour: insert a duel and confirm the
--      frozen-set guard still raises, insert a duplicate race inside the 7-day
--      window and confirm the guard still raises, and render the dashboard
--      sidebar leaderboard (lib/leaderboard.ts) to confirm rows still return.
--   4. Only after 1-3 pass, apply during a low-traffic window.
-- =============================================================================

alter function public.duels_guard_update() set search_path = '';
alter function public.races_guard_insert() set search_path = '';
alter function public.leaderboard(integer) set search_path = '';

comment on function public.duels_guard_update() is
  'Freezes duel core fields. search_path pinned: no unqualified object access.';
comment on function public.races_guard_insert() is
  'Blocks a duplicate race between the same pair inside the 7-day window. search_path pinned.';
