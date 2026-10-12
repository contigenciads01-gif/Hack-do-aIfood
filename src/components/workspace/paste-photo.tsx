import { useEffect } from 'react';
import { ClipboardPaste } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function PastePhotoButton({ onPhoto }: { onPhoto: (file: File) => void }) {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find(item => item.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (!file) return;
      event.preventDefault();
      onPhoto(file);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onPhoto]);

  const pastePhoto = async () => {
    if (!navigator.clipboard?.read) {
      toast('Cole a foto com ⌘V no Mac ou Ctrl+V no Windows.');
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find(type => type.startsWith('image/'));
        if (!type) continue;
        const blob = await item.getType(type);
        onPhoto(new File([blob], 'foto-colada', { type: blob.type || type }));
        return;
      }
      toast.error('Não há uma foto copiada para colar.');
    } catch {
      toast('Não foi possível acessar a área de transferência. Cole com ⌘V no Mac ou Ctrl+V no Windows.');
    }
  };

  return <Button variant="outline" onClick={pastePhoto} title="Colar foto — ⌘V no Mac / Ctrl+V no Windows"><ClipboardPaste/>Colar foto</Button>;
}