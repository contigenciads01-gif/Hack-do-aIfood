import { useState } from 'react';
import { Brain, Copy, Trash2, FolderOpen, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toolTitles } from '@/data/prompt-fields';
import { ToolPage } from './pages';
import { BrainPanel, copyPrompt } from './brain-panel';
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
import { toast } from 'sonner';
import { useMaterials, useDeleteMaterial, useUpdateMaterial, type DbMaterial } from '@/lib/data';

export function MaterialsPage() {
  const { data: materials = [], isLoading } = useMaterials();
  const deleteMutation = useDeleteMaterial();
  const updateMutation = useUpdateMaterial();

  const [selected, setSelected] = useState<DbMaterial | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!materialToDelete) return;
    try {
      await deleteMutation.mutateAsync(materialToDelete);
      toast.success('Metaprompt excluído com sucesso.');
    } catch {
      toast.error('Erro ao excluir metaprompt.');
    } finally {
      setMaterialToDelete(null);
    }
  };

  const handleUpdateText = async (newText: string) => {
    if (!selected) return;
    const updated = { ...selected, text: newText };
    setSelected(updated);
    try {
      await updateMutation.mutateAsync({ id: selected.id, text: newText });
    } catch {
      toast.error('Erro ao salvar edições.');
    }
  };

  return (
    <ToolPage
      title="Meus materiais"
      description="Seus metaprompts salvos e organizados na sua conta."
      icon={FolderOpen}
    >
      {isLoading ? (
        <section className="tool-card">
          <p>Carregando seus materiais...</p>
        </section>
      ) : !materials.length ? (
        <div className="tool-card empty-state">
          <FolderOpen size={48} className="text-white/40" />
          <h2 className="mt-2 text-lg font-bold">Nenhum metaprompt salvo ainda</h2>
          <p className="text-sm text-white/60">
            Quando você gerar e salvar prompts em qualquer ferramenta, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {materials.map((m) => (
            <section className="tool-card flex flex-col justify-between" key={m.id}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="example-label">{toolTitles[m.tool] || m.tool}</span>
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    <Calendar size={12} />
                    {new Date(m.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-bold">{m.title}</h2>
                {m.summary && m.summary.length > 0 && (
                  <p className="mt-1 line-clamp-2 text-xs text-white/60">
                    {m.summary.join(' · ')}
                  </p>
                )}
              </div>

              <div className="prompt-actions mt-6 pt-4 border-t border-white/10">
                <Button variant="outline" size="sm" onClick={() => setSelected(m)}>
                  <Brain size={16} />
                  Abrir no cérebro
                </Button>
                <Button size="sm" onClick={() => copyPrompt(m.text)}>
                  <Copy size={16} />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-400 hover:text-rose-300"
                  onClick={() => setMaterialToDelete(m.id)}
                >
                  <Trash2 size={16} />
                  Excluir
                </Button>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Brain Editor for Selected Material */}
      {selected && (
        <BrainPanel
          open={true}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
          title={toolTitles[selected.tool] || selected.tool}
          text={selected.text}
          original={selected.original || selected.text}
          onChange={handleUpdateText}
        />
      )}

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={!!materialToDelete} onOpenChange={(open) => !open && setMaterialToDelete(null)}>
        <AlertDialogContent className="border-white/15 bg-[#181818] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este metaprompt?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Esta ação removerá permanentemente o material salvo da sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EA1D2C] text-white hover:bg-[#ff3b4b]"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ToolPage>
  );
}
