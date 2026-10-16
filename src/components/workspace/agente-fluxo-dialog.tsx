import { useState, useEffect, useMemo } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Mic,
  MicOff,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Edit2,
  FolderPlus,
  AlertCircle,
  HelpCircle,
  UtensilsCrossed,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AGENTE_FLUXOS, type AgenteFluxo, type AgentePasso } from '@/data/agente-fluxos';
import { useSpeech, matchKeywordsToOptions } from '@/lib/speech';
import { usePratos } from '@/lib/data/pratos';
import { useCompany } from '@/lib/data/company';
import { useSaveMaterial } from '@/lib/data/materials';
import { buildMetaprompt } from '@/lib/metaprompt';

interface AgenteFluxoDialogProps {
  fluxoId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenFotoStudio?: (pratoId?: string) => void;
}

export function AgenteFluxoDialog({
  fluxoId,
  open,
  onOpenChange,
  onOpenFotoStudio,
}: AgenteFluxoDialogProps) {
  const fluxo = fluxoId ? AGENTE_FLUXOS[fluxoId] : null;
  const { data: company } = useCompany();
  const { data: pratos = [] } = usePratos();
  const saveMaterialMutation = useSaveMaterial();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [spokenDetails, setSpokenDetails] = useState('');
  const [showVoiceCard, setShowVoiceCard] = useState(true);
  const [isSummaryView, setIsSummaryView] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);
  const [isPromptSaved, setIsPromptSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Web Speech API
  const {
    supported: speechSupported,
    isListening,
    transcript,
    setTranscript,
    error: speechError,
    toggleListening,
    stopListening,
  } = useSpeech();

  const draftKey = fluxo ? `hdi_agente_draft_${fluxo.id}` : '';

  // Load draft or initialize when opening
  useEffect(() => {
    if (open && fluxo) {
      setIsSummaryView(false);
      setGeneratedPrompt(null);
      setEditedPrompt(null);
      setIsPromptSaved(false);
      setShowVoiceCard(true);

      const savedDraft = draftKey ? localStorage.getItem(draftKey) : null;
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setAnswers(parsed.answers || {});
          setSpokenDetails(parsed.spokenDetails || '');
          setCurrentStepIndex(parsed.stepIndex || 0);
          return;
        } catch {}
      }

      // Default answers
      const defaults: Record<string, any> = {};
      fluxo.passos.forEach((p) => {
        if (p.valorPadrao !== undefined) {
          defaults[p.variavel] = p.valorPadrao;
        }
      });
      const firstDish = pratos[0];
      if (firstDish && !defaults['nome_prato'] && !defaults['prato_ou_tema'] && !defaults['prato']) {
        defaults['nome_prato'] = firstDish.nome;
        defaults['prato_ou_tema'] = firstDish.nome;
        defaults['prato'] = firstDish.nome;
      }
      setAnswers(defaults);
      setCurrentStepIndex(0);
    } else {
      stopListening();
    }
  }, [open, fluxoId, pratos.length]);

  // Persist draft on change
  useEffect(() => {
    if (open && draftKey && !generatedPrompt) {
      try {
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            answers,
            spokenDetails,
            stepIndex: currentStepIndex,
          }),
        );
      } catch {}
    }
  }, [open, draftKey, answers, spokenDetails, currentStepIndex, generatedPrompt]);

  if (!fluxo) return null;

  const totalSteps = fluxo.passos.length;
  const currentStep: AgentePasso | undefined = fluxo.passos[currentStepIndex];
  const progressPercent = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 100;

  // Handle voice transcript application
  const applyTranscript = () => {
    if (!transcript.trim()) return;
    const spoken = transcript.trim();
    setSpokenDetails((prev) => (prev ? `${prev}. ${spoken}` : spoken));

    // Match keywords to auto-select options
    const autoMatches = matchKeywordsToOptions(spoken, fluxo.passos);
    if (Object.keys(autoMatches).length > 0) {
      setAnswers((prev) => ({ ...prev, ...autoMatches }));
      toast.success(
        `Opções correspondentes à sua fala foram pré-selecionadas!`,
        { duration: 4000 },
      );
    } else {
      toast.info('Texto falado adicionado aos detalhes do pedido.');
    }
    setTranscript('');
    stopListening();
    setShowVoiceCard(false);
  };

  // Auto-fill all with "Surpreenda-me"
  const handleSurpriseMe = () => {
    const filled: Record<string, any> = { ...answers };
    fluxo.passos.forEach((p) => {
      if (!filled[p.variavel]) {
        if (p.valorPadrao !== undefined) {
          filled[p.variavel] = p.valorPadrao;
        } else if (p.opcoes && p.opcoes[0]) {
          filled[p.variavel] = p.opcoes[0].valorPrompt || p.opcoes[0].rotulo;
        } else if (p.tipo === 'prato' && pratos[0]) {
          filled[p.variavel] = pratos[0].nome;
        }
      }
    });
    setAnswers(filled);
    setIsSummaryView(true);
    toast.success('Opções recomendadas preenchidas automaticamente!');
  };

  // Reset draft
  const handleRestart = () => {
    if (confirm('Deseja recomeçar este fluxo do início?')) {
      if (draftKey) localStorage.removeItem(draftKey);
      const defaults: Record<string, any> = {};
      fluxo.passos.forEach((p) => {
        if (p.valorPadrao !== undefined) defaults[p.variavel] = p.valorPadrao;
      });
      const firstDish = pratos[0];
      if (firstDish) {
        defaults['nome_prato'] = firstDish.nome;
        defaults['prato_ou_tema'] = firstDish.nome;
        defaults['prato'] = firstDish.nome;
      }
      setAnswers(defaults);
      setSpokenDetails('');
      setCurrentStepIndex(0);
      setIsSummaryView(false);
      setGeneratedPrompt(null);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep?.obrigatorio && !answers[currentStep.variavel]) {
      toast.warning('Escolha uma opção antes de avançar ou toque em Pular se disponível.');
      return;
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsSummaryView(true);
    }
  };

  const handlePrev = () => {
    if (isSummaryView) {
      setIsSummaryView(false);
      return;
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      onOpenChange(false);
    }
  };

  // Generate prompt
  const handleGeneratePrompt = () => {
    // Validate required fields
    const missing = fluxo.passos.filter(
      (p) => p.obrigatorio && !answers[p.variavel],
    );

    const firstMissing = missing[0];
    if (firstMissing) {
      toast.error(`Falta preencher: ${firstMissing.pergunta}`);
      const missingIndex = fluxo.passos.findIndex((p) => p.id === firstMissing.id);
      if (missingIndex !== -1) {
        setIsSummaryView(false);
        setCurrentStepIndex(missingIndex);
      }
      return;
    }

    const payload: Record<string, any> = {
      ...answers,
    };

    if (spokenDetails.trim()) {
      payload['detalhes_falados'] = spokenDetails.trim();
    }

    // Company profile fallback values
    const companyPayload: Record<string, any> = {
      nome_loja: company?.nome || 'Minha Loja',
      categoria: company?.categoria || 'Restaurante e Delivery',
      cidade: company?.cidade || '',
      whatsapp: company?.whatsapp || '',
      instagram: company?.instagram || '',
      horario: company?.horario || '',
      slogan: company?.slogan || '',
      personalidade: company?.personalidade || 'Acolhedora e profissional',
      tom: answers['tom'] || company?.tom || 'Apetitoso e direto',
      publico: company?.publico?.join(', ') || 'Clientes locais apaixonados por boa comida',
      diferenciais: company?.diferenciais?.join(', ') || 'Ingredientes selecionados e feitos na hora',
      cores_marca: company?.cores?.join(', ') || '#EA1D2C',
    };

    // If step was numeric promo
    if (answers['preco_atual'] && typeof answers['preco_atual'] === 'object') {
      payload['preco_atual'] = answers['preco_atual'].preco || '39.90';
      payload['custo'] = answers['preco_atual'].custo || '15.00';
      payload['comissao'] = answers['preco_atual'].comissao || '23';
    }

    const result = buildMetaprompt(fluxo.toolId, payload, companyPayload);
    setGeneratedPrompt(result.text);
    setEditedPrompt(result.text);
    setIsSummaryView(false);

    // Clean draft now that it's finalized
    if (draftKey) localStorage.removeItem(draftKey);
    toast.success('Prompt pronto com sucesso!');
  };

  // Save to materials
  const handleSaveToMaterials = async () => {
    const textToSave = editedPrompt || generatedPrompt;
    if (!textToSave) return;

    try {
      const selectedDishName =
        answers['nome_prato'] || answers['prato_ou_tema'] || answers['prato'];
      const matchedDish = pratos.find(
        (p) => p.nome.toLowerCase() === String(selectedDishName || '').toLowerCase(),
      );

      await saveMaterialMutation.mutateAsync({
        title: `${fluxo.titulo} — ${selectedDishName || company?.nome || 'Loja'}`,
        text: textToSave,
        template: fluxo.toolId,
        tool: fluxo.id,
        tipo: 'prompt',
        prato_id: matchedDish?.id || null,
        original: null,
        summary: [],
      });

      setIsPromptSaved(true);
      toast.success('Prompt salvo com sucesso na pasta do prato em "Meus materiais"!');
    } catch (e: any) {
      toast.error('Não foi possível salvar em materiais.');
    }
  };

  // Copy to clipboard
  const handleCopyPrompt = async () => {
    const text = editedPrompt || generatedPrompt;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Prompt copiado! Abra o ChatGPT e cole com Ctrl+V.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar.');
    }
  };

  // Download photo if available
  const handleDownloadPhotos = () => {
    const selectedDishName =
      answers['nome_prato'] || answers['prato_ou_tema'] || answers['prato'];
    const matchedDish = pratos.find(
      (p) => p.nome.toLowerCase() === String(selectedDishName || '').toLowerCase(),
    );

    const photos = matchedDish?.fotos || matchedDish?.prato_fotos || [];
    if (photos.length === 0) {
      toast.info('Esse prato ainda não tem fotos salvas. Você pode tirar fotos no Agente.');
      return;
    }

    const photoUrl = photos[0]?.url || photos[0]?.signed_url;
    if (photoUrl) {
      const a = document.createElement('a');
      a.href = photoUrl;
      a.download = `${matchedDish?.nome || 'prato'}-foto-1.jpg`;
      a.target = '_blank';
      a.click();
      toast.success('Baixando foto de referência para você anexar no ChatGPT!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/15 bg-[#121214] text-white p-0 overflow-hidden sm:max-w-3xl w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-3xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-[#161618] shrink-0">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              className="h-9 w-9 p-0 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#EA1D2C]">
                  {fluxo.titulo}
                </span>
                {fluxo.isPlus && (
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300 border border-amber-500/30">
                    PLUS
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-[240px] sm:max-w-md">
                {generatedPrompt
                  ? 'Prompt pronto para o ChatGPT'
                  : isSummaryView
                    ? 'Resumo das suas escolhas'
                    : currentStep?.pergunta}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!generatedPrompt && !isSummaryView && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSurpriseMe}
                className="hidden sm:flex h-8 text-xs font-semibold rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-1.5"
                title="Preenche as opções recomendadas automaticamente"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Surpreenda-me
              </Button>
            )}

            {!generatedPrompt && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                className="h-8 w-8 p-0 rounded-xl text-white/40 hover:text-white"
                title="Recomeçar do início"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 p-0 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Bar (when answering steps) */}
        {!generatedPrompt && !isSummaryView && (
          <div className="w-full bg-white/5 h-1.5">
            <div
              className="bg-[#EA1D2C] h-1.5 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ═══════ RESULT VIEW: PROMPT PRONTO ═══════ */}
          {generatedPrompt ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Ready Header */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold">
                  <Check className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white">
                    Seu prompt foi montado com sucesso!
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Copie o prompt abaixo e cole no ChatGPT para receber as criações profissionais
                    com a identidade e as regras de fidelidade da sua loja.
                  </p>
                </div>
              </div>

              {/* Editable Text Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-zinc-400">
                    Texto do Prompt
                  </span>
                  {editedPrompt !== generatedPrompt && (
                    <button
                      type="button"
                      onClick={() => setEditedPrompt(generatedPrompt)}
                      className="text-[#EA1D2C] hover:underline font-semibold"
                    >
                      Restaurar original
                    </button>
                  )}
                </div>
                <textarea
                  value={editedPrompt || ''}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-white/15 bg-black/60 p-4 text-xs font-mono text-zinc-200 focus:border-[#EA1D2C] focus:outline-hidden leading-relaxed resize-y"
                />
              </div>

              {/* 3-Step ChatGPT Action Card */}
              <div className="rounded-2xl border border-white/10 bg-[#18181a] p-5 space-y-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#EA1D2C]">
                  Levar para o ChatGPT (3 passos)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1: Copy */}
                  <Button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="h-14 rounded-2xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white text-xs font-bold gap-2 justify-center shadow-lg shadow-[#EA1D2C]/20"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copiado!' : '1. Copiar prompt'}
                  </Button>

                  {/* Step 2: Photos */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadPhotos}
                    className="h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 text-xs font-semibold gap-2 justify-center"
                  >
                    <UtensilsCrossed className="h-4 w-4 text-[#EA1D2C]" />
                    2. Baixar foto do prato
                  </Button>

                  {/* Step 3: Open ChatGPT */}
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 text-xs font-semibold gap-2 justify-center"
                  >
                    <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      3. Abrir o ChatGPT
                    </a>
                  </Button>
                </div>
              </div>

              {/* Save Material Action */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveToMaterials}
                  disabled={isPromptSaved || saveMaterialMutation.isPending}
                  className="rounded-xl border-white/20 text-xs font-semibold h-11 text-zinc-300 hover:text-white"
                >
                  <FolderPlus className="mr-2 h-4 w-4 text-[#EA1D2C]" />
                  {isPromptSaved ? 'Salvo em Meus Materiais ✓' : 'Salvar na pasta do prato'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl text-xs text-zinc-400 hover:text-white"
                >
                  Concluir e fechar
                </Button>
              </div>
            </div>
          ) : isSummaryView ? (
            /* ═══════ SUMMARY VIEW ═══════ */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Confira suas escolhas</h3>
                <p className="text-xs text-zinc-400">
                  Você pode editar qualquer resposta antes de gerar o prompt oficial.
                </p>
              </div>

              {/* Review Rows */}
              <div className="rounded-2xl border border-white/10 bg-[#161618] divide-y divide-white/10 overflow-hidden">
                {fluxo.passos.map((p, idx) => {
                  const val = answers[p.variavel];
                  let displayVal = 'Não informado';
                  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                    displayVal = `Preço: R$ ${val.preco || '-'} · Custo: R$ ${val.custo || '-'}`;
                  } else if (Array.isArray(val)) {
                    displayVal = val.length > 0 ? val.join(', ') : 'Nenhum selecionado';
                  } else if (val) {
                    displayVal = String(val);
                  }

                  return (
                    <div
                      key={p.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-[11px] font-semibold text-zinc-400 block">
                          {p.pergunta}
                        </span>
                        <p className="text-sm font-bold text-white truncate">{displayVal}</p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsSummaryView(false);
                          setCurrentStepIndex(idx);
                        }}
                        className="h-8 px-2.5 rounded-xl text-xs font-semibold text-[#EA1D2C] hover:bg-[#EA1D2C]/10 shrink-0 gap-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                    </div>
                  );
                })}

                {spokenDetails && (
                  <div className="p-4 flex items-center justify-between gap-4 bg-[#EA1D2C]/5">
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[11px] font-semibold text-rose-300 block">
                        Detalhes ditos por voz
                      </span>
                      <p className="text-xs text-zinc-200 line-clamp-2 italic">
                        "{spokenDetails}"
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSpokenDetails('')}
                      className="h-8 px-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 shrink-0"
                    >
                      Limpar
                    </Button>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleGeneratePrompt}
                  className="w-full h-14 rounded-2xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white text-base font-black shadow-xl shadow-[#EA1D2C]/20 gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Gerar prompt
                </Button>
              </div>
            </div>
          ) : (
            /* ═══════ STEP BY STEP QUESTION VIEW ═══════ */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Optional Voice Card: "Prefere falar?" at top of first step or when triggered */}
              {showVoiceCard && (
                <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-black/80 to-[#18181a] p-4 sm:p-5 relative overflow-hidden space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#EA1D2C]">
                        Sem digitar
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">Prefere falar?</h4>
                      <p className="text-xs text-zinc-400">
                        Toque no microfone e diga como quer seu anúncio. As opções serão marcadas
                        automaticamente.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowVoiceCard(false)}
                      className="text-zinc-500 hover:text-white p-1"
                      aria-label="Dispensar sugestão de voz"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {speechSupported ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      {/* 72px Rounded Square Mic Button (SEM CÍRCULO) */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`h-[72px] w-[72px] shrink-0 rounded-2xl flex flex-col items-center justify-center transition-all ${
                          isListening
                            ? 'bg-[#EA1D2C] text-white animate-pulse border-2 border-white ring-4 ring-[#EA1D2C]/40'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-95'
                        }`}
                        aria-label={isListening ? 'Parar gravação' : 'Iniciar microfone'}
                      >
                        {isListening ? (
                          <MicOff className="h-6 w-6" />
                        ) : (
                          <Mic className="h-6 w-6 text-[#EA1D2C]" />
                        )}
                        <span className="text-[10px] font-black uppercase mt-1">
                          {isListening ? 'Ouvindo...' : 'Falar'}
                        </span>
                      </button>

                      {/* Live Transcript Box */}
                      <div className="flex-1 w-full rounded-2xl border border-white/10 bg-black/40 p-3 min-h-[72px] flex flex-col justify-between">
                        <p className="text-xs text-zinc-300 italic">
                          {transcript
                            ? `"${transcript}"`
                            : isListening
                              ? 'Fale agora: "Quero um anúncio de hambúrguer para sexta no iFood com 20% de desconto..."'
                              : 'Toque em Falar para ditar o que deseja...'}
                        </p>

                        {transcript && (
                          <div className="flex justify-end pt-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={applyTranscript}
                              className="h-7 px-3 rounded-lg bg-[#EA1D2C] text-xs font-bold text-white hover:bg-[#ff3b4b]"
                            >
                              Usar transcrição
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      Seu navegador não suporta voz; escolha as opções abaixo.
                    </p>
                  )}

                  {speechError && (
                    <p className="text-xs text-rose-400 font-medium">{speechError}</p>
                  )}

                  <p className="text-[10px] text-zinc-500 leading-tight">
                    Aviso: O reconhecimento de voz é feito pelo navegador e pode usar serviços do
                    fabricante.
                  </p>
                </div>
              )}

              {/* Step Question Header */}
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  Passo {currentStepIndex + 1} de {totalSteps}
                </span>
                <h3 className="text-xl font-black text-white">{currentStep?.pergunta}</h3>
                {currentStep?.subtitulo && (
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {currentStep.subtitulo}
                  </p>
                )}
                {currentStep?.aviso && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center gap-2.5 text-xs text-amber-200 mt-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>{currentStep.aviso}</span>
                  </div>
                )}
              </div>

              {/* ═══════ OPTION CARDS (MIN HEIGHT 72PX, NO CIRCLES) ═══════ */}
              {currentStep?.tipo === 'prato' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* "Divulgar a loja toda" choice if applicable */}
                    {fluxo.id === 'anuncio_instagram' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            [currentStep.variavel]: 'Divulgar a loja toda',
                          }));
                        }}
                        className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          answers[currentStep.variavel] === 'Divulgar a loja toda'
                            ? 'border-[#EA1D2C] bg-[#EA1D2C]/10 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div>
                          <span className="text-sm font-bold block text-white">
                            Divulgar a loja toda
                          </span>
                          <span className="text-xs text-zinc-400">
                            Apresentar cardápio geral e diferenciais da casa
                          </span>
                        </div>
                        {answers[currentStep.variavel] === 'Divulgar a loja toda' && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EA1D2C] text-white">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    )}

                    {/* Real dishes from database/local */}
                    {pratos.map((p) => {
                      const isSelected = answers[currentStep.variavel] === p.nome;
                      const photoCount = (p.fotos || p.prato_fotos || []).length;

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setAnswers((prev) => ({
                              ...prev,
                              [currentStep.variavel]: p.nome,
                            }));
                          }}
                          className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#EA1D2C] bg-[#EA1D2C]/10 text-white'
                              : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-sm font-bold block text-white truncate">
                              {p.nome}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {photoCount} fotos na pasta
                            </span>
                          </div>

                          {isSelected && (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#EA1D2C] text-white">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {pratos.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 text-center space-y-3">
                      <p className="text-xs text-zinc-400">
                        Nenhum prato cadastrado ainda. Cadastre um nome rápido:
                      </p>
                      <input
                        type="text"
                        placeholder="Ex: Smash Burger Artesanal"
                        value={answers[currentStep.variavel] || ''}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [currentStep.variavel]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                      />
                    </div>
                  )}
                </div>
              ) : currentStep?.tipo === 'estrelas' ? (
                /* Star ratings in large rectangular buttons */
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {['1', '2', '3', '4', '5'].map((starVal) => {
                    const isSelected = String(answers[currentStep.variavel]) === starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            [currentStep.variavel]: starVal,
                          }));
                        }}
                        className={`h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'border-[#EA1D2C] bg-[#EA1D2C]/15 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className="text-lg font-black text-white">{starVal}</span>
                        <div className="flex">
                          {Array.from({ length: Number(starVal) }).map((_, i) => (
                            <span key={i} className="text-amber-400 text-xs">
                              ★
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : currentStep?.tipo === 'fala' ? (
                /* Text with Voice / Clipboard Paste Support */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">
                      Digite, cole do clipboard ou use o microfone:
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            setAnswers((prev) => ({
                              ...prev,
                              [currentStep.variavel]: text,
                            }));
                            toast.success('Texto colado da área de transferência!');
                          }
                        } catch {
                          toast.error('Permissão de colar negada.');
                        }
                      }}
                      className="h-8 text-xs rounded-xl border-white/20 text-white"
                    >
                      Colar texto
                    </Button>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={5}
                      placeholder={currentStep.placeholder || 'Descreva aqui os detalhes...'}
                      value={answers[currentStep.variavel] || ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentStep.variavel]: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-white/15 bg-black/60 p-4 text-sm text-white placeholder-zinc-500 focus:border-[#EA1D2C] focus:outline-hidden resize-none pr-16"
                    />

                    {speechSupported && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`absolute right-3 bottom-4 h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                          isListening
                            ? 'bg-[#EA1D2C] text-white animate-pulse'
                            : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                        }`}
                        title="Falar este campo"
                      >
                        <Mic className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : currentStep?.tipo === 'passos_numericos' ? (
                /* Numeric calculations */
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Preço de venda atual (R$)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={answers[currentStep.variavel]?.preco || '39.90'}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentStep.variavel]: {
                            ...(prev[currentStep.variavel] || {}),
                            preco: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-xl font-black rounded-xl border border-white/15 bg-black/50 p-3 text-white focus:border-[#EA1D2C] focus:outline-hidden"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Custo do insumo/prato (R$)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={answers[currentStep.variavel]?.custo || '15.00'}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentStep.variavel]: {
                            ...(prev[currentStep.variavel] || {}),
                            custo: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-xl font-black rounded-xl border border-white/15 bg-black/50 p-3 text-white focus:border-[#EA1D2C] focus:outline-hidden"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                    <label className="text-xs font-semibold text-zinc-300 block">
                      Taxa/Comissão iFood (%)
                    </label>
                    <input
                      type="number"
                      value={answers[currentStep.variavel]?.comissao || '23'}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentStep.variavel]: {
                            ...(prev[currentStep.variavel] || {}),
                            comissao: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-xl font-black rounded-xl border border-white/15 bg-black/50 p-3 text-white focus:border-[#EA1D2C] focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                /* Choice options (single or multiple) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentStep?.opcoes?.map((opt) => {
                    const isSelected =
                      currentStep.tipo === 'multipla'
                        ? Array.isArray(answers[currentStep.variavel]) &&
                          answers[currentStep.variavel].includes(opt.valorPrompt || opt.rotulo)
                        : (answers[currentStep.variavel] === opt.valorPrompt ||
                           answers[currentStep.variavel] === opt.rotulo);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (currentStep.tipo === 'multipla') {
                            const currentList = Array.isArray(answers[currentStep.variavel])
                              ? [...answers[currentStep.variavel]]
                              : [];
                            const val = opt.valorPrompt || opt.rotulo;
                            const nextList = currentList.includes(val)
                              ? currentList.filter((item) => item !== val)
                              : [...currentList, val];
                            setAnswers((prev) => ({
                              ...prev,
                              [currentStep.variavel]: nextList,
                            }));
                          } else {
                            setAnswers((prev) => ({
                              ...prev,
                              [currentStep.variavel]: opt.valorPrompt || opt.rotulo,
                            }));
                          }
                        }}
                        className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#EA1D2C] bg-[#EA1D2C]/10 text-white'
                            : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 pr-2">
                          <span className="text-sm font-bold block text-white leading-snug">
                            {opt.rotulo}
                          </span>
                          {opt.descricao && (
                            <span className="text-xs text-zinc-400 block leading-tight">
                              {opt.descricao}
                            </span>
                          )}
                        </div>

                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-[#EA1D2C] border-[#EA1D2C] text-white'
                              : 'border-white/20 bg-transparent text-transparent'
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar (Single Primary Button & Nav) */}
        {!generatedPrompt && (
          <div className="border-t border-white/10 p-4 bg-[#161618] flex items-center justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              className="h-12 px-4 rounded-xl border-white/20 text-xs font-semibold text-white hover:bg-white/10"
            >
              {isSummaryView ? 'Voltar' : currentStepIndex === 0 ? 'Cancelar' : 'Voltar'}
            </Button>

            <div className="flex items-center gap-2">
              {!isSummaryView && !currentStep?.obrigatorio && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleNext}
                  className="h-12 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Pular
                </Button>
              )}

              {isSummaryView ? (
                <Button
                  type="button"
                  onClick={handleGeneratePrompt}
                  className="h-12 px-6 rounded-xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white text-xs font-black shadow-lg shadow-[#EA1D2C]/20 gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Gerar prompt
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-12 px-6 rounded-xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white text-xs font-bold gap-2"
                >
                  {currentStepIndex === totalSteps - 1 ? 'Ver resumo' : 'Avançar'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
