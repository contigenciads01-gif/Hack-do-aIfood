import React from 'react';

interface ArrowHintProps {
  className?: string;
}

export function ArrowHint({ className = '' }: ArrowHintProps) {
  return (
    <div
      className={`hidden lg:flex items-center gap-2.5 pointer-events-none select-none text-white ${className}`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-end">
        {/* Etiqueta retangular sem círculos */}
        <span className="rounded-md border border-white/20 bg-[#141414]/90 px-2.5 py-1 text-xs font-bold tracking-wide uppercase text-white shadow-lg backdrop-blur-md">
          Comece por aqui
        </span>
        {/* Seta desenhada à mão em SVG (branca, 2px stroke) curvando e apontando para a esquerda/baixo */}
        <svg
          width="110"
          height="46"
          viewBox="0 0 110 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible mt-1"
        >
          {/* Linha curva orgânica simulando traço à mão */}
          <path
            d="M 102 6 C 75 4, 38 10, 16 34"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ponta da seta apontando para a esquerda */}
          <path
            d="M 24 24 L 14 36 L 28 39"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
