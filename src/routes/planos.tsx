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

  // Billing cycle state
  const [selectedCycle, setSelectedCycle] = useState<'mensal' | 'trimestral' | 'anual'>('mensal');

  // Admin form state
  const [adminUserId, setAdminUserId] = useState('');
  const [adminPlan, setAdminPlan] = useState<PlanId>('chef_master');
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
      <section className="mt-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="section-title">Escolha seu plano</h2>
            <p className="text-xs text-white/60">
              Receba pagamentos de 30 em 30 dias via Pix ou economize nos ciclos mais longos.
            </p>
          </div>

          {/* Toggle de Ciclo de Faturamento */}
          <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCycle('mensal')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                selectedCycle === 'mensal'
                  ? 'bg-[#EA1D2C] text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('trimestral')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedCycle === 'trimestral'
                  ? 'bg-[#EA1D2C] text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Trimestral</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-extrabold">
                Economia
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('anual')}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedCycle === 'anual'
                  ? 'bg-[#EA1D2C] text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Anual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 font-extrabold">
                25% OFF
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* 1. PLANO PRIMEIROS PASSOS */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#141414] p-6 shadow-xl relative">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Primeiros Passos</h3>
                <span className="rounded-xl bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/70">
                  {selectedCycle === 'anual'
                    ? '—'
                    : selectedCycle === 'trimestral'
                      ? '90 dias'
                      : '30 dias'}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60">
                Ideal para começar: fotos com IA essencial e descrições apetitosas para seus pratos.
              </p>

              {selectedCycle === 'anual' ? (
                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                  <p className="text-xs font-bold text-white/80">Não oferecido no ciclo anual</p>
                  <p className="text-[11px] text-white/40">
                    Disponível no Mensal (R$ 14,90) ou Trimestral (R$ 34,90).
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">
                      {selectedCycle === 'trimestral'
                        ? formatCurrency(PLANS.primeiros_passos_trimestral.price)
                        : formatCurrency(PLANS.primeiros_passos.price)}
                    </span>
                    <span className="text-xs text-white/50">
                      {selectedCycle === 'trimestral' ? '/ 90 dias' : '/ mês'}
                    </span>
                  </div>
                  {selectedCycle === 'trimestral' && (
                    <p className="mt-1 text-xs font-semibold text-emerald-400">
                      R$ 11,63/mês · Economia de R$ 9,80
                    </p>
                  )}
                </div>
              )}

              <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4 text-xs text-white/80">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span>Fotos reais com IA essencial</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span>Descrições apetitosas para o iFood</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span>Câmera de pratos e galeria</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span>Cobrança Pix automatizada Asaas</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4">
              {access.plano === 'primeiros_passos' && access.hasAccess ? (
                <Button disabled variant="outline" className="w-full rounded-2xl">
                  Plano atual ativo
                </Button>
              ) : selectedCycle === 'anual' ? (
                <Button
                  type="button"
                  onClick={() => setSelectedCycle('trimestral')}
                  variant="outline"
                  className="w-full rounded-2xl border-white/15 text-xs text-white/70"
                >
                  Ver no Trimestral
                </Button>
              ) : (
                <Button asChild className="w-full rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold">
                  <a
                    href={getWhatsAppSubscribeUrl(
                      selectedCycle === 'trimestral'
                        ? 'primeiros_passos_trimestral'
                        : 'primeiros_passos',
                      company?.nome,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Assinar Primeiros Passos
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* 2. PLANO CHEF (MAIS POPULAR) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-emerald-500/50 bg-[#141414] p-6 shadow-2xl">
            <span className="absolute -top-3 right-4 rounded-xl bg-emerald-500 px-3 py-0.5 text-xs font-bold text-black shadow">
              Mais Escolhido
            </span>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Chef</h3>
                <span className="rounded-xl bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                  {selectedCycle === 'anual'
                    ? '365 dias'
                    : selectedCycle === 'trimestral'
                      ? '90 dias'
                      : '30 dias'}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60">
                Para delivery profissional: fotos de estúdio com iluminação, cardápio completo e respostas de avaliações.
              </p>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {selectedCycle === 'anual'
                      ? formatCurrency(PLANS.chef_anual.price)
                      : selectedCycle === 'trimestral'
                        ? formatCurrency(PLANS.chef_trimestral.price)
                        : formatCurrency(PLANS.chef.price)}
                  </span>
                  <span className="text-xs text-white/50">
                    {selectedCycle === 'anual'
                      ? '/ ano'
                      : selectedCycle === 'trimestral'
                        ? '/ 90 dias'
                        : '/ mês'}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-emerald-400">
                  {selectedCycle === 'anual'
                    ? 'R$ 22,49/mês · Economize R$ 88,90 ao ano'
                    : selectedCycle === 'trimestral'
                      ? 'R$ 26,63/mês · Economize R$ 9,80'
                      : 'Cobrança Pix de 30 em 30 dias'}
                </p>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4 text-xs text-white/80">
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>Estúdio com iluminação gastronômica gourmet</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>Descrições apetitosas para todo o cardápio</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>Promoções e cálculo seguro de preço</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>Respostas inteligentes para notas 1 a 5</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                  <span>Minha página com bio e link de WhatsApp</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4">
              {access.plano === 'chef' && access.hasAccess ? (
                <Button disabled variant="outline" className="w-full rounded-2xl">
                  Plano atual ativo
                </Button>
              ) : (
                <Button asChild className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold shadow-lg shadow-emerald-500/20">
                  <a
                    href={getWhatsAppSubscribeUrl(
                      selectedCycle === 'anual'
                        ? 'chef_anual'
                        : selectedCycle === 'trimestral'
                          ? 'chef_trimestral'
                          : 'chef',
                      company?.nome,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Assinar Plano Chef
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* 3. PLANO CHEF MASTER (ACESSO TOTAL + ANÚNCIOS) */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-[#EA1D2C] bg-gradient-to-b from-[#1a080a] to-[#121212] p-6 shadow-2xl">
            <span className="absolute -top-3 right-4 rounded-xl bg-[#EA1D2C] px-3 py-0.5 text-xs font-bold text-white shadow">
              Acesso Total + Anúncios
            </span>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Chef Master</h3>
                <span className="rounded-xl bg-[#EA1D2C]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#EA1D2C] border border-[#EA1D2C]/30">
                  VIP Irrestrito
                </span>
              </div>
              <p className="mt-2 text-xs text-white/60">
                Poder absoluto para seu delivery: liberação de todas as 7 ferramentas, incluindo criativos de Anúncios no Instagram.
              </p>

              <div className="mt-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {selectedCycle === 'anual'
                      ? formatCurrency(PLANS.chef_master_anual.price)
                      : selectedCycle === 'trimestral'
                        ? formatCurrency(PLANS.chef_master_trimestral.price)
                        : formatCurrency(PLANS.chef_master.price)}
                  </span>
                  <span className="text-xs text-white/50">
                    {selectedCycle === 'anual'
                      ? '/ ano'
                      : selectedCycle === 'trimestral'
                        ? '/ 90 dias'
                        : '/ mês'}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#EA1D2C]">
                  {selectedCycle === 'anual'
                    ? 'R$ 37,49/mês · Quase 3 meses grátis (Economize R$ 148,90)'
                    : selectedCycle === 'trimestral'
                      ? 'R$ 44,97/mês · Economize R$ 14,80'
                      : 'Cobrança Pix de 30 em 30 dias'}
                </p>
              </div>

              <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4 text-xs text-white/80">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span className="font-bold text-white">Anúncios para Instagram (Story 9:16 + Feed)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span>Todas as 7 ferramentas do Agente 100% destravadas</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span>Cérebro de marca e identidade completa</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span>Gerações de prompt ilimitadas sem cortes</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-4 w-4 flex-shrink-0 text-[#EA1D2C]" />
                  <span>Suporte VIP prioritário direto no WhatsApp</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4">
              {access.plano === 'chef_master' && access.hasAccess ? (
                <Button disabled variant="outline" className="w-full rounded-2xl border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                  <Check className="mr-2 h-4 w-4 text-emerald-400" />
                  Plano Master Ativo
                </Button>
              ) : (
                <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-[#EA1D2C] to-[#E31020] font-black text-white hover:brightness-110 shadow-lg shadow-[#EA1D2C]/40">
                  <a
                    href={getWhatsAppSubscribeUrl(
                      selectedCycle === 'anual'
                        ? 'chef_master_anual'
                        : selectedCycle === 'trimestral'
                          ? 'chef_master_trimestral'
                          : 'chef_master',
                      company?.nome,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Assinar Chef Master
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Admin Panel (visible only for admin users) */}
      {isAdmin && (
        <section className="mt-10 rounded-3xl border border-amber-500/30 bg-[#16130b] p-6 text-white shadow-xl">
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
                <option value="chef_master">Chef Master (Acesso Total - R$ 49,90)</option>
                <option value="chef_master_anual">Chef Master Anual (R$ 449,90)</option>
                <option value="chef">Chef (R$ 29,90)</option>
                <option value="chef_trimestral">Chef Trimestral (R$ 79,90)</option>
                <option value="chef_anual">Chef Anual (R$ 269,90)</option>
                <option value="primeiros_passos">Primeiros Passos (R$ 14,90)</option>
                <option value="primeiros_passos_trimestral">Primeiros Passos Trimestral (R$ 34,90)</option>
                <option value="experimental">Experimental (7 dias)</option>
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
