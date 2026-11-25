-- =============================================================================
-- Exam-scoped entitlements and manual-payment orders
-- Apex Pakistan / MED Prep
--
-- The product decision says access is granted per Prep Space and enforced on
-- the server, not by hiding a card in the UI. Nothing in the schema modelled
-- that: a student either had an approved account (global gate) or nothing.
-- This adds the two tables that decision needs, without wiring a payment
-- provider:
--
--   access_orders           — a student says "I paid for this Prep Space",
--                             with the method and the transfer reference.
--                             Status starts at 'pending' and only an operator
--                             (service role) can move it.
--   prep_space_entitlements — the actual grant. One row per student per Prep
--                             Space, with a source, a status and a window.
--
-- Why manual payment: no gateway contract is approved, and Raast / Easypaisa /
-- JazzCash transfer + reference is the realistic first path in Pakistan. The
-- schema is provider-agnostic, so a gateway can later write the same rows.
--
-- Enforcement:
--   * RLS lets a student read only their own rows and insert only their own
--     'pending' order. They cannot grant themselves access.
--   * Writes to entitlements have no policy at all, so only the service role
--     (which bypasses RLS) can create, extend or revoke a grant.
--   * has_prep_space_access(text) answers "may the CALLER use this Prep Space"
--     and takes the student from auth.uid(), so it can never be used to probe
--     another student's access.
--
-- Not applied to production by this commit. Run it against the edweb project
-- only after the founder approves the access policy and the price list.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Orders: what a student says they paid, awaiting verification
-- ---------------------------------------------------------------------------
create table if not exists public.access_orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  prep_space_id text not null,
  amount_pkr integer not null check (amount_pkr > 0),
  method text not null check (method in ('raast', 'easypaisa', 'jazzcash', 'bank_transfer', 'manual')),
  payment_reference text not null check (length(btrim(payment_reference)) between 4 and 120),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  submitted_at timestamptz not null default timezone('utc'::text, now()),
  verified_by text,
  verified_at timestamptz,
  note text,
  -- A verified order must say who verified it and when; a pending one must not
  -- pretend it was reviewed.
  constraint access_orders_verification_complete check (
    (status = 'pending' and verified_at is null and verified_by is null)
    or (status in ('verified', 'rejected') and verified_at is not null and verified_by is not null)
  )
);

create index if not exists access_orders_student_idx
  on public.access_orders (student_id, submitted_at desc);
create index if not exists access_orders_pending_idx
  on public.access_orders (status, submitted_at)
  where status = 'pending';
-- One open claim per student per space: a student who mistypes a reference
-- should edit that claim, not stack duplicates an operator has to sift.
create unique index if not exists access_orders_one_pending_per_space
  on public.access_orders (student_id, prep_space_id)
  where status = 'pending';

-- ---------------------------------------------------------------------------
-- 2. Entitlements: the grant itself
-- ---------------------------------------------------------------------------
create table if not exists public.prep_space_entitlements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  prep_space_id text not null,
  source text not null check (source in ('purchase', 'scholarship', 'trial', 'sponsored', 'staff', 'launch_grant')),
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  starts_at timestamptz not null default timezone('utc'::text, now()),
  -- NULL means "no fixed end" (a launch grant during beta); every paid grant
  -- should set it, and the application decides the term, not this table.
  ends_at timestamptz,
  order_id uuid references public.access_orders(id) on delete set null,
  granted_by text,
  note text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint prep_space_entitlements_window_valid check (ends_at is null or ends_at > starts_at)
);

create index if not exists prep_space_entitlements_student_idx
  on public.prep_space_entitlements (student_id, prep_space_id);
-- At most one live grant per student per Prep Space. Re-granting means ending
-- or revoking the old row first, so the history stays auditable instead of
-- being overwritten.
create unique index if not exists prep_space_entitlements_one_active
  on public.prep_space_entitlements (student_id, prep_space_id)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- 3. "May the caller use this Prep Space?"
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER so the check works even when the caller cannot read the
-- table directly; search_path is pinned because a definer function without it
-- can be hijacked by a shadowing schema. The student always comes from
-- auth.uid(), never from an argument, so this cannot probe other students.
create or replace function public.has_prep_space_access(p_prep_space text)
returns boolean
language sql
stable
security definer
set search_path = public
as $fn$
  select exists (
    select 1
    from public.prep_space_entitlements e
    where e.student_id = auth.uid()
      and e.prep_space_id = p_prep_space
      and e.status = 'active'
      and e.starts_at <= timezone('utc'::text, now())
      and (e.ends_at is null or e.ends_at > timezone('utc'::text, now()))
  );
$fn$;

revoke all on function public.has_prep_space_access(text) from public;
grant execute on function public.has_prep_space_access(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. RLS: read your own, claim your own, grant nothing
-- ---------------------------------------------------------------------------
alter table public.access_orders enable row level security;

drop policy if exists "Students read own orders" on public.access_orders;
create policy "Students read own orders" on public.access_orders
  for select to authenticated
  using (student_id = auth.uid());

-- A student may file a claim, but only as themselves and only as pending:
-- the WITH CHECK is what stops a client from inserting a pre-verified order.
drop policy if exists "Students submit own pending order" on public.access_orders;
create policy "Students submit own pending order" on public.access_orders
  for insert to authenticated
  with check (student_id = auth.uid() and status = 'pending');

grant select, insert on public.access_orders to authenticated;

alter table public.prep_space_entitlements enable row level security;

drop policy if exists "Students read own entitlements" on public.prep_space_entitlements;
create policy "Students read own entitlements" on public.prep_space_entitlements
  for select to authenticated
  using (student_id = auth.uid());

-- Deliberately no insert/update/delete policy: only the service role can grant,
-- extend or revoke access.
grant select on public.prep_space_entitlements to authenticated;

comment on table public.access_orders is
  'A student claim of payment for one Prep Space. Client may insert pending rows only; verification is operator-only.';
comment on table public.prep_space_entitlements is
  'The access grant itself, scoped to one Prep Space per student. Written only by the service role.';
comment on function public.has_prep_space_access(text) is
  'True when the CALLING student (auth.uid()) holds a live entitlement for the given Prep Space.';
