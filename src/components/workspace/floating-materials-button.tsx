import { useState } from 'react';
import { Folder, Store } from 'lucide-react';
import { useCompany } from '@/lib/data/company';
import { MateriaisExplorer } from './materiais-explorer';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Prato } from '@/lib/data/pratos';

interface FloatingMaterialsButtonProps {
  onSelectPrato?: (prato: Prato) => void;
}

export function FloatingMaterialsButton({ onSelectPrato }: FloatingMaterialsButtonProps) {
  const { data: company } = useCompany();
  const [open, setOpen] = useState(false);

  const handleSelect = (prato: Prato) => {
    setOpen(false);
    if (onSelectPrato) {
      onSelectPrato(prato);
    }
  };

  return (
    <>
      {/* 56px Rounded Square Floating Button (SEM CÍRCULO) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 bg-[#161618] text-white shadow-2xl transition-all duration-200 hover:scale-105 hover:border-[#EA1D2C] active:scale-95"
        title="Abrir Meus materiais"
        aria-label="Abrir Meus materiais"
      >
        {company?.tem_logo && company.logo_path ? (
          <img
            src={company.logo_path}
            alt={company.nome}
            className="h-8 w-8 object-contain"
          />
        ) : (
          <Store className="h-6 w-6 text-white/80" />
        )}

        {/* Corner Badge */}
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-[#EA1D2C] text-[10px] font-bold text-white shadow">
          <Folder className="h-3 w-3" />
        </span>
      </button>

      {/* Selector Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-4xl p-0 border-white/15 bg-[#0f0f10] text-white h-[90vh] sm:h-[80vh] overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Seletor de Materiais</DialogTitle>
          <DialogDescription className="sr-only">
            Escolha um prato para anexar fotos e dados diretamente à ferramenta.
          </DialogDescription>
          <MateriaisExplorer
            mode="seletor"
            onSelectPrato={handleSelect}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
