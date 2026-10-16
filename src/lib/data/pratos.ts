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
  signed_url?: string;
}

export interface PratoChecklist {
  tem_foto: boolean;
  tem_imagem: boolean;
  tem_descricao: boolean;
  tem_anuncio: boolean;
  pronto: boolean;
  hasFoto: boolean;
  hasImagem: boolean;
  hasDescricao: boolean;
  hasAnuncio: boolean;
  isComplete: boolean;
}

export interface Prato {
  id: string;
  user_id: string;
  nome: string;
  ingredientes?: string[] | undefined;
  preco?: number | null | undefined;
  destaque?: string | null | undefined;
  criado_em: string;
  fotos: PratoFoto[];
  prato_fotos?: PratoFoto[];
  materiais?: DbMaterial[];
  checklist?: PratoChecklist;
}

const LOCAL_PRATOS_KEY = 'hdi_pratos';

import { safeTrim } from '@/lib/utils';
export { safeTrim };

export function getLocalPratosKey(userId?: string | null): string {
  return `hdi_pratos_${userId || 'guest'}`;
}

export function loadLocalPratos(userId?: string | null): Prato[] {
  try {
    const userKey = getLocalPratosKey(userId);
    const data = localStorage.getItem(userKey);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    const legacy = localStorage.getItem(LOCAL_PRATOS_KEY);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) return parsedLegacy;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalPratos(userId: string | undefined | null, pratos: Prato[]) {
  try {
    const userKey = getLocalPratosKey(userId);
    const json = JSON.stringify(pratos);
    localStorage.setItem(userKey, json);
    localStorage.setItem(LOCAL_PRATOS_KEY, json);
  } catch (e) {
    console.warn('Failed to save pratos to localStorage:', e);
  }
}

export interface PratoValidationResult {
  valid: boolean;
  error?: string;
  trimmed: string;
}

/**
 * Pure function: validates prato name.
 * Mandatory, 2 to 60 characters, no duplicates in existing pratos.
 */
export function validatePratoNome(
  nome: unknown,
  existingPratos?: Array<{ id?: string; nome?: string | null }> | null,
  currentPratoId?: string,
): PratoValidationResult {
  const trimmed = safeTrim(nome);

  if (!trimmed) {
    return {
      valid: false,
      error: 'O nome do prato é obrigatório.',
      trimmed: '',
    };
  }

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: 'O nome deve ter pelo menos 2 caracteres.',
      trimmed,
    };
  }

  if (trimmed.length > 60) {
    return {
      valid: false,
      error: 'O nome deve ter no máximo 60 caracteres.',
      trimmed,
    };
  }

  if (existingPratos && existingPratos.length > 0) {
    const isDuplicate = existingPratos.some((p) => {
      if (currentPratoId && p.id === currentPratoId) return false;
      return safeTrim(p.nome).toLowerCase() === trimmed.toLowerCase();
    });

    if (isDuplicate) {
      return {
        valid: false,
        error: 'Você já tem um prato com esse nome.',
        trimmed,
      };
    }
  }

  return {
    valid: true,
    trimmed,
  };
}

/**
 * Pure function: calculates the 4 completion checklist badges for a prato.
 * A prato is "pronto" when it has at least 1 photo AND generated materials for image, description, and ad.
 */
