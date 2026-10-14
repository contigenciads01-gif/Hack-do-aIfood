import { useState, useEffect, type ReactNode } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Camera,
  ImagePlus,
  FileText,
  Brain,
  FolderOpen,
  Globe,
  CreditCard,
  Store,
  LogOut,
  Bell,
  Menu,
  MessageSquare,
  Instagram,
  Tags,
  Megaphone,
  Lock,
  BookOpen,
  Check,
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

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const { access, subscription } = useSubscription();
  const { isCompleted: tutorialCompleted } = useTutorialProgress();
  const isPlus = isCompanyPlus(company);

  const [menu, setMenu] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTutorialPopup, setShowTutorialPopup] = useState(false);

  // Dynamic Navigation Groups
  const groups = [
    {
      title: 'INÍCIO',
      items: [
        { to: '/dashboard', label: 'Meu cardápio', icon: LayoutDashboard },
        { to: '/tutorial', label: 'Tutorial', icon: GoldenBookIcon, isTutorial: true },
      ],
    },
    {
      title: 'ESTÚDIO',
      items: [
        { to: '/foto', label: 'Tirar foto do prato', icon: Camera },
        { to: '/imagem', label: 'Gerar imagem', icon: ImagePlus },
        { to: '/descricao', label: 'Descrição para o iFood', icon: FileText },
        ...(SHOW_CEREBRO_MARCA
          ? [{ to: '/branding', label: 'Cérebro de marca', icon: Brain }]
          : []),
        { to: '/materiais', label: 'Meus materiais', icon: FolderOpen },
      ],
    },
    {
      title: 'DIVULGAR',
      items: [
        { to: '/pagina', label: 'Minha página', icon: Globe },
        { to: '/avaliacoes', label: 'Respostas a avaliações', icon: MessageSquare },
        { to: '/instagram', label: 'Instagram', icon: Instagram },
        { to: '/promocoes', label: 'Promoções e preço', icon: Tags },
        { to: '/anuncios', label: 'Anúncios', icon: Megaphone, isPlus: true },
      ],
    },
    {
      title: 'CONTA',
      items: [
        { to: '/planos', label: 'Planos e assinatura', icon: CreditCard },
        { to: '/empresa', label: 'Minha empresa', icon: Store },
      ],
    },
  ];

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading && !user && pathname !== '/') {
      navigate({ to: '/' });
    }
  }, [authLoading, user, pathname]);

  // 2. Empresa Obrigatória Protection
  // If user is authenticated, without complete company profile they are sent to /cadastro
  useEffect(() => {
    if (!authLoading && user && !isCompanyLoading && pathname !== '/' && pathname !== '/cadastro') {
      const isComplete =
        company &&
        Boolean(company.nome?.trim()) &&
        Boolean(company.categoria?.trim()) &&
        Boolean(company.cores && company.cores.length > 0) &&
        (company.cadastro_passo ? company.cadastro_passo >= 4 : true);

      if (!isComplete) {
        navigate({ to: '/cadastro' });
      }
    }
  }, [authLoading, user, isCompanyLoading, company, pathname]);

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
  }, [user, authLoading, pathname, tutorialCompleted]);

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
            aria-label="Menu Editar meu E-commerce"
            title="Editar meu E-commerce"
            onClick={() => setMenu(true)}
          >
            <Menu />
          </Button>
          <Link to="/dashboard" className="workspace-brand">
            hack du ifood
          </Link>
          <div className="header-actions">
            <Link
              to="/planos"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-opacity hover:opacity-90 ${
                access.badgeVariant === 'active'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : access.badgeVariant === 'warning'
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
              title="Gerenciar assinatura e planos"
            >
              <span
                className={`h-2 w-2 rounded-full ${
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

      {/* Slide-out Menu Sheet */}
      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="workspace ecommerce-menu">
          <SheetHeader>
            <SheetTitle>Editar meu E-commerce</SheetTitle>
            <SheetDescription>Ferramentas da sua loja</SheetDescription>
          </SheetHeader>
          <nav aria-label="Editar meu E-commerce" className="mt-6">
            {groups.map((g) => (
              <div className="nav-group" key={g.title}>
                <p>{g.title}</p>
                {g.items.map((item) => {
                  const locked = (item as any).isPlus && !isPlus;
                  const isTutorial = (item as any).isTutorial;

                  if (locked) {
                    return (
                      <Button
                        key={item.to}
                        variant="ghost"
                        className="workspace-nav flex items-center justify-between text-white/50 hover:bg-white/5 hover:text-white"
                        onClick={() => {
                          setMenu(false);
                          setShowUpgradeModal(true);
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                          <Lock className="h-3 w-3" />
                          PLUS
                        </span>
                      </Button>
                    );
                  }

                  return (
                    <Button
                      asChild
                      variant="ghost"
                      className={`workspace-nav flex items-center justify-between ${
                        pathname === item.to ? 'is-active' : ''
                      }`}
                      key={item.to}
                    >
                      <Link to={item.to} onClick={() => setMenu(false)}>
                        <span className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </span>

                        {isTutorial && (
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                              tutorialCompleted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-[#EA1D2C]/20 text-[#EA1D2C] border border-[#F5B400] -rotate-3 shadow-xs'
                            }`}
                          >
                            {tutorialCompleted ? 'CONCLUÍDO ✓' : 'OBRIGATÓRIO'}
                          </span>
                        )}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            ))}
            <Button
              variant="ghost"
              className="workspace-nav text-rose-400 hover:text-rose-300"
              onClick={() => {
                setMenu(false);
                setShowExitDialog(true);
              }}
            >
              <LogOut />
              Sair da conta
            </Button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Accessible Logout Confirmation AlertDialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="border-white/15 bg-[#181818] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja sair da sua conta?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Você precisará do seu @usuario e senha para entrar novamente neste dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EA1D2C] text-white hover:bg-[#ff3b4b]"
              onClick={handleLogout}
            >
              Sair da conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* First Access Tutorial Dialog */}
      <Dialog open={showTutorialPopup} onOpenChange={setShowTutorialPopup}>
        <DialogContent className="border-white/15 bg-[#141414] text-white max-w-md">
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
              className="text-xs text-white/50 hover:text-white"
            >
              Depois
            </Button>
            <Button
              asChild
              className="bg-[#EA1D2C] font-bold text-xs hover:bg-[#ff3b4b]"
              onClick={() => setShowTutorialPopup(false)}
            >
              <Link to="/tutorial">Ver tutorial agora</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plus Upgrade Modal */}
      <PlusUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
