-- Migration: Pratos, Fotos por Prato (máximo 3) e vinculação em Materiais

-- 1. Tabela de Pratos
create table if not exists public.pratos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  criado_em timestamptz not null default now(),
  constraint pratos_user_nome_key unique (user_id, nome)
);

alter table public.pratos enable row level security;

drop policy if exists "pratos_select_own" on public.pratos;
create policy "pratos_select_own" on public.pratos
  for select using (auth.uid() = user_id);

drop policy if exists "pratos_insert_own" on public.pratos;
create policy "pratos_insert_own" on public.pratos
  for insert with check (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  );

drop policy if exists "pratos_update_own" on public.pratos;
create policy "pratos_update_own" on public.pratos
  for update using (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  ) with check (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  );

drop policy if exists "pratos_delete_own" on public.pratos;
create policy "pratos_delete_own" on public.pratos
  for delete using (auth.uid() = user_id);

-- 2. Tabela de Fotos do Prato (máximo 3 fotos garantido por constraint de slot 1 a 3 e chave única)
create table if not exists public.prato_fotos (
  id uuid primary key default gen_random_uuid(),
  prato_id uuid not null references public.pratos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  slot int not null check (slot in (1, 2, 3)),
  storage_path text not null,
  criado_em timestamptz not null default now(),
  constraint prato_fotos_prato_slot_key unique (prato_id, slot)
);

alter table public.prato_fotos enable row level security;

drop policy if exists "prato_fotos_select_own" on public.prato_fotos;
create policy "prato_fotos_select_own" on public.prato_fotos
  for select using (auth.uid() = user_id);

drop policy if exists "prato_fotos_insert_own" on public.prato_fotos;
create policy "prato_fotos_insert_own" on public.prato_fotos
  for insert with check (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  );

drop policy if exists "prato_fotos_update_own" on public.prato_fotos;
create policy "prato_fotos_update_own" on public.prato_fotos
  for update using (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  ) with check (
    auth.uid() = user_id and public.has_active_plan(auth.uid())
  );

drop policy if exists "prato_fotos_delete_own" on public.prato_fotos;
create policy "prato_fotos_delete_own" on public.prato_fotos
  for delete using (auth.uid() = user_id);

-- 3. Atualizar tabela materials com prato_id e tipo
alter table public.materials add column if not exists prato_id uuid references public.pratos(id) on delete set null;
alter table public.materials add column if not exists tipo text default 'prompt';
