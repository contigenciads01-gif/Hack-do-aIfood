-- Migration to add plano column to companies table
alter table public.companies add column if not exists plano text default 'gratuito';
alter table public.companies add column if not exists responsavel text;

-- Restrict saving prompt drafts of 'anuncios' only to Plus users
create or replace function public.check_user_is_plus()
returns boolean as $$
declare
  user_plano text;
  user_nivel int;
begin
  select plano, nivel into user_plano, user_nivel
  from public.companies
  where user_id = auth.uid()
  limit 1;

  return (user_plano = 'plus' or coalesce(user_nivel, 1) >= 2);
end;
$$ language plpgsql security definer;

-- Drop and re-create prompt_drafts policy with Plus guard for anuncios tool
drop policy if exists "prompt_drafts_insert_own" on public.prompt_drafts;
create policy "prompt_drafts_insert_own" on public.prompt_drafts
  for insert with check (
    auth.uid() = user_id and
    (tool != 'anuncios' or public.check_user_is_plus())
  );

drop policy if exists "prompt_drafts_update_own" on public.prompt_drafts;
create policy "prompt_drafts_update_own" on public.prompt_drafts
  for update using (
    auth.uid() = user_id and
    (tool != 'anuncios' or public.check_user_is_plus())
  ) with check (
    auth.uid() = user_id and
    (tool != 'anuncios' or public.check_user_is_plus())
  );
