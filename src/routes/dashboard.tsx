import { useState, useMemo } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  UtensilsCrossed,
  Plus,
  Camera,
  Image as ImageIcon,
  FileText,
  Megaphone,
  Check,
  Sparkles,
  ArrowRight,
  Award,
  FolderOpen,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PlanGate } from '@/components/workspace/plan-gate';
import { useCompany } from '@/lib/data/company';
import {
  usePratos,
  useCreatePrato,
  calculatePratoChecklist,
  type Prato,
} from '@/lib/data/pratos';
import { useMaterials, type DbMaterial } from '@/lib/data/materials';
import { useTutorialProgress } from '@/lib/tutorial-progress';
import { GoldenBookIcon } from '@/components/ui/golden-book-icon';

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [
      { title: 'Meu cardápio — Hack do iFood' },
      {
        name: 'description',
        content: 'Gerencie os pratos do seu cardápio, fotos e prompts prontos.',
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { data: company } = useCompany();
  const { data: pratos = [], isLoading: loadingPratos } = usePratos();
  const { data: materials = [] } = useMaterials();
  const { isCompleted: tutorialCompleted } = useTutorialProgress();
  const createPratoMutation = useCreatePrato();

  const [createOpen, setCreateOpen] = useState(false);
  const [newPratoNome, setNewPratoNome] = useState('');
  const [selectedPrato, setSelectedPrato] = useState<Prato | null>(null);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  // Calculate progress for each dish
  const dishesWithStatus = useMemo(() => {
    return pratos.map((p) => {
      const checklist = calculatePratoChecklist(p.prato_fotos || [], materials, p.id);
      const coverPhoto = p.prato_fotos?.find((f) => f.slot === 1) || p.prato_fotos?.[0];
      return {
        ...p,
        checklist,
        coverPhoto,
      };
    });
  }, [pratos, materials]);

  const totalPratos = dishesWithStatus.length;
  const readyPratos = dishesWithStatus.filter((p) => p.checklist.isComplete).length;
  const progressPercent = totalPratos === 0 ? 0 : Math.round((readyPratos / totalPratos) * 100);

  // Next recommended action
  const nextStep = useMemo(() => {
    if (totalPratos === 0) {
      return {
        title: 'Cadastre seu primeiro prato',
        desc: 'Adicione o prato principal da sua casa para começar a montar o cardápio.',
        actionLabel: 'Novo prato',
        onClick: () => setCreateOpen(true),
      };
    }

    const dishWithoutPhoto = dishesWithStatus.find((p) => !p.checklist.hasFoto);
    if (dishWithoutPhoto) {
      return {
        title: `Tire as fotos de "${dishWithoutPhoto.nome}"`,
        desc: 'Tire 3 fotos com seu celular: de cima, de lado e detalhe suculento.',
        actionLabel: 'Tirar fotos agora',
        onClick: () => navigate({ to: '/foto' }),
      };
    }

    const dishWithoutDesc = dishesWithStatus.find((p) => !p.checklist.hasDescricao);
    if (dishWithoutDesc) {
      return {
        title: `Gere a descrição de "${dishWithoutDesc.nome}"`,
        desc: 'Crie uma descrição apetitosa e completa para o cardápio do iFood.',
        actionLabel: 'Gerar descrição',
        onClick: () => navigate({ to: '/descricao' }),
      };
    }

    const dishWithoutImg = dishesWithStatus.find((p) => !p.checklist.hasImagem);
    if (dishWithoutImg) {
      return {
        title: `Gere a imagem de "${dishWithoutImg.nome}"`,
        desc: 'Monte um prompt profissional para aprimorar a foto do seu prato.',
        actionLabel: 'Gerar imagem',
        onClick: () => navigate({ to: '/imagem' }),
      };
    }

    const dishWithoutAd = dishesWithStatus.find((p) => !p.checklist.hasAnuncio);
    if (dishWithoutAd) {
      return {
        title: `Crie um anúncio de "${dishWithoutAd.nome}"`,
        desc: 'Aumente seus pedidos com copys de alta conversão para Instagram ou Meta Ads.',
        actionLabel: 'Criar anúncio',
        onClick: () => navigate({ to: '/anuncios' }),
      };
    }

    return {
      title: 'Todos os pratos estão 100% prontos!',
      desc: 'Seu cardápio está completo com fotos, imagens e descrições irresistíveis.',
      actionLabel: 'Ver meus materiais',
      onClick: () => navigate({ to: '/materiais' }),
    };
  }, [dishesWithStatus, totalPratos, navigate]);

  // Real Collectible Badges
  const badges = [
    {
      id: 'first_dish',
      label: 'Primeiro prato',
      desc: 'Cadastrou o primeiro item',
      unlocked: totalPratos >= 1,
    },
    {
      id: 'three_ready',
      label: '3 pratos prontos',
      desc: '3 pratos com os 4 selos',
      unlocked: readyPratos >= 3,
    },
    {
      id: 'all_ready',
      label: 'Cardápio 100%',
      desc: 'Todos os pratos finalizados',
      unlocked: totalPratos > 0 && readyPratos === totalPratos,
    },
    {
      id: 'tutorial_done',
      label: 'Tutorial concluído',
      desc: 'Assistiu ao guia completo',
      unlocked: tutorialCompleted,
    },
  ];

  const handleCreatePrato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPratoNome.trim()) {
      toast.error('Informe o nome do prato.');
      return;
    }

    try {
      const created = await createPratoMutation.mutateAsync(newPratoNome.trim());
      toast.success(`Prato "${created.nome}" adicionado com sucesso!`);
      setNewPratoNome('');
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar prato.');
    }
  };

  return (
    <PlanGate toolTitle="Meu cardápio">
      <div className="min-h-svh bg-[#0f0f10] text-zinc-100">
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-black text-white">
                <UtensilsCrossed className="h-7 w-7 text-[#EA1D2C]" />
                Meu cardápio
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {greeting}, <strong className="text-white">{company?.nome || 'Parceiro'}</strong>!
                Acompanhe e finalize os itens do seu cardápio profissional.
              </p>
            </div>

            {/* 56px Tall Primary Button */}
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="h-14 px-6 rounded-2xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white text-base font-bold shadow-xl shadow-[#EA1D2C]/20 gap-2.5 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Novo prato
            </Button>
          </div>

          {/* Progress Meter: Meu cardápio profissional */}
          <div className="rounded-2xl border border-white/10 bg-[#161618] p-5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#EA1D2C]">
                  Progresso geral
                </span>
                <h2 className="text-lg font-bold text-white">
                  Meu cardápio profissional — {readyPratos} de {totalPratos} pratos prontos
                </h2>
              </div>
              <span className="text-sm font-extrabold text-white bg-white/10 px-3 py-1 rounded-xl">
                {progressPercent}%
              </span>
            </div>

            <div className="h-3 w-full rounded-xl bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#EA1D2C] via-amber-500 to-emerald-500 rounded-xl transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/50">
              Um prato é considerado pronto quando possui foto real, prompt de imagem, descrição e anúncio.
            </p>
          </div>

          {/* Card: Seu próximo passo */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#181818] to-[#141414] p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Seu próximo passo
                </span>
                <h3 className="text-base font-bold text-white">{nextStep.title}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{nextStep.desc}</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={nextStep.onClick}
              className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md gap-2 shrink-0 self-stretch sm:self-auto"
            >
              {nextStep.actionLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Grade de Pratos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Pratos cadastrados ({totalPratos})</h2>
              {totalPratos > 0 && (
                <Link
                  to="/materiais"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-medium"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Abrir Meus materiais
                </Link>
              )}
            </div>

            {loadingPratos ? (
              <div className="py-12 text-center text-sm text-zinc-500">
                Carregando cardápio…
              </div>
            ) : totalPratos === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EA1D2C]/10 text-[#EA1D2C]">
                  <UtensilsCrossed className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nenhum prato cadastrado ainda</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                    Cadastre o primeiro prato do seu delivery para tirar fotos sem complicação e gerar materiais prontos para o iFood.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="h-12 px-6 rounded-2xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-bold text-xs"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Cadastrar primeiro prato
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishesWithStatus.map((prato) => (
                  <div
                    key={prato.id}
                    onClick={() => setSelectedPrato(prato)}
                    className="group cursor-pointer rounded-2xl border border-white/10 bg-[#161618] hover:border-white/25 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                        {prato.coverPhoto ? (
                          <img
                            src={prato.coverPhoto.signed_url || prato.coverPhoto.storage_path}
                            alt={prato.nome}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-500 p-4">
                            <Camera className="h-6 w-6 text-zinc-600" />
                            <span className="text-[11px] font-medium">Sem foto de capa</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate({ to: '/foto' });
                              }}
                              className="h-7 text-[10px] rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white"
                            >
                              Tirar foto
                            </Button>
                          </div>
                        )}

                        {/* Slot Count Badge */}
                        {prato.prato_fotos && prato.prato_fotos.length > 0 && (
                          <div className="absolute top-2 right-2 rounded-lg bg-black/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                            {prato.prato_fotos.length} de 3 fotos
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-white text-base truncate group-hover:text-[#EA1D2C] transition-colors">
                          {prato.nome}
                        </h3>

                        {/* 4 Status Badges */}
                        <div className="mt-3 grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5">
                          {/* 1. Foto */}
                          <div
                            className={`flex flex-col items-center p-1.5 rounded-xl text-center border ${
                              prato.checklist.hasFoto
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-zinc-500'
                            }`}
                            title={prato.checklist.hasFoto ? 'Foto no slot 1 OK' : 'Sem foto'}
                          >
                            <Camera className="h-3.5 w-3.5 mb-0.5" />
                            <span className="text-[9px] font-bold">Foto</span>
                          </div>

                          {/* 2. Imagem */}
                          <div
                            className={`flex flex-col items-center p-1.5 rounded-xl text-center border ${
                              prato.checklist.hasImagem
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-zinc-500'
                            }`}
                            title={prato.checklist.hasImagem ? 'Prompt de imagem gerado' : 'Sem prompt de imagem'}
                          >
                            <ImageIcon className="h-3.5 w-3.5 mb-0.5" />
                            <span className="text-[9px] font-bold">Imagem</span>
                          </div>

                          {/* 3. Descrição */}
                          <div
                            className={`flex flex-col items-center p-1.5 rounded-xl text-center border ${
                              prato.checklist.hasDescricao
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-zinc-500'
                            }`}
                            title={prato.checklist.hasDescricao ? 'Descrição gerada' : 'Sem descrição'}
                          >
                            <FileText className="h-3.5 w-3.5 mb-0.5" />
                            <span className="text-[9px] font-bold">Descrição</span>
                          </div>

                          {/* 4. Anúncio */}
                          <div
                            className={`flex flex-col items-center p-1.5 rounded-xl text-center border ${
                              prato.checklist.hasAnuncio
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-zinc-500'
                            }`}
                            title={prato.checklist.hasAnuncio ? 'Anúncio criado' : 'Sem anúncio'}
                          >
                            <Megaphone className="h-3.5 w-3.5 mb-0.5" />
                            <span className="text-[9px] font-bold">Anúncio</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-3 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                      <span>Clique para ver detalhes</span>
                      <span className="text-white/60 group-hover:text-white">Ver →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conquistas e Selos (100% dados reais) */}
          <div className="rounded-2xl border border-white/10 bg-[#161618] p-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-amber-400" />
              Selos de conquista da sua loja
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                    b.unlocked
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                      : 'border-white/5 bg-white/[0.02] text-zinc-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">
                      {b.id === 'tutorial_done' ? '📖' : b.id === 'all_ready' ? '🏆' : b.id === 'three_ready' ? '⚡' : '🍽️'}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm ${
                        b.unlocked
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-white/5 text-zinc-500'
                      }`}
                    >
                      {b.unlocked ? 'CONQUISTADO' : 'BLOQUEADO'}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold ${b.unlocked ? 'text-white' : 'text-zinc-400'}`}>
                      {b.label}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Modal: Novo Prato */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="border-white/15 bg-[#161618] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-[#EA1D2C]" />
                Cadastrar novo prato
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-xs">
                Informe o nome do prato para criar a pasta correspondente e começar a anexar fotos e textos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePrato} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Nome do prato ou combo *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Ex: Smash Burger Duplo com Queijo"
                  value={newPratoNome}
                  onChange={(e) => setNewPratoNome(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#EA1D2C] focus:outline-hidden"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createPratoMutation.isPending}
                  className="rounded-xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white text-xs font-bold"
                >
                  {createPratoMutation.isPending ? 'Salvando…' : 'Criar prato'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Detalhes do Prato */}
        <Dialog open={!!selectedPrato} onOpenChange={(open) => !open && setSelectedPrato(null)}>
          <DialogContent className="border-white/15 bg-[#161618] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedPrato && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA1D2C] bg-[#EA1D2C]/15 px-2 py-0.5 rounded-sm">
                      Detalhes do prato
                    </span>
                  </div>
                  <DialogTitle className="text-xl font-black text-white mt-1">
                    {selectedPrato.nome}
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-xs">
                    Fotos registradas e materiais salvos vinculados a este prato.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-2">
                  {/* Fotos do Prato (até 3) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Fotos registradas ({selectedPrato.prato_fotos?.length || 0} de 3)
                      </h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedPrato(null);
                          navigate({ to: '/foto' });
                        }}
                        className="text-xs text-[#EA1D2C] hover:text-[#ff3b4b] h-7 gap-1 font-semibold"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Tirar ou refazer fotos
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((slot) => {
                        const foto = selectedPrato.prato_fotos?.find((f) => f.slot === slot);
                        const label = slot === 1 ? 'De cima' : slot === 2 ? 'De lado' : 'Detalhe';

                        return (
                          <div
                            key={slot}
                            className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40 flex flex-col items-center justify-center text-center p-2"
                          >
                            {foto ? (
                              <>
                                <img
                                  src={foto.signed_url || foto.storage_path}
                                  alt={`Slot ${slot}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                                  {label}
                                </div>
                              </>
                            ) : (
                              <div className="space-y-1">
                                <Camera className="h-5 w-5 text-zinc-600 mx-auto" />
                                <p className="text-[10px] font-bold text-zinc-400">{label}</p>
                                <span className="text-[9px] text-zinc-600">Vazio</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Materiais salvos para este prato */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                      Materiais gerados para este prato
                    </h3>
                    {materials.filter((m) => m.prato_id === selectedPrato.id).length === 0 ? (
                      <p className="text-xs text-zinc-500 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                        Nenhum texto salvo para este prato ainda. Use os atalhos abaixo para criar prompts.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {materials
                          .filter((m) => m.prato_id === selectedPrato.id)
                          .map((mat) => (
                            <div
                              key={mat.id}
                              className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start justify-between gap-3"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-sm">
                                    {mat.tool}
                                  </span>
                                  <p className="text-xs font-bold text-white truncate">{mat.title}</p>
                                </div>
                                <p className="text-[11px] text-zinc-400 line-clamp-2">{mat.text}</p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(mat.text);
                                  toast.success('Prompt copiado!');
                                }}
                                className="h-7 text-xs rounded-lg border-white/20 shrink-0 gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                Copiar
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Atalhos rápidos para ferramentas */}
                  <div className="pt-2 border-t border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                      Atalhos rápidos para ferramentas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedPrato(null);
                          navigate({ to: '/imagem' });
                        }}
                        className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-bold gap-2 h-10 justify-start"
                      >
                        <ImageIcon className="h-4 w-4 text-[#EA1D2C]" />
                        Gerar imagem
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedPrato(null);
                          navigate({ to: '/descricao' });
                        }}
                        className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-bold gap-2 h-10 justify-start"
                      >
                        <FileText className="h-4 w-4 text-[#EA1D2C]" />
                        Gerar descrição
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedPrato(null);
                          navigate({ to: '/anuncios' });
                        }}
                        className="rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-bold gap-2 h-10 justify-start"
                      >
                        <Megaphone className="h-4 w-4 text-[#EA1D2C]" />
                        Criar anúncio
                      </Button>
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedPrato(null)}
                    className="rounded-xl text-xs border-white/20 text-white"
                  >
                    Fechar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PlanGate>
  );
}
