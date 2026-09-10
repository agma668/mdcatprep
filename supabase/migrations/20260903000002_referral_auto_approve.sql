-- Referral auto-approval: no manual counting anywhere.
--
-- Every time a student transitions INTO 'approved', their referrer (profiles.referred_by)
-- gains +1 approved referral automatically. When that counter reaches 10 the referrer is
-- auto-approved on the spot — no admin click, no SQL, no counting. This is database-driven
-- so it works for approvals made through the admin UI, a script, or the SQL editor alike.
--
-- Depends on the referral_system migration (referral_code / referred_by columns +
-- auto-generated codes). Idempotent: safe on a fresh database and on the live project.
--
-- NOTE: only transitions after this migration lands are counted — referrals approved
-- earlier do not backfill. Auto-approval only promotes status 'pending'; accounts that
-- were rejected or suspended keep their state (an admin can still approve them normally,
-- which then counts toward the referrer).

alter table public.profiles
  add column if not exists approved_referrals integer not null default 0,
  add column if not exists auto_approved_at timestamptz;

create or replace function public.count_referral_on_approval()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_total integer;
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.referred_by is not null then
    update public.profiles
       set approved_referrals = coalesce(approved_referrals, 0) + 1
     where id = new.referred_by
    returning approved_referrals into v_total;

    -- 10 approved referrals = instant access for the waiting referrer.
    if v_total >= 10 then
      update public.profiles
         set status = 'approved',
             auto_approved_at = now()
       where id = new.referred_by
         and status = 'pending';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_student_approved on public.profiles;
create trigger on_student_approved
  after update of status on public.profiles
  for each row execute procedure public.count_referral_on_approval();

-- Anyone can see the counter; only the service role mutates profiles.
comment on table public.profiles is 'Student profiles; referral auto-approval counts approved referrals per profile.';
