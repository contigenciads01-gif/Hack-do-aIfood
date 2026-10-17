import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface CompanyAddress {
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  complemento?: string;
}

export interface Company {
  id?: string | undefined;
  user_id: string;
  nome: string;
  responsavel?: string | null | undefined;
  categoria: string;
  cidade?: string | null | undefined;
  whatsapp?: string | null | undefined;
  instagram?: string | null | undefined;
  horario?: string | null | undefined;
  slogan?: string | null | undefined;
  tem_logo: boolean;
  logo_path?: string | null | undefined;
  cores: string[];
  personalidade: string[];
  tom?: string | null | undefined;
  publico: string[];
  faixa_preco?: string | null | undefined;
  diferenciais: string[];
  estilo_visual?: string | null | undefined;
  data_inicio: string;
  nivel: number;
  plano?: 'gratuito' | 'plus' | string | undefined;
  cadastro_passo: number;
  cadastro_concluido?: boolean | undefined;
  banner_path?: string | null | undefined;
  site?: string | null | undefined;
  email_publico?: string | null | undefined;
  endereco?: CompanyAddress | null | undefined;
  mostrar_endereco_anuncios?: boolean | undefined;
  formas_atendimento?: string[] | undefined;
  horario_funcionamento?: Record<string, any> | null | undefined;
  created_at?: string | undefined;
  updated_at?: string | undefined;
}

import { isUserAdminEmail } from '@/config/plans';

export function isCompanyPlus(company: Company | null | undefined, userEmail?: string | null): boolean {
  if (userEmail && isUserAdminEmail(userEmail)) return true;
  if (!company) return false;
  return (
    company.plano === 'plus' ||
    company.plano === 'chef_master' ||
    company.plano === 'chef' ||
    (company.nivel ?? 1) >= 2
  );
}

const LOCAL_COMPANY_KEY = 'hdi_company_profile';

