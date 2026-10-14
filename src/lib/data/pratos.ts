import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { compressImage } from './storage';
import type { DbMaterial } from './materials';

export interface PratoFoto {
  id: string;
  prato_id: string;
  user_id: string;
  slot: 1 | 2 | 3;
  storage_path: string;
  criado_em: string;
  url?: string;
}

export interface PratoChecklist {
  tem_foto: boolean;
  tem_imagem: boolean;
  tem_descricao: boolean;
  tem_anuncio: boolean;
  pronto: boolean;
}

export interface Prato {
  id: string;
  user_id: string;
  nome: string;
  criado_em: string;
  fotos: PratoFoto[];
  materiais?: DbMaterial[];
  checklist?: PratoChecklist;
}

const LOCAL_PRATOS_KEY = 'hdi_pratos';
const LOCAL_FOTOS_KEY = 'hdi_prato_fotos';

/**
 * Pure function: calculates the 4 completion checklist badges for a prato.
 * A prato is "pronto" when it has at least 1 photo AND generated materials for image, description, and ad.
 */
export function calculatePratoChecklist(
  fotos: PratoFoto[] = [],
  materiais: { tool?: string; tipo?: string }[] = [],
): PratoChecklist {
  const tem_foto = fotos.length > 0;
  const tem_imagem = materiais.some(
    (m) => m.tool === 'imagem' || m.tipo === 'imagem' || m.tool === 'T1' || m.tool === 'T2',
  );
  const tem_descricao = materiais.some(
    (m) => m.tool === 'descricao' || m.tipo === 'descricao' || m.tool === 'T5',
  );
  const tem_anuncio = materiais.some(
    (m) => m.tool === 'anuncios' || m.tipo === 'anuncio' || m.tool === 'T_STORY' || m.tool === 'T_CARROSSEL',
  );

  return {
    tem_foto,
    tem_imagem,
    tem_descricao,
    tem_anuncio,
    pronto: tem_foto && tem_imagem && tem_descricao && tem_anuncio,
  };
}

/**
 * Pure function: verifies the 3-photo slot constraint.
 * Strictly forbids a 4th photo.
 */
export function validatePhotoSlot(
  existingPhotos: { slot: number }[],
  desiredSlot?: number,
): { canAdd: boolean; slot: 1 | 2 | 3; error?: string } {
  if (desiredSlot !== undefined) {
    if (desiredSlot < 1 || desiredSlot > 3) {
      return { canAdd: false, slot: 1, error: 'O número do espaço deve ser 1, 2 ou 3.' };
    }
    return { canAdd: true, slot: desiredSlot as 1 | 2 | 3 };
  }

  // Find lowest free slot
  const occupied = new Set(existingPhotos.map((p) => p.slot));
  for (let s = 1; s <= 3; s++) {
    if (!occupied.has(s)) {
      return { canAdd: true, slot: s as 1 | 2 | 3 };
    }
  }

  return {
    canAdd: false,
    slot: 1,
    error: 'O prato já atingiu o limite máximo de 3 fotos. Troque ou remova uma foto.',
  };
}

/**
 * Fetches signed URL for a dish photo path.
 */
export async function getSignedPhotoUrl(path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  try {
    const { data } = await supabase.storage
      .from('company-assets')
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
    return data?.signedUrl || '';
  } catch {
    return '';
  }
}

/**
 * Hook to list all pratos of the logged-in user with their photos and status.
 */
export function usePratos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pratos', user?.id],
    queryFn: async (): Promise<Prato[]> => {
      if (!user?.id) {
        try {
          return JSON.parse(localStorage.getItem(LOCAL_PRATOS_KEY) || '[]');
        } catch {
          return [];
        }
      }

      try {
        // 1. Fetch pratos
        const { data: pratosData, error: pratosError } = await supabase
          .from('pratos')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });

        if (pratosError) {
          console.warn('Pratos query fallback:', pratosError.message);
          const cached = localStorage.getItem(`${LOCAL_PRATOS_KEY}_${user.id}`);
          return cached ? JSON.parse(cached) : [];
        }

        if (!pratosData || pratosData.length === 0) {
          return [];
        }

        // 2. Fetch fotos
        const { data: fotosData } = await supabase
          .from('prato_fotos')
          .select('*')
          .eq('user_id', user.id);

        // 3. Fetch materials for checklist calculation
        const { data: materialsData } = await supabase
          .from('materials')
          .select('id, prato_id, tool, tipo')
          .eq('user_id', user.id);

        // Sign photo URLs in parallel
        const fotosWithUrls: PratoFoto[] = await Promise.all(
          (fotosData || []).map(async (f) => {
            const url = await getSignedPhotoUrl(f.storage_path);
            return {
              id: f.id,
              prato_id: f.prato_id,
              user_id: f.user_id,
              slot: f.slot as 1 | 2 | 3,
              storage_path: f.storage_path,
              criado_em: f.criado_em,
              url,
            };
          }),
        );

        const pratosList: Prato[] = pratosData.map((p) => {
          const pratoFotos = fotosWithUrls
            .filter((f) => f.prato_id === p.id)
            .sort((a, b) => a.slot - b.slot);

          const pratoMateriais = (materialsData || []).filter(
            (m: any) => m.prato_id === p.id,
          );

          const checklist = calculatePratoChecklist(pratoFotos, pratoMateriais as any);

          return {
            id: p.id,
            user_id: p.user_id,
            nome: p.nome,
            criado_em: p.criado_em,
            fotos: pratoFotos,
            checklist,
          };
        });

        localStorage.setItem(`${LOCAL_PRATOS_KEY}_${user.id}`, JSON.stringify(pratosList));
        return pratosList;
      } catch (err) {
        console.warn('Error fetching pratos:', err);
        const cached = localStorage.getItem(`${LOCAL_PRATOS_KEY}_${user?.id}`);
        return cached ? JSON.parse(cached) : [];
      }
    },
  });
}

