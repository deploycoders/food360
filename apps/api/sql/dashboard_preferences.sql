-- Run once in the Supabase SQL Editor (or through the project's migration runner).
-- The API uses supabaseAdmin, while RLS also protects direct authenticated access.
create table if not exists public.dashboard_preferences (
  user_id uuid not null references auth.users (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  layout jsonb not null default '{"widgets":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dashboard_preferences_layout_object
    check (jsonb_typeof(layout) = 'object')
);

create unique index if not exists dashboard_preferences_user_restaurant_idx
  on public.dashboard_preferences (user_id, restaurant_id);

create index if not exists dashboard_preferences_restaurant_id_idx
  on public.dashboard_preferences (restaurant_id);

alter table public.dashboard_preferences enable row level security;

drop policy if exists dashboard_preferences_select_own_active_restaurant
  on public.dashboard_preferences;
create policy dashboard_preferences_select_own_active_restaurant
  on public.dashboard_preferences for select to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.restaurant_members membership
      where membership.user_id = auth.uid()
        and membership.restaurant_id = dashboard_preferences.restaurant_id
        and membership.is_active = true
    )
  );

drop policy if exists dashboard_preferences_insert_own_active_restaurant
  on public.dashboard_preferences;
create policy dashboard_preferences_insert_own_active_restaurant
  on public.dashboard_preferences for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.restaurant_members membership
      where membership.user_id = auth.uid()
        and membership.restaurant_id = dashboard_preferences.restaurant_id
        and membership.is_active = true
    )
  );

drop policy if exists dashboard_preferences_update_own_active_restaurant
  on public.dashboard_preferences;
create policy dashboard_preferences_update_own_active_restaurant
  on public.dashboard_preferences for update to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.restaurant_members membership
      where membership.user_id = auth.uid()
        and membership.restaurant_id = dashboard_preferences.restaurant_id
        and membership.is_active = true
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.restaurant_members membership
      where membership.user_id = auth.uid()
        and membership.restaurant_id = dashboard_preferences.restaurant_id
        and membership.is_active = true
    )
  );

drop policy if exists dashboard_preferences_delete_own_active_restaurant
  on public.dashboard_preferences;
create policy dashboard_preferences_delete_own_active_restaurant
  on public.dashboard_preferences for delete to authenticated
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.restaurant_members membership
      where membership.user_id = auth.uid()
        and membership.restaurant_id = dashboard_preferences.restaurant_id
        and membership.is_active = true
    )
  );
