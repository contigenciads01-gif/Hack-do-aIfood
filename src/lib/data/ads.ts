import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface AdPhrase {
  id: string;
  texto: string;
}

export interface AdItem {
  id?: string;
  user_id: string;
  titulo?: string | null;
  preco?: number | null;
  mostrar_preco: boolean;
  frases: AdPhrase[];
  formato: '9:16' | '1:1';
  imagem_fundo_url?: string | null;
  logo_posicao: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right';
  mostrar_logo: boolean;
  preset_origem?: string | null;
  criado_em?: string;
  atualizado_em?: string;
}

export function useAds() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ads', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<AdItem[]> => {
      if (!user?.id) return [];

      try {
        const { data, error } = await supabase
          .from('ads' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });

        if (error) {
          console.warn('Erro ao carregar rascunhos de anúncios:', error.message);
          return [];
        }

        return (data || []).map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          titulo: row.titulo ?? '',
          preco: row.preco ? Number(row.preco) : null,
          mostrar_preco: row.mostrar_preco !== false,
          frases: Array.isArray(row.frases) ? row.frases : [],
          formato: row.formato === '1:1' ? '1:1' : '9:16',
          imagem_fundo_url: row.imagem_fundo_url ?? null,
          logo_posicao: row.logo_posicao || 'top-right',
          mostrar_logo: row.mostrar_logo !== false,
          preset_origem: row.preset_origem ?? null,
          criado_em: row.criado_em,
          atualizado_em: row.atualizado_em,
        }));
      } catch (err) {
        console.warn('Exceção ao buscar anúncios:', err);
        return [];
      }
    },
  });
}

export function useSaveAd() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<AdItem>): Promise<AdItem> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const adData: Record<string, any> = {
        user_id: user.id,
        titulo: payload.titulo !== undefined ? payload.titulo : null,
        preco: payload.preco !== undefined ? payload.preco : null,
        mostrar_preco: payload.mostrar_preco ?? true,
        frases: payload.frases || [],
        formato: payload.formato || '9:16',
        imagem_fundo_url: payload.imagem_fundo_url ?? null,
        logo_posicao: payload.logo_posicao || 'top-right',
        mostrar_logo: payload.mostrar_logo ?? true,
        preset_origem: payload.preset_origem ?? null,
        atualizado_em: new Date().toISOString(),
      };

      if (payload.id) {
        const { data, error } = await supabase
          .from('ads' as any)
          .update(adData)
          .eq('id', payload.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || 'Erro ao atualizar rascunho');
        }
        return data as unknown as AdItem;
      } else {
        const { data, error } = await supabase
          .from('ads' as any)
          .insert(adData)
          .select()
          .single();

        if (error) {
          throw new Error(error.message || 'Erro ao criar anúncio');
        }
        return data as unknown as AdItem;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', user?.id] });
    },
  });
}

export function useDeleteAd() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adId: string): Promise<void> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('ads' as any)
        .delete()
        .eq('id', adId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message || 'Erro ao excluir anúncio');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads', user?.id] });
    },
  });
}
