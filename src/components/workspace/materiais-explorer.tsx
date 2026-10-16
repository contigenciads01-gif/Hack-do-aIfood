import { useState, useMemo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Folder,
  FolderOpen,
  Camera,
  Image as ImageIcon,
  Copy,
  Download,
  Trash2,
  Edit2,
  Plus,
  ArrowLeft,
  ArrowUp,
  LayoutGrid,
  List,
  Search,
  Check,
  Sparkles,
  Palette,
  Store,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { openCompanyEditor } from '@/lib/company-editor-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  usePratos,
  useCreatePrato,
  useRenamePrato,
  useDeletePrato,
  useDeletePratoFoto,
  validatePratoNome,
  safeTrim,
  type Prato,
  type PratoFoto,
} from '@/lib/data/pratos';
import { useMaterials, type DbMaterial } from '@/lib/data/materials';
import { useCompany } from '@/lib/data/company';

interface MateriaisExplorerProps {
  mode?: 'pagina' | 'seletor';
  onSelectPrato?: (prato: Prato) => void;
  onClose?: () => void;
  initialPratoId?: string;
}

export function MateriaisExplorer({
  mode = 'pagina',
  onSelectPrato,
  onClose,
  initialPratoId,
}: MateriaisExplorerProps) {
  const navigate = useNavigate();
  const { data: pratos = [], isLoading: loadingPratos } = usePratos();
  const { data: materials = [] } = useMaterials();
  const { data: company } = useCompany();

  const createPratoMutation = useCreatePrato();
  const renamePratoMutation = useRenamePrato();
  const deletePratoMutation = useDeletePrato();
  const deleteFotoMutation = useDeletePratoFoto();

  const [currentFolder, setCurrentFolder] = useState<string>(
    initialPratoId || 'raiz',
  );
  const [viewMode, setViewMode] = useState<'grade' | 'lista'>('grade');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [newPratoOpen, setNewPratoOpen] = useState(false);
  const [newPratoName, setNewPratoName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [pratoToRename, setPratoToRename] = useState<Prato | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pratoToDelete, setPratoToDelete] = useState<Prato | null>(null);

  const selectedPrato = useMemo(() => {
    if (currentFolder === 'raiz' || currentFolder === 'minha-marca') return null;
    return pratos.find((p) => p.id === currentFolder) || null;
  }, [currentFolder, pratos]);

  const selectedPratoMaterials = useMemo(() => {
    if (!selectedPrato) return [];
    return materials.filter(
      (m: any) =>
        m.prato_id === selectedPrato.id ||
        m.title?.toLowerCase().includes(selectedPrato.nome.toLowerCase()),
    );
  }, [selectedPrato, materials]);

  const filteredPratos = useMemo(() => {
    const trimmedQuery = safeTrim(searchQuery);
    if (!trimmedQuery) return pratos;
    const q = trimmedQuery.toLowerCase();
    return pratos.filter((p) => p.nome.toLowerCase().includes(q));
  }, [pratos, searchQuery]);

  const handleCreatePrato = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePratoNome(newPratoName, pratos);
    if (!validation.valid) {
      setCreateError(validation.error || 'Nome inválido.');
      return;
    }
    setCreateError(null);

    try {
      const created = await createPratoMutation.mutateAsync({
        nome: validation.trimmed,
      });
      toast.success(`Pasta "${created.nome}" criada com sucesso!`);
      setNewPratoName('');
      setCreateError(null);
      setNewPratoOpen(false);
      setCurrentFolder(created.id);
    } catch (err: any) {
      const msg = err.message || 'Erro ao criar prato.';
      setCreateError(msg);
      toast.warning(msg);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pratoToRename) return;
    const validation = validatePratoNome(renameValue, pratos, pratoToRename.id);
    if (!validation.valid) {
      setRenameError(validation.error || 'Nome inválido.');
      return;
    }
    setRenameError(null);

    try {
      await renamePratoMutation.mutateAsync({
        id: pratoToRename.id,
        novoNome: validation.trimmed,
      });
      toast.success('Prato renomeado com sucesso.');
      setRenameOpen(false);
      setRenameError(null);
      setPratoToRename(null);
    } catch (err: any) {
      const msg = err.message || 'Erro ao renomear prato.';
      setRenameError(msg);
      toast.warning(msg);
    }
  };

  const handleDelete = async () => {
    if (!pratoToDelete) return;
    try {
      await deletePratoMutation.mutateAsync(pratoToDelete.id);
      toast.success(`Prato "${pratoToDelete.nome}" removido.`);
      if (currentFolder === pratoToDelete.id) {
        setCurrentFolder('raiz');
      }
      setDeleteOpen(false);
      setPratoToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir prato.');
    }
  };

  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const blobUrl = URL.createObjectURL(blob);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = blobUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob(async (pngBlob) => {
        if (pngBlob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': pngBlob }),
          ]);
          toast.success('Foto copiada para a área de transferência!');
        }
        URL.revokeObjectURL(blobUrl);
      }, 'image/png');
    } catch {
      toast.error('Não foi possível copiar diretamente. Clique em Baixar.');
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyText = (text: string, label = 'Texto') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const isSelector = mode === 'seletor';

  return (
    <div
      className={`flex flex-col bg-[#0f0f10] text-white ${
        isSelector
          ? 'h-full w-full rounded-2xl border border-white/15 overflow-hidden'
          : 'rounded-2xl border border-white/10 p-4 sm:p-6 shadow-xl'
      }`}
    >
      {/* Top Header / Explorer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Button
            size="sm"
            variant="ghost"
            disabled={currentFolder === 'raiz'}
            onClick={() => setCurrentFolder('raiz')}
            className="h-9 px-2 text-white/60 hover:text-white"
            title="Subir para a raiz"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>

          <button
            type="button"
            onClick={() => setCurrentFolder('raiz')}
            className={`flex items-center gap-1.5 transition-colors ${
              currentFolder === 'raiz'
                ? 'text-white font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Folder className="h-4 w-4 text-[#EA1D2C]" />
            Meus materiais
          </button>

          {currentFolder === 'minha-marca' && (
            <>
              <ChevronRight className="h-4 w-4 text-white/40" />
              <span className="text-white font-bold">Minha marca</span>
            </>
          )}

          {selectedPrato && (
            <>
              <ChevronRight className="h-4 w-4 text-white/40" />
              <span className="text-white font-bold truncate max-w-[180px] sm:max-w-xs">
                {selectedPrato.nome}
              </span>
            </>
          )}
        </div>

        {/* Actions: Search, View Mode, New Folder, Close (in selector) */}
        <div className="flex items-center gap-2">
          {currentFolder === 'raiz' && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar pasta..."
                className="h-9 w-32 sm:w-48 rounded-xl border border-white/10 bg-black/40 pl-8 pr-3 text-xs text-white placeholder:text-white/40 focus:border-[#EA1D2C] focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center rounded-xl border border-white/10 bg-black/30 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grade')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grade' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Exibição em Grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'lista' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
              title="Exibição em Lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {currentFolder === 'raiz' && (
            <Button
              size="sm"
              onClick={() => setNewPratoOpen(true)}
              className="bg-[#EA1D2C] text-xs font-bold text-white hover:bg-[#ff3b4b]"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Novo prato
            </Button>
          )}

          {isSelector && onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-9 w-9 p-0 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pt-5 pb-2">
        {/* ─── RAIZ DO EXPLORADOR ─── */}
        {currentFolder === 'raiz' && (
          <div className="space-y-6">
            {/* Special Folder: Minha marca */}
            <div
              onClick={() => setCurrentFolder('minha-marca')}
              className="group flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-[#141414] p-4 transition-all hover:border-[#EA1D2C]/50 hover:bg-[#181818]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EA1D2C]/15 text-[#EA1D2C]">
                  {company?.logo_path ? (
                    <img
                      src={company.logo_path}
                      alt={company.nome}
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <Store className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#EA1D2C] transition-colors">
                    Minha marca
                  </h3>
                  <p className="text-xs text-white/60">
                    Logo, cores oficiais e dados públicos da empresa
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-white/40 group-hover:text-white" />
            </div>

            {/* Dish Folders Heading */}
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/50">
                Pastas de pratos ({filteredPratos.length})
              </h2>
            </div>

            {/* Empty State */}
            {filteredPratos.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#EA1D2C]">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Nenhum prato ainda</h3>
                  <p className="text-xs text-white/60 max-w-sm mt-1">
                    Cadastre seu primeiro prato para salvar fotos, prompts e descrições organizadas.
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => setNewPratoOpen(true)}
                    className="bg-[#EA1D2C] text-xs font-bold text-white hover:bg-[#ff3b4b]"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Novo prato
                  </Button>
                  <Button asChild variant="outline" className="text-xs border-white/20">
                    <Link to="/foto">
                      <Camera className="mr-1.5 h-4 w-4" />
                      Tirar foto
                    </Link>
                  </Button>
                </div>
              </div>
            ) : viewMode === 'grade' ? (
              /* Grid View */
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {filteredPratos.map((prato) => {
                  const fotoCount = prato.fotos?.length || 0;
                  const coverPhoto = prato.fotos?.[0]?.url;

                  return (
                    <div
                      key={prato.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141414] p-4 transition-all hover:border-[#EA1D2C]/40 hover:bg-[#181818]"
                    >
                      <div
                        onClick={() => {
                          if (isSelector && onSelectPrato) {
                            onSelectPrato(prato);
                          } else {
                            setCurrentFolder(prato.id);
                          }
                        }}
                        className="cursor-pointer space-y-3"
                      >
                        {/* Cover / Thumbnails */}
                        <div className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/60">
                          {coverPhoto ? (
                            <img
                              src={coverPhoto}
                              alt={prato.nome}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-white/30">
                              <Camera className="h-6 w-6" />
                              <span className="text-[10px]">Sem fotos</span>
                            </div>
                          )}

                          {/* 3 slots mini preview indicator */}
                          <div className="absolute bottom-2 right-2 flex gap-1 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur">
                            {[1, 2, 3].map((slot) => {
                              const hasSlot = prato.fotos?.some((f) => f.slot === slot);
                              return (
                                <span
                                  key={slot}
                                  className={`h-2 w-2 rounded-xs ${
                                    hasSlot ? 'bg-[#EA1D2C]' : 'bg-white/20'
                                  }`}
                                  title={`Foto ${slot}: ${hasSlot ? 'Salva' : 'Vazia'}`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-base group-hover:text-[#EA1D2C] transition-colors truncate">
                              {prato.nome}
                            </h3>
                          </div>
                          <p className="text-xs text-white/50">
                            {fotoCount} de 3 fotos salvas
                          </p>
                        </div>
                      </div>

                      {/* Context Menu / Bottom Bar */}
                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                        {isSelector ? (
                          <Button
                            size="sm"
                            className="w-full bg-[#EA1D2C] text-xs font-bold text-white hover:bg-[#ff3b4b]"
                            onClick={() => onSelectPrato && onSelectPrato(prato)}
                          >
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                            Usar este prato
                          </Button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setCurrentFolder(prato.id)}
                              className="text-xs font-semibold text-[#EA1D2C] hover:underline"
                            >
                              Abrir pasta →
                            </button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-white/40 hover:text-white"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="border-white/10 bg-[#181818] text-white"
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPratoToRename(prato);
                                    setRenameValue(prato.nome);
                                    setRenameOpen(true);
                                  }}
                                  className="text-xs cursor-pointer"
                                >
                                  <Edit2 className="mr-2 h-3.5 w-3.5" />
                                  Renomear
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPratoToDelete(prato);
                                    setDeleteOpen(true);
                                  }}
                                  className="text-xs text-rose-400 focus:text-rose-300 cursor-pointer"
                                >
                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                  Excluir pasta
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#141414] overflow-hidden">
                {filteredPratos.map((prato) => (
                  <div
                    key={prato.id}
                    className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors"
                  >
                    <div
                      onClick={() => {
                        if (isSelector && onSelectPrato) onSelectPrato(prato);
                        else setCurrentFolder(prato.id);
                      }}
                      className="flex cursor-pointer items-center gap-3 truncate"
                    >
                      <Folder className="h-5 w-5 shrink-0 text-[#EA1D2C]" />
                      <span className="font-semibold text-sm truncate">{prato.nome}</span>
                      <span className="text-xs text-white/40">
                        ({prato.fotos?.length || 0}/3 fotos)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelector ? (
                        <Button
                          size="sm"
                          onClick={() => onSelectPrato && onSelectPrato(prato)}
                          className="bg-[#EA1D2C] text-xs h-8"
                        >
                          Usar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCurrentFolder(prato.id)}
                          className="text-xs h-8"
                        >
                          Abrir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── PASTA: MINHA MARCA ─── */}
        {currentFolder === 'minha-marca' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-6 space-y-4">
              <div className="flex items-center gap-4">
                {company?.tem_logo && company.logo_path ? (
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-1">
                    <img
                      src={company.logo_path}
                      alt={company.nome}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EA1D2C] text-xl font-bold">
                    {company?.nome?.slice(0, 2).toUpperCase() || 'IF'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{company?.nome || 'Minha loja'}</h3>
                  <p className="text-xs text-[#EA1D2C] font-semibold">{company?.categoria}</p>
                </div>
              </div>

              {company?.cores && company.cores.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold uppercase text-white/50">
                    Cores oficiais
                  </span>
                  <div className="mt-2 flex gap-2">
                    {company.cores.map((c, i) => (
                      <div
                        key={i}
                        className="h-8 w-12 rounded-lg border border-white/20 shadow"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openCompanyEditor('identidade')}
                >
                  Editar identidade completa
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── PASTA DO PRATO SELECIONADO ─── */}
        {selectedPrato && (
          <div className="space-y-8">
            {/* Prato Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141414] p-4 rounded-2xl border border-white/10">
              <div>
                <h2 className="text-xl font-black text-white">{selectedPrato.nome}</h2>
                <p className="text-xs text-white/60">
                  Fotos salvas e histórico de prompts criados para este prato
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isSelector && (
                  <Button
                    onClick={() => onSelectPrato && onSelectPrato(selectedPrato)}
                    className="bg-[#EA1D2C] font-bold text-xs hover:bg-[#ff3b4b]"
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Anexar à ferramenta
                  </Button>
                )}
                <Button asChild variant="outline" size="sm" className="text-xs border-white/20">
                  <Link to="/foto">
                    <Camera className="mr-1.5 h-3.5 w-3.5 text-[#EA1D2C]" />
                    Tirar foto nova
                  </Link>
                </Button>
              </div>
            </div>

            {/* SEÇÃO FOTOS (1 a 3) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Fotos do prato ({selectedPrato.fotos?.length || 0} de 3)
                </h3>
                <span className="text-xs text-white/40">Limite de 3 fotos</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((slotNum) => {
                  const foto = selectedPrato.fotos?.find((f) => f.slot === slotNum);
                  const slotLabels = ['1. De cima', '2. De lado (45°)', '3. Detalhe'];

                  return (
                    <div
                      key={slotNum}
                      className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141414] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/70">
                          {slotLabels[slotNum - 1]}
                        </span>
                        {foto && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                            Salva
                          </span>
                        )}
                      </div>

                      {/* Photo preview or empty placeholder */}
                      <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/60">
                        {foto?.url ? (
                          <img
                            src={foto.url}
                            alt={`${selectedPrato.nome} foto ${slotNum}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-white/30 text-center p-2">
                            <Camera className="h-6 w-6" />
                            <span className="text-[11px]">Espaço {slotNum} vazio</span>
                          </div>
                        )}
                      </div>

                      {/* Photo Action Buttons */}
                      <div className="flex flex-wrap gap-1.5">
                        {foto ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => foto.url && copyImageToClipboard(foto.url)}
                              className="flex-1 text-[11px] h-8 border-white/15 hover:border-[#EA1D2C]"
                              title="Copiar imagem"
                            >
                              <Copy className="mr-1 h-3 w-3" />
                              Copiar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                foto.url &&
                                downloadImage(
                                  foto.url,
                                  `${selectedPrato.nome}-slot-${slotNum}.webp`,
                                )
                              }
                              className="flex-1 text-[11px] h-8 border-white/15"
                              title="Baixar imagem"
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Baixar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                if (confirm('Deseja remover esta foto?')) {
                                  await deleteFotoMutation.mutateAsync({
                                    fotoId: foto.id,
                                    storagePath: foto.storage_path,
                                  });
                                  toast.success('Foto removida.');
                                }
                              }}
                              className="text-rose-400 hover:text-rose-300 h-8 px-2"
                              title="Remover foto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <Button asChild size="sm" variant="outline" className="w-full text-xs h-8">
                            <Link to="/foto">
                              <Plus className="mr-1 h-3 w-3 text-[#EA1D2C]" />
                              Tirar foto
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SEÇÃO TEXTOS E PROMPTS SALVOS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
                  Textos e prompts salvos ({selectedPratoMaterials.length})
                </h3>
              </div>

              {selectedPratoMaterials.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#141414] p-6 text-center text-xs text-white/50">
                  Nenhum texto salvo para este prato ainda. Use as ferramentas de Descrição ou
                  Anúncios para gerar prompts prontos.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedPratoMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className="rounded-2xl border border-white/10 bg-[#141414] p-4 space-y-2 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-[#EA1D2C]/20 px-2 py-0.5 text-[10px] font-bold text-[#EA1D2C] uppercase">
                            {mat.tipo || mat.tool || 'Prompt'}
                          </span>
                          <h4 className="text-sm font-bold text-white truncate max-w-sm">
                            {mat.title}
                          </h4>
                        </div>
                        <span className="text-[11px] text-white/40">
                          {new Date(mat.criado_em).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                        {mat.text}
                      </p>

                      <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyText(mat.text, 'Prompt')}
                          className="text-xs h-8"
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copiar prompt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dialog: Criar Novo Prato */}
      <Dialog
        open={newPratoOpen}
        onOpenChange={(open) => {
          setNewPratoOpen(open);
          if (!open) setCreateError(null);
        }}
      >
        <DialogContent className="border-white/15 bg-[#141414] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Criar nova pasta de prato</DialogTitle>
            <DialogDescription className="text-white/60">
              Digite o nome do prato para organizar suas fotos e prompts em um só lugar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePrato} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase">
                Nome do prato *
              </label>
              <input
                type="text"
                value={newPratoName}
                onChange={(e) => {
                  setNewPratoName(e.target.value);
                  if (createError) setCreateError(null);
                }}
                placeholder="Ex.: Smash Burger Duplo"
                autoFocus
                className={`mt-1.5 w-full rounded-xl border bg-black/50 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none ${
                  createError
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-white/15 focus:border-[#EA1D2C]'
                }`}
              />
              {createError && (
                <p className="text-xs text-rose-400 font-medium mt-1">{createError}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewPratoOpen(false)}
                className="border-white/20"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#EA1D2C] font-bold hover:bg-[#ff3b4b]">
                Criar pasta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Renomear Prato */}
      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          setRenameOpen(open);
          if (!open) setRenameError(null);
        }}
      >
        <DialogContent className="border-white/15 bg-[#141414] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Renomear prato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase">Novo nome *</label>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value);
                  if (renameError) setRenameError(null);
                }}
                autoFocus
                className={`mt-1.5 w-full rounded-xl border bg-black/50 px-4 py-3 text-sm text-white focus:outline-none ${
                  renameError
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-white/15 focus:border-[#EA1D2C]'
                }`}
              />
              {renameError && (
                <p className="text-xs text-rose-400 font-medium mt-1">{renameError}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#EA1D2C] font-bold">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Excluir Prato */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-white/15 bg-[#141414] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir a pasta "{pratoToDelete?.nome}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Todas as fotos e referências deste prato serão removidas. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-500">
              Excluir pasta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
