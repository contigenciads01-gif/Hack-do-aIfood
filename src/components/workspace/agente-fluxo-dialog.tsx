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
  Lightbulb,
  FileText,
  Layers,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { AGENTE_FLUXOS, type AgenteFluxo, type AgentePasso } from '@/data/agente-fluxos';
import { useSpeech, matchKeywordsToOptions } from '@/lib/speech';
import { usePratos } from '@/lib/data/pratos';
import { useCompany } from '@/lib/data/company';
import { useSaveMaterial } from '@/lib/data/materials';
import { buildPromptBlueprint, type PromptBlueprintResult } from '@/data/prompt-blueprint';
import {
  getStepHelp,
  getOptionPreviewPhrase,
  getFluxoDeliverables,
  getFluxoReadyExample,
  calculateBriefingQuality,
} from '@/data/agente-guias';
import { AnimatedBrain } from '@/components/brand/AnimatedBrain';

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

  // Prompt building states (Etapa 1 + 2)
  const [isBuildingPrompt, setIsBuildingPrompt] = useState(false);
  const [buildSuccess, setBuildSuccess] = useState(false);
  const [blueprintResult, setBlueprintResult] = useState<PromptBlueprintResult | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null);
  const [isPromptSaved, setIsPromptSaved] = useState(false);

  // Result Tabs (Etapa 3)
  const [activeResultTab, setActiveResultTab] = useState<'tudo' | 'sistema' | 'pedido'>('tudo');
  const [copiedTab, setCopiedTab] = useState<'tudo' | 'sistema' | 'pedido' | null>(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);

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

  // Selected dish helper
  const selectedDishName =
    answers['nome_prato'] || answers['prato_ou_tema'] || answers['prato'] || '';
  const selectedPrato = useMemo(() => {
    if (!selectedDishName) return pratos[0] || null;
    return (
      pratos.find(
        (p) => p.nome.toLowerCase() === String(selectedDishName).toLowerCase(),
      ) || null
    );
  }, [pratos, selectedDishName]);

  // Load draft or initialize when opening
  useEffect(() => {
    if (open && fluxo) {
      setIsSummaryView(false);
      setGeneratedPrompt(null);
      setEditedPrompt(null);
      setBlueprintResult(null);
      setIsPromptSaved(false);
      setShowVoiceCard(true);
      setActiveResultTab('tudo');

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

  // Answered count for quality
  const answeredCount = fluxo.passos.filter((p) => {
    const val = answers[p.variavel];
    return val !== undefined && val !== null && val !== '';
  }).length;

  const hasRealPhoto = Boolean(
    (selectedPrato?.fotos && selectedPrato.fotos.length > 0) ||
      (selectedPrato?.prato_fotos && selectedPrato.prato_fotos.length > 0),
  );

  const quality = calculateBriefingQuality(
    answers,
    totalSteps,
    answeredCount,
    hasRealPhoto,
    spokenDetails,
  );

  // Deliverables list for summary view
  const deliverables = getFluxoDeliverables(fluxo.id);

  // Handle voice transcript application
  const applyTranscript = () => {
    if (!transcript.trim()) return;
    const spoken = transcript.trim();
    setSpokenDetails((prev) => (prev ? `${prev}. ${spoken}` : spoken));

    const autoMatches = matchKeywordsToOptions(spoken, fluxo.passos);
    if (Object.keys(autoMatches).length > 0) {
      setAnswers((prev) => ({ ...prev, ...autoMatches }));
      toast.success(
        `${Object.keys(autoMatches).length} opções foram marcadas automaticamente com sua fala!`,
      );
    } else {
      toast.info('Detalhe adicionado ao prompt com sucesso!');
    }
    setTranscript('');
    stopListening();
  };

  // Load Ready Example ("Ver exemplo pronto")
  const handleLoadReadyExample = () => {
    const ready = getFluxoReadyExample(fluxo.id);
    if (!ready) {
      toast.info('Exemplo já preparado.');
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      ...ready.answers,
    }));
    if (ready.spokenDetails) {
      setSpokenDetails(ready.spokenDetails);
    }
    setIsSummaryView(true);
    toast.success(`Exemplo "${ready.tituloExemplo}" carregado! Confira e toque em Gerar prompt.`);
  };

  // "Surpreenda-me" auto fill
  const handleSurpriseMe = () => {
    const autoFilled: Record<string, any> = { ...answers };
    fluxo.passos.forEach((passo) => {
      if (passo.opcoes && passo.opcoes.length > 0) {
        const chosen = passo.opcoes[0];
        if (chosen) {
          autoFilled[passo.variavel] = chosen.valorPrompt || chosen.rotulo;
        }
      } else if (passo.tipo === 'prato' && pratos.length > 0) {
        autoFilled[passo.variavel] = pratos[0]?.nome;
      }
    });

    setAnswers(autoFilled);
    setIsSummaryView(true);
    toast.success('Opções recomendadas preenchidas! Confira o resumo antes de gerar.');
  };

  // Restart flow
  const handleRestart = () => {
    if (confirm('Deseja reiniciar todas as respostas deste assistente?')) {
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
      setBlueprintResult(null);
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

  // Generate prompt with 900ms build delay and AnimatedBrain
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

    // Start 900ms building animation
    setIsBuildingPrompt(true);

    setTimeout(() => {
      const blueprint = buildPromptBlueprint({
        toolId: fluxo.id,
        company: company || {},
        answers,
        prato: selectedPrato,
        spokenDetails,
      });

      setBlueprintResult(blueprint);
      setGeneratedPrompt(blueprint.completo);
      setEditedPrompt(blueprint.completo);
      setIsBuildingPrompt(false);
      setBuildSuccess(true);
      setIsSummaryView(false);

      if (draftKey) localStorage.removeItem(draftKey);
      toast.success('Prompt pronto com sucesso!');

      setTimeout(() => {
        setBuildSuccess(false);
      }, 2200);
    }, 900);
  };

  // Save to materials
  const handleSaveToMaterials = async () => {
    const textToSave = editedPrompt || generatedPrompt;
    if (!textToSave) return;

    try {
      await saveMaterialMutation.mutateAsync({
        title: `${fluxo.titulo} — ${selectedDishName || (company && company.nome) || 'Loja'}`,
        text: textToSave,
        template: fluxo.toolId,
        tool: fluxo.id,
        tipo: 'prompt',
        prato_id: selectedPrato?.id || null,
        original: null,
        summary: [],
      });

      setIsPromptSaved(true);
      toast.success('Prompt salvo com sucesso na pasta do prato em "Meus materiais"!');
    } catch {
      toast.error('Não foi possível salvar em materiais.');
    }
  };

  // Copy to clipboard per active tab
  const handleCopyTab = async (tab: 'tudo' | 'sistema' | 'pedido') => {
    let textToCopy = '';
    if (tab === 'tudo') {
      textToCopy = editedPrompt || generatedPrompt || '';
    } else if (tab === 'sistema') {
      textToCopy = blueprintResult?.sistema || '';
    } else if (tab === 'pedido') {
      textToCopy = `${blueprintResult?.pedido || ''}\n\n${blueprintResult?.entregavel || ''}`.trim();
    }

    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedTab(tab);
      const label =
        tab === 'sistema'
          ? 'Instruções de Sistema copiadas!'
          : tab === 'pedido'
            ? 'Pedido da Tarefa copiado!'
            : 'Prompt completo copiado!';
      toast.success(`${label} Cole no ChatGPT com Ctrl+V.`);
      setTimeout(() => setCopiedTab(null), 3000);
    } catch {
      toast.error('Erro ao copiar.');
    }
  };

  // Download photo if available
  const handleDownloadPhotos = () => {
    const photos = selectedPrato?.fotos || selectedPrato?.prato_fotos || [];
    if (photos.length === 0) {
      toast.info('Esse prato ainda não tem fotos salvas. Você pode tirar fotos no Agente.');
      return;
    }

    const photoUrl = photos[0]?.url || photos[0]?.signed_url;
    if (photoUrl) {
      const a = document.createElement('a');
      a.href = photoUrl;
      a.download = `${selectedPrato?.nome || 'prato'}-foto-1.jpg`;
      a.target = '_blank';
      a.click();
      toast.success('Baixando foto de referência para você anexar no ChatGPT!');
    }
  };

  // Current step help guide
  const currentHelp = currentStep ? getStepHelp(fluxo.id, currentStep.id) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="border-white/15 bg-[#121214] text-white p-0 overflow-hidden sm:max-w-3xl w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-3xl relative"
      >
        {/* ═══════ 900MS PROMPT BUILDING OVERLAY WITH ANIMATED BRAIN ═══════ */}
        {isBuildingPrompt && (
          <div className="absolute inset-0 z-50 bg-[#0f0f11]/92 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <AnimatedBrain size={64} isHovered={true} className="mb-4" />
            <h3 className="text-xl font-black text-white tracking-wide">
              Montando seu prompt...
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-relaxed">
              Combinando o perfil da sua loja, regras inegociáveis de conversão e formato rigoroso de
              entrega.
            </p>
          </div>
        )}

        {/* ═══════ TOP HEADER ═══════ */}
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
                {buildSuccess && (
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30 flex items-center gap-1 animate-in zoom-in-95">
                    <Check className="h-3 w-3" />
                    Prompt montado!
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
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadReadyExample}
                  className="hidden md:flex h-8 text-xs font-semibold rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 gap-1.5 border border-white/10"
                  title="Carrega um caso real de sucesso pronto para ver como funciona"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  Ver exemplo pronto
                </Button>

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
              </>
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

        {/* ═══════ MEDIDOR DE QUALIDADE DO BRIEFING (5 BARRAS) ═══════ */}
        {!generatedPrompt && (
          <div className="border-b border-white/10 bg-[#141416] px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400">Qualidade do briefing:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((seg) => (
                  <div
                    key={seg}
                    className={`h-2 w-5 sm:w-6 rounded-xs transition-all duration-300 ${
                      seg <= quality.score
                        ? quality.score >= 5
                          ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50'
                          : quality.score >= 3
                            ? 'bg-[#EA1D2C]'
                            : 'bg-amber-400'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <span
                className={`font-black text-[11px] uppercase tracking-wider ${
                  quality.score >= 5
                    ? 'text-emerald-400'
                    : quality.score >= 3
                      ? 'text-white'
                      : 'text-amber-400'
                }`}
              >
                {quality.label}
              </span>
            </div>

            <span className="text-[11px] text-zinc-400 truncate max-w-md">
              <strong className="text-zinc-300">Falta:</strong> {quality.advice}
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ═══════ RESULT VIEW: PROMPT PRONTO EM 3 ABAS ═══════ */}
          {generatedPrompt && blueprintResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Ready Header */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold">
                    <Check className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white">
                      Seu prompt foi montado com sucesso!
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Dividimos o prompt em partes limpas para você obter o melhor resultado no
                      ChatGPT.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExplanationModal(true)}
                  className="rounded-xl border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold gap-1 shrink-0"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  O que é isso?
                </Button>
              </div>

              {/* 3 Tabs Selection */}
              <div className="flex rounded-2xl border border-white/10 bg-[#161618] p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveResultTab('sistema')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    activeResultTab === 'sistema'
                      ? 'bg-[#EA1D2C] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  1. Instruções (cole uma vez)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab('pedido')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    activeResultTab === 'pedido'
                      ? 'bg-[#EA1D2C] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  2. Pedido (cole a cada tarefa)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveResultTab('tudo')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    activeResultTab === 'tudo'
                      ? 'bg-[#EA1D2C] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Tudo junto
                </button>
              </div>

              {/* Tab Explanation Banner */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-300 flex items-center justify-between gap-3">
                <span>
                  {activeResultTab === 'sistema' && (
                    <>
                      💡 <strong>Dica de ouro:</strong> Salve este bloco no{' '}
                      <em>Custom Instructions</em> do ChatGPT. Você só precisa colar isso uma vez na
                      vida!
                    </>
                  )}
                  {activeResultTab === 'pedido' && (
                    <>
                      🎯 <strong>Apenas a tarefa de hoje:</strong> Cole este bloco a cada novo
                      anúncio ou prato que quiser produzir.
                    </>
                  )}
                  {activeResultTab === 'tudo' && (
                    <>
                      📦 <strong>Prompt Completo Tradicional:</strong> Contém instruções, regras da
                      marca e pedido estruturado para colar direto.
                    </>
                  )}
                </span>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleCopyTab(activeResultTab)}
                  className="rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs h-8 px-3 shrink-0 gap-1.5"
                >
                  {copiedTab === activeResultTab ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedTab === activeResultTab ? 'Copiado!' : 'Copiar esta aba'}
                </Button>
              </div>

              {/* Active Tab Text Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-zinc-400">
                    {activeResultTab === 'sistema'
                      ? 'Bloco 1: Instruções de Sistema e Regras da Marca'
                      : activeResultTab === 'pedido'
                        ? 'Bloco 2: Pedido da Tarefa e Entregável Esperado'
                        : 'Prompt Completo (XML Estruturado)'}
                  </span>
                  {activeResultTab === 'tudo' && editedPrompt !== generatedPrompt && (
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
                  readOnly={activeResultTab !== 'tudo'}
                  value={
                    activeResultTab === 'sistema'
                      ? blueprintResult.sistema
                      : activeResultTab === 'pedido'
                        ? `${blueprintResult.pedido}\n\n${blueprintResult.entregavel}`
                        : editedPrompt || generatedPrompt || ''
                  }
                  onChange={(e) => {
                    if (activeResultTab === 'tudo') setEditedPrompt(e.target.value);
                  }}
                  rows={9}
                  className="w-full rounded-2xl border border-white/15 bg-black/60 p-4 text-xs font-mono text-zinc-200 focus:border-[#EA1D2C] focus:outline-hidden leading-relaxed resize-y"
                />
              </div>

              {/* 3-Step ChatGPT Action Card */}
              <div className="rounded-2xl border border-white/10 bg-[#18181a] p-5 space-y-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#EA1D2C]">
                  Levar para o ChatGPT (3 passos)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Step 1: Copy Tab */}
                  <Button
                    type="button"
                    onClick={() => handleCopyTab(activeResultTab)}
                    className="h-14 rounded-2xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white text-xs font-bold gap-2 justify-center shadow-lg shadow-[#EA1D2C]/20"
                  >
                    {copiedTab === activeResultTab ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedTab === activeResultTab ? 'Copiado!' : '1. Copiar prompt'}
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

              {/* ═══════ "O QUE VOCÊ VAI RECEBER" CARD (ETAPA 3) ═══════ */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161618] to-black/60 p-5 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#EA1D2C]">
                  O que você vai receber:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {deliverables.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-zinc-300">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
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
              {/* Optional Voice Card: "Prefere falar?" */}
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
                </div>
              )}

              {/* Step Question Header with Help (?) Popover */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                    Passo {currentStepIndex + 1} de {totalSteps}
                  </span>

                  {/* HELP (?) POPOVER (ETAPA 3) */}
                  {currentHelp && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/20 transition-colors"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          <span>Dica da pergunta</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        className="w-80 p-4 rounded-2xl bg-[#161618] border border-white/15 text-white space-y-3 shadow-2xl z-50"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                            Para que serve isso?
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {currentHelp.paraQue}
                          </p>
                        </div>
                        <div className="space-y-1 border-t border-white/10 pt-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                            Exemplo bom:
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {currentHelp.exemploBom}
                          </p>
                        </div>
                        <div className="space-y-1 border-t border-white/10 pt-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                            Evite:
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {currentHelp.evite}
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

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
                        Nenhum prato cadastrado ainda. Digite o nome do prato:
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
                            toast.success('Texto colado!');
                          }
                        } catch {
                          toast.error('Permissão negada.');
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
                /* Choice options (single or multiple) with HOVER PREVIEW PHRASE */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentStep?.opcoes?.map((opt) => {
                    const isSelected =
                      currentStep.tipo === 'multipla'
                        ? Array.isArray(answers[currentStep.variavel]) &&
                          answers[currentStep.variavel].includes(opt.valorPrompt || opt.rotulo)
                        : (answers[currentStep.variavel] === opt.valorPrompt ||
                           answers[currentStep.variavel] === opt.rotulo);

                    const previewPhrase = getOptionPreviewPhrase(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onMouseEnter={() => setHoveredOptionId(opt.id)}
                        onMouseLeave={() => setHoveredOptionId(null)}
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
                        className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'border-[#EA1D2C] bg-[#EA1D2C]/10 text-white shadow-md'
                            : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 w-full">
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
                        </div>

                        {/* HOVER / TOUCH PHRASE PREVIEW (ETAPA 3) */}
                        {previewPhrase && (
                          <div
                            className={`pt-1 text-[11px] text-amber-300/90 italic transition-opacity ${
                              hoveredOptionId === opt.id || isSelected ? 'opacity-100' : 'opacity-70'
                            }`}
                          >
                            {previewPhrase}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══════ BOTTOM ACTIONS BAR ═══════ */}
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

        {/* ═══════ "O QUE É ISSO?" EXPLANATION MODAL (ETAPA 3) ═══════ */}
        {showExplanationModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#18181b] border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#EA1D2C]">
                  Arquitetura de Prompt
                </span>
                <button
                  type="button"
                  onClick={() => setShowExplanationModal(false)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-lg font-black text-white">
                Por que dividir o prompt melhora a IA em 10x?
              </h3>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                <p>
                  <strong>1. Instruções de Sistema (Cole uma vez):</strong> Defina a identidade,
                  cores e regras da sua marca direto no <em>Custom Instructions</em> do ChatGPT. A
                  IA nunca mais esquece quem você é.
                </p>
                <p>
                  <strong>2. Pedido da Tarefa (Cole a cada prato):</strong> Cada vez que for postar,
                  você só cola o pedido específico com os ingredientes do dia. Isso economiza tempo
                  e evita repetições desnecessárias.
                </p>
                <p>
                  <strong>3. Respostas 100% fiéis e sem enrolação:</strong> A IA foca diretamente no
                  entregável que você precisa, sem alucinar ingredientes e sem usar clichês batidos.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setShowExplanationModal(false)}
                className="w-full h-11 rounded-xl bg-[#EA1D2C] text-white text-xs font-bold hover:bg-[#ff3b4b]"
              >
                Entendi, voltar ao prompt
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
