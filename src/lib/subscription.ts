import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { PLANS, type PlanId, isUserAdminEmail } from '@/config/plans';

export interface SubscriptionRecord {
  id?: string;
  user_id?: string;
  plano: PlanId;
  status: 'ativo' | 'expirado' | 'cancelado';
  inicio: string | Date;
  fim: string | Date;
  origem?: 'trial' | 'manual';
  criado_em?: string;
}

export type AccessStatus = 'ativo' | 'expirado' | 'cancelado' | 'sem_assinatura';

export interface PlanAccess {
  hasAccess: boolean;
  status: AccessStatus;
  plano: PlanId | null;
  planName: string;
  daysRemaining: number;
  hoursRemaining: number;
  isExpiringSoon: boolean;
  formattedRemaining: string;
  label: string;
  badgeVariant: 'active' | 'warning' | 'danger';
}

/**
 * Pure function to calculate plan access, expiration and remaining time.
 * Fully testable and deterministic when providing the `agora` reference date.
 */
export function getAccess(
  subscription: SubscriptionRecord | null | undefined,
  agora: Date = new Date(),
): PlanAccess {
  if (!subscription) {
    return {
      hasAccess: false,
      status: 'sem_assinatura',
      plano: null,
      planName: 'Sem plano',
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpiringSoon: false,
      formattedRemaining: 'Sem assinatura',
      label: 'Sem assinatura',
      badgeVariant: 'danger',
    };
  }

  if (subscription.status === 'cancelado') {
    const planName = PLANS[subscription.plano]?.name || subscription.plano;
    return {
      hasAccess: false,
      status: 'cancelado',
      plano: subscription.plano,
      planName,
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpiringSoon: false,
      formattedRemaining: 'Cancelado',
      label: `${planName} · Cancelado`,
      badgeVariant: 'danger',
    };
  }

  const fimTime = new Date(subscription.fim).getTime();
  const agoraTime = agora.getTime();
  const diffMs = fimTime - agoraTime;

  // Expired if current time is greater than or equal to end time
  if (diffMs <= 0 || subscription.status === 'expirado') {
    const planName = PLANS[subscription.plano]?.name || subscription.plano;
    return {
      hasAccess: false,
      status: 'expirado',
      plano: subscription.plano,
      planName,
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpiringSoon: false,
      formattedRemaining: 'Expirado',
      label: `${planName} · Expirado`,
      badgeVariant: 'danger',
    };
  }

  // Active
  const hoursRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = daysRemaining <= 2;
  const planName = PLANS[subscription.plano]?.name || subscription.plano;

  let formattedRemaining: string;
  if (daysRemaining > 1) {
    formattedRemaining = `${daysRemaining} dias`;
  } else if (daysRemaining === 1 && hoursRemaining > 24) {
    formattedRemaining = '1 dia';
  } else {
    formattedRemaining = hoursRemaining === 1 ? '1 hora' : `${hoursRemaining} horas`;
  }

  return {
    hasAccess: true,
    status: 'ativo',
    plano: subscription.plano,
    planName,
    daysRemaining,
    hoursRemaining,
    isExpiringSoon,
    formattedRemaining,
    label: `${planName} · ${formattedRemaining}`,
    badgeVariant: isExpiringSoon ? 'warning' : 'active',
  };
}

/**
 * React hook to fetch and monitor current user's subscription and admin status.
 */
export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isSuperAdminEmail = isUserAdminEmail(user?.email);

  const { data: dbAdminRole = false } = useQuery({
    queryKey: ['user_role_admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        return false;
      }
      return !!data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const isAdmin = isSuperAdminEmail || dbAdminRole;

  const {
    data: subscription,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['user_subscription', user?.id, user?.email],
    queryFn: async (): Promise<SubscriptionRecord | null> => {
      if (!user?.id) return null;

      // SuperAdmin override: grant Chef Master plan with 10 years access immediately
      if (isSuperAdminEmail) {
        const now = new Date();
        const tenYearsLater = new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000);

        // Attempt background persistence to Supabase
        (async () => {
          try {
            await (supabase as any).from('subscriptions').upsert({
              user_id: user.id,
              plano: 'chef_master',
              status: 'ativo',
              inicio: now.toISOString(),
              fim: tenYearsLater.toISOString(),
              origem: 'manual',
            });
            await (supabase as any).from('user_roles').upsert({
              user_id: user.id,
              role: 'admin',
            });
          } catch {
            // silent ignore in offline/sandbox
          }
        })();

        return {
          plano: 'chef_master' as PlanId,
          status: 'ativo' as const,
          inicio: now.toISOString(),
          fim: tenYearsLater.toISOString(),
          origem: 'manual' as const,
        };
      }

      const { data, error } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching subscription:', error);
        return {
          plano: 'experimental' as PlanId,
          status: 'ativo' as const,
          inicio: new Date().toISOString(),
          fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          origem: 'trial' as const,
        };
      }

      if (!data) {
        // Automatically try to seed experimental trial if no subscription row exists
        const now = new Date();
        const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const { data: newSub } = await (supabase as any)
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plano: 'experimental',
            status: 'ativo',
            inicio: now.toISOString(),
            fim: end.toISOString(),
            origem: 'trial',
          })
          .select()
          .single();

        return (newSub as SubscriptionRecord) || {
          plano: 'experimental' as PlanId,
          status: 'ativo' as const,
          inicio: now.toISOString(),
          fim: end.toISOString(),
          origem: 'trial' as const,
        };
      }

      return data as SubscriptionRecord;
    },
    enabled: !!user?.id,
  });

  const baseAccess = getAccess(subscription);

  // If user is admin, guarantee full access even if subscription has lapsed
  const access: PlanAccess = isAdmin
    ? {
        ...baseAccess,
        hasAccess: true,
        label: baseAccess.plano ? `${baseAccess.label} (Admin)` : 'Administrador',
        badgeVariant: 'active',
      }
    : baseAccess;

  return {
    subscription,
    access,
    isAdmin,
    isLoading,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['user_subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user_role_admin'] });
      return refetch();
    },
  };
}
