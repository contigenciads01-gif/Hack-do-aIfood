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

export function isCompanyPlus(company: Company | null | undefined): boolean {
  if (!company) return false;
  return company.plano === 'plus' || (company.nivel ?? 1) >= 2;
}

const LOCAL_COMPANY_KEY = 'hdi_company_profile';

export function useCompany() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['company', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Company | null> => {
      if (!user?.id) return null;

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('Company fetch error, falling back to local storage:', error.message);
          const cached = localStorage.getItem(`${LOCAL_COMPANY_KEY}_${user.id}`);
          return cached ? JSON.parse(cached) : null;
        }

        if (data) {
          const raw = data as any;
          const isConcluido =
            raw.cadastro_concluido !== undefined && raw.cadastro_concluido !== null
              ? !!raw.cadastro_concluido
              : Boolean(raw.nome?.trim()) && Boolean(raw.categoria?.trim());

          const parsed: Company = {
            id: data.id,
            user_id: data.user_id,
            nome: data.nome,
            responsavel: (data as any).responsavel ?? null,
            categoria: data.categoria,
            cidade: data.cidade,
            whatsapp: data.whatsapp,
            instagram: data.instagram,
            horario: data.horario,
            slogan: data.slogan,
            tem_logo: !!data.tem_logo,
            logo_path: data.logo_path,
            cores: Array.isArray(data.cores) ? (data.cores as string[]) : [],
            personalidade: Array.isArray(data.personalidade) ? data.personalidade : [],
            tom: data.tom,
            publico: Array.isArray(data.publico) ? data.publico : [],
            faixa_preco: data.faixa_preco,
            diferenciais: Array.isArray(data.diferenciais) ? data.diferenciais : [],
            estilo_visual: data.estilo_visual,
            data_inicio: data.data_inicio ?? new Date().toISOString().split('T')[0] ?? '',
            nivel: data.nivel ?? 1,
            plano: (data as any).plano ?? ((data.nivel ?? 1) >= 2 ? 'plus' : 'gratuito'),
            cadastro_passo: data.cadastro_passo ?? 1,
            cadastro_concluido: isConcluido,
            banner_path: (data as any).banner_path ?? null,
            site: (data as any).site ?? null,
            email_publico: (data as any).email_publico ?? null,
            endereco: (data as any).endereco ?? null,
            mostrar_endereco_anuncios: !!(data as any).mostrar_endereco_anuncios,
            formas_atendimento: Array.isArray((data as any).formas_atendimento)
              ? (data as any).formas_atendimento
              : [],
            horario_funcionamento: (data as any).horario_funcionamento ?? {},
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          localStorage.setItem(`${LOCAL_COMPANY_KEY}_${user.id}`, JSON.stringify(parsed));
          return parsed;
        }

        const cached = localStorage.getItem(`${LOCAL_COMPANY_KEY}_${user.id}`);
        return cached ? JSON.parse(cached) : null;
      } catch (err) {
        console.warn('Error reading company:', err);
        const cached = localStorage.getItem(`${LOCAL_COMPANY_KEY}_${user.id}`);
        return cached ? JSON.parse(cached) : null;
      }
    },
  });
}

