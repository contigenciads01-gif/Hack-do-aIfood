import { useEffect, useRef, useState } from 'react';
import { Brain, Copy, RotateCcw, RefreshCw } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export async function copyPrompt(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Prompt copiado com sucesso.');
  } catch {
    toast.error('Não foi possível copiar. Selecione o texto e copie manualmente.');
  }
}

export function BrainPanel({
  open,
  onOpenChange,
  title,
  text,
  original,
  onChange,
  missing = [],
  onField,
  onRegenerate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  text: string;
  original: string;
  onChange: (text: string) => void;
  missing?: { key: string; label: string }[];
  onField?: (key: string) => void;
  onRegenerate?: () => void;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

  useEffect(() => {
    const el = textarea.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(360, el.scrollHeight)}px`;
    }
  }, [text, open]);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="workspace brain-sheet">
          <SheetHeader>
            <SheetTitle className="flex gap-3 items-center">
              <Brain className="text-[#EA1D2C]" />
              Prompt pronto · {title}
            </SheetTitle>
            <SheetDescription>Prompt compilado pronto para IA</SheetDescription>
          </SheetHeader>

          <div className="prompt-actions mt-5">
            {text !== original && <span className="example-label">Editado</span>}
            <span className="text-muted-foreground text-sm">
              {text.trim() ? text.trim().split(/\s+/).length : 0} palavras · {text.length} caracteres
            </span>
          </div>

          {missing.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-amber-400">Campos sugeridos que faltam</h3>
              <div className="prompt-actions mt-2">
                {missing.map((f) => (
                  <Button
                    variant="outline"
                    className="missing-tag"
                    key={f.key}
                    onClick={() => {
                      onOpenChange(false);
                      onField?.(f.key);
                    }}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <textarea
            ref={textarea}
            className="brain-text mt-5"
            aria-label="Prompt pronto editável"
            value={text}
            onChange={(e) => onChange(e.target.value)}
          />

          <div className="prompt-actions mt-5">
            <Button onClick={() => copyPrompt(text)}>
              <Copy size={16} />
              Copiar
            </Button>
            <Button variant="outline" onClick={() => onChange(original)}>
              <RotateCcw size={16} />
              Restaurar original
            </Button>
            {onRegenerate && (
              <Button variant="outline" onClick={() => setShowConfirmRegenerate(true)}>
                <RefreshCw size={16} />
                Regenerar a partir dos campos
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Accessible Confirmation AlertDialog */}
      <AlertDialog open={showConfirmRegenerate} onOpenChange={setShowConfirmRegenerate}>
        <AlertDialogContent className="border-white/15 bg-[#181818] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerar a partir dos campos?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Todas as edições manuais feitas no texto do prompt pronto serão descartadas e substituídas pelo gerador automático.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EA1D2C] text-white hover:bg-[#ff3b4b]"
              onClick={() => {
                setShowConfirmRegenerate(false);
                onRegenerate?.();
              }}
            >
              Regenerar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
