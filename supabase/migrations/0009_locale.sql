-- RUN 1 (launch): a business remembers its language.
-- Starter categories are created in the language chosen when the business was created;
-- the demo («Автомойка Азамата» / «Azamat's Car Wash») opens in the visitor's language.
-- Safe on the live database: existing businesses get 'ru', nothing is deleted, RLS policies are untouched.
-- Error texts stay in the app dictionaries: these functions answer with error codes only.

alter table public.businesses
  add column locale text not null default 'ru' check (locale in ('ru', 'en'));

-- ---------------------------------------------------------------------------
-- create_business gets a third argument with a default. A new argument cannot be added with
-- «create or replace» (it would make a second function and an ambiguous two-argument call),
-- so the old one is dropped and created again; calls with two arguments keep working.

drop function public.create_business(text, text);

create function public.create_business(p_name text, p_activity text, p_locale text default 'ru')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_business_id uuid;
  -- Anything but 'en' is Russian: the column check would reject an unknown value anyway.
  business_locale text := case when p_locale = 'en' then 'en' else 'ru' end;
begin
  insert into public.businesses (name, activity, locale)
  values (btrim(p_name), btrim(p_activity), business_locale)
  returning id into new_business_id;

  insert into public.business_members (user_id, business_id, role)
  values (auth.uid(), new_business_id, 'owner');

  insert into public.categories (business_id, name, type)
  select new_business_id, case when business_locale = 'en' then starter.en else starter.ru end, starter.type
  from (values
    ('Мойка кузова', 'Exterior wash', 'income'),
    ('Комплексная мойка', 'Full wash', 'income'),
    ('Химчистка салона', 'Interior detailing', 'income'),
    ('Прочее', 'Other', 'income'),
    ('Аренда', 'Rent', 'expense'),
    ('Зарплата', 'Payroll', 'expense'),
    ('Расходники (шампунь, воск)', 'Supplies (shampoo, wax)', 'expense'),
    ('Коммунальные', 'Utilities', 'expense'),
    ('Прочее', 'Other', 'expense')
  ) as starter (ru, en, type);

  return new_business_id;
end;
$$;

revoke all on function public.create_business(text, text, text) from public, anon;
grant execute on function public.create_business(text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- The demo in the visitor's language, the same data as in 0007.
-- A second call returns the guest's demo; if it is in the other language, it is replaced.

drop function public.create_demo_business();

create function public.create_demo_business(p_locale text default 'ru')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  demo_id uuid;
  demo_locale text := case when p_locale = 'en' then 'en' else 'ru' end;
  today date := (now() at time zone 'Asia/Bishkek')::date;
  first_day date := (date_trunc('month', (now() at time zone 'Asia/Bishkek')) - interval '5 months')::date;
begin
  if auth.uid() is null or not public.is_demo_guest() then
    raise exception 'the demo is for guests only' using errcode = '42501';
  end if;

  select m.business_id into demo_id
  from public.business_members m
  join public.businesses b on b.id = m.business_id
  where m.user_id = auth.uid() and b.locale = demo_locale;
  if found then
    return demo_id;
  end if;
  -- The guest switched language: the old demo goes (members, categories and entries cascade).
  delete from public.businesses
  where id in (select business_id from public.business_members where user_id = auth.uid());

  if demo_locale = 'en' then
    demo_id := public.create_business('Azamat''s Car Wash', 'Car wash', 'en');
    update public.business_members set display_name = 'Azamat' where user_id = auth.uid();
  else
    demo_id := public.create_business('Автомойка Азамата', 'Автомойка', 'ru');
    update public.business_members set display_name = 'Азамат' where user_id = auth.uid();
  end if;

  -- Amounts are whole soms rounded to 100. random() runs per row, so every guest gets other numbers.
  -- Salary on the last day of the month, so an unfinished current month is not shown at a loss.
  insert into public.entries (business_id, type, amount, category_id, entry_date, comment, created_by)
  select demo_id, c.type, r.amount, c.id, days.day,
    case when demo_locale = 'en' then r.comment_en else r.comment_ru end,
    auth.uid()
  from (
    select d::date as day from generate_series(first_day, today, interval '1 day') as d
  ) as days
  cross join lateral (
    values
      ('income',  'Мойка кузова',               'Exterior wash',           (round((3000 + random() * 3500) / 100) * 100)::int, null::text, null::text, true),
      ('income',  'Комплексная мойка',          'Full wash',               (round((2000 + random() * 4000) / 100) * 100)::int, null, null, true),
      ('income',  'Химчистка салона',           'Interior detailing',      (round((2500 + random() * 1500) / 100) * 100)::int, null, null, random() < 0.4),
      ('income',  'Прочее',                     'Other',                   (round((500 + random() * 1000) / 100) * 100)::int, 'Полировка фар', 'Headlight polishing', random() < 0.15),
      ('expense', 'Аренда',                     'Rent',                    45000, 'Аренда бокса', 'Bay rent', extract(day from days.day) = 1),
      ('expense', 'Зарплата',                   'Payroll',                 90000, 'Двое мойщиков', 'Two washers', days.day = (date_trunc('month', days.day) + interval '1 month - 1 day')::date),
      ('expense', 'Расходники (шампунь, воск)', 'Supplies (shampoo, wax)', (round((4000 + random() * 3000) / 100) * 100)::int, null, null, extract(isodow from days.day) = 1),
      ('expense', 'Коммунальные',               'Utilities',               (round((6000 + random() * 3000) / 100) * 100)::int, 'Вода и свет', 'Water and power', extract(day from days.day) = 10),
      ('expense', 'Прочее',                     'Other',                   (round((1000 + random() * 4000) / 100) * 100)::int, 'Ремонт аппарата', 'Pressure washer repair', random() < 0.04)
  ) as r (type, category_ru, category_en, amount, comment_ru, comment_en, happens)
  join public.categories c
    on c.business_id = demo_id and c.type = r.type
    and c.name = case when demo_locale = 'en' then r.category_en else r.category_ru end
  where r.happens;

  return demo_id;
end;
$$;

revoke all on function public.create_demo_business(text) from public, anon;
grant execute on function public.create_demo_business(text) to authenticated;
