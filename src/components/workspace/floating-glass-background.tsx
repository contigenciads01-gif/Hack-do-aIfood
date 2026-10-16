import React, { useEffect, useState } from 'react';
import { Pizza, Sandwich, Coffee, Soup, Utensils, Beef } from 'lucide-react';

interface FloatingItem {
  id: number;
  Icon: React.ComponentType<{ className?: string }>;
  size: number;
  top: string;
  left: string;
  duration: string;
  delay: string;
  amber?: boolean;
}

const ITEMS: FloatingItem[] = [
  { id: 1, Icon: Sandwich, size: 52, top: '6%', left: '4%', duration: '14s', delay: '0s' },
  { id: 2, Icon: Pizza, size: 44, top: '22%', left: '88%', duration: '16s', delay: '-3s', amber: true },
  { id: 3, Icon: Utensils, size: 36, top: '48%', left: '2%', duration: '18s', delay: '-6s' },
  { id: 4, Icon: Coffee, size: 48, top: '68%', left: '92%', duration: '15s', delay: '-2s', amber: true },
  { id: 5, Icon: Beef, size: 40, top: '85%', left: '12%', duration: '17s', delay: '-8s' },
  { id: 6, Icon: Soup, size: 32, top: '90%', left: '82%', duration: '19s', delay: '-5s' },
];

export function FloatingGlassBackground() {
  const [isLowPower, setIsLowPower] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check device capabilities (mobile or <= 4 CPU threads)
    const checkLowPower = () => {
      const lowConcurrency = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
      const isMobile = window.innerWidth < 768;
      setIsLowPower(lowConcurrency || isMobile);
    };

    checkLowPower();
    window.addEventListener('resize', checkLowPower);

    // Pause when tab is hidden to save battery & maintain 60fps
    const handleVisibility = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', checkLowPower);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // On low power / mobile, halve to 3 items
  const activeItems = isLowPower ? ITEMS.slice(0, 3) : ITEMS;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      style={{
        animationPlayState: isTabHidden ? 'paused' : 'running',
      }}
    >
      <style>{`
        @keyframes floatGlassDrift {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-16px) rotate(4deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .floating-glass-box {
            animation: none !important;
          }
        }
      `}</style>

      {activeItems.map((item) => {
        const IconComponent = item.Icon;
        return (
          <div
            key={item.id}
            className="floating-glass-box absolute flex items-center justify-center rounded-[12px] border transition-opacity duration-700"
            style={{
              top: item.top,
              left: item.left,
              width: `${item.size}px`,
              height: `${item.size}px`,
              background: item.amber
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.04), rgba(255, 255, 255, 0.01))'
                : 'linear-gradient(135deg, rgba(234, 29, 44, 0.04), rgba(255, 255, 255, 0.01))',
              borderColor: item.amber ? 'rgba(245, 158, 11, 0.08)' : 'rgba(234, 29, 44, 0.08)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.3)',
              animation: `floatGlassDrift ${item.duration} ease-in-out ${item.delay} infinite alternate`,
              animationPlayState: isTabHidden ? 'paused' : 'running',
            }}
          >
            <IconComponent
              className={`w-1/2 h-1/2 ${
                item.amber ? 'text-amber-400/15' : 'text-[#EA1D2C]/15'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
