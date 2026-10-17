import { useState, useEffect, type ReactNode } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import {
  Sparkles,
  FolderOpen,
  CreditCard,
  Award,
  Store,
  LogOut,
  Bell,
  Menu,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useCompany, isCompanyPlus } from '@/lib/data/company';
import { PlusUpgradeModal } from '@/components/workspace/plus-upgrade-modal';
import { useSubscription } from '@/lib/subscription';
import { SHOW_CEREBRO_MARCA, TUTORIAL_BLOQUEANTE } from '@/config';
import { GoldenBookIcon } from '@/components/ui/golden-book-icon';
import { useTutorialProgress } from '@/lib/tutorial-progress';
import { LogoHack } from '@/components/brand/LogoHack';
import { LogoSplash } from '@/components/brand/LogoSplash';
import { CompanyEditorSheet } from '@/components/workspace/company-editor-sheet';
import { openCompanyEditor, type CompanyEditorSection } from '@/lib/company-editor-state';

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const { access, subscription, isAdmin } = useSubscription();
  const { isCompleted: tutorialCompleted } = useTutorialProgress();
  const isPlus =
    isAdmin ||
    access.plano === 'chef_master' ||
    (typeof access.plano === 'string' && access.plano.includes('master')) ||
    isCompanyPlus(company, user?.email);

  const [menu, setMenu] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTutorialPopup, setShowTutorialPopup] = useState(false);

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading && !user && pathname !== '/') {
      navigate({ to: '/' });
    }
  }, [authLoading, user, pathname, navigate]);

  // 2. Empresa Obrigatória Protection: checa APENAS cadastro_concluido
  useEffect(() => {
    if (!authLoading && user && !isCompanyLoading && pathname !== '/' && pathname !== '/cadastro') {
      const isComplete =
        company?.cadastro_concluido ??
        (Boolean(company?.nome?.trim()) && Boolean(company?.categoria?.trim()));

      if (!isComplete) {
        navigate({ to: '/cadastro' });
      }
    }
  }, [authLoading, user, isCompanyLoading, company, pathname, navigate]);

  // 3. Tutorial Bloqueante / First Access Check
  useEffect(() => {
    if (user && !authLoading && pathname !== '/' && pathname !== '/cadastro') {
      if (TUTORIAL_BLOQUEANTE && !tutorialCompleted && pathname !== '/tutorial') {
        navigate({ to: '/tutorial' });
        return;
      }

      const promptKey = `hdi_saw_tut_modal_${user.id}`;
      if (!sessionStorage.getItem(promptKey) && !tutorialCompleted && pathname !== '/tutorial') {
        sessionStorage.setItem(promptKey, 'true');
        setShowTutorialPopup(true);
      }
    }
  }, [user, authLoading, pathname, tutorialCompleted, navigate]);

  // 4. Discrete notification when 2 days or less remaining on active plan
  useEffect(() => {
    if (access.isExpiringSoon && access.hasAccess) {
      const alertedKey = `hdi_expiring_alert_${subscription?.id || 'trial'}`;
      if (!sessionStorage.getItem(alertedKey)) {
        sessionStorage.setItem(alertedKey, 'true');
        toast.warning(
          `Sua assinatura expira em ${access.formattedRemaining}. Acesse a aba Planos para renovar.`,
          { duration: 6000 },
        );
      }
    }
  }, [access.isExpiringSoon, access.hasAccess, access.formattedRemaining, subscription?.id]);

  if (pathname === '/' || pathname === '/cadastro') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Você saiu da sua conta.');
      navigate({ to: '/' });
    } catch {
      toast.error('Erro ao sair.');
    } finally {
      setShowExitDialog(false);
      setMenu(false);
    }
  };

  return (
    <div className="workspace ecommerce-workspace">
      <div className="workspace-body">
        <header className="workspace-header">
          <Button
            variant="outline"
            className="square-button"
            aria-label="Menu"
            title="Menu do Agente"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </Button>

          <Link to="/agente" className="workspace-brand inline-flex items-center">
            <LogoHack className="h-7 w-auto drop-shadow-sm" />
          </Link>

          <div className="header-actions">
            <Link
              to="/planos"
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition-opacity hover:opacity-90 ${
                access.badgeVariant === 'active'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : access.badgeVariant === 'warning'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
              title="Gerenciar assinatura e planos"
            >
              <span
                className={`h-2 w-2 rounded-xs ${
                  access.badgeVariant === 'active'
                    ? 'bg-emerald-400'
                    : access.badgeVariant === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                }`}
              />
              {access.label}
            </Link>

            <Button
              variant="ghost"
              className="square-button"
              aria-label="Notificações"
              onClick={() => {
                if (access.isExpiringSoon) {
                  toast.warning(`Sua assinatura expira em ${access.formattedRemaining}.`);
                } else if (!access.hasAccess) {
                  toast.error('Sua assinatura está expirada. Renove na aba Planos.');
                } else {
                  toast.info(`Plano ${access.planName} ativo. Restam ${access.formattedRemaining}.`);
                }
              }}
            >
              <Bell />
            </Button>
          </div>
        </header>

        {children}
      </div>

      {/* ═══════ MENU GAVETA (DRAWER) ═══════ */}
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="workspace ecommerce-menu p-0 bg-[#121214] text-white flex flex-col border-r border-white/10">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
            <SheetDescription>Navegue pelo Agente e pelas configurações da loja</SheetDescription>
          </SheetHeader>

          {/* ─── BLOCO FIXO NO TOPO: CARD MINHA EMPRESA ─── */}
          {(() => {
            const hasLogo = Boolean(company?.tem_logo && company?.logo_path);
            const hasColors = Boolean(company?.cores && company.cores.length >= 2);
            const hasWhatsapp = Boolean(company?.whatsapp?.trim());
            const hasAddress = Boolean((company?.endereco as any)?.cep || company?.cidade?.trim());
            const hasHours = Boolean(
              company?.horario?.trim() ||
                (company?.horario_funcionamento &&
                  typeof company.horario_funcionamento === 'object' &&
                  Object.values(company.horario_funcionamento).some((d: any) => d?.aberto)),
            );
            const hasBanner = Boolean(company?.banner_path?.trim());

            const filledCount = [hasLogo, hasColors, hasWhatsapp, hasAddress, hasHours, hasBanner].filter(Boolean).length;
            const completionPct = Math.round((filledCount / 6) * 100);

            const missingChips: Array<{ label: string; section: CompanyEditorSection }> = [];
            if (!hasWhatsapp) missingChips.push({ label: '+ WhatsApp', section: 'contato' });
            if (!hasHours) missingChips.push({ label: '+ Horário', section: 'negocio' });
            if (!hasAddress) missingChips.push({ label: '+ Endereço', section: 'localizacao' });
            if (!hasBanner) missingChips.push({ label: '+ Banner', section: 'identidade' });
            if (!hasLogo) missingChips.push({ label: '+ Logo', section: 'identidade' });

            const cardGradient =
              company?.cores && company.cores.length >= 2
                ? `linear-gradient(135deg, ${company.cores[0]} 0%, #111111 50%, ${company.cores[1] || company.cores[0]} 100%)`
                : 'linear-gradient(135deg, #EA1D2C 0%, #1A1A1A 100%)';

            return (
              <div className="p-4 border-b border-white/10 bg-[#161618]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Store className="h-3.5 w-3.5 text-[#EA1D2C]" />
                    Minha empresa
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">Toque para editar</span>
                </div>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setMenu(false);
                    openCompanyEditor('identidade');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setMenu(false);
                      openCompanyEditor('identidade');
                    }
                  }}
                  className="group relative rounded-2xl border border-white/15 overflow-hidden transition-all hover:border-[#EA1D2C]/60 hover:shadow-lg cursor-pointer bg-black/40 select-none"
                  title="Toque para editar os dados da sua empresa"
                >
                  {/* Banner Thumbnail (com degradê fallback da marca) */}
                  <div
                    className="h-16 w-full relative"
                    style={{
                      background: company?.banner_path
                        ? `url(${company.banner_path}) center/cover no-repeat`
                        : cardGradient,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>

                  {/* Info row */}
                  <div className="p-3 pt-0 relative -mt-6">
                    <div className="flex items-end justify-between gap-2.5">
                      {/* Logo ou Iniciais em quadrado arredondado (SEM CÍRCULO) */}
                      {company?.tem_logo && company?.logo_path ? (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border-2 border-[#161618] bg-black shadow-md p-0.5">
                          <img
                            src={company.logo_path}
                            alt={company.nome || 'Logo'}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#161618] bg-[#EA1D2C] text-sm font-black text-white shadow-md">
                          {(company?.nome || 'H').slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      {/* Plano Badge */}
                      <div className="pb-0.5">
                        {access.hasAccess ? (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30 truncate block">
                            {access.planName} · {access.formattedRemaining}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30 block">
                            Sem plano ativo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2">
                      <h3 className="font-black text-sm text-white truncate group-hover:text-[#EA1D2C] transition-colors">
                        {company?.nome || 'Minha Loja'}
                      </h3>
                      {company?.categoria && (
                        <p className="text-[11px] text-zinc-400 truncate">{company.categoria}</p>
                      )}
                    </div>

                    {/* Barra de Perfil X% Completo */}
                    <div className="mt-3 pt-2.5 border-t border-white/10">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-zinc-400 font-medium">Perfil da marca</span>
                        <span className="font-bold text-[#EA1D2C]">{completionPct}% completo</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#EA1D2C] to-[#ff5967] transition-all duration-500 rounded-full"
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>

                      {/* Missing Chips */}
                      {missingChips.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {missingChips.slice(0, 3).map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenu(false);
                                openCompanyEditor(chip.section);
                              }}
                              className="text-[10px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!access.hasAccess && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex justify-end">
                    <Link
                      to="/planos"
                      onClick={() => setMenu(false)}
                      className="text-xs font-bold text-[#EA1D2C] hover:underline"
                    >
                      Escolher plano agora →
                    </Link>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── LISTA DE NAVEGAÇÃO REORGANIZADA ─── */}
          <nav aria-label="Menu principal" className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {/* 1. AGENTE (DESTAQUE, TELA INICIAL) */}
            <Button
              asChild
              variant="ghost"
              className={`w-full h-13 justify-between rounded-2xl px-4 font-black text-sm transition-all ${
                pathname === '/agente' || pathname === '/dashboard'
                  ? 'bg-[#EA1D2C] text-white shadow-lg shadow-[#EA1D2C]/20 hover:bg-[#ff3b4b]'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              <Link to="/agente" onClick={() => setMenu(false)}>
                <span className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-amber-300 shrink-0" />
                  <span>Agente</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-md">
                  Início
                </span>
              </Link>
            </Button>

            {/* 2. MEUS MATERIAIS */}
            <Button
              asChild
              variant="ghost"
              className={`w-full h-12 justify-between rounded-2xl px-4 text-xs font-semibold ${
                pathname === '/materiais'
                  ? 'bg-white/15 text-white'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link to="/materiais" onClick={() => setMenu(false)}>
                <span className="flex items-center gap-3">
                  <FolderOpen className="h-4 w-4 text-[#EA1D2C] shrink-0" />
                  <span>Meus materiais</span>
                </span>
                <span className="text-[11px] text-zinc-500">Pastas por prato</span>
              </Link>
            </Button>

            {/* 3. FATURAMENTO */}
            <Button
              asChild
              variant="ghost"
              className={`w-full h-12 justify-between rounded-2xl px-4 text-xs font-semibold ${
                pathname === '/conta'
                  ? 'bg-white/15 text-white'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link to="/planos" onClick={() => setMenu(false)}>
                <span className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span>Faturamento</span>
                </span>
              </Link>
            </Button>

            {/* 4. PLANOS */}
            <Button
              asChild
              variant="ghost"
              className={`w-full h-12 justify-between rounded-2xl px-4 text-xs font-semibold ${
                pathname === '/planos'
                  ? 'bg-white/15 text-white'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link to="/planos" onClick={() => setMenu(false)}>
                <span className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Planos e assinatura</span>
                </span>
              </Link>
            </Button>

            {/* 5. TUTORIAL */}
            <Button
              asChild
              variant="ghost"
              className={`w-full h-12 justify-between rounded-2xl px-4 text-xs font-semibold ${
                pathname === '/tutorial'
                  ? 'bg-white/15 text-white'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Link to="/tutorial" onClick={() => setMenu(false)}>
                <span className="flex items-center gap-3">
                  <GoldenBookIcon className="h-4 w-4 shrink-0" />
                  <span>Tutorial</span>
                </span>

                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                    tutorialCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#EA1D2C]/20 text-[#EA1D2C] border border-[#F5B400] -rotate-3 shadow-xs'
                  }`}
                >
                  {tutorialCompleted ? 'CONCLUÍDO ✓' : 'OBRIGATÓRIO'}
                </span>
              </Link>
            </Button>

            {/* 6. MINHA EMPRESA */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setMenu(false);
                openCompanyEditor('identidade');
              }}
              className="w-full h-12 justify-start rounded-2xl px-4 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 gap-3"
            >
              <Store className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>Minha empresa</span>
            </Button>
          </nav>

          {/* ─── BASE: SAIR ─── */}
          <div className="p-4 border-t border-white/10 bg-[#161618]">
            <Button
              variant="ghost"
              className="w-full h-11 justify-start rounded-xl px-3 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-3"
              onClick={() => {
                setMenu(false);
                setShowExitDialog(true);
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sair da conta</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ═══════ PAINEL LATERAL RADIX SHEET: MINHA EMPRESA (4 SEÇÕES) ═══════ */}
      <CompanyEditorSheet />

      {/* Accessible Logout Confirmation AlertDialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="border-white/15 bg-[#181818] text-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair da sua conta?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Você precisará do seu @usuario e senha para entrar novamente neste dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10 rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EA1D2C] text-white hover:bg-[#ff3b4b] rounded-xl font-bold"
              onClick={handleLogout}
            >
              Sair da conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* First Access Tutorial Dialog */}
      <Dialog open={showTutorialPopup} onOpenChange={setShowTutorialPopup}>
        <DialogContent className="border-white/15 bg-[#141414] text-white max-w-md rounded-3xl">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 mb-2">
              <GoldenBookIcon className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-black">
              Antes de começar, veja o tutorial (2 minutos)
            </DialogTitle>
            <DialogDescription className="text-white/70 text-xs leading-relaxed pt-1">
              Aprenda a tirar as fotos certas, organizar suas pastas por prato e copiar os prompts
              prontos diretamente para o ChatGPT sem complicação.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="ghost"
              onClick={() => setShowTutorialPopup(false)}
              className="text-xs text-white/50 hover:text-white rounded-xl"
            >
              Depois
            </Button>
            <Button
              asChild
              className="bg-[#EA1D2C] font-bold text-xs hover:bg-[#ff3b4b] rounded-xl"
              onClick={() => setShowTutorialPopup(false)}
            >
              <Link to="/tutorial">Ver tutorial agora</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════ SPLASH ANIMADO DO LOGO PÓS-LOGIN (UMA VEZ POR SESSÃO) ═══════ */}
      <LogoSplash />
    </div>
  );
}
