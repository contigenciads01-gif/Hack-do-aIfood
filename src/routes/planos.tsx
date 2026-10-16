import { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  CreditCard,
  Check,
  Sparkles,
  MessageCircle,
  Clock,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  PLANS,
  type PlanId,
  formatCurrency,
  getTrimestralMonthlyPriceFormatted,
  getTrimestralSavingsFormatted,
  getWhatsAppSubscribeUrl,
} from '@/config/plans';
import { useSubscription } from '@/lib/subscription';
import { useCompany } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/planos')({
  head: () => ({
    meta: [
      { title: 'Planos e Assinatura — hack du ifood' },
      { name: 'description', content: 'Escolha o plano ideal para acelerar os pedidos e a lucratividade do seu delivery no iFood.' },
      { property: 'og:title', content: 'Planos e Assinatura — hack du ifood' },
      { property: 'og:description', content: 'Escolha o plano ideal para acelerar os pedidos do seu delivery.' },
    ],
  }),
  component: PlanosPage,
});

export function PlanosPage() {
  const { subscription, access, isAdmin, refetch } = useSubscription();
  const { data: company } = useCompany();

  // Admin form state
  const [adminUserId, setAdminUserId] = useState('');
  const [adminPlan, setAdminPlan] = useState<PlanId>('mensal');
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUserId.trim()) {
      toast.error('Informe o UUID do usuário.');
      return;
    }

    setAdminSubmitting(true);
    try {
      const { data, error } = await (supabase.rpc as any)('admin_set_subscription', {
        target_user_id: adminUserId.trim(),
        target_plano: adminPlan,
      });

      if (error) {
        throw error;
      }

      toast.success(`Assinatura do usuário atualizada para o plano ${PLANS[adminPlan].name}!`);
      setAdminUserId('');
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao alterar assinatura via admin.');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <main className="tool-page max-w-5xl">
      <div className="page-heading flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="icon-tile">
            <CreditCard />
          </span>
          <div>
            <h1>Planos e assinatura</h1>
            <p>Escolha o plano ideal para alavancar seu delivery com prompts profissionais.</p>
          </div>
        </div>

        <Button asChild variant="outline" className="self-start md:self-auto">
          <Link to="/tutorial">
            <BookOpen className="mr-2 h-4 w-4" />
            Ver tutorial completo
          </Link>
        </Button>
      </div>

      {/* Current Subscription Card */}
      <section className="tool-card border-white/10 bg-[#141414]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Sua assinatura atual
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  access.badgeVariant === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : access.badgeVariant === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {access.status === 'ativo' ? (
                  <>
                    <Clock className="h-3 w-3" />
                    {access.formattedRemaining}
                  </>
                ) : access.status === 'expirado' ? (
                  'Expirado'
                ) : access.status === 'cancelado' ? (
                  'Cancelado'
                ) : (
                  'Sem plano'
                )}
              </span>
            </div>

            <h2 className="mt-1 text-2xl font-bold text-white">
              {access.planName}
              {isAdmin && (
                <span className="ml-2 text-xs font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Admin
                </span>
              )}
            </h2>

            {subscription && (
              <p className="mt-1 text-xs text-white/60">
                Início: {formatDate(subscription.inicio)} · Vencimento: {formatDate(subscription.fim)}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <a
                href={getWhatsAppSubscribeUrl('trimestral', company?.nome)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Falar com suporte
              </a>
            </Button>
          </div>
        </div>

        {access.isExpiringSoon && access.hasAccess && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              Sua assinatura expira em breve ({access.formattedRemaining}). Renove agora para não perder o
              acesso às ferramentas de criação.
            </span>
          </div>
        )}
      </section>

      {/* Pricing Cards */}
      <section className="mt-8">
        <h2 className="section-title">Escolha seu plano</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Plano Experimental */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{PLANS.experimental.name}</h3>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/70">
                  7 dias
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60">{PLANS.experimental.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">Grátis</span>
                <span className="text-xs text-white/50">/ 7 dias</span>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4 text-xs text-white/80">
                {PLANS.experimental.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4">
              {access.plano === 'experimental' && access.hasAccess ? (
                <Button disabled variant="outline" className="w-full">
                  Plano atual ativo
                </Button>
              ) : (
                <Button disabled variant="ghost" className="w-full text-xs text-white/40">
                  Teste inicial de 7 dias
                </Button>
              )}
            </div>
          </div>

          {/* Plano Mensal */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-lg">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{PLANS.mensal.name}</h3>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/70">
                  30 dias
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60">{PLANS.mensal.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">
                  {formatCurrency(PLANS.mensal.price)}
                </span>
                <span className="text-xs text-white/50">/ mês</span>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4 text-xs text-white/80">
                {PLANS.mensal.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4">
              <Button asChild className="w-full bg-[#EA1D2C] hover:bg-[#ff3b4b]">
                <a
                  href={getWhatsAppSubscribeUrl('mensal', company?.nome)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Assinar Mensal
                </a>
              </Button>
            </div>
          </div>

          {/* Plano Trimestral */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-[#EA1D2C] bg-[#141414] p-6 shadow-2xl">
            <span className="absolute -top-3 right-4 rounded-full bg-[#EA1D2C] px-3 py-0.5 text-xs font-bold text-white shadow">
              {PLANS.trimestral.highlight}
            </span>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{PLANS.trimestral.name}</h3>
                <span className="rounded-md bg-[#EA1D2C]/20 px-2 py-0.5 text-[11px] font-semibold text-[#EA1D2C]">
                  90 dias
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60">{PLANS.trimestral.description}</p>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {formatCurrency(PLANS.trimestral.price)}
                  </span>
                  <span className="text-xs text-white/50">/ 90 dias</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-emerald-400">
                  {getTrimestralMonthlyPriceFormatted()} · Economize {getTrimestralSavingsFormatted()}
                </p>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4 text-xs text-white/80">
                {PLANS.trimestral.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4">
              <Button asChild className="w-full bg-[#EA1D2C] font-bold text-white hover:bg-[#ff3b4b]">
                <a
                  href={getWhatsAppSubscribeUrl('trimestral', company?.nome)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Assinar Trimestral
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel (visible only for admin users) */}
      {isAdmin && (
        <section className="mt-10 rounded-2xl border border-amber-500/30 bg-[#16130b] p-6 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-amber-400">Painel do Administrador</h2>
              <p className="text-xs text-amber-200/70">
                Ative ou altere a assinatura de qualquer restaurante pelo UUID da conta.
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminUpdate} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase text-white/60">
                UUID do Usuário (auth.users)
              </label>
              <input
                type="text"
                value={adminUserId}
                onChange={(e) => setAdminUserId(e.target.value)}
                placeholder="Ex.: 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-white/60">Plano</label>
              <select
                value={adminPlan}
                onChange={(e) => setAdminPlan(e.target.value as PlanId)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-[#181818] px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="experimental">Experimental (7 dias)</option>
                <option value="mensal">Mensal (30 dias)</option>
                <option value="trimestral">Trimestral (90 dias)</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <Button
                type="submit"
                disabled={adminSubmitting}
                className="bg-amber-500 font-bold text-black hover:bg-amber-400"
              >
                {adminSubmitting ? 'Atualizando...' : 'Definir Assinatura'}
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* Tutorial Banner */}
      <section className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 p-6 sm:flex-row">
        <div>
          <h3 className="text-lg font-bold text-white">Dúvidas sobre como usar as ferramentas?</h3>
          <p className="text-xs text-white/60">
            Acesse nosso tutorial passo a passo com exemplos e dicas para cada etapa do seu cardápio.
          </p>
        </div>
        <Button asChild variant="outline" className="border-white/20">
          <Link to="/tutorial">
            Ver tutorial
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </main>
  );
}
