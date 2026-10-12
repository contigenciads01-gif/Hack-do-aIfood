import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, Flame, Megaphone, Target, ArrowRight } from 'lucide-react';
import { SUPPORT_WHATSAPP } from '@/config';

interface PlusUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlusUpgradeModal({ open, onOpenChange }: PlusUpgradeModalProps) {
  const handleUpgrade = () => {
    const text = encodeURIComponent(
      'Olá! Gostaria de fazer o upgrade para o Plano Plus do Hack do iFood e ter acesso exclusivo ao gerador de Anúncios (Stories e Carrosséis).'
    );
    window.open(`${SUPPORT_WHATSAPP}?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/20 bg-gradient-to-b from-[#1c1c1c] to-[#121212] p-6 text-white shadow-2xl backdrop-blur-xl sm:rounded-3xl">
        <DialogHeader className="items-center text-center">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EA1D2C] to-[#ff5967] text-white shadow-lg shadow-[#EA1D2C]/40">
            <Megaphone className="h-8 w-8" />
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shadow">
              <Sparkles className="h-3.5 w-3.5 fill-black" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            EXCLUSIVO DO PLANO PLUS
          </span>
          <DialogTitle className="mt-2 text-2xl font-black tracking-tight">
            Desbloqueie a Máquina de Anúncios
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-white/70">
            Crie anúncios de alta conversão para Instagram e iFood em minutos com metaprompts calibrados para o delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div className="text-xs">
              <strong className="block text-white">Stories Verticais 9:16</strong>
              <span className="text-white/60">Zonas de respiro, títulos de impacto em até 6 palavras e CTA direcionado.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div className="text-xs">
              <strong className="block text-white">Carrosséis Narrativos 4:5</strong>
              <span className="text-white/60">Estrutura de 5 a 7 slides: gancho, desejo pelo prato real, oferta e fechamento.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div className="text-xs">
              <strong className="block text-white">Preenchimento 100% Automático</strong>
              <span className="text-white/60">Sua logo, WhatsApp, Instagram, cidade e paleta de cores integrados no prompt.</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleUpgrade}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA1D2C] py-4 text-base font-bold text-white shadow-lg shadow-[#EA1D2C]/40 transition hover:bg-[#ff3b4b] active:scale-[0.98]"
          >
            Assinar o Plus
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs text-white/50 hover:bg-transparent hover:text-white"
          >
            Continuar no plano gratuito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
