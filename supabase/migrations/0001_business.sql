-- Stage 3: businesses, members and categories.
-- Row Level Security is on from the start: the publishable key is public, so
-- every table must be closed by default. Employee rights are added at stage 7.

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  activity text not null check (char_length(btrim(activity)) between 1 and 100),
  created_at timestamptz not null default now()
);

-- user_id as primary key: one user belongs to one business.
create table public.business_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  role text not null check (role in ('owner', 'employee')),
  created_at timestamptz not null default now()
);

create index business_members_business_id_idx on public.business_members (business_id);

-- One owner per business.
create unique index business_members_one_owner_idx
  on public.business_members (business_id)
  where role = 'owner';

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  type text not null check (type in ('income', 'expense')),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  unique (business_id, type, name)
);

-- security definer: reading business_members from a policy on business_members
-- would otherwise recurse.
create function public.current_business_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select business_id from public.business_members where user_id = (select auth.uid())
$$;

-- Creates the business, its owner and starter categories in one transaction.
-- A second call by the same user fails on the business_members primary key.
create function public.create_business(p_name text, p_activity text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_business_id uuid;
begin
  insert into public.businesses (name, activity)
  values (btrim(p_name), btrim(p_activity))
  returning id into new_business_id;

  insert into public.business_members (user_id, business_id, role)
  values (auth.uid(), new_business_id, 'owner');

  insert into public.categories (business_id, name, type)
  select new_business_id, starter.name, starter.type
  from (values
    ('Мойка кузова', 'income'),
    ('Комплексная мойка', 'income'),
    ('Химчистка салона', 'income'),
    ('Прочее', 'income'),
    ('Аренда', 'expense'),
    ('Зарплата', 'expense'),
    ('Расходники (шампунь, воск)', 'expense'),
    ('Коммунальные', 'expense'),
    ('Прочее', 'expense')
  ) as starter (name, type);

  return new_business_id;
end;
$$;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.categories enable row level security;

create policy "Members read their business"
  on public.businesses for select to authenticated
  using (id = (select public.current_business_id()));

create policy "Members read their team"
  on public.business_members for select to authenticated
  using (business_id = (select public.current_business_id()));

create policy "Members read their categories"
  on public.categories for select to authenticated
  using (business_id = (select public.current_business_id()));

-- Guests get nothing; signed-in users only read, writes go through functions.
revoke all on public.businesses, public.business_members, public.categories from anon, authenticated;
grant select on public.businesses, public.business_members, public.categories to authenticated;

revoke all on function public.current_business_id() from public, anon;
revoke all on function public.create_business(text, text) from public, anon;
grant execute on function public.current_business_id() to authenticated;
grant execute on function public.create_business(text, text) to authenticated;