export function useCompany() {
  const { user } = useAuth();
  const isSuper = isUserAdminEmail(user?.email);

  return useQuery({
    queryKey: ['company', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Company | null> => {
      if (!user?.id) return null;

      // Read local cache first for smart fallback
      const cachedRaw = localStorage.getItem(`${LOCAL_COMPANY_KEY}_${user.id}`);
      let cached: any = null;
      if (cachedRaw) {
        try {
          cached = JSON.parse(cachedRaw);
        } catch {
          // ignore
        }
      }

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Company fetch warning, falling back to local storage:', error.message);
          if (cached) {
            if (isSuper) {
              cached.nivel = 3;
              cached.plano = 'chef_master';
            }
            return cached;
          }
          return null;
        }

        if (data) {
          const raw = data as any;
          const isConcluido =
            raw.cadastro_concluido !== undefined && raw.cadastro_concluido !== null
              ? !!raw.cadastro_concluido
              : Boolean(raw.nome?.trim()) && Boolean(raw.categoria?.trim());

          // If local save has a custom name or slogan saved recently, don't let stale DB row overwrite it
          const localHasRecentSave = cached && (cached._saved_at || cached.nome);
          const chooseNome =
            localHasRecentSave && cached.nome && cached.nome !== 'Minha Loja'
              ? (data.nome && data.nome !== 'Minha Loja' ? data.nome : cached.nome)
              : (data.nome || cached?.nome || 'Minha Loja');

          const chooseSlogan =
            localHasRecentSave && cached.slogan !== undefined && cached.slogan !== null
              ? (data.slogan || cached.slogan)
              : (data.slogan ?? cached?.slogan ?? null);

          const parsed: Company = {
            id: data.id,
            user_id: data.user_id,
            nome: chooseNome,
            responsavel: raw.responsavel ?? cached?.responsavel ?? null,
            categoria: data.categoria || cached?.categoria || 'Restaurante',
            cidade: data.cidade ?? cached?.cidade ?? null,
            whatsapp: data.whatsapp ?? cached?.whatsapp ?? null,
            instagram: data.instagram ?? cached?.instagram ?? null,
            horario: data.horario ?? cached?.horario ?? null,
            slogan: chooseSlogan,
            tem_logo: data.tem_logo !== undefined ? !!data.tem_logo : !!cached?.tem_logo,
            logo_path: data.logo_path ?? cached?.logo_path ?? null,
            cores:
              Array.isArray(data.cores) && data.cores.length
                ? (data.cores as string[])
                : (cached?.cores || ['#EA1D2C', '#1A1A1A']),
            personalidade: Array.isArray(data.personalidade)
              ? data.personalidade
              : (cached?.personalidade || []),
            tom: data.tom ?? cached?.tom ?? null,
            publico: Array.isArray(data.publico) ? data.publico : (cached?.publico || []),
            faixa_preco: data.faixa_preco ?? cached?.faixa_preco ?? null,
            diferenciais: Array.isArray(data.diferenciais)
              ? data.diferenciais
              : (cached?.diferenciais || []),
            estilo_visual: data.estilo_visual ?? cached?.estilo_visual ?? null,
            data_inicio: data.data_inicio ?? cached?.data_inicio ?? new Date().toISOString().split('T')[0] ?? '',
            nivel: isSuper ? 3 : (data.nivel ?? cached?.nivel ?? 1),
            plano: isSuper
              ? 'chef_master'
              : (raw.plano ?? cached?.plano ?? ((data.nivel ?? 1) >= 2 ? 'plus' : 'gratuito')),
            cadastro_passo: data.cadastro_passo ?? cached?.cadastro_passo ?? 1,
            cadastro_concluido: isConcluido,
            banner_path: raw.banner_path ?? cached?.banner_path ?? null,
            site: raw.site ?? cached?.site ?? null,
            email_publico: raw.email_publico ?? cached?.email_publico ?? null,
            endereco: raw.endereco ?? cached?.endereco ?? null,
            mostrar_endereco_anuncios:
              raw.mostrar_endereco_anuncios !== undefined
                ? !!raw.mostrar_endereco_anuncios
                : !!cached?.mostrar_endereco_anuncios,
            formas_atendimento:
              Array.isArray(raw.formas_atendimento) && raw.formas_atendimento.length
                ? raw.formas_atendimento
                : (cached?.formas_atendimento || ['Delivery']),
            horario_funcionamento: raw.horario_funcionamento ?? cached?.horario_funcionamento ?? {},
            created_at: data.created_at,
            updated_at: data.updated_at,
          };

          localStorage.setItem(`${LOCAL_COMPANY_KEY}_${user.id}`, JSON.stringify(parsed));
          return parsed;
        }

        if (cached) {
          if (isSuper) {
            cached.nivel = 3;
            cached.plano = 'chef_master';
          }
          return cached;
        }
        return null;
      } catch (err) {
        console.warn('Error reading company:', err);
        if (cached) {
          if (isSuper) {
            cached.nivel = 3;
            cached.plano = 'chef_master';
          }
          return cached;
        }
        return null;
      }
    },
  });
}

