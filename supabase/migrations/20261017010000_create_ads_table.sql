-- Migration: Tabela de Anúncios e Rascunhos de Criação Livre (ads)

CREATE TABLE IF NOT EXISTS public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text,
  preco numeric,
  mostrar_preco boolean DEFAULT true,
  frases jsonb DEFAULT '[]'::jsonb,
  formato text DEFAULT '9:16',
  imagem_fundo_url text,
  logo_posicao text DEFAULT 'top-right',
  mostrar_logo boolean DEFAULT true,
  preset_origem text,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Habilita RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS: Usuário só enxerga, cria, altera e remove os próprios anúncios
DROP POLICY IF EXISTS "ads_select_own" ON public.ads;
CREATE POLICY "ads_select_own" ON public.ads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ads_insert_own" ON public.ads;
CREATE POLICY "ads_insert_own" ON public.ads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ads_update_own" ON public.ads;
CREATE POLICY "ads_update_own" ON public.ads
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ads_delete_own" ON public.ads;
CREATE POLICY "ads_delete_own" ON public.ads
  FOR DELETE USING (auth.uid() = user_id);