export function calculatePratoChecklist(
  fotos: PratoFoto[] = [],
  materiais: { tool?: string; tipo?: string | null; prato_id?: string | null }[] = [],
  pratoId?: string,
): PratoChecklist {
  const mats = pratoId
    ? materiais.filter((m) => !m.prato_id || m.prato_id === pratoId)
    : materiais;

  const tem_foto = fotos.length > 0;
  const tem_imagem = mats.some(
    (m) => m.tool === 'imagem' || m.tipo === 'imagem' || m.tool === 'T1' || m.tool === 'T2',
  );
  const tem_descricao = mats.some(
    (m) => m.tool === 'descricao' || m.tipo === 'descricao' || m.tool === 'T5',
  );
  const tem_anuncio = mats.some(
    (m) => m.tool === 'anuncios' || m.tipo === 'anuncio' || m.tool === 'T_STORY' || m.tool === 'T_CARROSSEL',
  );
  const pronto = tem_foto && tem_imagem && tem_descricao && tem_anuncio;

  return {
    tem_foto,
    tem_imagem,
    tem_descricao,
    tem_anuncio,
    pronto,
    hasFoto: tem_foto,
    hasImagem: tem_imagem,
    hasDescricao: tem_descricao,
    hasAnuncio: tem_anuncio,
    isComplete: pronto,
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
      const localList = loadLocalPratos(user?.id);

      if (!user?.id) {
        return localList;
      }

      try {
        // 1. Fetch pratos
        const { data: pratosData, error: pratosError } = await (supabase as any)
          .from('pratos')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false });

        if (pratosError) {
          console.warn('Pratos query fallback to local:', pratosError.message);
          return localList;
        }

        // 2. Fetch fotos
        let fotosData: any[] = [];
        try {
          const { data, error: fotosError } = await (supabase as any)
            .from('prato_fotos')
            .select('*')
            .eq('user_id', user.id);
          if (!fotosError && data) {
            fotosData = data;
          }
        } catch {
          // table might not exist
        }

        // 3. Fetch materials for checklist calculation
        let materialsData: any[] = [];
        try {
          const { data, error: matError } = await supabase
            .from('materials')
            .select('id, prato_id, tool, tipo')
            .eq('user_id', user.id);
          if (!matError && data) {
            materialsData = data;
          }
        } catch {
          // materials fallback
        }

        // Sign photo URLs in parallel
        const fotosWithUrls: PratoFoto[] = await Promise.all(
          fotosData.map(async (f: any) => {
            const url = await getSignedPhotoUrl(f.storage_path);
            return {
              id: f.id,
              prato_id: f.prato_id,
              user_id: f.user_id,
              slot: f.slot as 1 | 2 | 3,
              storage_path: f.storage_path,
              criado_em: f.criado_em,
              url,
              signed_url: url,
            };
          }),
        );

        const remotePratos: Prato[] = (pratosData || []).map((p: any) => {
          const remoteFotos = fotosWithUrls.filter((f) => f.prato_id === p.id);
          const localMatch = localList.find((lp) => lp.id === p.id);
          const localFotos = localMatch?.fotos || localMatch?.prato_fotos || [];

          // Merge local and remote fotos (prefer remote if available, else keep local dataUrl)
          const mergedFotosMap: Record<number, PratoFoto> = {};
          localFotos.forEach((f) => {
            mergedFotosMap[f.slot] = f;
          });
          remoteFotos.forEach((f) => {
            mergedFotosMap[f.slot] = f;
          });
          const finalFotos = Object.values(mergedFotosMap).sort((a, b) => a.slot - b.slot);

          const pratoMateriais = materialsData.filter((m: any) => m.prato_id === p.id);
          const checklist = calculatePratoChecklist(finalFotos, pratoMateriais as any, p.id);

          return {
            id: p.id,
            user_id: p.user_id,
            nome: p.nome,
            ingredientes: Array.isArray(p.ingredientes)
              ? p.ingredientes
              : localMatch?.ingredientes || [],
            preco: p.preco !== undefined && p.preco !== null ? Number(p.preco) : (localMatch?.preco ?? null),
            destaque: p.destaque ?? localMatch?.destaque ?? null,
            criado_em: p.criado_em,
            fotos: finalFotos,
            prato_fotos: finalFotos,
            materiais: pratoMateriais as any,
            checklist,
          };
        });

        // Merge any unsynced local pratos
        const remoteIds = new Set(remotePratos.map((p) => p.id));
        const unsynced = localList.filter((lp) => !remoteIds.has(lp.id));
        const combined = [...remotePratos, ...unsynced];

        saveLocalPratos(user.id, combined);
        return combined;
      } catch (err) {
        console.warn('Error fetching pratos, using local:', err);
        return localList;
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
  return {
    data: prato,
    prato,
    fotos: prato?.fotos || prato?.prato_fotos || [],
    isLoading,
  };
}

/**
 * Mutation to create a new prato.
 */