export function useSaveCompany() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuper = isUserAdminEmail(user?.email);

  return useMutation({
    mutationFn: async (payload: Partial<Company>): Promise<Company> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Get cached company to preserve fields if not supplied
      let prevCompany: Partial<Company> = {};
      try {
        const cached = localStorage.getItem(`${LOCAL_COMPANY_KEY}_${user.id}`);
        if (cached) prevCompany = JSON.parse(cached);
      } catch {
        // ignore
      }

      const mergedPayload: Partial<Company> = {
        ...prevCompany,
        ...payload,
        user_id: user.id,
      };

      const coreData: Record<string, any> = {
        user_id: user.id,
        nome: (payload.nome !== undefined ? payload.nome : (mergedPayload.nome || 'Minha Loja')) || 'Minha Loja',
        categoria: (payload.categoria !== undefined ? payload.categoria : (mergedPayload.categoria || 'Restaurante')) || 'Restaurante',
        cidade: payload.cidade !== undefined ? payload.cidade : (mergedPayload.cidade || null),
        whatsapp: payload.whatsapp !== undefined ? payload.whatsapp : (mergedPayload.whatsapp || null),
        instagram: payload.instagram !== undefined ? payload.instagram : (mergedPayload.instagram || null),
        horario: payload.horario !== undefined ? payload.horario : (mergedPayload.horario || null),
        slogan: payload.slogan !== undefined ? payload.slogan : (mergedPayload.slogan || null),
        tem_logo: payload.tem_logo !== undefined ? payload.tem_logo : (mergedPayload.tem_logo ?? false),
        logo_path: payload.logo_path !== undefined ? payload.logo_path : (mergedPayload.logo_path || null),
        cores: payload.cores !== undefined ? payload.cores : (mergedPayload.cores || ['#EA1D2C', '#1A1A1A']),
        personalidade: payload.personalidade !== undefined ? payload.personalidade : (mergedPayload.personalidade || []),
        tom: payload.tom !== undefined ? payload.tom : (mergedPayload.tom || null),
        publico: payload.publico !== undefined ? payload.publico : (mergedPayload.publico || []),
        faixa_preco: payload.faixa_preco !== undefined ? payload.faixa_preco : (mergedPayload.faixa_preco || null),
        diferenciais: payload.diferenciais !== undefined ? payload.diferenciais : (mergedPayload.diferenciais || []),
        estilo_visual: payload.estilo_visual !== undefined ? payload.estilo_visual : (mergedPayload.estilo_visual || null),
        data_inicio: mergedPayload.data_inicio ?? new Date().toISOString().split('T')[0] ?? '',
        nivel: isSuper ? 3 : (mergedPayload.nivel ?? 1),
        cadastro_passo: mergedPayload.cadastro_passo ?? 1,
      };

      const extendedData: Record<string, any> = { ...coreData };
      if (mergedPayload.cadastro_concluido !== undefined) {
        extendedData['cadastro_concluido'] = mergedPayload.cadastro_concluido;
      }
      if (mergedPayload.banner_path !== undefined) {
        extendedData['banner_path'] = mergedPayload.banner_path;
      }
      if (mergedPayload.site !== undefined) {
        extendedData['site'] = mergedPayload.site;
      }
      if (mergedPayload.email_publico !== undefined) {
        extendedData['email_publico'] = mergedPayload.email_publico;
      }
      if (mergedPayload.endereco !== undefined) {
        extendedData['endereco'] = mergedPayload.endereco;
      }
      if (mergedPayload.mostrar_endereco_anuncios !== undefined) {
        extendedData['mostrar_endereco_anuncios'] = mergedPayload.mostrar_endereco_anuncios;
      }
      if (mergedPayload.formas_atendimento !== undefined) {
        extendedData['formas_atendimento'] = mergedPayload.formas_atendimento;
      }
      if (mergedPayload.horario_funcionamento !== undefined) {
        extendedData['horario_funcionamento'] = mergedPayload.horario_funcionamento;
      }

      let savedDbRow: any = null;

      try {
        // Step 1: Check if row exists for user
        const { data: existingRow } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingRow?.id) {
          // Attempt update with extended columns
          const updateAttempt = await supabase
            .from('companies')
            .update(extendedData as any)
            .eq('user_id', user.id)
            .select()
            .maybeSingle();

          if (updateAttempt.error) {
            console.warn(
              'Extended company update error, retrying with core columns:',
              updateAttempt.error.message,
            );
            const coreAttempt = await supabase
              .from('companies')
              .update(coreData as any)
              .eq('user_id', user.id)
              .select()
              .maybeSingle();

            if (coreAttempt.error) {
              console.warn('Core company update failed:', coreAttempt.error.message);
            } else {
              savedDbRow = coreAttempt.data;
            }
          } else {
            savedDbRow = updateAttempt.data;
          }
        } else {
          // Attempt insert with extended columns
          const insertAttempt = await supabase
            .from('companies')
            .insert(extendedData as any)
            .select()
            .maybeSingle();

          if (insertAttempt.error) {
            console.warn(
              'Extended company insert error, retrying with core columns:',
              insertAttempt.error.message,
            );
            const coreAttempt = await supabase
              .from('companies')
              .insert(coreData as any)
              .select()
              .maybeSingle();

            if (coreAttempt.error) {
              console.warn('Core company insert failed:', coreAttempt.error.message);
            } else {
              savedDbRow = coreAttempt.data;
            }
          } else {
            savedDbRow = insertAttempt.data;
          }
        }
      } catch (dbErr) {
        console.warn('Database network exception while saving company:', dbErr);
      }

      const merged: Company & { _saved_at: number } = {
        ...prevCompany,
        ...mergedPayload,
        ...(savedDbRow || {}),
        user_id: user.id,
        nome: (payload.nome !== undefined ? payload.nome : (savedDbRow?.nome || mergedPayload.nome || 'Minha Loja')) || 'Minha Loja',
        slogan: payload.slogan !== undefined ? payload.slogan : (savedDbRow?.slogan ?? mergedPayload.slogan ?? null),
        categoria: (payload.categoria !== undefined ? payload.categoria : (savedDbRow?.categoria || mergedPayload.categoria || 'Restaurante')) || 'Restaurante',
        tem_logo: payload.tem_logo !== undefined ? payload.tem_logo : (savedDbRow?.tem_logo ?? mergedPayload.tem_logo ?? false),
        logo_path: payload.logo_path !== undefined ? payload.logo_path : (savedDbRow?.logo_path ?? mergedPayload.logo_path ?? null),
        banner_path: payload.banner_path !== undefined ? payload.banner_path : (savedDbRow?.banner_path ?? mergedPayload.banner_path ?? null),
        site: payload.site !== undefined ? payload.site : (savedDbRow?.site ?? mergedPayload.site ?? null),
        email_publico: payload.email_publico !== undefined ? payload.email_publico : (savedDbRow?.email_publico ?? mergedPayload.email_publico ?? null),
        endereco: payload.endereco !== undefined ? payload.endereco : (savedDbRow?.endereco ?? mergedPayload.endereco ?? null),
        mostrar_endereco_anuncios:
          payload.mostrar_endereco_anuncios !== undefined
            ? payload.mostrar_endereco_anuncios
            : (savedDbRow?.mostrar_endereco_anuncios ?? mergedPayload.mostrar_endereco_anuncios ?? false),
        formas_atendimento:
          payload.formas_atendimento !== undefined
            ? payload.formas_atendimento
            : (savedDbRow?.formas_atendimento ?? mergedPayload.formas_atendimento ?? ['Delivery']),
        horario_funcionamento:
          payload.horario_funcionamento !== undefined
            ? payload.horario_funcionamento
            : (savedDbRow?.horario_funcionamento ?? mergedPayload.horario_funcionamento ?? {}),
        cores: payload.cores !== undefined ? payload.cores : (savedDbRow?.cores || mergedPayload.cores || ['#EA1D2C', '#1A1A1A']),
        personalidade: payload.personalidade !== undefined ? payload.personalidade : (savedDbRow?.personalidade || mergedPayload.personalidade || []),
        publico: payload.publico !== undefined ? payload.publico : (savedDbRow?.publico || mergedPayload.publico || []),
        diferenciais: payload.diferenciais !== undefined ? payload.diferenciais : (savedDbRow?.diferenciais || mergedPayload.diferenciais || []),
        data_inicio: mergedPayload.data_inicio || savedDbRow?.data_inicio || new Date().toISOString().split('T')[0],
        nivel: isSuper ? 3 : (savedDbRow?.nivel ?? mergedPayload.nivel ?? 1),
        plano: isSuper ? 'chef_master' : (savedDbRow?.plano ?? mergedPayload.plano ?? 'gratuito'),
        cadastro_passo: mergedPayload.cadastro_passo ?? savedDbRow?.cadastro_passo ?? 1,
        cadastro_concluido:
          savedDbRow?.cadastro_concluido ??
          mergedPayload.cadastro_concluido ??
          (Boolean((payload.nome || mergedPayload.nome)?.trim()) &&
            Boolean((payload.categoria || mergedPayload.categoria)?.trim())),
        _saved_at: Date.now(),
      } as any;

      localStorage.setItem(`${LOCAL_COMPANY_KEY}_${user.id}`, JSON.stringify(merged));
      return merged as Company;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['company', user?.id], saved);
    },
  });
}
