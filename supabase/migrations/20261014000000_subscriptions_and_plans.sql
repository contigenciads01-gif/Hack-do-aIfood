-- Migration: Subscriptions, Roles, and Plan Access Control

-- 1. Clean up any previous credit tables/functions if they exist
drop table if exists public.credit_ledger cascade;
drop function if exists public.spend_credit cascade;
drop function if exists public.refund_credit cascade;

-- 2. User Roles Table
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  criado_em timestamptz not null default now(),
  constraint user_roles_user_role_key unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Function to check if a user has a specific role (SECURITY DEFINER)
create or replace function public.has_role(uid uuid, role_name text)
returns boolean as $$
begin
  return exists (
    select 1
    from public.user_roles
    where user_id = uid and role = role_name
  );
end;
$$ language plpgsql security definer;

-- RLS policies for user_roles:
drop policy if exists "user_roles_select" on public.user_roles;
create policy "user_roles_select" on public.user_roles
  for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "user_roles_admin_write" on public.user_roles;
create policy "user_roles_admin_write" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3. Subscriptions Table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plano text not null check (plano in ('experimental', 'mensal', 'trimestral')),
  status text not null default 'ativo' check (status in ('ativo', 'expirado', 'cancelado')),
  inicio timestamptz not null default now(),
  fim timestamptz not null,
  origem text not null default 'trial' check (origem in ('trial', 'manual')),
  criado_em timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Function to check if a user has an active plan (SECURITY DEFINER)
create or replace function public.has_active_plan(uid uuid default auth.uid())
returns boolean as $$
begin
  -- Admins always have access
  if public.has_role(uid, 'admin') then
    return true;
  end if;

  return exists (
    select 1
    from public.subscriptions
    where user_id = uid
      and status = 'ativo'
      and fim > now()
  );
end;
$$ language plpgsql security definer;

-- RLS policies for subscriptions
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

drop policy if exists "subscriptions_admin_insert" on public.subscriptions;
create policy "subscriptions_admin_insert" on public.subscriptions
  for insert with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "subscriptions_admin_update" on public.subscriptions;
create policy "subscriptions_admin_update" on public.subscriptions
  for update using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "subscriptions_admin_delete" on public.subscriptions;
create policy "subscriptions_admin_delete" on public.subscriptions
  for delete using (public.has_role(auth.uid(), 'admin'));

-- 4. Trigger to grant 7-day experimental trial on new user creation
create or replace function public.handle_new_user_trial()
returns trigger as $$
begin
  -- Only grant trial if no subscription exists yet for this user
  if not exists (select 1 from public.subscriptions where user_id = new.id) then
    insert into public.subscriptions (user_id, plano, status, inicio, fim, origem)
    values (
      new.id,
      'experimental',
      'ativo',
      now(),
      now() + interval '7 days',
      'trial'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_trial on auth.users;
create trigger on_auth_user_created_trial
  after insert on auth.users
  for each row execute function public.handle_new_user_trial();

-- 5. Backfill existing users with 7-day trial starting now (if they have no subscription)
insert into public.subscriptions (user_id, plano, status, inicio, fim, origem)
select
  u.id,
  'experimental',
  'ativo',
  now(),
  now() + interval '7 days',
  'trial'
from auth.users u
where not exists (
  select 1 from public.subscriptions s where s.user_id = u.id
);

-- 6. Function admin_set_subscription(user_id, plano)
create or replace function public.admin_set_subscription(target_user_id uuid, target_plano text)
returns jsonb as $$
declare
  plan_duration interval;
  new_sub_id uuid;
begin
  -- Verify calling user is admin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Apenas administradores podem alterar assinaturas.';
  end if;

  if target_plano = 'experimental' then
    plan_duration := interval '7 days';
  elsif target_plano = 'mensal' then
    plan_duration := interval '30 days';
  elsif target_plano = 'trimestral' then
    plan_duration := interval '90 days';
  else
    raise exception 'Plano inválido: %', target_plano;
  end if;

  -- Deactivate previous active subscriptions
  update public.subscriptions
  set status = 'cancelado'
  where user_id = target_user_id and status = 'ativo';

  -- Insert new active subscription
  insert into public.subscriptions (user_id, plano, status, inicio, fim, origem)
  values (
    target_user_id,
    target_plano,
    'ativo',
    now(),
    now() + plan_duration,
    'manual'
  )
  returning id into new_sub_id;

  return jsonb_build_object(
    'success', true,
    'subscription_id', new_sub_id,
    'plano', target_plano,
    'fim', (now() + plan_duration)
  );
end;
$$ language plpgsql security definer;

-- 7. Apply has_active_plan() on write policies of user tables
-- Prompt drafts:
drop policy if exists "prompt_drafts_insert_own" on public.prompt_drafts;
create policy "prompt_drafts_insert_own" on public.prompt_drafts
  for insert with check (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  );

drop policy if exists "prompt_drafts_update_own" on public.prompt_drafts;
create policy "prompt_drafts_update_own" on public.prompt_drafts
  for update using (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  ) with check (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  );

-- Materials:
drop policy if exists "materials_insert_own" on public.materials;
create policy "materials_insert_own" on public.materials
  for insert with check (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  );
