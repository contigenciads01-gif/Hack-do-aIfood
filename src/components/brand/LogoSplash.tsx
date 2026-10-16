import React, { useEffect, useState, useRef } from 'react';
import logoTransparent from '@/assets/logo-hack-transparente.png';

interface LogoSplashProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export function LogoSplash({ onComplete, forceShow = false }: LogoSplashProps) {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if splash was already shown in this session
    const seen = sessionStorage.getItem('hdi_splash_seen');
    if (seen === 'true' && !forceShow) {
      return;
    }

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    setVisible(true);

    const animDuration = mql.matches ? 200 : 850;

    // Auto-dismiss after animation
    timerRef.current = setTimeout(() => {
      dismiss();
    }, animDuration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [forceShow]);

  const dismiss = () => {
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem('hdi_splash_seen', 'true');
      } catch {}
      onComplete?.();
    }, 200);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Carregando hack du ifood"
      onClick={dismiss}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#080808] transition-opacity duration-200 select-none cursor-pointer ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <style>{`
        @keyframes splashOvershootRotation {
          0% {
            transform: scale(0.92) rotate(0deg);
          }
          40% {
            transform: scale(1.04) rotate(14deg);
          }
          70% {
            transform: scale(0.99) rotate(-2.5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes splashGlintSweep {
          0% {
            transform: translateX(-140%) rotate(22deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            transform: translateX(160%) rotate(22deg);
            opacity: 1;
          }
          100% {
            transform: translateX(200%) rotate(22deg);
            opacity: 0;
          }
        }

        @keyframes splashSparklePop {
          0%, 45% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.35) rotate(45deg);
            opacity: 1;
          }
          80% {
            transform: scale(1) rotate(90deg);
            opacity: 1;
          }
          100% {
            transform: scale(0.3) rotate(135deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Center Animated Logo Container */}
      <div className="relative flex items-center justify-center p-8 max-w-sm sm:max-w-md w-full">
        {/* Glow behind the logo */}
        <div className="absolute -inset-4 bg-[#EA1D2C]/15 rounded-3xl blur-2xl pointer-events-none" />

        {/* The Transparent Logo with Overshoot Rotation and Glint Track-Matte */}
        <div
          className="relative overflow-hidden p-2 rounded-2xl"
          style={{
            animation: prefersReducedMotion
              ? 'none'
              : 'splashOvershootRotation 850ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* Main Logo Image */}
          <img
            src={logoTransparent}
            alt="hack du ifood"
            className="w-64 sm:w-80 h-auto object-contain block drop-shadow-[0_10px_20px_rgba(234,29,44,0.25)]"
          />

          {/* Glint Light Beam (Faixa branca/dourada 22 graus) */}
          {!prefersReducedMotion && (
            <div
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 48%, rgba(255,230,150,0.9) 52%, transparent 100%)',
                width: '60%',
                height: '240%',
                top: '-70%',
                left: '20%',
                mixBlendMode: 'screen',
                animation: 'splashGlintSweep 750ms ease-in-out forwards',
              }}
            />
          )}

          {/* 4-Point Star Sparkle in Upper-Right Corner */}
          {!prefersReducedMotion && (
            <div
              className="pointer-events-none absolute top-1 right-2 sm:right-3 w-5 h-5 z-20"
              style={{
                animation: 'splashSparklePop 800ms ease-out forwards',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">
                <path
                  d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Discrete "Toque para pular" button */}
      <span className="text-[11px] font-semibold text-zinc-500 mt-6 tracking-wider uppercase hover:text-zinc-300 transition-colors">
        Toque para pular
      </span>
    </div>
  );
}
