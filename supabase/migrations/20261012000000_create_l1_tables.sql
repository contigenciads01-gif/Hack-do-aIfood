-- Migration for L1: Companies, Prompt Drafts, Materials and Storage Bucket

-- 1. Ensure companies table
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  categoria text not null,
  cidade text,
  whatsapp text,
  instagram text,
  horario text,
  slogan text,
  tem_logo boolean default false,
  logo_path text,
  cores jsonb default '[]'::jsonb,
  personalidade text[] default '{}',
  tom text,
  publico text[] default '{}',
  faixa_preco text,
  diferenciais text[] default '{}',
  estilo_visual text,
  data_inicio date default current_date,
  nivel int default 1,
  cadastro_passo int default 1,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- In case companies existed before with partial columns
alter table public.companies add column if not exists estilo_visual text;
alter table public.companies add column if not exists cadastro_passo int default 1;
alter table public.companies add column if not exists criado_em timestamptz default now();
alter table public.companies add column if not exists atualizado_em timestamptz default now();

alter table public.companies enable row level security;

drop policy if exists "companies_select_own" on public.companies;
create policy "companies_select_own" on public.companies
  for select using (auth.uid() = user_id);

drop policy if exists "companies_insert_own" on public.companies;
create policy "companies_insert_own" on public.companies
  for insert with check (auth.uid() = user_id);

drop policy if exists "companies_update_own" on public.companies;
create policy "companies_update_own" on public.companies
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "companies_delete_own" on public.companies;
create policy "companies_delete_own" on public.companies
  for delete using (auth.uid() = user_id);

-- 2. Prompt drafts
create table if not exists public.prompt_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null,
  values jsonb default '{}'::jsonb,
  template text not null,
  texto text,
  original text,
  atualizado_em timestamptz default now(),
  constraint prompt_drafts_user_tool_key unique (user_id, tool)
);

alter table public.prompt_drafts enable row level security;

drop policy if exists "prompt_drafts_select_own" on public.prompt_drafts;
create policy "prompt_drafts_select_own" on public.prompt_drafts
  for select using (auth.uid() = user_id);

drop policy if exists "prompt_drafts_insert_own" on public.prompt_drafts;
create policy "prompt_drafts_insert_own" on public.prompt_drafts
  for insert with check (auth.uid() = user_id);

drop policy if exists "prompt_drafts_update_own" on public.prompt_drafts;
create policy "prompt_drafts_update_own" on public.prompt_drafts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "prompt_drafts_delete_own" on public.prompt_drafts;
create policy "prompt_drafts_delete_own" on public.prompt_drafts
  for delete using (auth.uid() = user_id);

-- 3. Materials
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null,
  template text not null,
  title text not null,
  text text not null,
  original text,
  summary jsonb default '[]'::jsonb,
  criado_em timestamptz default now()
);

alter table public.materials enable row level security;

drop policy if exists "materials_select_own" on public.materials;
create policy "materials_select_own" on public.materials
  for select using (auth.uid() = user_id);

drop policy if exists "materials_insert_own" on public.materials;
create policy "materials_insert_own" on public.materials
  for insert with check (auth.uid() = user_id);

drop policy if exists "materials_update_own" on public.materials;
create policy "materials_update_own" on public.materials
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "materials_delete_own" on public.materials;
create policy "materials_delete_own" on public.materials
  for delete using (auth.uid() = user_id);

-- 4. Storage Bucket: company-assets
insert into storage.buckets (id, name, public)
values ('company-assets', 'company-assets', false)
on conflict (id) do nothing;

drop policy if exists "company_assets_select" on storage.objects;
create policy "company_assets_select" on storage.objects
  for select using (bucket_id = 'company-assets' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "company_assets_insert" on storage.objects;
create policy "company_assets_insert" on storage.objects
  for insert with check (bucket_id = 'company-assets' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "company_assets_update" on storage.objects;
create policy "company_assets_update" on storage.objects
  for update using (bucket_id = 'company-assets' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "company_assets_delete" on storage.objects;
create policy "company_assets_delete" on storage.objects
  for delete using (bucket_id = 'company-assets' and auth.uid()::text = (storage.foldername(name))[1]);
