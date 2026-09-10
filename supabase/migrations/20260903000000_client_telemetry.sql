-- Client telemetry: anonymous page-view counts and client-side error reports.
--
-- Purpose: see how the product is used (which pages get visited) and catch
-- crashes the server never sees (JS errors, failed hydration) — the web
-- equivalent of crash reporting. Written server-side via the service role by
-- the /api/telemetry route; clients never touch this table directly, so there
-- is no public insert policy and no spam surface.
--
-- Privacy: stores only what is needed — event name, page url, error message
-- and stack, plus the signed-in user's id (NULL for anonymous visitors). No
-- IPs, no user agents, no free-text. Rows for a deleted account disappear via
-- the cascade. Idempotent: safe on the live project and on a fresh database.

create table if not exists public.client_telemetry (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- NULL for anonymous visitors; cascade removes a deleted user's events.
  user_id uuid references auth.users (id) on delete cascade,
  -- 'page_view' | 'event' | 'error'
  type text not null check (type in ('page_view', 'event', 'error')),
  name text not null,
  url text,
  message text,
  stack text,
  meta jsonb not null default '{}'::jsonb
);

alter table public.client_telemetry enable row level security;

create index if not exists client_telemetry_created_at_idx
  on public.client_telemetry (created_at desc);

create index if not exists client_telemetry_type_idx
  on public.client_telemetry (type, created_at desc);