/**
 * Hook to get a single prato with full details.
 */
export function usePrato(id?: string) {
  const { data: pratos = [], isLoading } = usePratos();
  const prato = pratos.find((p) => p.id === id);
  return { data: prato, isLoading };
}

/**
 * Mutation to create a new prato.
 */
export function useCreatePrato() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nome }: { nome: string }): Promise<Prato> => {
      const trimmedNome = nome.trim();
      if (!trimmedNome) throw new Error('O nome do prato é obrigatório.');

      const userId = user?.id || 'guest';
      const id = crypto.randomUUID();
      const criado_em = new Date().toISOString();

      if (user?.id) {
        const { data, error } = await supabase
          .from('pratos')
          .insert({
            id,
            user_id: user.id,
            nome: trimmedNome,
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            throw new Error(`Já existe um prato com o nome "${trimmedNome}". Escolha um nome diferente.`);
          }
          throw error;
        }

        return {
          id: data.id,
          user_id: data.user_id,
          nome: data.nome,
          criado_em: data.criado_em,
          fotos: [],
          checklist: calculatePratoChecklist([], []),
        };
      }

      // Offline / Guest fallback
      const offlinePrato: Prato = {
        id,
        user_id: userId,
        nome: trimmedNome,
        criado_em,
        fotos: [],
        checklist: calculatePratoChecklist([], []),
      };

      const cached: Prato[] = JSON.parse(localStorage.getItem(LOCAL_PRATOS_KEY) || '[]');
      if (cached.some((p) => p.nome.toLowerCase() === trimmedNome.toLowerCase())) {
        throw new Error(`Já existe um prato com o nome "${trimmedNome}". Escolha um nome diferente.`);
      }
      cached.unshift(offlinePrato);
      localStorage.setItem(LOCAL_PRATOS_KEY, JSON.stringify(cached));
      return offlinePrato;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pratos'] });
    },
  });
}

/**
 * Mutation to rename a prato.
 */
export function useRenamePrato() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, novoNome }: { id: string; novoNome: string }) => {
      const trimmed = novoNome.trim();
      if (!trimmed) throw new Error('O nome não pode ficar vazio.');

      if (user?.id) {
        const { error } = await supabase
          .from('pratos')
          .update({ nome: trimmed })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          if (error.code === '23505') {
            throw new Error(`Já existe um prato com o nome "${trimmed}".`);
          }
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pratos'] });
    },
  });
}

/**
 * Mutation to delete a prato and its photos.
 */
export function useDeletePrato() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (user?.id) {
        const { error } = await supabase
          .from('pratos')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pratos'] });
    },
  });
}

/**
 * Mutation to upload and save a photo to a specific slot (1, 2 or 3) of a prato.
 * Automatically compresses up to 1600px.
 */
export function useSavePratoFoto() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pratoId,
      file,
      slot,
    }: {
      pratoId: string;
      file: File | Blob;
      slot: 1 | 2 | 3;
    }) => {
      if (slot < 1 || slot > 3) {
        throw new Error('O espaço da foto deve ser 1, 2 ou 3.');
      }

      const userId = user?.id || 'guest';
      // Compress image to max 1600px
      const fileObj = file instanceof File ? file : new File([file], `slot-${slot}.jpg`, { type: 'image/jpeg' });
      const { blob } = await compressImage(fileObj, 1600, 0.88);

      const ext = 'webp';
      const storagePath = `${userId}/pratos/${pratoId}/slot-${slot}.${ext}`;

      if (user?.id) {
        // Upload to company-assets bucket
        const { error: uploadError } = await supabase.storage
          .from('company-assets')
          .upload(storagePath, blob, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (uploadError) {
          console.warn('Storage upload warning:', uploadError.message);
        }

        // Upsert into prato_fotos table
        const { data: fotoRecord, error: dbError } = await supabase
          .from('prato_fotos')
          .upsert(
            {
              prato_id: pratoId,
              user_id: user.id,
              slot,
              storage_path: storagePath,
            },
            { onConflict: 'prato_id,slot' },
          )
          .select()
          .single();

        if (dbError) throw dbError;

        const signedUrl = await getSignedPhotoUrl(storagePath);
        return { ...fotoRecord, url: signedUrl || URL.createObjectURL(blob) };
      }

      // Guest / Offline fallback
      return new Promise<{ id: string; prato_id: string; slot: 1 | 2 | 3; url: string; storage_path: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            id: crypto.randomUUID(),
            prato_id: pratoId,
            slot,
            storage_path: storagePath,
            url: reader.result as string,
          });
        };
        reader.readAsDataURL(blob);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pratos'] });
    },
  });
}

/**
 * Mutation to delete a specific photo slot.
 */
export function useDeletePratoFoto() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fotoId, storagePath }: { fotoId: string; storagePath?: string }) => {
      if (user?.id) {
        if (storagePath) {
          try {
            await supabase.storage.from('company-assets').remove([storagePath]);
          } catch (e) {
            console.warn('Failed to remove from storage:', e);
          }
        }

        const { error } = await supabase
          .from('prato_fotos')
          .delete()
          .eq('id', fotoId)
          .eq('user_id', user.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pratos'] });
    },
  });
}
