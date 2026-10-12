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
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useCompany, isCompanyPlus } from '@/lib/data/company';
import { PlusUpgradeModal } from '@/components/workspace/plus-upgrade-modal';

const groups = [
  {
    title: 'INÍCIO',
    items: [{ to: '/dashboard', label: 'Painel', icon: LayoutDashboard }],
  },
  {
    title: 'ESTÚDIO',
    items: [
      { to: '/foto', label: 'Tirar foto do prato', icon: Camera },
      { to: '/imagem', label: 'Gerar imagem', icon: ImagePlus },
      { to: '/descricao', label: 'Descrição para o iFood', icon: FileText },
      { to: '/branding', label: 'Cérebro de marca', icon: Brain },
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
      { to: '/creditos', label: 'Créditos', icon: CreditCard },
      { to: '/empresa', label: 'Minha empresa', icon: Store },
    ],
  },
] as const;

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const { data: company } = useCompany();
  const isPlus = isCompanyPlus(company);

  const [menu, setMenu] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Auth protection for protected routes
  useEffect(() => {
    if (!authLoading && !user && pathname !== '/') {
      navigate({ to: '/' });
    }
  }, [authLoading, user, pathname]);

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
            <span className="example-label header-free">Prompts grátis</span>
            <Button
              variant="ghost"
              className="square-button"
              aria-label="Notificações"
              onClick={() => toast('Nenhuma notificação por enquanto.')}
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
                      className={`workspace-nav ${pathname === item.to ? 'is-active' : ''}`}
                      key={item.to}
                    >
                      <Link to={item.to} onClick={() => setMenu(false)}>
                        <item.icon />
                        {item.label}
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

      {/* Plus Upgrade Modal */}
      <PlusUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
