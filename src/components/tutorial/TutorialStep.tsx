import { useState } from 'react';
import {
  Image as ImageIcon,
  ZoomIn,
  Sparkles,
  Copy,
  Check,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export interface TutorialStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  paragraphs: string[];
  imageSrc: string;
  imageAlt: string;
  tip?: string;
  exampleToCopy?: string;
  exampleLabel?: string;
}

export function TutorialStep({
  stepNumber,
  title,
  description,
  paragraphs,
  imageSrc,
  imageAlt,
  tip,
  exampleToCopy,
  exampleLabel = 'Copiar exemplo',
}: TutorialStepProps) {
  const [imageError, setImageError] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!exampleToCopy) return;
    try {
      await navigator.clipboard.writeText(exampleToCopy);
      setCopied(true);
      toast.success('Exemplo copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar o exemplo.');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 sm:p-6 space-y-5 transition-colors hover:border-white/20">
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EA1D2C] text-sm font-black text-white shadow">
          {stepNumber}
        </span>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
          {description && <p className="text-xs text-white/60">{description}</p>}
        </div>
      </div>

      {/* Image Preview / Placeholder */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
        {!imageError ? (
          <div
            className="group relative cursor-pointer"
            onClick={() => setZoomOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setZoomOpen(true)}
            aria-label={`Ampliar imagem: ${imageAlt}`}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              onError={() => setImageError(true)}
              className="max-h-[360px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-xl bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow backdrop-blur">
                <ZoomIn className="h-4 w-4 text-[#EA1D2C]" />
                Clique para ampliar
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#EA1D2C] ring-1 ring-white/10">
              <ImageIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-white/80">Imagem em breve</p>
            <p className="text-xs text-white/40 max-w-sm">
              Exemplo visual em atualização para {imageAlt.toLowerCase()}
            </p>
          </div>
        )}
      </div>

      {/* Explanatory Paragraphs */}
      <div className="space-y-2.5 text-sm text-white/80 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Highlighted Tip */}
      {tip && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-200">
          <Lightbulb className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300">Dica prática: </span>
            <span>{tip}</span>
          </div>
        </div>
      )}

      {/* Copy Example Button */}
      {exampleToCopy && (
        <div className="pt-1 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
          <span className="text-xs text-white/50">Modelo de texto pronto:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="border-white/15 text-xs font-medium hover:border-[#EA1D2C] hover:text-[#EA1D2C]"
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {exampleLabel}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Image Zoom Dialog */}
      {!imageError && (
        <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
          <DialogContent className="max-w-4xl border-white/15 bg-[#141414] p-4 text-white">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-base font-bold text-white">{title}</DialogTitle>
              <DialogDescription className="text-xs text-white/60">
                {imageAlt}
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-hidden rounded-xl bg-black">
              <img src={imageSrc} alt={imageAlt} className="max-h-[75vh] w-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
