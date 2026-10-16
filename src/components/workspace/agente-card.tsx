import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { AnimatedBrain } from '@/components/brand/AnimatedBrain';

export interface AgenteCardProps {
  id: string;
  title: string;
  subtitle: string;
  badge?: string | undefined;
  index: number;
  isLocked?: boolean | undefined;
  requiredPlanName?: string | undefined;
  onClick: () => void;
}

export function AgenteCard({
  id,
  title,
  subtitle,
  badge,
  index,
  isLocked = false,
  requiredPlanName = 'Mensal ou Trimestral',
  onClick,
}: AgenteCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [transformStyle, setTransformStyle] = useState('');
  const [glarePos, setGlarePos] = useState<{ x: number; y: number } | null>(null);
  const [sparking, setSparking] = useState(false);

  // Floating animation durations (varied between 5s and 8s for organic feel)
  const floatDurations = ['5.8s', '6.4s', '7.2s', '5.5s', '6.8s', '7.6s', '6.1s'];
  const floatDuration = floatDurations[index % floatDurations.length];
  const floatDelay = `${(index * 0.35).toFixed(2)}s`;

  // 3D tilt with mouse on desktop (max 4 degrees)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = (((y - centerY) / centerY) * -4).toFixed(2);
    const rotY = (((x - centerX) / centerX) * 4).toFixed(2);

    setTransformStyle(`rotateX(${rotX}deg) rotateY(${rotY}deg)`);
    setGlarePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle('rotateX(0deg) rotateY(0deg)');
    setGlarePos(null);
  };

  const handleClick = () => {
    setSparking(true);
    setTimeout(() => {
      setSparking(false);
      onClick();
    }, 120);
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative text-left rounded-3xl border transition-all duration-300 cursor-pointer select-none active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#EA1D2C] ${
        isLocked
          ? 'border-white/10 bg-[#161618]/80 opacity-85 hover:border-amber-500/40'
          : 'border-white/10 bg-[#141416] hover:border-[#EA1D2C]/50 hover:bg-[#18181b]'
      }`}
      style={{
        perspective: '900px',
        animation: `agenteCascadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms both, agenteFloat ${floatDuration} ease-in-out ${floatDelay} infinite alternate`,
      }}
    >
      <style>{`
        @keyframes agenteCascadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes agenteFloat {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-5px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .group {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ─── 3D TILT CONTAINER ─── */}
      <div
        className="relative w-full h-full p-6 flex flex-col justify-between rounded-3xl transition-transform duration-150 ease-out overflow-hidden"
        style={{
          transform: transformStyle || undefined,
          boxShadow: isHovered
            ? '0 20px 35px -10px rgba(0,0,0,0.8), 0 0 25px 0 rgba(234,29,44,0.15)'
            : '0 10px 20px -5px rgba(0,0,0,0.5)',
        }}
      >
        {/* Pointer Follower Glare Sheen (only with mouse) */}
        {glarePos && (
          <div
            className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 180px at ${glarePos.x}px ${glarePos.y}px, rgba(255,255,255,0.08), transparent 70%)`,
            }}
          />
        )}

        {/* Short spark feedback on tap */}
        {sparking && (
          <div className="absolute inset-0 bg-[#EA1D2C]/20 z-20 animate-pulse rounded-3xl pointer-events-none" />
        )}

        {/* Top bar with Animated Brain + Badge */}
        <div className="flex items-start justify-between gap-3">
          {/* CÉREBRO ANIMADO "PENSANDO" (56px rounded square, NO CIRCLE) */}
          <AnimatedBrain
            size={56}
            isHovered={isHovered}
            isLocked={isLocked}
            className="shrink-0"
          />

          {badge && (
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                isLocked
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 flex items-center gap-1'
                  : 'bg-white/5 text-white/70 border-white/10 group-hover:border-[#EA1D2C]/40 group-hover:text-white'
              }`}
            >
              {isLocked && <Lock className="w-3 h-3 text-amber-400" />}
              {badge}
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="mt-5 space-y-2">
          <h3 className="text-lg font-black text-white group-hover:text-[#EA1D2C] transition-colors leading-snug">
            {title}
          </h3>
          <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Footer info: Lock label or "Criar agora →" */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          {isLocked ? (
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>Disponível no plano {requiredPlanName}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#EA1D2C] font-black group-hover:translate-x-1 transition-transform">
              <span>Criar agora</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
