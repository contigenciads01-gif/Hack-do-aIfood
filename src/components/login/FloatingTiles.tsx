import React from 'react';
import { Camera, Brain, BarChart3, QrCode, Star } from 'lucide-react';

interface FloatingTilesProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

export function FloatingTiles({ className = '', variant = 'desktop' }: FloatingTilesProps) {
  if (variant === 'mobile') {
    return (
      <div
        className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 lg:hidden ${className}`}
        aria-hidden="true"
      >
        {/* Tile 1 Mobile: Camera */}
        <div
          className="absolute top-12 right-6 flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/15 bg-[#141414]/70 text-white/90 shadow-xl backdrop-blur-md animate-drift-1"
        >
          <Camera className="h-5 w-5 text-[#EA1D2C]" />
        </div>

        {/* Tile 2 Mobile: Star */}
        <div
          className="absolute bottom-28 right-8 flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-[#141414]/60 text-white/80 shadow-lg backdrop-blur-sm animate-drift-2"
        >
          <Star className="h-4 w-4 text-[#EA1D2C]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none z-0 hidden lg:block ${className}`}
      aria-hidden="true"
    >
      {/* 
        Chef's face is on the top-right corner.
        Tiles float in the right column / background with varying depth and blur,
        leaving the top-right face clear while adding atmospheric depth.
      */}

      {/* Tile 1: Star — Deep background layer, smaller (28px), subtle blur */}
      <div
        className="absolute top-[28%] right-[22%] flex h-7 w-7 items-center justify-center rounded-[12px] border border-white/10 bg-[#141414]/50 text-white/70 shadow-md backdrop-blur-[2px] opacity-60 animate-drift-3"
      >
        <Star className="h-3.5 w-3.5 text-[#EA1D2C]" />
      </div>

      {/* Tile 2: Camera — Foreground layer, 52px, crisp */}
      <div
        className="absolute top-[44%] right-[8%] flex h-[52px] w-[52px] items-center justify-center rounded-[12px] border border-white/20 bg-[#141414]/80 text-white shadow-2xl backdrop-blur-lg animate-drift-1"
      >
        <Camera className="h-6 w-6 text-[#EA1D2C]" />
      </div>

      {/* Tile 3: Brain — Mid layer, 44px */}
      <div
        className="absolute top-[62%] right-[18%] flex h-11 w-11 items-center justify-center rounded-[12px] border border-white/15 bg-[#141414]/70 text-white/90 shadow-xl backdrop-blur-md opacity-85 animate-drift-2"
      >
        <Brain className="h-5 w-5 text-[#EA1D2C]" />
      </div>

      {/* Tile 4: QrCode — Background layer, 34px, subtle blur */}
      <div
        className="absolute top-[78%] right-[10%] flex h-[34px] w-[34px] items-center justify-center rounded-[12px] border border-white/10 bg-[#141414]/55 text-white/75 shadow-md backdrop-blur-[1px] opacity-70 animate-drift-4"
      >
        <QrCode className="h-4 w-4 text-[#EA1D2C]" />
      </div>

      {/* Tile 5: BarChart3 — Foreground lower layer, 48px */}
      <div
        className="absolute top-[82%] right-[28%] flex h-12 w-12 items-center justify-center rounded-[12px] border border-white/20 bg-[#141414]/80 text-white shadow-xl backdrop-blur-lg animate-drift-5"
      >
        <BarChart3 className="h-5 w-5 text-[#EA1D2C]" />
      </div>
    </div>
  );
}
