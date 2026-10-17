import { useState, useEffect } from 'react';
import {
  Sparkles,
  Smartphone,
  Square,
  Copy,
  Check,
  Save,
  Trash2,
  Plus,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  FolderOpen,
  Image as ImageIcon,
  CheckCircle2,
  UtensilsCrossed,
  Sliders,
  DollarSign,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useCompany } from '@/lib/data/company';
import { usePratos, type Prato } from '@/lib/data/pratos';
import { useAds, useSaveAd, useDeleteAd, type AdItem, type AdPhrase } from '@/lib/data/ads';
import { openCompanyEditor } from '@/lib/company-editor-state';
import { buildAdImageMetaprompt, type AdMetapromptResult } from '@/lib/build-ad-metaprompt';

export interface AdPreset {
  id: string;
  nome: string;
  titulo: string;
  preco: number | null;
  frases: string[];
}

export const AD_PRESETS: AdPreset[] = [
  {
    id: 'apetite',
    nome: 'Apetite & Sabor',
    titulo: 'O sabor artesanal que conquista no primeiro pedaço',
    preco: null,
    frases: [
      'Feito na brasa com carne 100% fresca',
      'Queijo derretido no ponto perfeito',
      'Entrega super rápida e quentinha',
    ],
  },
  {
    id: 'promocao',
    nome: 'Promoção com Preço',
    titulo: 'Promoção Exclusiva no iFood Só Hoje',
    preco: 29.9,
    frases: [
      'Desconto especial por tempo limitado',
      'Acompanha molho da casa artesanal',
    ],
  },
  {
    id: 'combo',
    nome: 'Combo / Almoço Completo',
    titulo: 'Almoço Completo com Prato, Acompanhamento e Bebida',
    preco: 34.9,
    frases: [
      'Refeição balanceada feita na hora',
      'Prático e delicioso para o seu dia a dia',
    ],
  },
  {
    id: 'artesanal',
    nome: 'Bastidores & Artesanal',
    titulo: 'Aqui não tem nada congelado',
    preco: null,
    frases: [
      'Receitas preparadas à mão todo santo dia',
      'Ingredientes selecionados frescos',
    ],
  },
  {
    id: 'urgencia',
    nome: 'Urgência & Últimas Unidades',
    titulo: 'Últimas 15 unidades saindo da chapa agora!',
    preco: null,
    frases: [
      'Peça antes que esgote o lote de hoje',
      'Direto no seu iFood',
    ],
  },
];

const PRESETS = AD_PRESETS;

interface AdEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAdId?: string | null;
}

