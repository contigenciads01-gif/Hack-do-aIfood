import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import type { Values } from '@/lib/metaprompt';

export interface PromptDraft {
  values: Values;
  template: string;
  texto: string;
  original: string;
  summary: string[];
  image?: string;
}

export function usePromptDraft(tool: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['prompt_draft', user?.id, tool],
    enabled: !!user?.id && !!tool,
    queryFn: async (): Promise<PromptDraft | null> => {
      if (!user?.id || !tool) return null;

      try {
        const { data, error } = await supabase
          .from('prompt_drafts')
          .select('*')
          .eq('user_id', user.id)
          .eq('tool', tool)
          .maybeSingle();

        if (error) {
          const cached = localStorage.getItem(`hdi_prompt_${tool}`);
          return cached ? JSON.parse(cached) : null;
        }

        if (data) {
          return {
            values: (data.values as Values) || {},
            template: data.template,
            texto: data.texto || '',
            original: data.original || '',
            summary: [],
          };
        }

        const cached = localStorage.getItem(`hdi_prompt_${tool}`);
        return cached ? JSON.parse(cached) : null;
      } catch {
        const cached = localStorage.getItem(`hdi_prompt_${tool}`);
        return cached ? JSON.parse(cached) : null;
      }
    },
  });
}

export function useSavePromptDraft(tool: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: PromptDraft) => {
      if (!user?.id) return draft;

      try {
        await supabase.from('prompt_drafts').upsert(
          {
            user_id: user.id,
            tool,
            values: draft.values as any,
            template: draft.template,
            texto: draft.texto,
            original: draft.original,
            atualizado_em: new Date().toISOString(),
          },
          { onConflict: 'user_id,tool' },
        );
      } catch (err) {
        console.warn('Draft save network warning:', err);
      }

      // Also keep fallback
      localStorage.setItem(`hdi_prompt_${tool}`, JSON.stringify(draft));
      return draft;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['prompt_draft', user?.id, tool], saved);
    },
  });
}