export function useSaveCompany() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

      const upsertData: Record<string, any> = {
        user_id: user.id,
        nome: mergedPayload.nome || 'Minha Loja',
        categoria: mergedPayload.categoria || 'Outro',
        cidade: mergedPayload.cidade || null,
        whatsapp: mergedPayload.whatsapp || null,
        instagram: mergedPayload.instagram || null,
        horario: mergedPayload.horario || null,
        slogan: mergedPayload.slogan || null,
        tem_logo: mergedPayload.tem_logo ?? false,
        logo_path: mergedPayload.logo_path || null,
        cores: mergedPayload.cores || [],
        personalidade: mergedPayload.personalidade || [],
        tom: mergedPayload.tom || null,
        publico: mergedPayload.publico || [],
        faixa_preco: mergedPayload.faixa_preco || null,
        diferenciais: mergedPayload.diferenciais || [],
        estilo_visual: mergedPayload.estilo_visual || null,
        data_inicio: mergedPayload.data_inicio ?? new Date().toISOString().split('T')[0] ?? '',
        nivel: mergedPayload.nivel ?? 1,
        cadastro_passo: mergedPayload.cadastro_passo ?? 1,
      };

      if (mergedPayload.cadastro_concluido !== undefined) {
        upsertData['cadastro_concluido'] = mergedPayload.cadastro_concluido;
      }
      if (mergedPayload.banner_path !== undefined) {
        upsertData['banner_path'] = mergedPayload.banner_path;
      }
      if (mergedPayload.site !== undefined) {
        upsertData['site'] = mergedPayload.site;
      }
      if (mergedPayload.email_publico !== undefined) {
        upsertData['email_publico'] = mergedPayload.email_publico;
      }
      if (mergedPayload.endereco !== undefined) {
        upsertData['endereco'] = mergedPayload.endereco;
      }
      if (mergedPayload.mostrar_endereco_anuncios !== undefined) {
        upsertData['mostrar_endereco_anuncios'] = mergedPayload.mostrar_endereco_anuncios;
      }
      if (mergedPayload.formas_atendimento !== undefined) {
        upsertData['formas_atendimento'] = mergedPayload.formas_atendimento;
      }
      if (mergedPayload.horario_funcionamento !== undefined) {
        upsertData['horario_funcionamento'] = mergedPayload.horario_funcionamento;
      }

      try {
        const { data, error } = await supabase
          .from('companies')
          .upsert(upsertData, { onConflict: 'user_id' })
          .select()
          .single();

        if (error) {
          console.warn('Supabase upsert warning, updating local cache:', error.message);
        }

        const merged: Company = {
          ...mergedPayload,
          ...(data || {}),
          user_id: user.id,
          nome: mergedPayload.nome || 'Minha Loja',
          categoria: mergedPayload.categoria || 'Outro',
          tem_logo: mergedPayload.tem_logo ?? false,
          cores: mergedPayload.cores || [],
          personalidade: mergedPayload.personalidade || [],
          publico: mergedPayload.publico || [],
          diferenciais: mergedPayload.diferenciais || [],
          data_inicio: mergedPayload.data_inicio || new Date().toISOString().split('T')[0],
          nivel: mergedPayload.nivel ?? 1,
          cadastro_passo: mergedPayload.cadastro_passo ?? 1,
          cadastro_concluido:
            (data as any)?.cadastro_concluido ??
            mergedPayload.cadastro_concluido ??
            (Boolean(mergedPayload.nome?.trim()) && Boolean(mergedPayload.categoria?.trim())),
        } as Company;

        localStorage.setItem(`${LOCAL_COMPANY_KEY}_${user.id}`, JSON.stringify(merged));
        return merged;
      } catch (err) {
        console.warn('Network error while saving company, saving locally:', err);
        const merged = {
          ...mergedPayload,
          user_id: user.id,
          nome: mergedPayload.nome || 'Minha Loja',
          categoria: mergedPayload.categoria || 'Outro',
          tem_logo: mergedPayload.tem_logo ?? false,
          cores: mergedPayload.cores || [],
          personalidade: mergedPayload.personalidade || [],
          publico: mergedPayload.publico || [],
          diferenciais: mergedPayload.diferenciais || [],
          data_inicio: mergedPayload.data_inicio || new Date().toISOString().split('T')[0],
          nivel: mergedPayload.nivel ?? 1,
          cadastro_passo: mergedPayload.cadastro_passo ?? 1,
          cadastro_concluido:
            mergedPayload.cadastro_concluido ??
            (Boolean(mergedPayload.nome?.trim()) && Boolean(mergedPayload.categoria?.trim())),
        } as Company;
        localStorage.setItem(`${LOCAL_COMPANY_KEY}_${user.id}`, JSON.stringify(merged));
        return merged;
      }
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['company', user?.id], saved);
      queryClient.invalidateQueries({ queryKey: ['company', user?.id] });
    },
  });
}
