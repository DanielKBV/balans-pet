-- Stage 4: the owner adds, renames and hides categories.
-- No deletes for anyone: entries will reference categories from stage 5.

-- The app never sends business_id: the database fills in the caller's business.
alter table public.categories
  alter column business_id set default public.current_business_id();

create policy "Owner adds categories"
  on public.categories for insert to authenticated
  with check (
    business_id = (select public.current_business_id())
    and exists (
      select 1 from public.business_members
      where user_id = (select auth.uid()) and role = 'owner'
    )
  );

create policy "Owner edits categories"
  on public.categories for update to authenticated
  using (
    business_id = (select public.current_business_id())
    and exists (
      select 1 from public.business_members
      where user_id = (select auth.uid()) and role = 'owner'
    )
  )
  with check (business_id = (select public.current_business_id()));

-- Column grants: business_id, type and created_at cannot be changed after insert.
grant insert (name, type) on public.categories to authenticated;
grant update (name, is_hidden) on public.categories to authenticated;
