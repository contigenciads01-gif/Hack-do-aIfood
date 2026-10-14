import React from 'react';
import phoneImg from '@/assets/phone-clean.png';
import ifoodBadge from '@/assets/icon-ifood-badge.png';
import icon99Badge from '@/assets/icon-99-badge.png';
import instaBadge from '@/assets/icon-insta-badge.png';

interface PhoneHeroProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

export function PhoneHero({ className = '', variant = 'desktop' }: PhoneHeroProps) {
  if (variant === 'mobile') {
    return (
      <div className={`relative flex flex-col items-center justify-center py-6 select-none ${className}`}>
        {/* Glow de fundo para mobile */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-64 w-64 rounded-full bg-[#EA1D2C]/20 blur-[70px]" />
        </div>

        {/* Container do Celular Compacto com Flutuação Suave */}
        <div className="relative z-10 flex items-center justify-center animate-phone-float-mobile">
          <img
            src={phoneImg}
            alt="Aplicativo delivery no celular"
            className="w-48 sm:w-56 h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] filter"
          />

          {/* Sombra difusa projetada */}
          <div className="absolute -bottom-4 h-6 w-36 rounded-full bg-black/70 blur-md pointer-events-none animate-shadow-pulse" />

          {/* Ícones Flutuantes Compactos para Mobile */}
          <div className="absolute -top-3 -right-4 transition-transform duration-300 hover:scale-110 cursor-pointer animate-float-ifood">
            <img
              src={ifoodBadge}
              alt="iFood"
              className="w-12 h-12 drop-shadow-[0_8px_16px_rgba(234,29,44,0.5)]"
            />
          </div>

          <div className="absolute top-12 -right-7 transition-transform duration-300 hover:scale-110 cursor-pointer animate-float-99">
            <img
              src={icon99Badge}
              alt="99"
              className="w-10 h-10 drop-shadow-[0_6px_14px_rgba(255,184,0,0.45)]"
            />
          </div>

          <div className="absolute top-26 -right-6 transition-transform duration-300 hover:scale-110 cursor-pointer animate-float-insta">
            <img
              src={instaBadge}
              alt="Instagram"
              className="w-11 h-11 drop-shadow-[0_8px_16px_rgba(193,53,132,0.45)]"
            />
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Glow de fundo focalizado atrás do aparelho */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="h-80 w-80 rounded-full bg-[#EA1D2C]/25 blur-[95px] animate-ambient-pulse-slow" />
      </div>

      {/* Conjunto do Celular Flutuante */}
      <div className="relative group/phone">
        {/* Smartphone Flutuante com oscilação contínua de 6 a 10px e -1° a +1° */}
        <div className="relative z-10 animate-phone-float transition-transform duration-500">
          {/* Efeito de reflexo vermelho sutil na borda externa do dispositivo */}
          <div className="relative rounded-[38px] p-0.5 bg-gradient-to-tr from-[#EA1D2C]/30 via-transparent to-white/10">
            <img
              src={phoneImg}
              alt="Smartphone exibindo cardápio Seu Restaurante"
              className="w-[230px] lg:w-[260px] xl:w-[280px] h-auto object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.9)] pointer-events-none"
            />
          </div>

          {/* Sombra difusa abaixo do aparelho acompanhando a flutuação */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-8 w-48 rounded-full bg-black/80 blur-lg pointer-events-none animate-shadow-pulse" />
        </div>

        {/* ── ÍCONES FLUTUANTES AO REDOR DO CELULAR COM INTERAÇÃO AO MOUSE ── */}

        {/* 1. ÍCONE IFOOD (Topo Direito do Celular) */}
        <div
          className="absolute -top-3 right-[-18px] lg:right-[-24px] z-20 cursor-pointer transition-all duration-300 ease-out hover:scale-115 hover:-translate-y-1 hover:brightness-110 animate-float-ifood group/ifood"
          title="iFood Delivery"
        >
          <div className="relative">
            <img
              src={ifoodBadge}
              alt="iFood"
              className="w-14 h-14 lg:w-16 lg:h-16 drop-shadow-[0_10px_22px_rgba(234,29,44,0.55)] transition-all duration-300 group-hover/ifood:drop-shadow-[0_14px_30px_rgba(234,29,44,0.85)]"
            />
            {/* Brilho vermelho pulsante sutil na borda */}
            <div className="absolute inset-0 rounded-[18px] bg-[#EA1D2C]/20 opacity-0 group-hover/ifood:opacity-100 transition-opacity blur-sm" />
          </div>
        </div>

        {/* 2. ÍCONE 99 (À Direita do Aparelho) */}
        <div
          className="absolute top-[80px] lg:top-[90px] right-[-54px] lg:right-[-64px] z-20 cursor-pointer transition-all duration-300 ease-out hover:scale-115 hover:-translate-y-1 hover:brightness-110 animate-float-99 group/99"
          title="99Food"
        >
          <div className="relative">
            <img
              src={icon99Badge}
              alt="99"
              className="w-12 h-12 lg:w-14 lg:h-14 drop-shadow-[0_10px_20px_rgba(255,184,0,0.5)] transition-all duration-300 group-hover/99:drop-shadow-[0_14px_28px_rgba(255,184,0,0.8)]"
            />
            <div className="absolute inset-0 rounded-[16px] bg-[#FFB800]/25 opacity-0 group-hover/99:opacity-100 transition-opacity blur-sm" />
          </div>
        </div>

        {/* 3. ÍCONE INSTAGRAM (Abaixo do 99) */}
        <div
          className="absolute top-[170px] lg:top-[185px] right-[-40px] lg:right-[-48px] z-20 cursor-pointer transition-all duration-300 ease-out hover:scale-115 hover:-translate-y-1 hover:brightness-110 animate-float-insta group/insta"
          title="Instagram"
        >
          <div className="relative">
            <img
              src={instaBadge}
              alt="Instagram"
              className="w-13 h-13 lg:w-15 lg:h-15 drop-shadow-[0_10px_22px_rgba(193,53,132,0.55)] transition-all duration-300 group-hover/insta:drop-shadow-[0_14px_30px_rgba(193,53,132,0.85)]"
            />
            <div className="absolute inset-0 rounded-[18px] bg-[#C13584]/25 opacity-0 group-hover/insta:opacity-100 transition-opacity blur-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
