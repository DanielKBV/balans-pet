-- Stage 6: dashboard sums are calculated in the database.
-- Supabase returns at most 1000 rows per request, so summing rows in the app
-- would silently go wrong once a business has more entries than that.
-- security invoker: the caller's RLS applies, so each owner sums only their own business.

create function public.monthly_totals(p_from date, p_to date)
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
  group by 1
  order by 1
$$;

create function public.expense_by_category(p_from date, p_to date)
returns table (category_id uuid, name text, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.category_id, c.name, sum(e.amount)::bigint as total
  from public.entries e
  join public.categories c on c.id = e.category_id
  where e.type = 'expense' and e.entry_date between p_from and p_to
  group by e.category_id, c.name
  order by total desc, c.name
$$;

revoke all on function public.monthly_totals(date, date) from public, anon;
revoke all on function public.expense_by_category(date, date) from public, anon;
grant execute on function public.monthly_totals(date, date) to authenticated;
grant execute on function public.expense_by_category(date, date) to authenticated;
