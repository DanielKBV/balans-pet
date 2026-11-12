-- Stage 7: team, invite links and employee rights.
-- Employees see only their own entries and may change or delete them for 24 hours.
-- They never see totals, the team list or invites.

-- Owner check used by policies and functions below.
-- security definer: reading business_members from its own policy would otherwise recurse.
create function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.business_members
    where user_id = (select auth.uid()) and role = 'owner'
  )
$$;

revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

-- ---------------------------------------------------------------------------
-- Names for the team list and «Кто внёс»: Google name if there is one, else the email.

alter table public.business_members
  add column email text,
  add column display_name text;

create function public.fill_member_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select
    u.email,
    coalesce(
      nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
      u.email
    )
  into new.email, new.display_name
  from auth.users u
  where u.id = new.user_id;
  return new;
end;
$$;

revoke all on function public.fill_member_profile() from public, anon, authenticated;

create trigger business_members_fill_profile
  before insert on public.business_members
  for each row execute function public.fill_member_profile();

-- Existing members (owners from stages 3–6).
update public.business_members m
set
  email = u.email,
  display_name = coalesce(
    nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
    u.email
  )
from auth.users u
where u.id = m.user_id;

-- ---------------------------------------------------------------------------
-- Team: the owner sees everyone and removes employees; an employee sees only their own row.

drop policy "Members read their team" on public.business_members;

create policy "Owner reads the team, members read themselves"
  on public.business_members for select to authenticated
  using (
    user_id = (select auth.uid())
    or (business_id = (select public.current_business_id()) and (select public.is_owner()))
  );

create policy "Owner removes employees"
  on public.business_members for delete to authenticated
  using (
    business_id = (select public.current_business_id())
    and role = 'employee'
    and (select public.is_owner())
  );

grant delete on public.business_members to authenticated;

-- ---------------------------------------------------------------------------
-- Invite links: one link, one person, valid for 7 days, one active link per business.
-- The id is the code in the link.

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null default public.current_business_id()
    references public.businesses (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  used_at timestamptz,
  used_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz
);

create index invites_business_id_idx on public.invites (business_id, created_at desc);

alter table public.invites enable row level security;

create policy "Owner reads invites"
  on public.invites for select to authenticated
  using (business_id = (select public.current_business_id()) and (select public.is_owner()));

create policy "Owner revokes invites"
  on public.invites for update to authenticated
  using (business_id = (select public.current_business_id()) and (select public.is_owner()))
  with check (business_id = (select public.current_business_id()));

revoke all on public.invites from anon, authenticated;
grant select on public.invites to authenticated;
grant update (revoked_at) on public.invites to authenticated;

-- One active link at a time: if the owner already has one, it is returned instead of a new one.
-- The next link can be made once this one is used, revoked or expired.
create function public.create_invite()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if not public.is_owner() then
    raise exception 'only the owner creates invites' using errcode = '42501';
  end if;

  -- Lock the business row so a double click cannot create two links.
  perform 1 from public.businesses where id = public.current_business_id() for update;

  select id into new_id
  from public.invites
  where business_id = public.current_business_id()
    and used_at is null and revoked_at is null and expires_at > now()
  order by created_at desc
  limit 1;
  if found then
    return new_id;
  end if;

  insert into public.invites (business_id)
  values (public.current_business_id())
  returning id into new_id;
  return new_id;
end;
$$;

-- What the invite page shows before sign-in: business name and link status.
-- Anyone with the code may ask; without it nothing can be found.
create function public.invite_info(p_code uuid)
returns table (business_name text, status text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    b.name,
    case
      when i.revoked_at is not null then 'revoked'
      when i.used_at is not null then 'used'
      when i.expires_at <= now() then 'expired'
      else 'active'
    end
  from public.invites i
  join public.businesses b on b.id = i.business_id
  where i.id = p_code
$$;

-- Joins the business as an employee and spends the link, in one transaction.
create function public.accept_invite(p_code uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite public.invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;

  -- Lock the link: two people opening it at once cannot both join.
  select * into invite from public.invites where id = p_code for update;
  if not found then
    raise exception 'invite not found' using errcode = 'P0002';
  end if;
  if invite.revoked_at is not null or invite.used_at is not null or invite.expires_at <= now() then
    raise exception 'invite is not active' using errcode = '22023';
  end if;
  if exists (select 1 from public.business_members where user_id = auth.uid()) then
    raise exception 'already in a business' using errcode = '23505';
  end if;

  insert into public.business_members (user_id, business_id, role)
  values (auth.uid(), invite.business_id, 'employee');

  update public.invites set used_at = now(), used_by = auth.uid() where id = invite.id;
  return invite.business_id;
end;
$$;

revoke all on function public.create_invite() from public, anon;
revoke all on function public.invite_info(uuid) from public;
revoke all on function public.accept_invite(uuid) from public, anon;
grant execute on function public.create_invite() to authenticated;
grant execute on function public.invite_info(uuid) to anon, authenticated;
grant execute on function public.accept_invite(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Entries: employees read their own and change or delete them for 24 hours after adding.
-- The owner policies from 0003 stay as they are (policies of one kind are combined with OR).

create policy "Employees read own entries"
  on public.entries for select to authenticated
  using (business_id = (select public.current_business_id()) and created_by = (select auth.uid()));

create policy "Employees edit own entries for 24 hours"
  on public.entries for update to authenticated
  using (
    business_id = (select public.current_business_id())
    and created_by = (select auth.uid())
    and created_at > now() - interval '24 hours'
  )
  with check (
    business_id = (select public.current_business_id())
    and created_by = (select auth.uid())
    and entry_date <= (now() at time zone 'Asia/Bishkek')::date
  );

create policy "Employees delete own entries for 24 hours"
  on public.entries for delete to authenticated
  using (
    business_id = (select public.current_business_id())
    and created_by = (select auth.uid())
    and created_at > now() - interval '24 hours'
  );

-- ---------------------------------------------------------------------------
-- Dashboard sums: owner only. Employees would otherwise get sums of their own entries.

create or replace function public.monthly_totals(p_from date, p_to date)
returns table (month date, income bigint, expense bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    date_trunc('month', entry_date)::date as month,
    coalesce(sum(amount) filter (where type = 'income'), 0)::bigint as income,
    coalesce(sum(amount) filter (where type = 'expense'), 0)::bigint as expense
  from public.entries
  where entry_date between p_from and p_to
    and (select public.is_owner())
  group by 1
  order by 1
$$;

create or replace function public.expense_by_category(p_from date, p_to date)
returns table (category_id uuid, name text, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.category_id, c.name, sum(e.amount)::bigint as total
  from public.entries e
  join public.categories c on c.id = e.category_id
  where e.type = 'expense'
    and e.entry_date between p_from and p_to
    and (select public.is_owner())
  group by e.category_id, c.name
  order by total desc, c.name
$$;
