import React from 'react';
import { Palette, PenTool, TrendingUp, Play } from 'lucide-react';

interface ServicesSectionProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

const SERVICES_DATA = [
  {
    id: 'criacao-marca',
    title: 'CRIAÇÃO DE MARCA',
    icon: Palette,
    description: 'Do zero ou do seu jeito, com uma identidade única.',
    delayClass: 'delay-[150ms]',
  },
  {
    id: 'rebranding',
    title: 'REBRANDING',
    icon: PenTool,
    description: 'Modernizamos sua marca e deixamos ela mais atraente e estratégica.',
    delayClass: 'delay-[350ms]',
  },
  {
    id: 'presenca-digital',
    title: 'PRESENÇA DIGITAL',
    icon: TrendingUp,
    description: 'Mais engajamento, mais clientes, mais vendas.',
    delayClass: 'delay-[550ms]',
  },
];

export function ServicesSection({ className = '', variant = 'desktop' }: ServicesSectionProps) {
  return (
    <div className={`relative flex flex-col justify-center text-white ${className}`}>
      {/* 1. Tag Superior: SUA MARCA, MAIS FORTE. */}
      <div className="flex items-center gap-2 animate-fade-in-up">
        <span className="text-[#EA1D2C] text-xs font-black tracking-widest uppercase flex items-center gap-1.5">
          <Play className="h-2.5 w-2.5 fill-[#EA1D2C] text-[#EA1D2C]" />
          SUA MARCA, MAIS FORTE.
        </span>
      </div>

      {/* 2. Título Principal em 3 Linhas (Fonte Anton pesada) */}
      <h2 className="mt-3 font-['Anton',sans-serif] text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] tracking-tight uppercase text-white animate-fade-in-up delay-75">
        <div>RESTAURANTES</div>
        <div>E NEGÓCIOS QUE</div>
        <div>
          <span className="text-[#EA1D2C] drop-shadow-[0_0_20px_rgba(234,29,44,0.4)]">
            CRESCEM
          </span>{' '}
          NO DIGITAL.
        </div>
      </h2>

      {/* 3. Descrição Institucional */}
      <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed max-w-[440px] animate-fade-in-up delay-100">
        Criação de marca, rebranding e identidade visual para empresas que já estão no iFood, 99 e Instagram e querem se destacar de verdade.
      </p>

      {/* 4. Lista dos 3 Serviços Informativos com Ícones Circulares Vermelhos */}
      <div className="mt-8 space-y-5">
        {SERVICES_DATA.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className={`group/service flex items-start gap-4 p-2 rounded-2xl transition-all duration-300 hover:bg-white/[0.04] cursor-default animate-fade-in-up ${service.delayClass}`}
            >
              {/* Ícone Circular Vermelho com Pulso Luminoso */}
              <div className="relative flex-shrink-0 mt-0.5">
                {/* Glow circular externo suave */}
                <div className="absolute inset-0 rounded-full bg-[#EA1D2C]/25 blur-md opacity-70 group-hover/service:opacity-100 group-hover/service:scale-125 transition-all duration-300 animate-service-pulse" />

                {/* Círculo Principal com Borda Vermelha */}
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#EA1D2C]/80 bg-[#140608]/90 text-[#EA1D2C] shadow-lg shadow-[#EA1D2C]/20 transition-all duration-300 group-hover/service:scale-110 group-hover/service:border-[#FF3B4B] group-hover/service:bg-[#EA1D2C]/20">
                  <Icon className="h-5 w-5 transition-transform duration-300 group-hover/service:scale-110" />
                </div>
              </div>

              {/* Textos do Serviço */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-white group-hover/service:text-white transition-colors">
                  {service.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-white/60 leading-relaxed group-hover/service:text-white/85 transition-colors">
                  {service.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
