-- Stage 8a: settings. The owner renames and deletes the business;
-- every member edits their own display name.

create policy "Owner edits the business"
  on public.businesses for update to authenticated
  using (id = (select public.current_business_id()) and (select public.is_owner()))
  with check (id = (select public.current_business_id()));

-- Cascades to members, categories, entries and invites. User accounts stay:
-- everyone lands on /onboarding next time.
create policy "Owner deletes the business"
  on public.businesses for delete to authenticated
  using (id = (select public.current_business_id()) and (select public.is_owner()));

grant update (name, activity) on public.businesses to authenticated;
grant delete on public.businesses to authenticated;

-- ---------------------------------------------------------------------------
-- Own name, shown in «Кто внёс» and the team list.

alter table public.business_members
  add constraint business_members_display_name_length
  check (display_name is null or char_length(btrim(display_name)) between 1 and 100);

create policy "Members edit their own name"
  on public.business_members for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant update (display_name) on public.business_members to authenticated;
