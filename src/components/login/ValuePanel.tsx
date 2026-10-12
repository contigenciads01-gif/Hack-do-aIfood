import React from 'react';
import { Camera, Palette, BarChart3, ChevronRight } from 'lucide-react';

interface ValuePanelProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

const CARDS_DATA = [
  {
    id: 'performance',
    title: 'DESEMPENHO NA PLATAFORMA',
    icon: Camera,
    text: 'Prompts prontos para foto, banner e descrição do cardápio, para sua loja ficar mais atraente.',
  },
  {
    id: 'branding',
    title: 'BRANDING',
    icon: Palette,
    text: 'Crie sua logo e a identidade da sua loja e ganhe uma página própria com QR code.',
  },
  {
    id: 'structure',
    title: 'ESTRUTURA EMPRESARIAL',
    icon: BarChart3,
    text: 'Lance suas vendas e acompanhe faturamento, impostos e lucro estimado, com metas do mês.',
  },
];

const STEPS_DATA = [
  { step: '1', text: 'Cadastre sua loja uma vez' },
  { step: '2', text: 'Escolha a ferramenta' },
  { step: '3', text: 'Copie o prompt e cole no ChatGPT' },
];

export function ValuePanel({ className = '', variant = 'desktop' }: ValuePanelProps) {
  if (variant === 'mobile') {
    return (
      <section className={`w-full py-8 text-white ${className}`}>
        {/* Título da seção no mobile */}
        <div className="px-2 mb-4">
          <div className="inline-block rounded-md bg-[#EA1D2C] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Como o Hack do aiFood ajuda
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-block rounded-md border border-[#EA1D2C]/40 bg-[#EA1D2C]/15 px-3 py-1 font-mono text-xs font-extrabold text-[#EA1D2C]">
              9 PROMPTS PRONTOS
            </span>
            <span className="text-xs text-white/70">
              foto, banner, logo, cardápio e mais
            </span>
          </div>
        </div>

        {/* 3 Cartões em Carrossel Horizontal (scroll-snap) */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-2 snap-x snap-mandatory scrollbar-none">
          {CARDS_DATA.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="w-[85vw] max-w-[320px] shrink-0 snap-center rounded-[16px] border border-[#2A2A2A] bg-[#141414]/90 p-5 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EA1D2C] text-white shadow-md">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-sm tracking-wide text-white">
                    {card.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  {card.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Como Funciona em 3 Passos */}
        <div className="mt-6 rounded-[16px] border border-[#2A2A2A] bg-[#141414]/80 p-5 backdrop-blur-md mx-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">
            Como funciona:
          </h4>
          <div className="space-y-3">
            {STEPS_DATA.map((item, idx) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#EA1D2C] font-mono text-sm font-black text-white">
                  {item.step}
                </div>
                <span className="text-sm font-medium text-white/90">
                  {item.text}
                </span>
                {idx < STEPS_DATA.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-white/30 ml-auto shrink-0 hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // DESKTOP (máx 520px, gradiente preto #080808 para transparente)
  return (
    <div
      className={`relative flex w-full max-w-[520px] flex-col justify-center px-6 py-10 lg:px-8 text-white z-10 ${className}`}
    >
      {/* Fundo com gradiente preto (#080808 para transparente) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#080808]/95 via-[#080808]/70 to-transparent backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Etiqueta retangular vermelha */}
      <div className="login-cascade-1 inline-flex self-start rounded-md bg-[#EA1D2C] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
        COMO USAR O HACK DO AIFOOD
      </div>

      {/* Título em 3 linhas com fonte Anton condensada pesada */}
      <div className="login-cascade-2 mt-4 font-['Anton',sans-serif] text-4xl uppercase tracking-normal sm:text-5xl leading-[1.08] text-white">
        <div>ORGANIZE E DESTAQUE</div>
        <div className="my-1">
          <span className="inline-block rounded-md bg-white px-3 py-0.5 text-[#EA1D2C] shadow-sm">
            SEU DELIVERY
          </span>
        </div>
        <div>NO IFOOD</div>
      </div>

      {/* Destaque numérico grande em vermelho: 9 PROMPTS PRONTOS */}
      <div className="login-cascade-3 mt-6 border-b border-[#2A2A2A]/80 pb-5">
        <div className="font-['Anton',sans-serif] text-3xl sm:text-4xl tracking-tight text-[#EA1D2C]">
          9 PROMPTS PRONTOS
        </div>
        <p className="mt-1 text-sm font-medium text-white/75 leading-relaxed">
          foto, banner, ícone, logo, descrição, página, avaliações, Instagram e promoções
        </p>
      </div>

      {/* 3 Cartões Empilhados (vidro escuro #141414 a 80%, borda #2A2A2A, raio 16px) */}
      <div className="mt-5 space-y-3.5">
        {CARDS_DATA.map((card, idx) => {
          const Icon = card.icon;
          const cascadeClass = `login-cascade-${idx + 4}`;
          return (
            <div
              key={card.id}
              id={`value-card-${card.id}`}
              className={`${cascadeClass} rounded-[16px] border border-[#2A2A2A] bg-[#141414]/80 p-4.5 shadow-xl backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EA1D2C] text-white shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wide text-white">
                  {card.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/80 pl-[54px]">
                {card.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Como funciona em 3 passos numerados em quadrados */}
      <div className="login-cascade-7 mt-5 rounded-[16px] border border-[#2A2A2A] bg-[#141414]/70 p-4.5 backdrop-blur-md">
        <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
          Como funciona:
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2">
          {STEPS_DATA.map((item, idx) => (
            <React.Fragment key={item.step}>
              <div className="flex flex-1 items-center gap-2.5 rounded-[10px] border border-[#2A2A2A]/80 bg-black/40 px-3 py-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#EA1D2C] font-mono text-xs font-extrabold text-white">
                  {item.step}
                </div>
                <span className="text-xs font-semibold leading-tight text-white/90">
                  {item.text}
                </span>
              </div>
              {idx < STEPS_DATA.length - 1 && (
                <div className="hidden sm:block text-white/30 text-xs font-bold shrink-0">
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
