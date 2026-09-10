-- Referral auto-approval: count SIGNUPS, not approvals.
--
-- The founder's model: a waiting student shares their link; the moment 10
-- people have signed up through it they are approved automatically — nobody
-- waits for each friend to finish admin approval, and nobody counts by hand.
--
-- Replaces 20260903000002's approach (which counted referred students only
-- after they were themselves approved). Attribution happens in the signup
-- action via `update profiles set referred_by = ...`, so the trigger fires on
-- that update (and on direct inserts that already carry referred_by). The
-- counter column is renamed approved_referrals -> referred_signups to tell
-- the truth about what it counts.
--
-- Idempotent: drop-then-create everywhere; safe to re-run.

drop trigger if exists on_student_approved on public.profiles;
drop function if exists public.count_referral_on_approval();

alter table public.profiles
  rename column approved_referrals to referred_signups;

create or replace function public.count_referral_on_signup()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_total integer;
begin
  -- Fires on INSERT (old rows are all-null) and on UPDATE of referred_by
  -- (the signup action's attribution write). A repeated update to the same
  -- referrer is a no-op, so nobody can farm counts.
  if new.referred_by is not null
     and new.referred_by is distinct from old.referred_by then
    update public.profiles
       set referred_signups = coalesce(referred_signups, 0) + 1
     where id = new.referred_by
    returning referred_signups into v_total;

    -- 10 people through your link = instant access for a waiting referrer.
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

drop trigger if exists on_referral_attributed on public.profiles;
create trigger on_referral_attributed
  after insert or update of referred_by on public.profiles
  for each row execute procedure public.count_referral_on_signup();
