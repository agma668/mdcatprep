-- WhatsApp bot subscribers table
create table if not exists public.whatsapp_subscribers (
  id uuid primary key default gen_random_uuid(),
  phone_number text unique not null,
  is_active boolean not null default true,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unsubscribed_at timestamp with time zone,
  student_id uuid references auth.users (id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.whatsapp_subscribers enable row level security;

create index if not exists whatsapp_subscribers_phone_idx on public.whatsapp_subscribers (phone_number);
create index if not exists whatsapp_subscribers_active_idx on public.whatsapp_subscribers (is_active);

-- Only service role can access (bot runs server-side)
create policy "Service role full access" on public.whatsapp_subscribers
  for all to service_role
  using (true)
  with check (true);
