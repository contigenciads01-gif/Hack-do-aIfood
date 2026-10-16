import React from 'react';
import { Lock } from 'lucide-react';

export interface AnimatedBrainProps {
  className?: string;
  isHovered?: boolean;
  isBuilding?: boolean;
  isLocked?: boolean;
  size?: number; // default 56px
}

/**
 * CÉREBRO ANIMADO "PENSANDO"
 * Formato: Quadrado arredondado de 56px (RIGOROSAMENTE SEM CÍRCULOS).
 * Efeitos:
 * - Traços vetoriais de linha fina desenhando e apagando em ciclo (stroke-dashoffset);
 * - 3 quadradinhos de sinapse pulsando em sequência no canto superior;
 * - Borda com gradiente cônico dinâmico que gira em volta do quadrado (@property --angle com fallback);
 * - Parado: ritmo lento (4s); Em hover/foco: ritmo acelerado (1.5s); Montando prompt: ritmo veloz (0.8s);
 * - Apagado e com cadeado se estiver bloqueado pelo plano;
 * - Respeita prefers-reduced-motion (tudo estático).
 */
export function AnimatedBrain({
  className = '',
  isHovered = false,
  isBuilding = false,
  isLocked = false,
  size = 56,
}: AnimatedBrainProps) {
  // Speed variations
  const speedClass = isBuilding
    ? 'brain-building'
    : isHovered
      ? 'brain-hover'
      : isLocked
        ? 'brain-locked'
        : 'brain-idle';

  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-2xl ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-hidden="true"
    >
      <style>{`
        @property --brain-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes brainConicRotate {
          to {
            --brain-angle: 360deg;
          }
        }

        @keyframes brainDashStroke {
          0% {
            stroke-dashoffset: 120;
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -120;
          }
        }

        @keyframes brainPulseDot {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .brain-conic-border {
          --brain-angle: 0deg;
          background: conic-gradient(
            from var(--brain-angle),
            #EA1D2C 0%,
            rgba(234, 29, 44, 0.1) 25%,
            #FF5967 50%,
            rgba(234, 29, 44, 0.1) 75%,
            #EA1D2C 100%
          );
          animation: brainConicRotate 4s linear infinite;
        }

        .brain-hover .brain-conic-border {
          animation-duration: 1.6s;
        }

        .brain-building .brain-conic-border {
          animation-duration: 0.9s;
        }

        .brain-locked .brain-conic-border {
          background: #27272a;
          animation: none;
        }

        .brain-dash-path {
          stroke-dasharray: 60 60;
          animation: brainDashStroke 4s ease-in-out infinite;
        }

        .brain-hover .brain-dash-path {
          animation-duration: 1.8s;
        }

        .brain-building .brain-dash-path {
          animation-duration: 0.9s;
        }

        .brain-locked .brain-dash-path {
          animation: none;
          stroke-dashoffset: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .brain-conic-border,
          .brain-dash-path,
          .brain-dot-1,
          .brain-dot-2,
          .brain-dot-3 {
            animation: none !important;
          }
        }
      `}</style>

      {/* ─── 1. BORDA COM GRADIENTE CÔNICO GIRATÓRIO ─── */}
      <div className={`absolute inset-0 p-[2px] rounded-2xl ${speedClass}`}>
        <div className="absolute inset-0 rounded-2xl brain-conic-border" />
        <div className="relative w-full h-full rounded-[14px] bg-[#161618] flex items-center justify-center overflow-hidden">
          {/* Fundo sutil com gradiente interno */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#EA1D2C]/10 via-transparent to-black/60 pointer-events-none" />

          {/* ─── 2. SVG DE CÉREBRO DE LINHA FINA (TRAÇOS EM CICLO) ─── */}
          <svg
            viewBox="0 0 64 64"
            className={`w-8 h-8 z-10 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hemisfério Esquerdo do Cérebro */}
            <path
              d="M 31 14 C 25 14, 20 18, 20 23 C 16 23, 14 28, 14 33 C 14 37, 16 41, 19 43 C 18 47, 21 51, 26 51 C 29 51, 31 49, 31 47"
              stroke={isLocked ? '#71717a' : isBuilding ? '#FFFFFF' : '#EA1D2C'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isLocked ? '' : 'brain-dash-path'}
            />

            {/* Dobras / Conexões Internas Esquerdas */}
            <path
              d="M 23 26 C 26 28, 28 32, 28 37 C 24 37, 22 39, 21 42"
              stroke={isLocked ? '#52525b' : '#ff7985'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isLocked ? '' : 'brain-dash-path'}
              style={{ animationDelay: '-1s' }}
            />

            {/* Hemisfério Direito do Cérebro */}
            <path
              d="M 33 14 C 39 14, 44 18, 44 23 C 48 23, 50 28, 50 33 C 50 37, 48 41, 45 43 C 46 47, 43 51, 38 51 C 35 51, 33 49, 33 47"
              stroke={isLocked ? '#71717a' : isBuilding ? '#FFFFFF' : '#EA1D2C'}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isLocked ? '' : 'brain-dash-path'}
              style={{ animationDelay: '-0.5s' }}
            />

            {/* Dobras / Conexões Internas Direitas */}
            <path
              d="M 41 26 C 38 28, 36 32, 36 37 C 40 37, 42 39, 43 42"
              stroke={isLocked ? '#52525b' : '#ff7985'}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isLocked ? '' : 'brain-dash-path'}
              style={{ animationDelay: '-1.5s' }}
            />

            {/* Ponte Central (Corpo Caloso) */}
            <path
              d="M 32 18 L 32 46"
              stroke={isLocked ? '#3f3f46' : isBuilding ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2 3"
            />
          </svg>

          {/* ─── 3. TRÊS QUADRADINHOS QUE PULSAM EM SEQUÊNCIA NO CANTO ─── */}
          {!isLocked && (
            <div className="absolute top-2 right-2 flex gap-1 z-20">
              <span
                className="w-1.5 h-1.5 rounded-[3px] bg-[#EA1D2C] brain-dot-1"
                style={{
                  animation: 'brainPulseDot 1.4s infinite ease-in-out',
                  animationDelay: '0s',
                }}
              />
              <span
                className="w-1.5 h-1.5 rounded-[3px] bg-[#ff7985] brain-dot-2"
                style={{
                  animation: 'brainPulseDot 1.4s infinite ease-in-out',
                  animationDelay: '0.25s',
                }}
              />
              <span
                className="w-1.5 h-1.5 rounded-[3px] bg-amber-400 brain-dot-3"
                style={{
                  animation: 'brainPulseDot 1.4s infinite ease-in-out',
                  animationDelay: '0.5s',
                }}
              />
            </div>
          )}

          {/* Se estiver bloqueado: sobrepõe o cadeado */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-30">
              <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-white/20 flex items-center justify-center text-amber-400 shadow">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