export function useCreatePrato() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: string | { nome?: string }): Promise<Prato> => {
      const rawNome = typeof input === 'string' ? input : input?.nome;
      const validation = validatePratoNome(rawNome);
      if (!validation.valid) {
        throw new Error(validation.error || 'O nome do prato é obrigatório.');
      }
      const trimmedNome = validation.trimmed;

      const userId = user?.id || 'guest';
      const id = crypto.randomUUID();
      const criado_em = new Date().toISOString();

      const newPrato: Prato = {
        id,
        user_id: userId,
        nome: trimmedNome,
        criado_em,
        fotos: [],
        prato_fotos: [],
        checklist: calculatePratoChecklist([], []),
      };

      // Always save to localStorage immediately to guarantee persistence
      const currentLocal = loadLocalPratos(userId);
      if (currentLocal.some((p) => safeTrim(p.nome).toLowerCase() === trimmedNome.toLowerCase())) {
        throw new Error('Você já tem um prato com esse nome.');
      }
      saveLocalPratos(userId, [newPrato, ...currentLocal]);

      if (user?.id) {
        try {
          const { data, error } = await (supabase as any)
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
              saveLocalPratos(userId, currentLocal);
              throw new Error('Você já tem um prato com esse nome.');
            }
            console.warn('Supabase pratos insert warning (persisted locally):', error.message);
          } else if (data) {
            newPrato.id = data.id;
            saveLocalPratos(userId, [newPrato, ...currentLocal]);
          }
        } catch (err: any) {
          if (err.message === 'Você já tem um prato com esse nome.') throw err;
          console.warn('Supabase pratos insert exception (persisted locally):', err);
        }
      }

      return newPrato;
    },
    onSuccess: (createdPrato) => {
      queryClient.setQueryData(['pratos', user?.id], (old: Prato[] | undefined) => {
        const list = old ? [...old] : [];
        if (!list.some((p) => p.id === createdPrato.id)) {
          return [createdPrato, ...list];
        }
        return list;
      });
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
      const validation = validatePratoNome(novoNome);
      if (!validation.valid) {
        throw new Error(validation.error || 'Nome inválido.');
      }
      const trimmed = validation.trimmed;
      const userId = user?.id || 'guest';

      const allLocal = loadLocalPratos(userId);
      if (allLocal.some((p) => p.id !== id && safeTrim(p.nome).toLowerCase() === trimmed.toLowerCase())) {
        throw new Error('Você já tem um prato com esse nome.');
      }
      const updated = allLocal.map((p) => (p.id === id ? { ...p, nome: trimmed } : p));
      saveLocalPratos(userId, updated);

      if (user?.id) {
        try {
          const { error } = await (supabase as any)
            .from('pratos')
            .update({ nome: trimmed })
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) {
            if (error.code === '23505') {
              saveLocalPratos(userId, allLocal);
              throw new Error('Você já tem um prato com esse nome.');
            }
            console.warn('Supabase rename prato warning (renamed locally):', error.message);
          }
        } catch (err: any) {
          if (err.message === 'Você já tem um prato com esse nome.') throw err;
          console.warn('Supabase rename prato exception (renamed locally):', err);
        }
      }
    },
    onSuccess: (_, { id, novoNome }) => {
      queryClient.setQueryData(['pratos', user?.id], (old: Prato[] | undefined) => {
        if (!old) return old;
        return old.map((p) => (p.id === id ? { ...p, nome: safeTrim(novoNome) } : p));
      });
      queryClient.invalidateQueries({ queryKey: ['pratos'] });
    },
  });
}

/**
 * Mutation to update prato details: ingredients, price, highlight, and name.
 */
