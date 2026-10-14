import { type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Lock, ArrowRight, MessageCircle, FolderOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/lib/subscription';
import { getWhatsAppSubscribeUrl, getTrimestralMonthlyPriceFormatted } from '@/config/plans';

interface PlanGateProps {
  children: ReactNode;
  toolTitle?: string;
  allowExpired?: boolean;
}

export function PlanGate({ children, toolTitle, allowExpired = false }: PlanGateProps) {
  const { access, isLoading } = useSubscription();

  if (isLoading || allowExpired || access.hasAccess) {
    return <>{children}</>;
  }

  const isExpired = access.status === 'expirado';
  const isCanceled = access.status === 'cancelado';
  const whatsappUrl = getWhatsAppSubscribeUrl('trimestral');

  return (
    <div className="flex min-h-[480px] w-full items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#141414] p-6 text-center shadow-2xl sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EA1D2C]/15 text-[#EA1D2C] ring-1 ring-[#EA1D2C]/30">
          <Lock className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
          {isExpired
            ? 'Seu período de acesso expirou'
            : isCanceled
              ? 'Sua assinatura está inativa'
              : 'Assinatura necessária'}
        </h2>

        <p className="mt-2 text-sm text-white/70">
          {toolTitle ? `O recurso "${toolTitle}" requer` : 'As ferramentas de criação exigem'}{' '}
          um plano ativo. Seus materiais já criados continuam salvos e acessíveis na sua conta.
        </p>

        {isExpired && access.plano && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-1.5 text-xs font-semibold text-rose-300">
            <AlertCircle className="h-4 w-4" />
            Plano {access.planName} finalizado
          </div>
        )}

        <div className="mt-6 rounded-xl border border-white/5 bg-black/40 p-4 text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-[#EA1D2C]">
            Vantagens da assinatura
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-white/80">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EA1D2C]" />
              Acesso a todos os 9 geradores de prompt para delivery
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EA1D2C]" />
              Anúncios de alta conversão (Story 9:16 e Carrossel)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EA1D2C]" />
              Planos a partir de {getTrimestralMonthlyPriceFormatted()}
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-[#EA1D2C] font-semibold text-white hover:bg-[#ff3b4b]">
            <Link to="/planos">
              Ver planos e assinar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chamar no WhatsApp
            </a>
          </Button>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <Button asChild variant="ghost" size="sm" className="text-xs text-white/50 hover:text-white">
            <Link to="/materiais">
              <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
              Acessar Meus materiais salvos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
