import { useState, useEffect } from 'react';
import { useRouterState, useNavigate } from '@tanstack/react-router';
import {
  Megaphone,
  ImagePlus,
  FileText,
  Tags,
  MessageSquare,
  Globe,
  Camera,
  Lock,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandProfileBar } from '@/components/workspace/brand-profile-bar';
import { AgenteFluxoDialog } from '@/components/workspace/agente-fluxo-dialog';
import { FotoStudio } from '@/components/workspace/foto-studio';
import { PlusUpgradeModal } from '@/components/workspace/plus-upgrade-modal';
import { AgenteCard } from '@/components/workspace/agente-card';
import { FloatingGlassBackground } from '@/components/workspace/floating-glass-background';
import { useCompany, isCompanyPlus } from '@/lib/data/company';
import { usePratos, type Prato } from '@/lib/data/pratos';
import { useMaterials } from '@/lib/data/materials';
import { useAuth } from '@/lib/auth';
import { useSubscription } from '@/lib/subscription';
import { AGENTE_FLUXOS } from '@/data/agente-fluxos';

interface AgenteWorkspaceProps {
  initialCard?: string;
}

export function AgenteWorkspace({ initialCard }: AgenteWorkspaceProps = {}) {
  const navigate = useNavigate();
  const searchParams = useRouterState({
    select: (s) => (s.location.search as Record<string, string | undefined>) || {},
  });

  const { user } = useAuth();
  const { access, isAdmin } = useSubscription();
  const { data: company } = useCompany();
  const { data: pratos = [] } = usePratos();
  const { data: materials = [] } = useMaterials();
  const isPlus =
    isAdmin ||
    access.plano === 'chef_master' ||
    (typeof access.plano === 'string' && access.plano.includes('master')) ||
    isCompanyPlus(company, user?.email);

  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFotoStudio, setShowFotoStudio] = useState(false);

  // Sync with search parameter `?card=id`
  useEffect(() => {
    const targetCard = searchParams['card'] || initialCard;
    if (targetCard) {
      if (targetCard === 'fotos_pratos' || targetCard === 'foto') {
        setShowFotoStudio(true);
      } else if (AGENTE_FLUXOS[targetCard]) {
        setActiveCard(targetCard);
      }
    }
  }, [searchParams['card'], initialCard]);

  // Card list matching specification
  const cards = [
    {
      id: 'anuncio_instagram',
      title: 'Anúncio para Instagram',
      subtitle: 'Campanhas de posts, stories ou carrossel com copy e chamada.',
      icon: Megaphone,
      isPlus: true,
      badge: 'Instagram & Ads',
    },
    {
      id: 'imagem_prato',
      title: 'Imagem do prato',
      subtitle: 'Aprimore sua foto real ou crie uma imagem fotográfica do zero.',
      icon: ImagePlus,
      badge: 'Fotos & Capas',
    },
    {
      id: 'descricao_ifood',
      title: 'Descrição para o iFood',
      subtitle: 'Títulos e descrições apetitosas com os ingredientes reais.',
      icon: FileText,
      badge: 'Cardápio iFood',
    },
    {
      id: 'promocao_preco',
      title: 'Promoção e preço',
      subtitle: 'Calcule descontos e combos lucrativos sem risco de prejuízo.',
      icon: Tags,
      badge: 'Lucro & Taxas',
    },
    {
      id: 'responder_avaliacao',
      title: 'Responder avaliação',
      subtitle: 'Respostas humanas, educadas e estratégicas para notas de 1 a 5.',
      icon: MessageSquare,
      badge: 'Avaliações',
    },
    {
      id: 'minha_pagina',
      title: 'Minha página',
      subtitle: 'Página de links para Instagram, WhatsApp e QR code da embalagem.',
      icon: Globe,
      badge: 'Bio & Links',
    },
    {
      id: 'fotos_pratos',
      title: 'Fotos dos pratos',
      subtitle: 'Tire 3 fotos com a câmera do celular ou envie da galeria.',
      icon: Camera,
      badge: 'Câmera do celular',
    },
  ];

  const handleCardClick = (card: (typeof cards)[0]) => {
    if (card.isPlus && !isPlus) {
      setShowUpgradeModal(true);
      return;
    }

    if (card.id === 'fotos_pratos') {
      setShowFotoStudio(true);
    } else {
      setActiveCard(card.id);
    }
  };

  // Dish summary count
  const totalPratos = pratos.length;
  const readyPratos = pratos.filter((p) => p.checklist?.isComplete).length;

  return (
    <main className="tool-page relative max-w-6xl space-y-7 pb-16">
      {/* ═══════ 0. FUNDO COM QUADRADOS DE VIDRO FLUTUANDO (MAX 6) ═══════ */}
      <FloatingGlassBackground />

      {/* ═══════ 1. BARRA "PERFIL DA MARCA" NO TOPO ═══════ */}
      <BrandProfileBar />

      {/* ═══════ 2. TÍTULO E SUBTÍTULO ═══════ */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#EA1D2C] bg-[#EA1D2C]/10 px-2.5 py-0.5 rounded-md border border-[#EA1D2C]/20">
            Workspace único
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          O que você quer fazer hoje?
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
          Os dados da sua loja entram automaticamente em todos os prompts. Escolha uma ferramenta
          para responder perguntas rápidas por opções, sem precisar digitar.
        </p>
      </div>

      {/* ═══════ 3. GRADE DE CARDS GRANDES COM FÍSICA E CÉREBRO PENSANDO ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {cards.map((card, idx) => {
          const isLocked = card.isPlus && !isPlus;

          return (
            <AgenteCard
              key={card.id}
              id={card.id}
              title={card.title}
              subtitle={card.subtitle}
              badge={card.badge}
              index={idx}
              isLocked={isLocked}
              requiredPlanName="Mensal ou Trimestral"
              onClick={() => handleCardClick(card)}
            />
          );
        })}
      </div>

      {/* ═══════ 4. FAIXA "MEUS PRATOS" COM PROGRESSO DO CARDÁPIO ═══════ */}
      <div className="rounded-3xl border border-white/10 bg-[#161618] p-5 sm:p-6 space-y-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase font-black tracking-wider text-[#EA1D2C]">
              Meu cardápio no iFood
            </span>
            <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
              Progresso dos pratos: {readyPratos} de {totalPratos} finalizados
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Adicione fotos e materiais aos seus pratos para completar o cardápio profissional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFotoStudio(true)}
              className="h-9 px-3.5 rounded-xl border-white/20 text-xs font-semibold text-white hover:bg-white/10 gap-1.5"
            >
              <Camera className="h-3.5 w-3.5 text-[#EA1D2C]" />
              Tirar fotos
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/materiais' })}
              className="h-9 px-3.5 rounded-xl border-white/20 text-xs font-semibold text-white hover:bg-white/10 gap-1.5"
            >
              <FolderOpen className="h-3.5 w-3.5 text-[#EA1D2C]" />
              Ver pastas
            </Button>
          </div>
        </div>

        {/* Dishes list preview */}
        {totalPratos > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {pratos.slice(0, 6).map((p) => {
              const photoCount = (p.fotos || p.prato_fotos || []).length;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-black/40 text-xs"
                >
                  <span className="font-semibold text-white truncate pr-2">{p.nome}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      {photoCount}/3 fotos
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 p-4 text-center">
            <p className="text-xs text-zinc-400">
              Nenhum prato cadastrado ainda. Toque em <strong>Fotos dos pratos</strong> para começar.
            </p>
          </div>
        )}
      </div>

      {/* ═══════ DIALOGS ═══════ */}
      {/* 1. Agente Guided Flow Dialog */}
      <AgenteFluxoDialog
        fluxoId={activeCard}
        open={Boolean(activeCard)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveCard(null);
            navigate({ to: '/agente', search: {} });
          }
        }}
        onOpenFotoStudio={(pratoId) => {
          setActiveCard(null);
          setShowFotoStudio(true);
        }}
      />

      {/* 2. Foto Studio Drawer/Modal */}
      {showFotoStudio && (
        <div className="fixed inset-0 z-50 bg-[#0f0f10] overflow-y-auto p-4 sm:p-8 animate-in fade-in">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-sm font-black uppercase tracking-wider text-[#EA1D2C]">
                Fotos dos pratos
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowFotoStudio(false);
                  navigate({ to: '/agente', search: {} });
                }}
                className="text-xs text-white/70 hover:text-white"
              >
                ← Voltar para o Agente
              </Button>
            </div>
            <FotoStudio />
          </div>
        </div>
      )}

      {/* 3. Plus Upgrade Modal */}
      <PlusUpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </main>
  );
}
