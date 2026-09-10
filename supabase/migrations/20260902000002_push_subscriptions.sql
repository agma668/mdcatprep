-- Push notification subscriptions table
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null default '',
  auth text not null default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.push_subscriptions enable row level security;

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index if not exists push_subscriptions_endpoint_idx on public.push_subscriptions (endpoint);

-- Users can manage their own subscriptions
create policy "Users can read own subscriptions" on public.push_subscriptions
  for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own subscriptions" on public.push_subscriptions
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete own subscriptions" on public.push_subscriptions
  for delete to authenticated
  using (user_id = auth.uid());
