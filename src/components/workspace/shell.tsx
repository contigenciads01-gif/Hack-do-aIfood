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
  Upload,
  X,
  Edit2,
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
import { useCompany, useSaveCompany, isCompanyPlus } from '@/lib/data/company';
import { uploadCompanyLogo } from '@/lib/data/storage';
import { PlusUpgradeModal } from '@/components/workspace/plus-upgrade-modal';
import { useSubscription } from '@/lib/subscription';
import { SHOW_CEREBRO_MARCA, TUTORIAL_BLOQUEANTE } from '@/config';
import { GoldenBookIcon } from '@/components/ui/golden-book-icon';
import { useTutorialProgress } from '@/lib/tutorial-progress';
import { LogoHack } from '@/components/brand/LogoHack';
import { LogoStudioModal } from '@/components/brand/LogoStudioModal';
import { LogoSplash } from '@/components/brand/LogoSplash';

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const saveCompanyMutation = useSaveCompany();
  const { access, subscription } = useSubscription();
  const { isCompleted: tutorialCompleted } = useTutorialProgress();
  const isPlus = isCompanyPlus(company);

  const [menu, setMenu] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTutorialPopup, setShowTutorialPopup] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showLogoStudio, setShowLogoStudio] = useState(false);

  // Edit Company State for the popup
  const [editNome, setEditNome] = useState('');
  const [editSlogan, setEditSlogan] = useState('');
  const [editCores, setEditCores] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('#EA1D2C');
  const [savingCompany, setSavingCompany] = useState(false);

  const openCompanyModal = () => {
    if (company) {
      setEditNome(company.nome || '');
      setEditSlogan(company.slogan || '');
      setEditCores(company.cores || ['#EA1D2C', '#181818']);
    }
    setMenu(false);
    setShowCompanyModal(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNome.trim()) {
      toast.error('Informe o nome da empresa.');
      return;
    }
    setSavingCompany(true);
    try {
      await saveCompanyMutation.mutateAsync({
        nome: editNome.trim(),
        slogan: editSlogan.trim(),
        cores: editCores,
      });
      toast.success('Perfil da empresa atualizado com sucesso!');
      setShowCompanyModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar dados.');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleLogoUpload = async (file?: File) => {
    if (!file || !user?.id) return;
    try {
      toast.loading('Enviando nova logo...', { id: 'shell-upload-logo' });
      const { path } = await uploadCompanyLogo(file, user.id);
      await saveCompanyMutation.mutateAsync({
        tem_logo: true,
        logo_path: path,
      });
      toast.success('Logo atualizada com sucesso!', { id: 'shell-upload-logo' });
    } catch {
      toast.error('Erro ao enviar imagem da logo.', { id: 'shell-upload-logo' });
    }
  };

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading && !user && pathname !== '/') {
      navigate({ to: '/' });
    }
  }, [authLoading, user, pathname, navigate]);

  // 2. Empresa Obrigatória Protection
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

          {/* ─── BLOCO FIXO NO TOPO: CABEÇALHO DA EMPRESA ─── */}
          <div className="p-5 border-b border-white/10 bg-[#161618]">
            <div
              role="button"
              tabIndex={0}
              onClick={openCompanyModal}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openCompanyModal();
                }
              }}
              className="group flex items-center justify-between gap-3 p-2.5 -m-1 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer select-none"
              title="Toque para ver e editar os dados da sua empresa"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Logo ou Iniciais em quadrado arredondado (SEM CÍRCULO) */}
                {company?.tem_logo && company?.logo_path ? (
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-0.5">
                    <img
                      src={company.logo_path}
                      alt={company.nome || 'Logo'}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EA1D2C] text-sm font-black text-white shadow-md">
                    {(company?.nome || 'H').slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-[#EA1D2C] transition-colors">
                      {company?.nome || 'Minha Loja'}
                    </h3>
                  </div>

                  {/* Plano e dias restantes */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {access.hasAccess ? (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 truncate">
                        {access.planName} · {access.formattedRemaining}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        Sem plano ativo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white shrink-0 transition-transform group-hover:translate-x-0.5" />
            </div>

            {!access.hasAccess && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-end">
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
              onClick={openCompanyModal}
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

      {/* ═══════ POP-UP "MINHA EMPRESA" (VER E EDITAR) ═══════ */}
      <Dialog open={showCompanyModal} onOpenChange={setShowCompanyModal}>
        <DialogContent className="border-white/15 bg-[#141414] text-white max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Minha empresa</DialogTitle>
            <DialogDescription className="text-white/60 text-xs">
              Veja e edite os dados cadastrais da sua loja. As alterações são sincronizadas
              diretamente em todos os prompts do Agente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveCompany} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Nome da loja
              </label>
              <input
                type="text"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Slogan
              </label>
              <input
                type="text"
                value={editSlogan}
                onChange={(e) => setEditSlogan(e.target.value)}
                placeholder="Ex.: O autêntico sabor artesanal"
                className="mt-1 w-full rounded-2xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
              />
            </div>

            {/* Logo Change */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Logo da loja
              </label>
              <div className="mt-1 flex flex-wrap items-center gap-2.5">
                <Button asChild size="sm" variant="outline" className="text-xs border-white/20 rounded-xl">
                  <label className="cursor-pointer">
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Enviar logo (Arquivo)
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                    />
                  </label>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLogoStudio(true)}
                  className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-xl gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Criar logo (Estúdio)
                </Button>
                {company?.tem_logo && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await saveCompanyMutation.mutateAsync({
                        tem_logo: false,
                        logo_path: null,
                      });
                      toast.success('Definido como sem logo.');
                    }}
                    className="text-xs text-white/50 hover:text-white rounded-xl"
                  >
                    Usar sem logo
                  </Button>
                )}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Cores da marca
              </label>
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                {editCores.map((c, i) => (
                  <div
                    key={i}
                    className="group relative flex items-center gap-1.5 rounded-lg border border-white/20 px-2 py-1 bg-black/40 text-xs"
                  >
                    <span className="h-3.5 w-3.5 rounded-xs" style={{ backgroundColor: c }} />
                    <span className="font-mono">{c}</span>
                    <button
                      type="button"
                      onClick={() => setEditCores(editCores.filter((_, idx) => idx !== i))}
                      className="text-white/40 hover:text-white ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border border-white/20 bg-transparent p-0"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!editCores.includes(newColor)) {
                        setEditCores([...editCores, newColor]);
                      }
                    }}
                    className="text-xs h-8 px-2 border-white/20 rounded-xl"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCompanyModal(false)}
                className="border-white/20 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={savingCompany}
                className="bg-[#EA1D2C] font-bold hover:bg-[#ff3b4b] rounded-xl"
              >
                {savingCompany ? 'Salvando...' : 'Salvar perfil'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

      {/* ═══════ ESTÚDIO DE CRIAÇÃO DE LOGO ═══════ */}
      <LogoStudioModal
        open={showLogoStudio}
        onOpenChange={setShowLogoStudio}
        defaultStoreName={company?.nome || editNome}
        defaultNiche={company?.categoria || 'Hamburgueria'}
        onSelectPalette={async (colors) => {
          setEditCores(colors);
          await saveCompanyMutation.mutateAsync({
            cores: colors,
          });
          toast.success('Paleta de cores aplicada à sua empresa!');
        }}
      />

      {/* ═══════ SPLASH ANIMADO DO LOGO PÓS-LOGIN (UMA VEZ POR SESSÃO) ═══════ */}
      <LogoSplash />
    </div>
  );
}
