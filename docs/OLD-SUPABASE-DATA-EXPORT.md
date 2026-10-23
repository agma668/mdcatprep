# Old Supabase project → new project: data export runbook

**Old project:** `mbhicswjzciafkvncwur.supabase.co` (old owner account)
**New project:** `niiskuwlpccmdtwjoxvm.supabase.co` (`edweb`, agma668 account)
**Do the export BEFORE anything is deleted or access is lost.**

## Option A — Supabase CLI (recommended, keeps auth users + hashed passwords)

1. Install the CLI once: `npm install -g supabase` (or `scoop install supabase`).
2. Get the old DB password: old dashboard → Project Settings → Database → Connection string (or reset the DB password there if unknown).
3. Dump SQL files (run from any folder, they land in `./supabase/` of a scratch dir):

```bash
# Roles first (custom grants), then schema (+ storage triggers), then data
supabase db dump --db-url "postgresql://postgres:<PASSWORD>@db.mbhicswjzciafkvncwur.supabase.co:5432/postgres" --data-only -f dump.sql
supabase db dump --db-url "postgresql://postgres:<PASSWORD>@db.mbhicswjzciafkvncwur.supabase.co:5432/postgres" -f roles.sql --role-only
supabase db dump --db-url "postgresql://postgres:<PASSWORD>@db.mbhicswjzciafkvncwur.supabase.co:5432/postgres" -f schema.sql
```

(`--use-pooler` may be needed if direct port 5432 is blocked — but pooler
connections break `pg_dump` triggers; prefer direct first.)

4. Apply to the NEW project:

```bash
# 0. NEW project already needs our schema first (see step 1 of the main checklist):
#    paste supabase/migrations-combined.sql in the new SQL Editor and Run.
# 1. Then restore:
psql "postgresql://postgres:<NEW_PASSWORD>@db.niiskuwlpccmdtwjoxvm.supabase.co:5432/postgres" -f roles.sql
psql "postgresql://postgres:<NEW_PASSWORD>@db.niiskuwlpccmdtwjoxvm.supabase.co:5432/postgres" -f dump.sql
```

Schema.sql is usually NOT needed (the combined migrations already created it) —
restore `dump.sql` only, and skip tables that conflict.

5. **Auth users come along**: the dump includes the `auth` schema with tables,
   hashed passwords and confirmations — nobody has to re-register.
6. **Auth CONFIG does not** — after restore, set in the new dashboard:
   Authentication → URL Configuration (Site URL + Redirect URLs), Google OAuth
   callback/client keys, any SMTP.

## Option B — no CLI available (dashboard only)

1. Old dashboard → Database → Backups → download the daily backup (paid plan
   feature; Free plan has no backup downloads).
2. If Free: use the Table Editor to spot-check what truth exists, but for a
   real export the CLI in Option A is the honest path.

## What NOT to bother migrating

- `question_attempts` of test/admin accounts, demo telemetry, WhatsApp test
  subscribers — ask yourself if it's real user data first. Honesty rule: a
  fresh project claiming zero users is more honest than importing noise.
- Storage buckets (if any were used) — Supabase CLI dumps do NOT include
  Storage FILES; copy those objects separately if the app used Storage.

## Provenance note for the ledger

Record in IMPROVEMENT_LOG.md what was exported/restored and when, so the new
project's data has a documented history instead of mystery rows.