export function useUpdatePratoDetails() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      nome,
      ingredientes,
      preco,
      destaque,
    }: {
      id: string;
      nome?: string;
      ingredientes?: string[];
      preco?: number | null;
      destaque?: string | null;
    }) => {
      const userId = user?.id || 'guest';
      const allLocal = loadLocalPratos(userId);
      const updated = allLocal.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          nome: nome !== undefined ? safeTrim(nome) : p.nome,
          ingredientes: ingredientes !== undefined ? ingredientes : p.ingredientes || [],
          preco: preco !== undefined ? preco : p.preco,
          destaque: destaque !== undefined ? destaque : p.destaque,
        };
      });
      saveLocalPratos(userId, updated);

      if (user?.id) {
        const updatePayload: Record<string, any> = {};
        if (nome !== undefined) updatePayload['nome'] = safeTrim(nome);
        if (ingredientes !== undefined) updatePayload['ingredientes'] = ingredientes;
        if (preco !== undefined) updatePayload['preco'] = preco;
        if (destaque !== undefined) updatePayload['destaque'] = destaque;

        try {
          await (supabase as any)
            .from('pratos')
            .update(updatePayload)
            .eq('id', id)
            .eq('user_id', user.id);
        } catch (err) {
          console.warn('Supabase update prato details exception:', err);
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['pratos', user?.id], (old: Prato[] | undefined) => {
        if (!old) return old;
        return old.map((p) => {
          if (p.id !== variables.id) return p;
          return {
            ...p,
            ...(variables.nome !== undefined ? { nome: safeTrim(variables.nome) } : {}),
            ...(variables.ingredientes !== undefined ? { ingredientes: variables.ingredientes } : {}),
            ...(variables.preco !== undefined ? { preco: variables.preco } : {}),
            ...(variables.destaque !== undefined ? { destaque: variables.destaque } : {}),
          };
        });
      });
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
      const userId = user?.id || 'guest';
      const allLocal = loadLocalPratos(userId);
      const updated = allLocal.filter((p) => p.id !== id);
      saveLocalPratos(userId, updated);

      if (user?.id) {
        try {
          await (supabase as any)
            .from('pratos')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        } catch (e) {
          console.warn('Error deleting prato remotely:', e);
        }
      }
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(['pratos', user?.id], (old: Prato[] | undefined) => {
        if (!old) return old;
        return old.filter((p) => p.id !== id);
      });
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
    }): Promise<PratoFoto> => {
      if (slot < 1 || slot > 3) {
        throw new Error('O espaço da foto deve ser 1, 2 ou 3.');
      }

      const userId = user?.id || 'guest';

      // 1. Convert to dataUrl immediately so we ALWAYS have a local preview
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });

      const photoId = crypto.randomUUID();
      const storagePath = `${userId}/pratos/${pratoId}/slot-${slot}.webp`;

      const savedFoto: PratoFoto = {
        id: photoId,
        prato_id: pratoId,
        user_id: userId,
        slot,
        storage_path: storagePath,
        url: dataUrl,
        signed_url: dataUrl,
        criado_em: new Date().toISOString(),
      };

      // Always save into local pratos list so it renders immediately
      const allLocal = loadLocalPratos(userId);
      const updatedPratos = allLocal.map((p) => {
        if (p.id === pratoId) {
          const oldFotos = (p.fotos || p.prato_fotos || []).filter((f) => f.slot !== slot);
          const newFotos = [...oldFotos, savedFoto].sort((a, b) => a.slot - b.slot);
          return {
            ...p,
            fotos: newFotos,
            prato_fotos: newFotos,
            checklist: calculatePratoChecklist(newFotos, p.materiais || [], p.id),
          };
        }
        return p;
      });
      saveLocalPratos(userId, updatedPratos);

      // Attempt remote upload if user is signed in
      if (user?.id) {
        try {
          const fileObj =
            file instanceof File ? file : new File([file], `slot-${slot}.jpg`, { type: 'image/jpeg' });
          const { blob } = await compressImage(fileObj, 1600, 0.88);

          await supabase.storage.from('company-assets').upload(storagePath, blob, {
            contentType: 'image/webp',
            upsert: true,
          });

          const { data: fotoRecord } = await (supabase as any)
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

          if (fotoRecord) {
            const signedUrl = await getSignedPhotoUrl(storagePath);
            savedFoto.id = fotoRecord.id;
            savedFoto.url = signedUrl || dataUrl;
            savedFoto.signed_url = signedUrl || dataUrl;
          }
        } catch (err) {
          console.warn('Supabase foto upload/db warning (saved locally):', err);
        }
      }

      return savedFoto;
    },
    onSuccess: (savedFoto) => {
      queryClient.setQueryData(['pratos', user?.id], (old: Prato[] | undefined) => {
        if (!old) return old;
        return old.map((p) => {
          if (p.id === savedFoto.prato_id) {
            const oldFotos = (p.fotos || p.prato_fotos || []).filter((f) => f.slot !== savedFoto.slot);
            const newFotos = [...oldFotos, savedFoto].sort((a, b) => a.slot - b.slot);
            return {
              ...p,
              fotos: newFotos,
              prato_fotos: newFotos,
              checklist: calculatePratoChecklist(newFotos, p.materiais || [], p.id),
            };
          }
          return p;
        });
      });
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
    mutationFn: async ({
      fotoId,
      storagePath,
      pratoId,
      slot,
    }: {
      fotoId: string;
      storagePath?: string;
      pratoId?: string;
      slot?: number;
    }) => {
      const userId = user?.id || 'guest';

      // Update local storage
      const allLocal = loadLocalPratos(userId);
      const updatedPratos = allLocal.map((p) => {
        if (!pratoId || p.id === pratoId) {
          const filtered = (p.fotos || p.prato_fotos || []).filter(
            (f) => f.id !== fotoId && (!slot || f.slot !== slot),
          );
          return {
            ...p,
            fotos: filtered,
            prato_fotos: filtered,
            checklist: calculatePratoChecklist(filtered, p.materiais || [], p.id),
          };
        }
        return p;
      });
      saveLocalPratos(userId, updatedPratos);

      if (user?.id) {
        try {
          if (storagePath) {
            await supabase.storage.from('company-assets').remove([storagePath]);
          }
          await (supabase as any)
            .from('prato_fotos')
            .delete()
            .eq('id', fotoId)
            .eq('user_id', user.id);
        } catch (e) {
          console.warn('Error deleting photo remotely:', e);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pratos'] });
    },
  });
}
