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

        {/* ═══════ BLOCO DE HISTÓRIA ═══════ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/5 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">
            A rotina que ninguém vê
          </span>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            Você conhece aquele dono de lanchonete que abre o fogão antes do sol nascer?
            Insumo subindo de preço toda semana, conta mais salgada no fim do mês, o
            cheiro de óleo que não sai da roupa nem depois do banho — e mesmo assim ele
            não fecha a porta. Trabalha na escala 5x2, folga só quando dá, geralmente
            nunca. Essa pessoa não está esperando as coisas ficarem mais fáceis. Está
            procurando um jeito de vender mais com o que já tem nas mãos.
          </p>
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

      {/* ═══════ D. BLOCO DA DOR REAL (FORMATO LISTA) ═══════ */}
      <div className="space-y-8">
        <div className="rounded-3xl border border-rose-500/25 bg-gradient-to-br from-[#1a0c0e] via-[#12080a] to-black p-6 sm:p-10 md:p-12 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-xs font-black uppercase tracking-wider text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            O Diagnóstico Real
          </div>

          <div className="space-y-4 max-w-3xl">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Na maioria das vezes, o problema não é o preço do seu prato:
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-500/20 bg-black/40">
                <Camera className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-zinc-200">
                  <strong className="text-white">É a foto tirada às pressas</strong>, com a luz da cozinha, borrada.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-500/20 bg-black/40">
                <FileText className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-zinc-200">
                  <strong className="text-white">É a descrição genérica</strong> que não diferencia seu prato de nenhum outro.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-500/20 bg-black/40">
                <UtensilsCrossed className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-zinc-200">
                  <strong className="text-white">É o cardápio</strong> que parece igual ao de mais cem concorrentes na mesma rua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ E. BLOCO DA SOLUÇÃO (RESULTADO, PROVA, TEMPO E ESFORÇO) ═══════ */}
      <div className="rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-[#0a140f] via-[#080d0a] to-black p-6 sm:p-10 md:p-12 shadow-2xl space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs font-black uppercase tracking-wider text-emerald-400">
          <Zap className="h-3.5 w-3.5" />
          A Solução Definitiva
        </div>

        <div className="space-y-4 max-w-3xl">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
            O Hack do iFood resolve isso de ponta a ponta:
          </h3>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-black/40">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-zinc-200">
                <strong className="text-white">Fotos geradas por IA</strong> treinada em milhares de pratos que já venderam mais.
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-black/40">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-zinc-200">
                <strong className="text-white">Descrições que convencem</strong>, escritas pra gente com fome, não pra robô de SEO.
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-black/40">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-zinc-200">
                <strong className="text-white">Rebranding completo do seu cardápio</strong>, pra parecer de outro nível.
              </p>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-black/40">
              <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-zinc-200">
                <strong className="text-white">Pronto em minutos, não em semanas</strong> — e você aprende o porquê de cada escolha no caminho, não só aperta um botão sem entender nada.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ F. CTA FINAL COM RISCO REVERTIDO E ROLANDO AO TOPO ═══════ */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#18181b] to-black p-8 sm:p-12 text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#EA1D2C]/15 border border-[#EA1D2C]/30 text-xs font-black uppercase tracking-wider text-[#EA1D2C]">
          <Sparkles className="h-3.5 w-3.5" />
          Comece agora
        </div>

        <div className="space-y-3 max-w-xl mx-auto">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Criar minha conta agora — leva menos de 2 minutos.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium">
            Sem fidelidade. Cancela quando quiser, direto no painel.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onScrollToTop('cadastro')}
            className="w-full sm:w-auto flex-1 h-14 px-8 rounded-2xl bg-gradient-to-r from-[#EA1D2C] to-[#E31020] text-white text-base font-black shadow-xl shadow-[#EA1D2C]/30 transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Criar minha conta agora</span>
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
          <span>Sem fidelidade. Cancela quando quiser, direto no painel.</span>
        </div>
      </div>
    </section>
  );
}
