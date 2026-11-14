-- Stage 9: superadmin.
-- The superadmin sees every real business on /admin. The role is a row in public.superadmins
-- (by account id, not by email: email confirmation is off, so an email alone proves nothing).
-- The site can neither read nor change that table; only the functions below look into it.

create table public.superadmins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.superadmins enable row level security;
revoke all on public.superadmins from anon, authenticated;

create function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.superadmins where user_id = (select auth.uid()))
$$;

revoke all on function public.is_superadmin() from public, anon;
grant execute on function public.is_superadmin() to authenticated;

-- ---------------------------------------------------------------------------
-- Every business except demos (a demo's owner signed in anonymously).
-- Last activity: the latest sign-in of a member or the latest entry, whichever is later
-- (a session lasts for weeks, so the sign-in alone gets old).

create function public.admin_businesses()
returns table (
  id uuid,
  name text,
  activity text,
  owner_name text,
  owner_email text,
  members integer,
  entries integer,
  last_activity timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_superadmin() then
    raise exception 'superadmin only' using errcode = '42501';
  end if;

  return query
  select
    b.id,
    b.name,
    b.activity,
    o.display_name,
    o.email,
    m.members,
    e.entries,
    greatest(m.last_sign_in, e.last_entry),
    b.created_at
  from public.businesses b
  join public.business_members o on o.business_id = b.id and o.role = 'owner'
  join auth.users ou on ou.id = o.user_id and not ou.is_anonymous
  cross join lateral (
    select count(*)::int as members, max(u.last_sign_in_at) as last_sign_in
    from public.business_members bm
    join auth.users u on u.id = bm.user_id
    where bm.business_id = b.id
  ) m
  cross join lateral (
    select count(*)::int as entries, max(en.created_at) as last_entry
    from public.entries en
    where en.business_id = b.id
  ) e
  order by greatest(m.last_sign_in, e.last_entry) desc nulls last, b.created_at desc;
end;
$$;

revoke all on function public.admin_businesses() from public, anon;
grant execute on function public.admin_businesses() to authenticated;

-- Totals for the cards on top. Demos are counted apart and left out of the rest.
create function public.admin_stats()
returns table (users integer, businesses integer, entries integer, demos integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_superadmin() then
    raise exception 'superadmin only' using errcode = '42501';
  end if;

  return query
  with demo as (
    select m.business_id
    from public.business_members m
    join auth.users u on u.id = m.user_id
    where m.role = 'owner' and u.is_anonymous
  )
  select
    (select count(*)::int from auth.users where not is_anonymous),
    (select count(*)::int from public.businesses where id not in (select business_id from demo)),
    (select count(*)::int from public.entries where business_id not in (select business_id from demo)),
    (select count(*)::int from demo);
end;
$$;

revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- Daniel's account. Does nothing if that account does not exist yet.
insert into public.superadmins (user_id)
select id from auth.users where email = 'daniel.monstr.kv@gmail.com' and not is_anonymous
on conflict do nothing;
