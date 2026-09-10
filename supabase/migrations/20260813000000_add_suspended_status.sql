-- Allow the 'suspended' status in profiles.status.
--
-- The admin panel can suspend an approved student (losing dashboard access)
-- and unsuspend them later. The initial schema restricted status to
-- ('pending', 'approved', 'rejected'); this widens it to include 'suspended'.
--
-- Idempotent: safe to run on the live project (lsjwyqouzezabaxnlhjy) and on a
-- fresh database that replays migrations.

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status in ('pending', 'approved', 'rejected', 'suspended'));
