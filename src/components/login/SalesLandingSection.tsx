import {
  Flame,
  Camera,
  FileText,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { MiniVslPlayer } from './MiniVslPlayer';

interface SalesLandingSectionProps {
  onScrollToTop: (modo?: 'login' | 'cadastro') => void;
}

export function SalesLandingSection({ onScrollToTop }: SalesLandingSectionProps) {
  return (
    <section className="relative z-10 w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-20 text-white">
      {/* Divisor Visual Luminoso Superior */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#121214] border border-white/15 text-xs font-bold text-zinc-300 shadow-xl">
          <Flame className="h-4 w-4 text-[#EA1D2C]" />
          Conheça o Hack do iFood
        </span>
      </div>

      {/* ═══════ B. BLOCO DE IDENTIFICAÇÃO DO PÚBLICO ═══════ */}
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#161618] via-[#101012] to-black p-6 sm:p-10 md:p-12 shadow-2xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EA1D2C]/15 border border-[#EA1D2C]/30 text-xs font-black uppercase tracking-wider text-[#EA1D2C]">
          <Flame className="h-3.5 w-3.5" />
          Para quem é isso
        </div>

        <div className="space-y-4 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Isso aqui não é pra empreendedor fraco.
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-zinc-300 leading-relaxed font-medium">
            É pra quem abre o fogão de manhã cedo e só fecha depois da meia-noite. Pra
            quem trabalha na escala 5x2 e não espera ninguém resolver nada por ele —
            resolve com as próprias mãos, todo santo dia.
          </p>
        </div>

        {/* Pilares do dono de restaurante real */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Rotina real</span>
            <p className="text-sm font-bold text-white">Chapa quente e mão na massa</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Zero enrolação</span>
            <p className="text-sm font-bold text-white">Resultado direto em pedidos</p>
          </div>
          <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-1">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Independência</span>
            <p className="text-sm font-bold text-white">Sem agência cobrando fortuna</p>
          </div>
        </div>
      </div>

      {/* ═══════ C. SEÇÃO DE VÍDEO (MINI VSL) COM TRANSCRIÇÃO ═══════ */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-wider text-[#EA1D2C]">
            Apresentação em Vídeo
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Veja em 3 minutos o que faz seu cardápio vender
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Aperte o play abaixo ou leia a transcrição completa do roteiro logo a seguir.
          </p>
        </div>

        <MiniVslPlayer onCtaClick={() => onScrollToTop('cadastro')} />
      </div>

      {/* ═══════ D. BLOCO DA DOR REAL ═══════ */}
      <div className="space-y-8">
        <div className="rounded-3xl border border-rose-500/25 bg-gradient-to-br from-[#1a0c0e] via-[#12080a] to-black p-6 sm:p-10 md:p-12 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-xs font-black uppercase tracking-wider text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            O Diagnóstico Real
          </div>

          <div className="space-y-4 max-w-3xl">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-100 leading-relaxed">
              Na maioria das vezes, o problema não é o preço do seu prato. É a foto tirada
              às pressas, borrada. É a descrição genérica que não convence ninguém. É o
              cardápio que parece igual ao de mais cem concorrentes na mesma rua.
            </p>
          </div>

          {/* 3 Dores Ilustradas em Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-rose-500/20">
            <div className="p-5 rounded-2xl border border-rose-500/20 bg-black/40 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Camera className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">Foto às pressas e borrada</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tirada na correria do balcão, sem luz certa e sem o apetite que faz a pessoa parar o feed.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-rose-500/20 bg-black/40 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">Descrição genérica</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Textos secos que só listam ingredientes sem despertar água na boca nem sensação de fome.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-rose-500/20 bg-black/40 space-y-2">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">Cardápio indistinguível</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Parece mais um restaurante genérico disputando centavos em vez de uma marca desejada.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ E. BLOCO DA SOLUÇÃO ═══════ */}
      <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-[#0a140f] via-[#080d0a] to-black p-6 sm:p-10 md:p-12 shadow-2xl space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs font-black uppercase tracking-wider text-emerald-400">
          <Zap className="h-3.5 w-3.5" />
          A Solução Definitiva
        </div>

        <div className="space-y-4 max-w-3xl">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-100 leading-relaxed">
            O Hack do iFood existe pra resolver exatamente isso: fotos que vendem,
            descrições que convencem, um cardápio que parece de outro nível — sem você
            precisar virar fotógrafo ou redator da noite pro dia.
          </p>
        </div>

        {/* 3 Pilares da Solução */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-emerald-500/20">
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white">Fotos que vendem</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Iluminação de estúdio gastronômico que realça queijo, fumaça e molhos sem desfigurar sua receita real.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white">Descrições que convencem</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Copywriters gastronômicos programados para converter a rolagem do cliente em toque no botão de pedido.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check className="h-5 w-5" />
            </div>
            <h4 className="text-base font-bold text-white">Cardápio de outro nível</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Destaques e combos estrategicamente ordenados para elevar o ticket médio e parar a guerra de preços.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════ F. CTA FINAL REPETINDO CRIAR CONTA E ROLANDO AO TOPO ═══════ */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#18181b] to-black p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EA1D2C]/15 border border-[#EA1D2C]/30 text-xs font-black uppercase tracking-wider text-[#EA1D2C]">
          <Sparkles className="h-3.5 w-3.5" />
          Comece agora
        </div>

        <div className="space-y-3 max-w-xl mx-auto">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Criar conta agora. O primeiro passo é só esse.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Leva menos de 1 minuto. Sem cartão de crédito obrigatório para testar.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onScrollToTop('cadastro')}
            className="w-full sm:w-auto flex-1 h-14 px-8 rounded-2xl bg-gradient-to-r from-[#EA1D2C] to-[#E31020] text-white text-base font-black shadow-xl shadow-[#EA1D2C]/30 transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Criar conta agora</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => onScrollToTop('login')}
            className="w-full sm:w-auto h-14 px-6 rounded-2xl border border-white/20 bg-white/5 text-white/90 text-sm font-semibold hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
          >
            Já tenho uma conta
          </button>
        </div>

        <div className="pt-2 flex items-center justify-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Acesso imediato e teste grátis incluído</span>
        </div>
      </div>
    </section>
  );
}
