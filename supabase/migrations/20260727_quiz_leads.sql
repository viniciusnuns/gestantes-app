create table if not exists public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  score integer,
  answers jsonb,
  created_at timestamptz not null default now()
);

alter table public.quiz_leads enable row level security;

create policy "service_role full access" on public.quiz_leads
  using (true) with check (true);
