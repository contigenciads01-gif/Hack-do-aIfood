import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Clock, FileText, CheckCircle2 } from 'lucide-react';
import cinematicBg from '@/assets/login-bg-cinematic.webp';

interface MiniVslPlayerProps {
  onCtaClick?: () => void;
}

export function MiniVslPlayer({ onCtaClick }: MiniVslPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = 222; // 3 minutos e 42 segundos
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round((currentTime / totalDuration) * 100));

  const transcriptChapters = [
    {
      time: '00:00',
      title: 'A ilusão da guerra de preços',
      content:
        'A maioria dos donos de restaurante acredita que não vende porque o preço está alto. Na verdade, baixar preço só queima sua margem. O cliente não quer o mais barato, quer o que parece mais gostoso.',
    },
    {
      time: '00:45',
      title: 'O teste dos 3 segundos no iFood',
      content:
        'A pessoa abre o app com fome e rola a tela rápido. Se a foto for escura ou borrada e o nome for genérico, ela desliza pro concorrente da mesma rua em menos de 3 segundos.',
    },
    {
      time: '01:30',
      title: 'O que faz o cliente salivar',
      content:
        'Fotos com iluminação de estúdio gastronômico, textura visível de queijo e brasa, e descrições com gatilhos sensoriais que fazem a boca encher de água antes mesmo de ver o preço.',
    },
    {
      time: '02:15',
      title: 'Como o Hack do iFood resolve',
      content:
        'Criamos fotos que vendem, descrições que convencem e um cardápio de outro nível. Tudo gerado especificamente para a sua cozinha, sem você precisar virar fotógrafo nem redator.',
    },
    {
      time: '03:10',
      title: 'O primeiro passo',
      content:
        'Cadastre seu primeiro prato hoje e sinta a diferença imediata no fluxo de pedidos da sua chapa.',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ═══════ VIDEO PLAYER CONTAINER (16:9) ═══════ */}
      <div className="relative group overflow-hidden rounded-2xl border border-white/15 bg-black/90 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl aspect-video flex flex-col justify-between">
        {/* Background Image / Thumbnail */}
        <div className="absolute inset-0 z-0">
          <img
            src={cinematicBg}
            alt="Mini VSL - Hack do iFood"
            className={`w-full h-full object-cover object-center transition-all duration-700 ${
              isPlaying ? 'scale-105 opacity-40 blur-[2px]' : 'opacity-70 group-hover:scale-102'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        </div>

        {/* Top Header do Player */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EA1D2C]/90 text-white font-black text-[11px] tracking-wider uppercase shadow-lg shadow-[#EA1D2C]/30">
              <Sparkles className="h-3 w-3" />
              Apresentação Exclusiva
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-white/70 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
              <Clock className="h-3 w-3 text-white/50" />
              3 min de conteúdo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white/90 bg-black/60 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-md">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* Centro: Botão de Play / Overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
          {!isPlaying ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label="Assistir apresentação"
                className="group/btn relative inline-flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#EA1D2C] to-[#b3121f] text-white shadow-[0_0_40px_rgba(234,29,44,0.6)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_60px_rgba(234,29,44,0.9)] active:scale-95 cursor-pointer"
              >
                {/* Glow pulsante */}
                <span className="absolute inset-0 rounded-2xl bg-[#EA1D2C] opacity-40 blur-xl animate-ping" />
                <Play className="relative h-9 w-9 sm:h-11 sm:w-11 fill-white ml-1 transition-transform group-hover/btn:scale-110" />
              </button>

              <div className="space-y-1">
                <h4 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-md">
                  Assista: Como destravar seus pedidos no iFood
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
                  Entenda o que separa os restaurantes cheios de pedidos dos que ficam invisíveis.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/80 border border-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-semibold">
                <span className="h-2.5 w-2.5 rounded-xs bg-[#EA1D2C] animate-pulse" />
                Apresentação em reprodução contínua
              </div>

              <div className="p-4 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md max-w-lg mx-auto text-left space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#EA1D2C]">
                  Capítulo Atual ({formatTime(currentTime)})
                </span>
                <p className="text-sm font-bold text-white">
                  {currentTime < 45
                    ? transcriptChapters[0]?.title
                    : currentTime < 90
                      ? transcriptChapters[1]?.title
                      : currentTime < 135
                        ? transcriptChapters[2]?.title
                        : currentTime < 190
                          ? transcriptChapters[3]?.title
                          : transcriptChapters[4]?.title}
                </p>
                <p className="text-xs text-zinc-300 italic">
                  "{currentTime < 45
                    ? transcriptChapters[0]?.content
                    : currentTime < 90
                      ? transcriptChapters[1]?.content
                      : currentTime < 135
                        ? transcriptChapters[2]?.content
                        : currentTime < 190
                          ? transcriptChapters[3]?.content
                          : transcriptChapters[4]?.content}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls Bar */}
        <div className="relative z-10 p-4 sm:p-5 bg-gradient-to-t from-black via-black/90 to-transparent space-y-2">
          {/* Progress Bar */}
          <div
            className="w-full h-2 bg-white/20 rounded-xs overflow-hidden cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              setCurrentTime(Math.round(ratio * totalDuration));
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#EA1D2C] to-[#ff4757] transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/80 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="hover:text-white transition-colors cursor-pointer p-1"
                aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-white transition-colors cursor-pointer p-1"
                aria-label={isMuted ? 'Ativar áudio' : 'Desativar áudio'}
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <span className="text-[11px] text-zinc-400">
                Áudio oficial narrado em português (BR)
              </span>
            </div>

            <button
              type="button"
              onClick={onCtaClick}
              className="text-[11px] font-bold text-[#EA1D2C] hover:text-[#ff4d5d] transition-colors cursor-pointer"
            >
              Pular vídeo e criar conta →
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ LEGENDA / TRANSCRIÇÃO POR BAIXO DO PLAYER ═══════ */}
      <div className="rounded-2xl border border-white/10 bg-[#121214] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#EA1D2C]" />
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
              Roteiro e Transcrição da Apresentação
            </h4>
          </div>
          <span className="text-[11px] text-zinc-400">Leitura de 1 min</span>
        </div>

        <div className="space-y-3.5 divide-y divide-white/5">
          {transcriptChapters.map((chapter, i) => (
            <div key={i} className="pt-3.5 first:pt-0 flex items-start gap-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] font-bold text-amber-300 shrink-0">
                {chapter.time}
              </span>
              <div className="space-y-1">
                <span className="text-xs font-bold text-white block">
                  {chapter.title}
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {chapter.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
