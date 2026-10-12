import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface Company {
  id?: string | undefined;
  user_id: string;
  nome: string;
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
  cadastro_passo: number;
  created_at?: string | undefined;
  updated_at?: string | undefined;
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
          const parsed: Company = {
            id: data.id,
            user_id: data.user_id,
            nome: data.nome,
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
            cadastro_passo: data.cadastro_passo ?? 1,
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

      const companyData: Partial<Company> & { user_id: string } = {
        ...payload,
        user_id: user.id,
      };

      try {
        const { data, error } = await supabase
          .from('companies')
          .upsert(
            {
              user_id: user.id,
              nome: companyData.nome || 'Minha Loja',
              categoria: companyData.categoria || 'Outro',
              cidade: companyData.cidade || null,
              whatsapp: companyData.whatsapp || null,
              instagram: companyData.instagram || null,
              horario: companyData.horario || null,
              slogan: companyData.slogan || null,
              tem_logo: companyData.tem_logo ?? false,
              logo_path: companyData.logo_path || null,
              cores: companyData.cores || [],
              personalidade: companyData.personalidade || [],
              tom: companyData.tom || null,
              publico: companyData.publico || [],
              faixa_preco: companyData.faixa_preco || null,
              diferenciais: companyData.diferenciais || [],
              estilo_visual: companyData.estilo_visual || null,
              data_inicio: companyData.data_inicio ?? new Date().toISOString().split('T')[0] ?? '',
              nivel: companyData.nivel ?? 1,
              cadastro_passo: companyData.cadastro_passo ?? 1,
            },
            { onConflict: 'user_id' },
          )
          .select()
          .single();

        if (error) {
          console.warn('Supabase upsert warning, updating local cache:', error.message);
        }

        const merged: Company = {
          ...payload,
          user_id: user.id,
          nome: payload.nome || 'Minha Loja',
          categoria: payload.categoria || 'Outro',
          tem_logo: payload.tem_logo ?? false,
          cores: payload.cores || [],
          personalidade: payload.personalidade || [],
          publico: payload.publico || [],
          diferenciais: payload.diferenciais || [],
          data_inicio: payload.data_inicio || new Date().toISOString().split('T')[0],
          nivel: payload.nivel ?? 1,
          cadastro_passo: payload.cadastro_passo ?? 1,
          ...(data || {}),
        } as Company;

        localStorage.setItem(`${LOCAL_COMPANY_KEY}_${user.id}`, JSON.stringify(merged));
        return merged;
      } catch (err) {
        console.warn('Network error while saving company, saving locally:', err);
        const merged = {
          ...payload,
          user_id: user.id,
          nome: payload.nome || 'Minha Loja',
          categoria: payload.categoria || 'Outro',
          tem_logo: payload.tem_logo ?? false,
          cores: payload.cores || [],
          personalidade: payload.personalidade || [],
          publico: payload.publico || [],
          diferenciais: payload.diferenciais || [],
          data_inicio: payload.data_inicio || new Date().toISOString().split('T')[0],
          nivel: payload.nivel ?? 1,
          cadastro_passo: payload.cadastro_passo ?? 1,
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
