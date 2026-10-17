import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  CreditCard,
  RefreshCw,
  Search,
  ArrowLeft,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription, type SubscriptionRecord } from '@/lib/subscription';
import { PLANS, type PlanId } from '@/config/plans';

export const Route = createFileRoute('/admin/assinaturas')({
  head: () => ({
    meta: [
      { title: 'Administração de Assinaturas — Hack do aiFood' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminAssinaturasPage,
});

export function AdminAssinaturasPage() {
  const { isAdmin, isLoading: loadingAdmin, refetch: refetchUserSub } = useSubscription();

  const [targetUserId, setTargetUserId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('chef_master');
  const [updating, setUpdating] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch recent subscriptions
  const {
    data: subscriptions = [],
    isLoading: loadingSubs,
    refetch: refetchList,
  } = useQuery({
    queryKey: ['admin_subscriptions_list'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('subscriptions')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error loading subscriptions for admin:', error);
        return [];
      }
      return (data || []) as SubscriptionRecord[];
    },
    enabled: !!isAdmin,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) {
      toast.error('Informe o UUID do usuário.');
      return;
    }

    setUpdating(true);
    try {
      const { data, error } = await (supabase.rpc as any)('admin_set_subscription', {
        target_user_id: targetUserId.trim(),
        target_plano: selectedPlan,
      });

      if (error) throw error;

      toast.success(`Assinatura atualizada com sucesso para o plano ${PLANS[selectedPlan].name}!`);
      setTargetUserId('');
      refetchList();
      refetchUserSub();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao definir assinatura.');
    } finally {
      setUpdating(false);
    }
  };

  if (loadingAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8 text-white/60">
        Verificando permissões de administrador...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
        <p className="text-sm text-white/60">
          Esta área é restrita a administradores do sistema hack du ifood.
        </p>
        <Button asChild variant="outline">
          <Link to="/planos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Planos
          </Link>
        </Button>
      </div>
    );
  }

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.user_id?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.plano.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            Painel do Administrador
          </span>
          <h1 className="mt-2 text-3xl font-black text-white">Gerenciar Assinaturas</h1>
          <p className="text-xs sm:text-sm text-white/60">
            Ative, renove ou altere o plano de qualquer usuário registrado.
          </p>
        </div>

        <Button asChild variant="outline" className="self-start sm:self-auto border-white/20">
          <Link to="/planos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos Planos
          </Link>
        </Button>
      </div>

      {/* Manual Subscription Grant Form */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-[#EA1D2C]" />
          Definir Plano para Usuário
        </h2>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
              UUID do Usuário (auth.users)
            </label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="Ex.: 3fa85f64-5717-4562-b3fc-2c963f66afa6"
              className="mt-1 w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#EA1D2C] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Plano a Aplicar
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value as PlanId)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-[#181818] px-4 py-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-none"
            >
              <option value="chef_master">Chef Master (Acesso Total - R$ 49,90/mês)</option>
              <option value="chef_master_anual">Chef Master Anual (R$ 449,90/ano)</option>
              <option value="chef_master_trimestral">Chef Master Trimestral (R$ 134,90)</option>
              <option value="chef">Chef (R$ 29,90/mês)</option>
              <option value="chef_trimestral">Chef Trimestral (R$ 79,90)</option>
              <option value="chef_anual">Chef Anual (R$ 269,90/ano)</option>
              <option value="primeiros_passos">Primeiros Passos (R$ 14,90/mês)</option>
              <option value="primeiros_passos_trimestral">Primeiros Passos Trimestral (R$ 34,90)</option>
              <option value="experimental">Experimental (7 dias)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <Button
              type="submit"
              disabled={updating}
              className="bg-[#EA1D2C] font-bold text-white hover:bg-[#ff3b4b]"
            >
              {updating ? 'Gravando no banco...' : 'Definir e Ativar Assinatura'}
            </Button>
          </div>
        </form>
      </div>

      {/* Subscriptions List */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-xl space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#EA1D2C]" />
            Últimas Assinaturas Registradas
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrar por UUID..."
                className="rounded-xl border border-white/15 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchList()}
              className="border-white/15 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {loadingSubs ? (
          <p className="text-xs text-white/50 py-4">Carregando lista...</p>
        ) : filteredSubs.length === 0 ? (
          <p className="text-xs text-white/50 py-4">Nenhuma assinatura encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="py-2.5 px-3">Usuário</th>
                  <th className="py-2.5 px-3">Plano</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Origem</th>
                  <th className="py-2.5 px-3">Vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredSubs.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-white/5">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-white/70">
                      {sub.user_id ? `${sub.user_id.slice(0, 8)}...${sub.user_id.slice(-6)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white capitalize">
                      {sub.plano}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sub.status === 'ativo'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white/60 capitalize">
                      {sub.origem || 'trial'}
                    </td>
                    <td className="py-2.5 px-3 text-white/70">
                      {new Date(sub.fim).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
