-- Referral system
alter table public.profiles
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;

create index if not exists profiles_referral_code_idx on public.profiles (referral_code);

-- Auto-generate referral codes
create or replace function public.generate_referral_code()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(substr(md5(random()::text || new.id::text), 1, 8));
  end if;
  return new
end;
$$;

drop trigger if exists on_profile_create_referral on public.profiles;
create trigger on_profile_create_referral
  before insert on public.profiles
  for each row execute procedure public.generate_referral_code();
