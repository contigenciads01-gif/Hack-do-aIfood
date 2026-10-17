import { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Download,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Square,
  HelpCircle,
  Eye,
  EyeOff,
  Clock,
  Layers,
  Store,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useCompany } from '@/lib/data/company';
import { usePratos, type Prato } from '@/lib/data/pratos';
import { useAds, useSaveAd, useDeleteAd, type AdItem, type AdPhrase } from '@/lib/data/ads';
import { openCompanyEditor } from '@/lib/company-editor-state';
import { getSignedAssetUrl, isAcceptedImage } from '@/lib/data/storage';

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
  const { data: ads = [], isLoading: loadingAds } = useAds();
  const saveAdMutation = useSaveAd();
  const deleteAdMutation = useDeleteAd();

  // Active Draft ID (if editing existing)
  const [currentAdId, setCurrentAdId] = useState<string | null>(null);

  // Form Fields (All Optional)
  const [titulo, setTitulo] = useState('');
  const [precoInput, setPrecoInput] = useState('');
  const [mostrarPreco, setMostrarPreco] = useState(true);
  const [frases, setFrases] = useState<AdPhrase[]>([]);
  const [formato, setFormato] = useState<'9:16' | '1:1'>('9:16');
  const [imagemFundoUrl, setImagemFundoUrl] = useState<string | null>(null);
  const [logoPosicao, setLogoPosicao] = useState<'top-right' | 'top-left' | 'bottom-left' | 'bottom-right'>('top-right');
  const [mostrarLogo, setMostrarLogo] = useState(true);
  const [presetOrigem, setPresetOrigem] = useState<string | null>(null);

  // Resolved Logo URL for display
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string | null>(null);

  // Export / Save loading states
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDraftsList, setShowDraftsList] = useState(false);

  // Resolve company logo URL when company changes
  useEffect(() => {
    if (company?.logo_path) {
      if (
        company.logo_path.startsWith('http://') ||
        company.logo_path.startsWith('https://') ||
        company.logo_path.startsWith('data:') ||
        company.logo_path.startsWith('blob:')
      ) {
        setResolvedLogoUrl(company.logo_path);
      } else {
        getSignedAssetUrl(company.logo_path).then((url) => {
          if (url) setResolvedLogoUrl(url);
        });
      }
    } else {
      setResolvedLogoUrl(null);
    }
  }, [company?.logo_path]);

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
    setImagemFundoUrl(ad.imagem_fundo_url || null);
    setLogoPosicao(ad.logo_posicao || 'top-right');
    setMostrarLogo(ad.mostrar_logo !== false);
    setPresetOrigem(ad.preset_origem || null);
    setShowDraftsList(false);
  };

  const handleApplyPreset = (preset: AdPreset) => {
    setPresetOrigem(preset.nome);
    setTitulo(preset.titulo);
    setPrecoInput(preset.preco !== null ? preset.preco.toFixed(2).replace('.', ',') : '');
    setMostrarPreco(preset.preco !== null);
    setFrases(preset.frases.map((f, i) => ({ id: `p-${Date.now()}-${i}`, texto: f })));
    toast.success(`Preset "${preset.nome}" aplicado como ponto de partida!`);
  };

  const handleClearAll = () => {
    setCurrentAdId(null);
    setTitulo('');
    setPrecoInput('');
    setMostrarPreco(true);
    setFrases([]);
    setImagemFundoUrl(null);
    setPresetOrigem(null);
    toast.info('Editor limpo. Começando do zero.');
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
    const temp = updated[index]!;
    updated[index] = updated[targetIndex]!;
    updated[targetIndex] = temp;
    setFrases(updated);
  };

  // Save Ad Draft to Supabase
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
        imagem_fundo_url: imagemFundoUrl,
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
      toast.success('Rascunho de anúncio salvo no Supabase com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar rascunho de anúncio.');
    } finally {
      setSaving(false);
    }
  };

  // Export PNG via Canvas
  const handleExportPNG = async () => {
    setExporting(true);
    toast.loading('Gerando imagem PNG em alta resolução...', { id: 'export-ad-png' });

    try {
      const canvas = document.createElement('canvas');
      const isSquare = formato === '1:1';
      const width = isSquare ? 1080 : 1080;
      const height = isSquare ? 1080 : 1920;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível obter contexto do canvas');

      // 1. Draw Background: Image or Dark Gradient
      if (imagemFundoUrl) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            bgImg.onload = () => resolve();
            bgImg.onerror = () => reject(new Error('Falha ao carregar imagem'));
            bgImg.src = imagemFundoUrl;
          });

          // Draw image centered and cover
          const hRatio = width / bgImg.width;
          const vRatio = height / bgImg.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShiftX = (width - bgImg.width * ratio) / 2;
          const centerShiftY = (height - bgImg.height * ratio) / 2;
          ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, centerShiftX, centerShiftY, bgImg.width * ratio, bgImg.height * ratio);
        } catch {
          // Fallback to high-contrast restaurant gradient
          const grad = ctx.createLinearGradient(0, 0, 0, height);
          grad.addColorStop(0, '#1c0708');
          grad.addColorStop(0.5, '#120b0c');
          grad.addColorStop(1, '#060607');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
        }
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#1c0708');
        grad.addColorStop(0.5, '#140c0d');
        grad.addColorStop(1, '#070708');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. High-contrast gradient overlay so text is 100% legible
      const overlayGrad = ctx.createLinearGradient(0, 0, 0, height);
      overlayGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      overlayGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.2)');
      overlayGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
      overlayGrad.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw Brand Logo in chosen corner (Overlay layer, NEVER distorted)
      if (mostrarLogo && resolvedLogoUrl) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            logoImg.onload = () => resolve();
            logoImg.onerror = () => reject();
            logoImg.src = resolvedLogoUrl;
          });

          const logoSize = isSquare ? 110 : 130;
          let logoX = width - logoSize - 60;
          let logoY = 60;

          if (logoPosicao === 'top-left') {
            logoX = 60;
            logoY = 60;
          } else if (logoPosicao === 'top-right') {
            logoX = width - logoSize - 60;
            logoY = 60;
          } else if (logoPosicao === 'bottom-left') {
            logoX = 60;
            logoY = height - logoSize - 60;
          } else if (logoPosicao === 'bottom-right') {
            logoX = width - logoSize - 60;
            logoY = height - logoSize - 60;
          }

          // Soft backdrop badge for logo clarity
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.beginPath();
          ctx.roundRect(logoX - 12, logoY - 12, logoSize + 24, logoSize + 24, 24);
          ctx.fill();
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        } catch {
          // If logo fails to load in canvas, continue gracefully
        }
      }

      // 4. Draw Content Bottom Area (Title, Price, Phrases)
      const contentPadding = 70;
      let currentY = isSquare ? height * 0.46 : height * 0.52;

      // Price Badge (if present and visible)
      const parsedPreco = precoInput.trim() ? parseFloat(precoInput.replace(',', '.')) : null;
      if (mostrarPreco && parsedPreco !== null && Number.isFinite(parsedPreco)) {
        const priceStr = `R$ ${parsedPreco.toFixed(2).replace('.', ',')}`;
        ctx.font = 'bold 44px sans-serif';
        const priceMetrics = ctx.measureText(priceStr);
        const badgeWidth = priceMetrics.width + 50;
        const badgeHeight = 70;

        ctx.fillStyle = '#EA1D2C';
        ctx.beginPath();
        ctx.roundRect(contentPadding, currentY, badgeWidth, badgeHeight, 18);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(priceStr, contentPadding + 25, currentY + 49);
        currentY += badgeHeight + 30;
      }

      // Title 1 (if present)
      if (titulo.trim()) {
        ctx.fillStyle = '#FFFFFF';
        const titleFontSize = isSquare ? 56 : 64;
        ctx.font = `900 ${titleFontSize}px sans-serif`;

        // Wrap text
        const maxWidth = width - contentPadding * 2;
        const words = titulo.trim().split(' ');
        let line = '';
        const lines: string[] = [];

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        lines.forEach((l) => {
          ctx.fillText(l.trim(), contentPadding, currentY);
          currentY += titleFontSize * 1.25;
        });
        currentY += 20;
      }

      // Phrase blocks
      const validPhrases = frases.filter((f) => f.texto.trim().length > 0);
      if (validPhrases.length > 0) {
        const phraseFontSize = isSquare ? 32 : 36;
        ctx.font = `600 ${phraseFontSize}px sans-serif`;

        validPhrases.forEach((p) => {
          const phraseText = `✓  ${p.texto.trim()}`;
          const metrics = ctx.measureText(phraseText);
          const pWidth = Math.min(metrics.width + 44, width - contentPadding * 2);
          const pHeight = 56;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.roundRect(contentPadding, currentY, pWidth, pHeight, 14);
          ctx.fill();

          ctx.fillStyle = '#F4F4F5';
          ctx.fillText(phraseText, contentPadding + 20, currentY + 39);
          currentY += pHeight + 16;
        });
      }

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Erro ao exportar blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anuncio-${formato.replace(':', 'x')}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Imagem do anúncio exportada com sucesso!', { id: 'export-ad-png' });
        setExporting(false);
      }, 'image/png');
    } catch (err: any) {
      toast.error('Erro ao exportar imagem do anúncio.', { id: 'export-ad-png' });
      setExporting(false);
    }
  };

  // Select dish photo as background
  const handleSelectDishPhoto = (prato: Prato) => {
    const photos = prato.prato_fotos || prato.fotos || [];
    const cover = photos[0];
    const photoUrl = cover?.signed_url || cover?.storage_path;
    if (photoUrl) {
      setImagemFundoUrl(photoUrl);
      toast.success(`Foto do prato "${prato.nome}" definida como fundo!`);
    } else {
      toast.warning(`O prato "${prato.nome}" não possui fotos cadastradas.`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1300px] w-[95vw] h-[92vh] p-0 overflow-hidden bg-[#0d0d0f] border-white/15 text-white flex flex-col rounded-3xl shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#141416]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#EA1D2C]/20 border border-[#EA1D2C]/30 flex items-center justify-center text-[#EA1D2C]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Editor Livre de Anúncios
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Totalmente Opcional
                </span>
              </h2>
              <p className="text-xs text-white/50">
                Monte seu anúncio com total liberdade. Cada campo é opcional e você vê o resultado na hora.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDraftsList(!showDraftsList)}
              className="text-xs border-white/15 bg-white/5 text-white/80 hover:bg-white/10 rounded-xl"
            >
              <Clock className="h-3.5 w-3.5 mr-1" />
              {showDraftsList ? 'Voltar ao Editor' : `Meus Rascunhos (${ads.length})`}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saving}
              className="text-xs border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {saving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleExportPNG}
              disabled={exporting}
              className="text-xs bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-bold rounded-xl shadow-lg shadow-[#EA1D2C]/25"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {exporting ? 'Exportando...' : 'Exportar PNG'}
            </Button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-xl border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Presets Toolbar (Ponto de partida, nunca obrigação) */}
        <div className="border-b border-white/10 px-6 py-2.5 bg-black/40 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 shrink-0">
            Modelos de Início:
          </span>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 font-medium shrink-0 cursor-pointer"
          >
            Do Zero (Limpar)
          </button>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/10 font-medium shrink-0 cursor-pointer transition"
            >
              {p.nome}
            </button>
          ))}
        </div>

        {/* Main Body */}
        {showDraftsList ? (
          // Saved Drafts View
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">
              Rascunhos salvos no Supabase
            </h3>
            {ads.length === 0 ? (
              <div className="text-center py-16 space-y-3 border border-white/10 rounded-2xl bg-white/[0.02]">
                <Layers className="h-10 w-10 text-white/30 mx-auto" />
                <p className="text-sm text-white/60">Você ainda não tem nenhum anúncio salvo.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-3 hover:border-white/20 transition flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span>Formato: {ad.formato}</span>
                        {ad.criado_em && (
                          <span>{new Date(ad.criado_em).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-2">
                        {ad.titulo || 'Anúncio sem título'}
                      </h4>
                      {ad.preco !== null && ad.preco !== undefined && ad.mostrar_preco && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                          R$ {ad.preco.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <p className="text-xs text-white/60">
                        {ad.frases?.length || 0} frase(s) configurada(s)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => loadAdIntoState(ad)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-xs rounded-xl"
                      >
                        Carregar no Editor
                      </Button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (ad.id) {
                            await deleteAdMutation.mutateAsync(ad.id);
                            toast.success('Rascunho excluído.');
                          }
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Two-Column Editor & Live Real-Time Preview
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] overflow-hidden">
            {/* LEFT COLUMN: Controls & Form */}
            <div className="p-6 overflow-y-auto space-y-6 border-r border-white/10">
              {/* Formato Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/60 block">
                  1. Formato do Anúncio
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormato('9:16')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      formato === '9:16'
                        ? 'border-[#EA1D2C] bg-[#EA1D2C]/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Smartphone className="h-5 w-5 text-[#EA1D2C]" />
                    <div>
                      <p className="text-xs font-bold">Vertical (9:16)</p>
                      <span className="text-[10px] text-white/50">Stories, Reels, TikTok</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormato('1:1')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      formato === '1:1'
                        ? 'border-[#EA1D2C] bg-[#EA1D2C]/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Square className="h-5 w-5 text-[#EA1D2C]" />
                    <div>
                      <p className="text-xs font-bold">Quadrado (1:1)</p>
                      <span className="text-[10px] text-white/50">Feed Instagram & Posts</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Título 1 (Opcional, texto livre) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                    2. Título 1 (Opcional)
                  </label>
                  <span className="text-[11px] text-white/40">
                    {titulo.length} caracteres
                    {titulo.length > 60 && (
                      <span className="text-amber-400 ml-1.5">(dica: até 60 para leitura rápida)</span>
                    )}
                  </span>
                </div>
                <textarea
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex.: O sabor artesanal que você só encontra aqui"
                  rows={2}
                  className="w-full rounded-2xl border border-white/15 bg-black/50 p-3 text-sm text-white placeholder:text-white/30 focus:border-[#EA1D2C] focus:outline-hidden"
                />
              </div>

              {/* Preço (Opcional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                    3. Preço da Oferta (Opcional)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={mostrarPreco}
                      onChange={(e) => setMostrarPreco(e.target.checked)}
                      className="rounded border-white/20 accent-[#EA1D2C]"
                    />
                    <span>Exibir no anúncio</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-white/40 font-bold">
                    R$
                  </span>
                  <input
                    type="text"
                    value={precoInput}
                    onChange={(e) => setPrecoInput(e.target.value)}
                    placeholder="29,90"
                    className="w-full rounded-2xl border border-white/15 bg-black/50 p-3 pl-10 text-sm text-white placeholder:text-white/30 focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Frases Dinâmicas (Blocos independentes) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-white/60 block">
                      4. Frases e Diferenciais
                    </label>
                    <span className="text-[11px] text-white/40">
                      Blocos independentes para destacar ingredientes, entrega e benefícios.
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddPhrase}
                    className="text-xs rounded-xl border-white/20 bg-white/5 hover:bg-white/10"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Adicionar frase
                  </Button>
                </div>

                {frases.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.01] text-center space-y-2">
                    <p className="text-xs text-white/40">
                      Nenhuma frase adicionada. Clique em "Adicionar frase" ou use um modelo acima.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {frases.map((phrase, idx) => (
                      <div
                        key={phrase.id}
                        className="flex items-center gap-2 p-2 rounded-2xl border border-white/10 bg-black/40"
                      >
                        <span className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white/50 shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={phrase.texto}
                          onChange={(e) => handleUpdatePhrase(phrase.id, e.target.value)}
                          placeholder="Ex.: Carne 100% fresca e queijo no ponto"
                          className="flex-1 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => handleMovePhrase(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePhrase(idx, 'down')}
                          disabled={idx === frases.length - 1}
                          className="p-1 text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhrase(phrase.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Imagem de Fundo (Pratos ou Referências) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                    5. Imagem de Fundo
                  </label>
                  {imagemFundoUrl && (
                    <button
                      type="button"
                      onClick={() => setImagemFundoUrl(null)}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Remover foto (usar degradê)
                    </button>
                  )}
                </div>

                {pratos.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-white/40">Escolher foto dos seus pratos cadastrados:</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {pratos.map((p) => {
                        const photos = p.prato_fotos || p.fotos || [];
                        const cover = photos[0];
                        const url = cover?.signed_url || cover?.storage_path;
                        if (!url) return null;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectDishPhoto(p)}
                            className="relative h-14 w-14 rounded-xl overflow-hidden border border-white/20 shrink-0 hover:scale-105 transition cursor-pointer"
                          >
                            <img src={url} alt={p.nome} className="h-full w-full object-cover" />
                            <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[8px] text-white truncate px-1">
                              {p.nome}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload or Direct URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imagemFundoUrl || ''}
                    onChange={(e) => setImagemFundoUrl(e.target.value)}
                    placeholder="Ou cole o link direto de uma imagem de prato/fundo..."
                    className="flex-1 rounded-2xl border border-white/15 bg-black/50 p-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                  <label className="px-3 py-2.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-white font-semibold cursor-pointer shrink-0">
                    <ImageIcon className="h-4 w-4 inline mr-1" />
                    Arquivo
                    <input
                      type="file"
                      accept="image/*,.png,.jpg,.jpeg,.webp"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && isAcceptedImage(file)) {
                          const preview = URL.createObjectURL(file);
                          setImagemFundoUrl(preview);
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Logo da Empresa no Canto */}
              <div className="space-y-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    6. Logo da Loja no Canto
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={mostrarLogo}
                      onChange={(e) => setMostrarLogo(e.target.checked)}
                      className="rounded border-white/20 accent-[#EA1D2C]"
                    />
                    <span>Ativar logo</span>
                  </label>
                </div>

                {!company?.tem_logo || !resolvedLogoUrl ? (
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Sua loja ainda não tem logo cadastrado.</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openCompanyEditor('identidade')}
                      className="text-xs border-amber-500/40 text-amber-200 hover:bg-amber-500/20 rounded-xl"
                    >
                      Cadastrar na Minha Empresa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-[11px] text-white/50">Posição da logo no anúncio:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'top-right', label: 'Superior Direito' },
                        { key: 'top-left', label: 'Superior Esquerdo' },
                        { key: 'bottom-left', label: 'Inferior Esquerdo' },
                        { key: 'bottom-right', label: 'Inferior Direito' },
                      ].map((pos) => (
                        <button
                          key={pos.key}
                          type="button"
                          onClick={() => setLogoPosicao(pos.key as any)}
                          className={`p-2 rounded-xl border text-[11px] font-semibold text-center transition cursor-pointer ${
                            logoPosicao === pos.key
                              ? 'border-[#EA1D2C] bg-[#EA1D2C]/15 text-white'
                              : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Live Real-Time Visual Preview */}
            <div className="p-6 bg-black/70 flex flex-col items-center justify-center overflow-y-auto">
              <div className="w-full max-w-[420px] flex flex-col items-center gap-3">
                <div className="flex items-center justify-between w-full text-xs text-white/60">
                  <span className="font-bold flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-emerald-400" />
                    Preview em Tempo Real ({formato})
                  </span>
                  <span className="text-[11px] text-white/40">Fiel ao que será baixado em PNG</span>
                </div>

                {/* The Visual Ad Card Container */}
                <div
                  className={`w-full relative overflow-hidden rounded-3xl border border-white/20 shadow-2xl flex flex-col justify-end p-6 transition-all duration-300 ${
                    formato === '9:16' ? 'aspect-[9/16] max-h-[620px]' : 'aspect-square max-h-[460px]'
                  }`}
                  style={{
                    background: imagemFundoUrl
                      ? `url(${imagemFundoUrl}) center/cover no-repeat`
                      : 'linear-gradient(180deg, #1f0709 0%, #120b0c 50%, #060607 100%)',
                  }}
                >
                  {/* Contrast Legibility Gradient Layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                  {/* Overlaid Logo in Chosen Corner (Separate layer, never distorted) */}
                  {mostrarLogo && resolvedLogoUrl && (
                    <div
                      className={`absolute z-20 ${
                        logoPosicao === 'top-left'
                          ? 'top-4 left-4'
                          : logoPosicao === 'top-right'
                            ? 'top-4 right-4'
                            : logoPosicao === 'bottom-left'
                              ? 'bottom-4 left-4'
                              : 'bottom-4 right-4'
                      }`}
                    >
                      <div className="h-12 w-12 rounded-2xl bg-black/50 border border-white/20 p-1 backdrop-blur-md shadow-lg flex items-center justify-center overflow-hidden">
                        <img src={resolvedLogoUrl} alt="Logo" className="h-full w-full object-contain" />
                      </div>
                    </div>
                  )}

                  {/* Foreground Content */}
                  <div className="relative z-10 space-y-3">
                    {/* Price Badge */}
                    {mostrarPreco && precoInput.trim() && (
                      <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-[#EA1D2C] text-white font-black text-sm shadow-lg shadow-[#EA1D2C]/40 animate-fade-in">
                        R$ {precoInput.trim()}
                      </div>
                    )}

                    {/* Title 1 */}
                    {titulo.trim() && (
                      <h3
                        className={`font-black text-white tracking-tight leading-tight drop-shadow-md ${
                          formato === '9:16' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                        }`}
                      >
                        {titulo}
                      </h3>
                    )}

                    {/* Phrases Blocks */}
                    {frases.filter((f) => f.texto.trim().length > 0).length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {frases
                          .filter((f) => f.texto.trim().length > 0)
                          .map((f) => (
                            <div
                              key={f.id}
                              className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
                            >
                              <Check className="h-3 w-3 text-[#EA1D2C] shrink-0" />
                              <span className="truncate">{f.texto}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Empty helper if user hasn't typed anything yet */}
                    {!titulo.trim() && !precoInput.trim() && frases.length === 0 && (
                      <div className="text-center py-8 text-white/40 space-y-1">
                        <p className="text-xs font-medium">Anúncio em branco</p>
                        <span className="text-[10px]">Digite um título ou selecione um modelo para começar.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Quick CTA button to export */}
                <Button
                  type="button"
                  onClick={handleExportPNG}
                  disabled={exporting}
                  className="w-full bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-bold py-2.5 rounded-2xl shadow-xl shadow-[#EA1D2C]/20 text-xs"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? 'Exportando PNG...' : `Baixar Anúncio em PNG (${formato})`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
