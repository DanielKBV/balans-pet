-- Stage 5: entries (income and expense records).
-- Any member adds entries; only the owner reads, edits and deletes them for now.
-- Employee rights (own entries, same day only) are added at stage 7.

-- Target for the composite foreign key below: an entry's category must belong
-- to the same business and have the same type as the entry.
alter table public.categories
  add constraint categories_id_business_type_key unique (id, business_id, type);

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  -- The app never sends business_id or created_by: the database fills them in.
  business_id uuid not null default public.current_business_id()
    references public.businesses (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount integer not null check (amount between 1 and 1000000000),
  category_id uuid not null,
  entry_date date not null check (entry_date >= date '2000-01-01'),
  comment text check (comment is null or char_length(comment) <= 500),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (category_id, business_id, type)
    references public.categories (id, business_id, type)
);

create index entries_business_date_idx on public.entries (business_id, entry_date desc, created_at desc);
create index entries_category_id_idx on public.entries (category_id);

alter table public.entries enable row level security;

create policy "Owner reads entries"
  on public.entries for select to authenticated
  using (
    business_id = (select public.current_business_id())
    and exists (
      select 1 from public.business_members
      where user_id = (select auth.uid()) and role = 'owner'
    )
  );

-- New entries: own business, own name, a visible category, no future dates (Bishkek time).
create policy "Members add entries"
  on public.entries for insert to authenticated
  with check (
    business_id = (select public.current_business_id())
    and created_by = (select auth.uid())
    and entry_date <= (now() at time zone 'Asia/Bishkek')::date
    and exists (
      select 1 from public.categories
      where id = category_id and not is_hidden
    )
  );

-- Editing may keep a category that was hidden later.
create policy "Owner edits entries"
  on public.entries for update to authenticated
  using (
    business_id = (select public.current_business_id())
    and exists (
      select 1 from public.business_members
      where user_id = (select auth.uid()) and role = 'owner'
    )
  )
  with check (
    business_id = (select public.current_business_id())
    and entry_date <= (now() at time zone 'Asia/Bishkek')::date
  );

create policy "Owner deletes entries"
  on public.entries for delete to authenticated
  using (
    business_id = (select public.current_business_id())
    and exists (
      select 1 from public.business_members
      where user_id = (select auth.uid()) and role = 'owner'
    )
  );

revoke all on public.entries from anon, authenticated;
grant select, delete on public.entries to authenticated;
grant insert (type, amount, category_id, entry_date, comment) on public.entries to authenticated;
grant update (type, amount, category_id, entry_date, comment) on public.entries to authenticated;