export function AdEditorModal({ open, onOpenChange, initialAdId }: AdEditorModalProps) {
  const { user } = useAuth();
  const { data: company } = useCompany();
  const { data: pratos = [] } = usePratos();
  const { data: ads = [] } = useAds();
  const saveAdMutation = useSaveAd();
  const deleteAdMutation = useDeleteAd();

  // Active Draft ID (if editing existing)
  const [currentAdId, setCurrentAdId] = useState<string | null>(null);

  // Simple Questionnaire State (All Optional)
  const [formato, setFormato] = useState<'9:16' | '1:1'>('9:16');
  const [pratoNome, setPratoNome] = useState('');
  const [titulo, setTitulo] = useState('');
  const [precoInput, setPrecoInput] = useState('');
  const [mostrarPreco, setMostrarPreco] = useState(true);
  const [frases, setFrases] = useState<AdPhrase[]>([]);
  const [logoPosicao, setLogoPosicao] = useState<'top-right' | 'top-left' | 'bottom-left' | 'bottom-right'>('top-right');
  const [mostrarLogo, setMostrarLogo] = useState(true);
  const [presetOrigem, setPresetOrigem] = useState<string | null>(null);

  // Metaprompt Output State
  const [promptResult, setPromptResult] = useState<AdMetapromptResult | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'tudo' | 'sistema' | 'comando'>('tudo');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDraftsList, setShowDraftsList] = useState(false);

  // Automatically select first dish name if available
  useEffect(() => {
    if (open && !pratoNome && pratos.length > 0) {
      setPratoNome(pratos[0]?.nome || '');
    }
  }, [open, pratos.length]);

  // Load initialAdId if provided
  useEffect(() => {
    if (initialAdId && ads.length > 0) {
      const found = ads.find((a) => a.id === initialAdId);
      if (found) {
        loadAdIntoState(found);
      }
    }
  }, [initialAdId, ads]);

  const loadAdIntoState = (ad: AdItem) => {
    setCurrentAdId(ad.id || null);
    setTitulo(ad.titulo || '');
    setPrecoInput(ad.preco !== null && ad.preco !== undefined ? ad.preco.toString().replace('.', ',') : '');
    setMostrarPreco(ad.mostrar_preco !== false);
    setFrases(Array.isArray(ad.frases) ? ad.frases : []);
    setFormato(ad.formato === '1:1' ? '1:1' : '9:16');
    setLogoPosicao(ad.logo_posicao || 'top-right');
    setMostrarLogo(ad.mostrar_logo !== false);
    setPresetOrigem(ad.preset_origem || null);
    setShowDraftsList(false);
    toast.success('Rascunho carregado com sucesso!');
  };

  const handleApplyPreset = (preset: AdPreset) => {
    setPresetOrigem(preset.nome);
    setTitulo(preset.titulo);
    setPrecoInput(preset.preco !== null ? preset.preco.toFixed(2).replace('.', ',') : '');
    setMostrarPreco(preset.preco !== null);
    setFrases(preset.frases.map((f, i) => ({ id: `p-${Date.now()}-${i}`, texto: f })));
    toast.success(`Preset "${preset.nome}" aplicado no questionário!`);
  };

  const handleClearAll = () => {
    setCurrentAdId(null);
    setTitulo('');
    setPrecoInput('');
    setMostrarPreco(true);
    setFrases([]);
    setPresetOrigem(null);
    setPromptResult(null);
    setEditedPrompt('');
    toast.info('Questionário limpo. Começando do zero.');
  };

  // Phrases Management
  const handleAddPhrase = () => {
    setFrases((prev) => [...prev, { id: `phrase-${Date.now()}-${Math.random()}`, texto: '' }]);
  };

  const handleUpdatePhrase = (id: string, text: string) => {
    setFrases((prev) => prev.map((f) => (f.id === id ? { ...f, texto: text } : f)));
  };

  const handleRemovePhrase = (id: string) => {
    setFrases((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMovePhrase = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= frases.length) return;
    const updated = [...frases];
    const temp = updated[index];
    const targetItem = updated[targetIndex];
    if (temp && targetItem) {
      updated[index] = targetItem;
      updated[targetIndex] = temp;
      setFrases(updated);
    }
  };

  // Dish helper
  const selectedPratoObj = pratos.find((p) => p.nome.toLowerCase() === pratoNome.toLowerCase());

  // Generate Ad Metaprompt
  const handleGenerateMetaprompt = () => {
    setIsGenerating(true);

    const parsedPreco = precoInput.trim()
      ? parseFloat(precoInput.replace(',', '.'))
      : null;

    setTimeout(() => {
      const res = buildAdImageMetaprompt({
        formato,
        pratoNome: pratoNome.trim() || null,
        pratoIngredientes: selectedPratoObj?.ingredientes || [],
        pratoFotoUrl: selectedPratoObj?.fotos?.[0]?.url || selectedPratoObj?.fotos?.[0]?.signed_url || selectedPratoObj?.fotos?.[0]?.storage_path || null,
        titulo: titulo.trim() || null,
        preco: Number.isFinite(parsedPreco) ? parsedPreco : null,
        mostrarPreco,
        frases,
        logoPosicao,
        mostrarLogo: Boolean(company?.logo_path && mostrarLogo),
        company: company || {},
      });

      setPromptResult(res);
      setEditedPrompt(res.completo);
      setIsGenerating(false);
      toast.success('Meta Prompt montado com sucesso! Pronto para forçar o ChatGPT a gerar a imagem.');
    }, 450);
  };

  // Save draft in Supabase
  const handleSaveDraft = async () => {
    if (!user?.id) {
      toast.error('Faça login para salvar anúncios.');
      return;
    }

    setSaving(true);
    try {
      const parsedPreco = precoInput.trim()
        ? parseFloat(precoInput.replace(',', '.'))
        : null;

      const adPayload: Partial<AdItem> = {
        titulo: titulo.trim() || null,
        preco: Number.isFinite(parsedPreco) ? parsedPreco : null,
        mostrar_preco: mostrarPreco,
        frases: frases.filter((f) => f.texto.trim().length > 0),
        formato,
        logo_posicao: logoPosicao,
        mostrar_logo: mostrarLogo,
        preset_origem: presetOrigem,
      };

      if (currentAdId) {
        adPayload.id = currentAdId;
      }

      const saved = await saveAdMutation.mutateAsync(adPayload);

      if (saved?.id) {
        setCurrentAdId(saved.id);
      }
      toast.success('Rascunho do anúncio salvo com sucesso no banco!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar rascunho.');
    } finally {
      setSaving(false);
    }
  };

  // Copy current tab text to clipboard
  const handleCopy = async () => {
    let textToCopy = editedPrompt;
    if (activeTab === 'sistema' && promptResult?.sistema) {
      textToCopy = promptResult.sistema;
    } else if (activeTab === 'comando' && promptResult) {
      textToCopy = `${promptResult.pedido}\n\n${promptResult.comandoImagem}`;
    }

    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      toast.success('Prompt copiado! Abra o ChatGPT e dê Ctrl+V para gerar a imagem.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Não foi possível copiar automaticamente.');
    }
  };

  // Open ChatGPT in a new tab with prompt copied
  const handleOpenChatGPT = async () => {
    await handleCopy();
    window.open('https://chatgpt.com', '_blank');
  };

  const hasLogo = Boolean(company?.logo_path);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border-white/10 bg-[#121212] p-0 text-white sm:rounded-3xl">
        <DialogHeader className="border-b border-white/10 bg-gradient-to-r from-[#1c1c1c] via-[#161616] to-[#121212] p-6 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EA1D2C]/40 bg-[#EA1D2C]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                <Sparkles className="h-3.5 w-3.5" />
                CRIADOR DE ANÚNCIO (METAPROMPT IA)
              </span>
              <DialogTitle className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Questionário do Anúncio
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs text-white/60">
                Responda às questões simples abaixo. O motor monta o System Prompt calibrado com a sua marca e força o ChatGPT a gerar a imagem do anúncio.
              </DialogDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDraftsList(!showDraftsList)}
                className="rounded-xl border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10"
              >
                <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                Rascunhos ({ads.length})
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="rounded-xl border-white/15 bg-white/5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Limpar
              </Button>

              <Button
                size="sm"
                onClick={handleSaveDraft}
                disabled={saving}
                className="rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
            </div>
          </div>

          {/* Lista de Rascunhos Salvos */}
          {showDraftsList && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/60 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">
                Seus Rascunhos Anteriores (Salvos no Supabase)
              </h4>
              {ads.length === 0 ? (
                <p className="mt-2 text-xs text-white/40">Nenhum rascunho salvo ainda.</p>
              ) : (
                <div className="mt-2 grid max-h-40 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  {ads.map((ad) => (
                    <div
                      key={ad.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs hover:border-[#EA1D2C]/40"
                    >
                      <button
                        type="button"
                        onClick={() => loadAdIntoState(ad)}
                        className="truncate text-left font-medium text-white hover:text-[#EA1D2C]"
                      >
                        {ad.titulo || 'Anúncio sem título'} ({ad.formato})
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (ad.id && confirm('Excluir este rascunho?')) {
                            await deleteAdMutation.mutateAsync(ad.id);
                            if (currentAdId === ad.id) setCurrentAdId(null);
                          }
                        }}
                        className="ml-2 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alerta caso a empresa não tenha logo */}
          {!hasLogo && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <span>
                  Sua empresa não possui logo cadastrada. O anúncio funcionará sem logo, mas você pode cadastrar a qualquer momento.
                </span>
              </div>
              <button
                type="button"
                onClick={() => openCompanyEditor('identidade')}
                className="shrink-0 font-bold underline hover:text-white"
              >
                Cadastrar Logo
              </button>
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-12">
          {/* LADO ESQUERDO: Questionário Simples (7 colunas) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Presets de Ponto de Partida */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Pontos de partida (Presets Opcionais)
                </label>
                {presetOrigem && (
                  <span className="text-[11px] text-emerald-400">
                    Preset ativo: <strong>{presetOrigem}</strong>
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-[#EA1D2C] hover:bg-[#EA1D2C]/10 hover:text-white"
                  >
                    {preset.nome}
                  </button>
                ))}
              </div>
            </div>

            {/* Questão 1: Formato */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                Questão 1
              </span>
              <h3 className="mt-1 text-sm font-bold text-white">Qual é o formato do anúncio?</h3>
              <p className="mt-0.5 text-xs text-white/50">
                A proporção é repassada com diretrizes de zonas seguras no prompt final.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormato('9:16')}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    formato === '9:16'
                      ? 'border-[#EA1D2C] bg-[#EA1D2C]/15 text-white'
                      : 'border-white/10 bg-black/30 text-white/70 hover:bg-white/5'
                  }`}
                >
                  <Smartphone className={`h-5 w-5 ${formato === '9:16' ? 'text-[#EA1D2C]' : ''}`} />
                  <div>
                    <strong className="block text-xs font-bold">Story / Reels (9:16)</strong>
                    <span className="text-[10px] text-white/40">1080 × 1920 px vertical</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormato('1:1')}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    formato === '1:1'
                      ? 'border-[#EA1D2C] bg-[#EA1D2C]/15 text-white'
                      : 'border-white/10 bg-black/30 text-white/70 hover:bg-white/5'
                  }`}
                >
                  <Square className={`h-5 w-5 ${formato === '1:1' ? 'text-[#EA1D2C]' : ''}`} />
                  <div>
                    <strong className="block text-xs font-bold">Feed / Post (1:1)</strong>
                    <span className="text-[10px] text-white/40">1080 × 1080 px quadrado</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Questão 2: Prato ou Tema */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                Questão 2
              </span>
              <h3 className="mt-1 text-sm font-bold text-white">Qual prato ou item você vai anunciar?</h3>
              <p className="mt-0.5 text-xs text-white/50">
                Escolha um prato cadastrado da sua loja ou digite o nome livremente.
              </p>
              <div className="mt-3 space-y-3">
                {pratos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pratos.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPratoNome(p.nome);
                          if (p.preco && !precoInput) {
                            setPrecoInput(p.preco.toFixed(2).replace('.', ','));
                          }
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          pratoNome.toLowerCase() === p.nome.toLowerCase()
                            ? 'border-[#EA1D2C] bg-[#EA1D2C]/20 text-white font-bold'
                            : 'border-white/10 bg-black/40 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {p.nome}
                      </button>
                    ))}
                  </div>
                )}
                <Input
                  value={pratoNome}
                  onChange={(e) => setPratoNome(e.target.value)}
                  placeholder="Ex: Smash Burger Cheddar Bacon ou Combo Almoço Executivo"
                  className="rounded-xl border-white/10 bg-black/40 text-sm text-white"
                />
              </div>
            </div>

            {/* Questão 3: Título 1 (Opcional) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                    Questão 3 (Opcional)
                  </span>
                  <h3 className="mt-0.5 text-sm font-bold text-white">Título 1 / Chamada de Impacto</h3>
                </div>
                <span className="text-[11px] text-white/40">
                  {titulo.length} caracteres (sem bloqueio)
                </span>
              </div>
              <p className="mt-1 text-xs text-white/50">
                Texto livre grafado na arte. Se deixar vazio, o foco fica 100% na foto do prato.
              </p>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: O sabor que conquista no primeiro pedaço"
                className="mt-3 rounded-xl border-white/10 bg-black/40 text-sm text-white"
              />
            </div>

            {/* Questão 4: Preço (Opcional) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                Questão 4 (Opcional)
              </span>
              <h3 className="mt-1 text-sm font-bold text-white">Preço no Anúncio</h3>
              <p className="mt-0.5 text-xs text-white/50">
                Quando preenchido, é embutido em um selo de preço com contraste nas cores da sua loja.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-white/40">R$</span>
                  <Input
                    value={precoInput}
                    onChange={(e) => setPrecoInput(e.target.value)}
                    placeholder="29,90 (deixe vazio se não quiser preço)"
                    className="rounded-xl border-white/10 bg-black/40 pl-9 text-sm text-white"
                  />
                </div>
                {precoInput.trim() && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={mostrarPreco}
                      onChange={(e) => setMostrarPreco(e.target.checked)}
                      className="rounded border-white/20 bg-black text-[#EA1D2C]"
                    />
                    Exibir selo de preço na arte
                  </label>
                )}
              </div>
            </div>

            {/* Questão 5: Frases / Destaques Independentes */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                    Questão 5 (Opcional)
                  </span>
                  <h3 className="mt-0.5 text-sm font-bold text-white">Frases de Apoio e Destaques</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPhrase}
                  className="rounded-xl border-white/15 bg-white/5 text-xs text-white hover:bg-white/10"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar Frase
                </Button>
              </div>
              <p className="mt-1 text-xs text-white/50">
                Blocos independentes para destacar queijo derretido, carne fresca, entrega rápida, etc.
              </p>

              {frases.length === 0 ? (
                <p className="mt-3 text-xs italic text-white/30">Nenhuma frase adicionada (começa com zero frases).</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {frases.map((frase, idx) => (
                    <div key={frase.id} className="flex items-center gap-2">
                      <span className="w-5 text-center text-xs font-mono text-white/40">{idx + 1}.</span>
                      <Input
                        value={frase.texto}
                        onChange={(e) => handleUpdatePhrase(frase.id, e.target.value)}
                        placeholder="Ex: Feito na brasa com carne 100% fresca"
                        className="rounded-xl border-white/10 bg-black/40 text-xs text-white"
                      />
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePhrase(idx, 'up')}
                          className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === frases.length - 1}
                          onClick={() => handleMovePhrase(idx, 'down')}
                          className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhrase(frase.id)}
                          className="rounded p-1 text-red-400/70 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Questão 6: Logo da Loja no Anúncio */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                Questão 6 (Opcional)
              </span>
              <h3 className="mt-1 text-sm font-bold text-white">Posição da Logo no Anúncio</h3>
              <p className="mt-0.5 text-xs text-white/50">
                A IA reserva o canto limpo e harmonioso sem distorcer o seu logotipo.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { id: 'top-right', label: 'Sup. Direito' },
                  { id: 'top-left', label: 'Sup. Esquerdo' },
                  { id: 'bottom-left', label: 'Inf. Esquerdo' },
                  { id: 'bottom-right', label: 'Inf. Direito' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => {
                      setLogoPosicao(pos.id as any);
                      setMostrarLogo(true);
                    }}
                    className={`rounded-xl border p-2 text-center text-xs font-semibold transition ${
                      mostrarLogo && logoPosicao === pos.id
                        ? 'border-[#EA1D2C] bg-[#EA1D2C]/20 text-white'
                        : 'border-white/10 bg-black/40 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={mostrarLogo}
                    onChange={(e) => setMostrarLogo(e.target.checked)}
                    className="rounded border-white/20 bg-black text-[#EA1D2C]"
                  />
                  Incluir reserva de logo no anúncio
                </label>
                {company?.nome && (
                  <span className="text-[11px] text-white/40">Marca: {company.nome}</span>
                )}
              </div>
            </div>

            {/* Botão de Disparo para Gerar Meta Prompt */}
            <Button
              type="button"
              onClick={handleGenerateMetaprompt}
              disabled={isGenerating}
              className="w-full rounded-2xl bg-gradient-to-r from-[#EA1D2C] to-[#ff3b4b] py-6 text-base font-black text-white shadow-xl shadow-[#EA1D2C]/30 hover:scale-[1.01] transition"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {isGenerating ? 'Compilando Meta Prompt...' : 'Gerar Meta Prompt do Anúncio (Forçar Imagem no ChatGPT)'}
            </Button>
          </div>

          {/* LADO DIREITO: Resultado do Meta Prompt e Ações de ChatGPT (5 colunas) */}
          <div className="flex flex-col space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Meta Prompt Calibrado
              </h3>
              {promptResult && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Pronto para o ChatGPT
                </span>
              )}
            </div>

            {promptResult ? (
              <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-black/50 p-4 shadow-inner">
                {/* Abas de Visualização */}
                <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white/5">
                    <TabsTrigger value="tudo" className="text-xs">
                      Completo
                    </TabsTrigger>
                    <TabsTrigger value="sistema" className="text-xs">
                      Sistema
                    </TabsTrigger>
                    <TabsTrigger value="comando" className="text-xs">
                      Comando DALL-E
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tudo" className="mt-3">
                    <Textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      rows={14}
                      className="font-mono text-xs leading-relaxed text-white/90 bg-black/40 border-white/10 rounded-xl"
                    />
                  </TabsContent>

                  <TabsContent value="sistema" className="mt-3">
                    <Textarea
                      readOnly
                      value={promptResult.sistema}
                      rows={14}
                      className="font-mono text-xs leading-relaxed text-white/90 bg-black/40 border-white/10 rounded-xl"
                    />
                  </TabsContent>

                  <TabsContent value="comando" className="mt-3">
                    <Textarea
                      readOnly
                      value={`${promptResult.pedido}\n\n${promptResult.comandoImagem}`}
                      rows={14}
                      className="font-mono text-xs leading-relaxed text-white/90 bg-black/40 border-white/10 rounded-xl"
                    />
                  </TabsContent>
                </Tabs>

                {/* Ações Rápidas */}
                <div className="mt-4 space-y-2.5">
                  <Button
                    type="button"
                    onClick={handleCopy}
                    className="w-full rounded-xl bg-white py-4 font-bold text-black hover:bg-white/90 shadow-md transition"
                  >
                    {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? 'Prompt Copiado!' : 'Copiar Meta Prompt Completo'}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleOpenChatGPT}
                    className="w-full rounded-xl bg-[#10a37f] py-4 font-bold text-white hover:bg-[#0e8e6e] shadow-lg shadow-[#10a37f]/20 transition"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Copiar e Abrir ChatGPT Agora
                  </Button>

                  <p className="text-center text-[11px] text-white/40">
                    Ao abrir o ChatGPT, cole com <strong>Ctrl+V</strong>. O prompt contém a diretriz imperativa para a IA gerar a imagem imediatamente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-white/50">
                <Sparkles className="mb-3 h-10 w-10 text-[#EA1D2C] opacity-70" />
                <h4 className="text-sm font-bold text-white">Nenhum prompt gerado ainda</h4>
                <p className="mt-1 text-xs text-white/50 max-w-xs">
                  Responda às questões simples ao lado e clique em <strong>"Gerar Meta Prompt do Anúncio"</strong>.
                </p>
                <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-left text-[11px] text-white/60 space-y-1">
                  <p className="font-semibold text-white">O que o motor faz:</p>
                  <p>✓ Injeta os dados da sua empresa e cores automaticamente</p>
                  <p>✓ Estrutura proporção 9:16 ou 1:1 e regras de zonas seguras</p>
                  <p>✓ Força o ChatGPT a criar a imagem do anúncio na primeira resposta</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
