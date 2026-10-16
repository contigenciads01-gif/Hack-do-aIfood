-- Migration: Minha Empresa (Cadastro Concluído, Banner, Contato, Localização, Negócio) e Detalhes dos Pratos

-- 1. Campos extras em companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS cadastro_concluido boolean DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS banner_path text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS site text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS email_publico text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS endereco jsonb DEFAULT '{"rua":"","numero":"","bairro":"","cidade":"","uf":"","cep":"","complemento":""}'::jsonb;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS mostrar_endereco_anuncios boolean DEFAULT false;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS formas_atendimento text[] DEFAULT '{}';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS horario_funcionamento jsonb DEFAULT '{}'::jsonb;

-- Preenche com true empresas já cadastradas com nome e categoria
UPDATE public.companies
SET cadastro_concluido = true
WHERE nome IS NOT NULL
  AND trim(nome) != ''
  AND categoria IS NOT NULL
  AND trim(categoria) != '';

-- 2. Campos extras em pratos (ingredientes, preço e destaque)
ALTER TABLE public.pratos ADD COLUMN IF NOT EXISTS ingredientes text[] DEFAULT '{}';
ALTER TABLE public.pratos ADD COLUMN IF NOT EXISTS preco numeric;
ALTER TABLE public.pratos ADD COLUMN IF NOT EXISTS destaque text;

-- 3. Bucket de storage company-assets (se o bucket storage existir)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'company-assets',
    'company-assets',
    false,
    10485760, -- 10MB
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760;
EXCEPTION
  WHEN undefined_table THEN
    -- Em ambiente local onde storage.buckets pode não estar carregado
    NULL;
END $$;

-- Policies de RLS para company-assets
DO $$
BEGIN
  DROP POLICY IF EXISTS "company_assets_select_own" ON storage.objects;
  CREATE POLICY "company_assets_select_own" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'company-assets' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );

  DROP POLICY IF EXISTS "company_assets_insert_own" ON storage.objects;
  CREATE POLICY "company_assets_insert_own" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'company-assets' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );

  DROP POLICY IF EXISTS "company_assets_update_own" ON storage.objects;
  CREATE POLICY "company_assets_update_own" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'company-assets' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );

  DROP POLICY IF EXISTS "company_assets_delete_own" ON storage.objects;
  CREATE POLICY "company_assets_delete_own" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'company-assets' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;
