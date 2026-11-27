-- Run this SQL in your Supabase project's SQL Editor (free tier)
create table if not exists public.cml_store (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cml_store enable row level security;

-- Allow public read/write for the CML app (or tighten with Supabase Auth if desired)
drop policy if exists "Allow anon all on cml_store" on public.cml_store;
create policy "Allow anon all on cml_store"
  on public.cml_store
  for all
  to anon, authenticated
  using (true)
  with check (true);
