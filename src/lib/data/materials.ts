import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface DbMaterial {
  id: string;
  user_id: string;
  tool: string;
  template: string;
  title: string;
  text: string;
  original: string | null;
  summary: string[];
  criado_em: string;
}

const LOCAL_MATERIALS_KEY = 'hdi_materials';

export function useMaterials() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['materials', user?.id],
    queryFn: async (): Promise<DbMaterial[]> => {
      if (!user?.id) {
        // Return local materials if not authenticated
        try {
          return JSON.parse(localStorage.getItem(LOCAL_MATERIALS_KEY) || '[]');
        } catch {
          return [];
        }
      }

      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });

        if (error || !data) {
          const cached = localStorage.getItem(`${LOCAL_MATERIALS_KEY}_${user.id}`);
          return cached ? JSON.parse(cached) : [];
        }

        const mapped: DbMaterial[] = data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          tool: item.tool,
          template: item.template,
          title: item.title,
          text: item.text,
          original: item.original,
          summary: Array.isArray(item.summary) ? (item.summary as string[]) : [],
          criado_em: item.criado_em,
        }));

        localStorage.setItem(`${LOCAL_MATERIALS_KEY}_${user.id}`, JSON.stringify(mapped));
        return mapped;
      } catch {
        const cached = localStorage.getItem(`${LOCAL_MATERIALS_KEY}_${user.id}`);
        return cached ? JSON.parse(cached) : [];
      }
    },
  });
}

export function useSaveMaterial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (material: Omit<DbMaterial, 'id' | 'user_id' | 'criado_em'> & { id?: string }) => {
      const id = material.id || crypto.randomUUID();
      const userId = user?.id || 'guest';
      const criado_em = new Date().toISOString();

      const newRecord: DbMaterial = {
        ...material,
        id,
        user_id: userId,
        criado_em,
        original: material.original || null,
      };

      if (user?.id) {
        try {
          await supabase.from('materials').insert({
            id,
            user_id: user.id,
            tool: material.tool,
            template: material.template,
            title: material.title,
            text: material.text,
            original: material.original || null,
            summary: material.summary as any,
            criado_em,
          });
        } catch (err) {
          console.warn('Material insert network warning:', err);
        }
      }

      // Also update local cache
      const key = user?.id ? `${LOCAL_MATERIALS_KEY}_${user.id}` : LOCAL_MATERIALS_KEY;
      try {
        const current: DbMaterial[] = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify([newRecord, ...current]));
      } catch {
        // ignore
      }

      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', user?.id] });
    },
  });
}

export function useDeleteMaterial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (user?.id) {
        try {
          await supabase.from('materials').delete().eq('id', id).eq('user_id', user.id);
        } catch (err) {
          console.warn('Material delete warning:', err);
        }
      }

      const key = user?.id ? `${LOCAL_MATERIALS_KEY}_${user.id}` : LOCAL_MATERIALS_KEY;
      try {
        const current: DbMaterial[] = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(key, JSON.stringify(current.filter((m) => m.id !== id)));
      } catch {
        // ignore
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', user?.id] });
    },
  });
}

export function useUpdateMaterial() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updated: Partial<DbMaterial> & { id: string }) => {
      if (user?.id) {
        try {
          const updatePayload: Record<string, any> = {};
          if (updated['text'] !== undefined) updatePayload['text'] = updated['text'];
          if (updated['title'] !== undefined) updatePayload['title'] = updated['title'];
          if (updated['summary'] !== undefined) updatePayload['summary'] = updated['summary'];

          await supabase
            .from('materials')
            .update(updatePayload as any)
            .eq('id', updated.id)
            .eq('user_id', user.id);
        } catch (err) {
          console.warn('Material update warning:', err);
        }
      }

      const key = user?.id ? `${LOCAL_MATERIALS_KEY}_${user.id}` : LOCAL_MATERIALS_KEY;
      try {
        const current: DbMaterial[] = JSON.parse(localStorage.getItem(key) || '[]');
        localStorage.setItem(
          key,
          JSON.stringify(current.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))),
        );
      } catch {
        // ignore
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', user?.id] });
    },
  });
}
