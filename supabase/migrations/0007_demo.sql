-- Stage 8д: demo mode.
-- «Посмотреть демо» signs the guest in anonymously (Supabase anonymous sign-in) and gives them
-- their own fresh «Автомойка Азамата» with six months of entries (as many as the dashboard chart). Guests never see each other.
-- Demo businesses and their anonymous users are deleted after 24 hours (pg_cron).
-- Needs in the dashboard: Authentication → Allow anonymous sign-ins; Integrations → Cron.

create function public.is_demo_guest()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
$$;

revoke all on function public.is_demo_guest() from public, anon;
grant execute on function public.is_demo_guest() to authenticated;

-- ---------------------------------------------------------------------------
-- The demo business: starter categories from create_business, owner «Азамат»,
-- entries from the first day of the month five months ago up to today (Bishkek).
-- A second call returns the guest's existing business.

create function public.create_demo_business()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  demo_id uuid;
  today date := (now() at time zone 'Asia/Bishkek')::date;
  first_day date := (date_trunc('month', (now() at time zone 'Asia/Bishkek')) - interval '5 months')::date;
begin
  if auth.uid() is null or not public.is_demo_guest() then
    raise exception 'the demo is for guests only' using errcode = '42501';
  end if;

  select business_id into demo_id from public.business_members where user_id = auth.uid();
  if found then
    return demo_id;
  end if;

  demo_id := public.create_business('Автомойка Азамата', 'Автомойка');
  update public.business_members set display_name = 'Азамат' where user_id = auth.uid();

  -- Amounts are whole soms rounded to 100. random() runs per row, so every guest gets other numbers.
  -- Salary on the last day of the month, so an unfinished current month is not shown at a loss.
  insert into public.entries (business_id, type, amount, category_id, entry_date, comment, created_by)
  select demo_id, c.type, r.amount, c.id, days.day, r.comment, auth.uid()
  from (
    select d::date as day from generate_series(first_day, today, interval '1 day') as d
  ) as days
  cross join lateral (
    values
      ('income',  'Мойка кузова',               (round((3000 + random() * 3500) / 100) * 100)::int, null::text, true),
      ('income',  'Комплексная мойка',          (round((2000 + random() * 4000) / 100) * 100)::int, null, true),
      ('income',  'Химчистка салона',           (round((2500 + random() * 1500) / 100) * 100)::int, null, random() < 0.4),
      ('income',  'Прочее',                     (round((500 + random() * 1000) / 100) * 100)::int, 'Полировка фар', random() < 0.15),
      ('expense', 'Аренда',                     45000, 'Аренда бокса', extract(day from days.day) = 1),
      ('expense', 'Зарплата',                   90000, 'Двое мойщиков', days.day = (date_trunc('month', days.day) + interval '1 month - 1 day')::date),
      ('expense', 'Расходники (шампунь, воск)', (round((4000 + random() * 3000) / 100) * 100)::int, null, extract(isodow from days.day) = 1),
      ('expense', 'Коммунальные',               (round((6000 + random() * 3000) / 100) * 100)::int, 'Вода и свет', extract(day from days.day) = 10),
      ('expense', 'Прочее',                     (round((1000 + random() * 4000) / 100) * 100)::int, 'Ремонт аппарата', random() < 0.04)
  ) as r (type, category, amount, comment, happens)
  join public.categories c
    on c.business_id = demo_id and c.type = r.type and c.name = r.category
  where r.happens;

  return demo_id;
end;
$$;

revoke all on function public.create_demo_business() from public, anon;
grant execute on function public.create_demo_business() to authenticated;

-- ---------------------------------------------------------------------------
-- A demo guest must not invite real people into a business that disappears tomorrow,
-- and must not join a real business by someone's invite link.

create function public.block_demo_guest()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_demo_guest() then
    raise exception 'not available in the demo' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.block_demo_guest() from public, anon, authenticated;

create trigger invites_no_demo_guest
  before insert on public.invites
  for each row execute function public.block_demo_guest();

create trigger business_members_no_demo_employee
  before insert on public.business_members
  for each row when (new.role = 'employee') execute function public.block_demo_guest();

-- ---------------------------------------------------------------------------
-- Every hour: businesses owned by anonymous users older than 24 hours, then those users.

create function public.delete_old_demos()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.businesses
  where id in (
    select m.business_id
    from public.business_members m
    join auth.users u on u.id = m.user_id
    where m.role = 'owner' and u.is_anonymous and u.created_at < now() - interval '24 hours'
  );

  delete from auth.users
  where is_anonymous and created_at < now() - interval '24 hours';
$$;

revoke all on function public.delete_old_demos() from public, anon, authenticated;

-- Same as Integrations → Cron in the dashboard.
create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule('delete-old-demos', '0 * * * *', 'select public.delete_old_demos()');
