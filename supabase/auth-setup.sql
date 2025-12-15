-- Auth-first configuration for the entries table
-- Run in Supabase SQL editor with a service role or owner.
--
-- IMPORTANT: After applying any SQL changes, update supabase/sql-changelog.md
-- to document what was changed, when, and how to re-apply it.

-- 1) Ensure table exists (safe if already present)
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('fix','improvement','repair','todo')),
  title text not null,
  value numeric null,
  notes text null
);

-- 2) Add owner column (nullable for backfill)
alter table public.entries add column if not exists owner uuid;

-- 3) Trigger to set owner from auth.uid()
create or replace function public.set_entry_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.owner is null then
    new.owner := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists set_entry_owner on public.entries;
create trigger set_entry_owner
before insert on public.entries
for each row
execute function public.set_entry_owner();

-- 4) Backfill existing rows to your user (replace placeholder)
-- Get your user id from Auth -> Users -> UUID column
-- update public.entries set owner = '00000000-0000-0000-0000-000000000000' where owner is null;

-- 5) Enforce not null and index owner
alter table public.entries alter column owner set not null;
create index if not exists entries_owner_idx on public.entries (owner);
create index if not exists entries_created_at_idx on public.entries (created_at desc);
create index if not exists entries_type_idx on public.entries (type);

-- 6) Enable RLS
alter table public.entries enable row level security;

-- 7) Authenticated, owner-scoped policies (idempotent via drop/create)
drop policy if exists entries_select_owner on public.entries;
drop policy if exists entries_insert_owner on public.entries;
drop policy if exists entries_update_owner on public.entries;
drop policy if exists entries_delete_owner on public.entries;

create policy entries_select_owner
on public.entries
for select
to authenticated
using (auth.uid() = owner);

create policy entries_insert_owner
on public.entries
for insert
to authenticated
with check (auth.uid() = owner);

create policy entries_update_owner
on public.entries
for update
to authenticated
using (auth.uid() = owner)
with check (auth.uid() = owner);

create policy entries_delete_owner
on public.entries
for delete
to authenticated
using (auth.uid() = owner);

-- 8) Optional: enforce RLS even for owner roles with bypass
-- alter table public.entries force row level security;

