import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Camera,
  Upload,
  RefreshCw,
  Trash2,
  Check,
  Sparkles,
  ArrowRight,
  FolderOpen,
  FileText,
  ImagePlus,
  Plus,
  Store,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import {
  usePratos,
  useCreatePrato,
  useSavePratoFoto,
  useDeletePratoFoto,
  validatePhotoSlot,
  validatePratoNome,
  safeTrim,
  loadLocalPratos,
  type Prato,
  type PratoFoto,
} from '@/lib/data/pratos';
import { PlanGate } from '@/components/workspace/plan-gate';

export function FotoStudio({ initialPratoId }: { initialPratoId?: string } = {}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: pratos = [], isLoading: loadingPratos } = usePratos();
  const createPratoMutation = useCreatePrato();
  const saveFotoMutation = useSavePratoFoto();
  const deleteFotoMutation = useDeletePratoFoto();

  // Step 1: Prato Selection / Creation
  const [selectedPratoId, setSelectedPratoId] = useState<string>('');
  const [newPratoNome, setNewPratoNome] = useState<string>('');
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Active camera modal state
  const [cameraActive, setCameraActive] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<1 | 2 | 3>(1);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [optimisticFotos, setOptimisticFotos] = useState<Record<number, string>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File inputs
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);
  const fallbackCameraRef = useRef<HTMLInputElement>(null);

  // Look up prato from React Query or fallback to local storage
  const selectedPrato =
    pratos.find((p) => p.id === selectedPratoId) ||
    loadLocalPratos(user?.id).find((p) => p.id === selectedPratoId);

  // Initial prato check (from prop, sessionStorage or first available)
  useEffect(() => {
    const targetId = initialPratoId || sessionStorage.getItem('hdi_target_prato_id');
    if (targetId) {
      sessionStorage.removeItem('hdi_target_prato_id');
      setSelectedPratoId(targetId);
      setStep(2);
    } else if (!selectedPratoId && pratos.length > 0) {
      setSelectedPratoId(pratos[0]?.id || '');
    }
  }, [initialPratoId, pratos, selectedPratoId]);

  const attachStreamToVideo = (el: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!el || !stream) return;
    try {
      el.muted = true;
      el.defaultMuted = true;
      el.setAttribute('playsinline', 'true');
      el.setAttribute('webkit-playsinline', 'true');
      el.setAttribute('autoplay', 'true');
      el.playsInline = true;
      el.autoplay = true;

      if (el.srcObject !== stream) {
        el.srcObject = stream;
      }

      const markReady = () => {
        setVideoReady(true);
        setCameraLoading(false);
      };

      const triggerPlay = () => {
        el.play()
          .then(() => {
            if (el.videoWidth > 0 && el.videoHeight > 0) {
              markReady();
            }
          })
          .catch((err) => {
            console.warn('Playback error / blocked by browser:', err);
          });
      };

      el.onloadedmetadata = () => {
        triggerPlay();
        if (el.videoWidth > 0) markReady();
      };
      el.oncanplay = triggerPlay;
      el.onplaying = markReady;
      el.ontimeupdate = () => {
        if (el.videoWidth > 0) markReady();
      };
      triggerPlay();
    } catch (e) {
      console.warn('Error attaching stream to video element:', e);
    }
  };

  // Connect stream to video element when active and mounted
  useEffect(() => {
    if (cameraActive && activeStream && videoRef.current) {
      attachStreamToVideo(videoRef.current, activeStream);
    }
  }, [cameraActive, activeStream]);

  // Stop camera tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNew = safeTrim(newPratoNome);

    if (trimmedNew) {
      const validation = validatePratoNome(trimmedNew, pratos);
      if (!validation.valid) {
        setStep1Error(validation.error || 'Nome inválido');
        return;
      }
      setStep1Error(null);

      try {
        const created = await createPratoMutation.mutateAsync({
          nome: validation.trimmed,
        });
        setSelectedPratoId(created.id);
        setNewPratoNome('');
        setStep(2);
        toast.success(`Prato "${created.nome}" selecionado!`);
      } catch (err: any) {
        setStep1Error(err.message || 'Erro ao criar prato.');
      }
    } else if (selectedPratoId) {
      setStep1Error(null);
      setStep(2);
    } else {
      setStep1Error('Escolha um prato ou digite um novo nome.');
    }
  };

  // ─── Camera streaming & capture ───
  const startCamera = async (slot: 1 | 2 | 3, facing: 'environment' | 'user' = cameraFacing) => {
    setActiveSlot(slot);
    setCameraError(null);
    setCameraLoading(true);
    setVideoReady(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const hasMediaDevices =
      typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

    if (!hasMediaDevices) {
      setCameraLoading(false);
      toast.info('Câmera direta indisponível neste navegador. Usando captura do aparelho.');
      fallbackCameraRef.current?.click();
      return;
    }

    try {
      let stream: MediaStream | null = null;
      // 1. Try specified facing mode with ideal high resolution
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err1) {
        console.warn('Attempt 1 failed, trying facingMode alone:', err1);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing },
            audio: false,
          });
        } catch (err2) {
          console.warn('Attempt 2 failed, falling back to any camera:', err2);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      if (!stream) {
        throw new Error('Não foi possível obter o fluxo de vídeo da câmera.');
      }

      streamRef.current = stream;
      setActiveStream(stream);
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraLoading(false);
      setCameraActive(false);

      let message = 'Não foi possível acessar a câmera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Permita o acesso à câmera para continuar';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'Nenhuma câmera encontrada no seu aparelho.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'A câmera está em uso por outro aplicativo.';
      } else if (err.name === 'SecurityError') {
        message = 'O acesso à câmera requer conexão segura (HTTPS).';
      }

      toast.error(message);
      setCameraError(message);
    }
  };

  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    await startCamera(activeSlot, nextFacing);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActiveStream(null);
    setCameraActive(false);
    setVideoReady(false);
    setCameraLoading(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !selectedPratoId) return;

    try {
      const video = videoRef.current;
      const vw = video.videoWidth || 0;
      const vh = video.videoHeight || 0;

      if (vw === 0 || vh === 0) {
        toast.warning('Aguarde a imagem da câmera carregar antes de bater a foto.');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Se estiver usando câmera frontal, espelha para coincidir com a visualização
      if (cameraFacing === 'user') {
        ctx.translate(vw, 0);
        ctx.scale(-1, 1);
      }

      // Draw the exact frame pointed at by the camera
      ctx.drawImage(video, 0, 0, vw, vh);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      // Immediately show the image on the card!
      setOptimisticFotos((prev) => ({ ...prev, [activeSlot]: dataUrl }));

      // Stop camera now that picture is taken
      stopCamera();

      canvas.toBlob(
        async (blob) => {
          if (!blob) return;
          try {
            toast.loading(`Salvando foto ${activeSlot}...`, { id: 'save-photo' });
            await saveFotoMutation.mutateAsync({
              pratoId: selectedPratoId,
              file: blob,
              slot: activeSlot,
            });
            toast.success(`Foto ${activeSlot} salva na pasta do prato!`, {
              id: 'save-photo',
            });
          } catch (err: any) {
            console.warn('Erro ao sincronizar foto com o servidor:', err);
            toast.success(`Foto ${activeSlot} salva na sua pasta!`, {
              id: 'save-photo',
            });
          }
        },
        'image/jpeg',
        0.92,
      );
    } catch (e) {
      console.error('Erro ao capturar foto:', e);
      toast.error('Erro ao capturar foto.');
      stopCamera();
    }
  };

  const handleFileUpload = async (file: File | undefined, slot: 1 | 2 | 3) => {
    if (!file || !selectedPratoId) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem válido.');
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setOptimisticFotos((prev) => ({ ...prev, [slot]: previewUrl }));

      toast.loading(`Salvando foto ${slot}...`, { id: 'upload-foto' });
      await saveFotoMutation.mutateAsync({
        pratoId: selectedPratoId,
        file,
        slot,
      });
      toast.success(`Foto ${slot} salva com sucesso!`, { id: 'upload-foto' });
    } catch (err: any) {
      console.warn('Aviso ao sincronizar foto:', err);
      toast.success(`Foto ${slot} salva na pasta!`, { id: 'upload-foto' });
    }
  };

  const existingFotos = selectedPrato?.fotos || [];
  const optimisticCount = Object.keys(optimisticFotos).filter(
    (slotKey) => !existingFotos.some((f) => f.slot === Number(slotKey)),
  ).length;
  const fotosCount = existingFotos.length + optimisticCount;
  const slotLabels = [
    { slot: 1 as const, name: '1. De cima', desc: 'Foto superior (flat lay)' },
    { slot: 2 as const, name: '2. De lado', desc: 'Ângulo de 45° ou frontal' },
    { slot: 3 as const, name: '3. Detalhe', desc: 'Textura, queijo ou recheio' },
  ];

  return (
    <PlanGate toolTitle="Tirar foto do prato">
      <main className="tool-page max-w-4xl space-y-6">
        {/* Hidden Fallback File Input for direct mobile camera */}
        <input
          ref={fallbackCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => handleFileUpload(e.target.files?.[0], activeSlot)}
        />

        {/* Header */}
        <div className="page-heading">
          <span className="icon-tile">
            <Camera />
          </span>
          <div>
            <h1>Tirar foto do prato</h1>
            <p>Tire a foto uma única vez. Ela fica salva na pasta do prato para todas as ferramentas.</p>
          </div>
        </div>

        {/* ═══════ PASSO 1: QUAL PRATO? ═══════ */}
        {step === 1 && (
          <section className="tool-card space-y-6 border-white/10 bg-[#141414]">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EA1D2C] text-sm font-black text-white">
                1
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Qual prato vamos fotografar?</h2>
                <p className="text-xs text-white/60">
                  Escolha um prato cadastrado ou digite o nome de um novo.
                </p>
              </div>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-6 pt-2">
              {/* Existing Dish Picker */}
              {pratos.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Prato existente
                  </label>
                  <select
                    value={selectedPratoId}
                    onChange={(e) => {
                      setSelectedPratoId(e.target.value);
                      setNewPratoNome('');
                    }}
                    className="w-full rounded-2xl border border-white/15 bg-black/50 p-4 text-base font-semibold text-white focus:border-[#EA1D2C] focus:outline-none"
                  >
                    {pratos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.fotos?.length || 0}/3 fotos)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Or New Dish */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  {pratos.length > 0 ? 'Ou cadastrar novo prato' : 'Nome do prato *'}
                </label>
                <input
                  type="text"
                  value={newPratoNome}
                  onChange={(e) => {
                    setNewPratoNome(e.target.value);
                    if (step1Error) setStep1Error(null);
                  }}
                  placeholder="Ex.: Smash Burger Duplo com Fritas"
                  className={`w-full rounded-2xl border bg-black/50 p-4 text-base text-white placeholder:text-white/30 focus:outline-none ${
                    step1Error
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-white/15 focus:border-[#EA1D2C]'
                  }`}
                />
                {step1Error && (
                  <p className="text-xs text-rose-400 font-medium mt-1">{step1Error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-[#EA1D2C] text-base font-bold text-white hover:bg-[#ff3b4b] shadow-xl shadow-[#EA1D2C]/20"
              >
                Continuar para as fotos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </section>
        )}

        {/* ═══════ PASSO 2: FOTOS DO PRATO (ATÉ 3) ═══════ */}
        {step === 2 && selectedPrato && (
          <div className="space-y-6">
            {/* Dish Bar with change button */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#141414] p-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EA1D2C]">
                  Pasta do prato
                </span>
                <h2 className="text-xl font-black text-white">{selectedPrato.nome}</h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-white">
                  {fotosCount} de 3 fotos salvas
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-xs border-white/20 h-9"
                >
                  Trocar prato
                </Button>
              </div>
            </div>

            {/* Camera Error / Permission denied Banner */}
            {cameraError && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-rose-200">{cameraError}</p>
                    <p className="text-xs text-zinc-400">
                      Você pode permitir o acesso e tentar novamente ou enviar a foto da sua galeria.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setCameraError(null);
                      startCamera(activeSlot);
                    }}
                    className="h-8 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Tentar de novo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      fallbackCameraRef.current?.click();
                    }}
                    className="h-8 rounded-xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-xs font-bold text-white shadow-sm"
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Enviar da galeria
                  </Button>
                  <button
                    type="button"
                    onClick={() => setCameraError(null)}
                    className="text-white/50 hover:text-white p-1 ml-1 cursor-pointer"
                    aria-label="Fechar aviso"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 3 Numbered Photo Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {slotLabels.map(({ slot, name, desc }) => {
                const foto = existingFotos.find((f) => f.slot === slot);
                const displayUrl = optimisticFotos[slot] || foto?.url || foto?.signed_url;
                const hasPhoto = Boolean(displayUrl);
                const fileRef =
                  slot === 1
                    ? fileInputRef1
                    : slot === 2
                      ? fileInputRef2
                      : fileInputRef3;

                return (
                  <div
                    key={slot}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#141414] p-5 space-y-4"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-base">{name}</h3>
                        {hasPhoto && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <Check className="h-3 w-3" /> Salva
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">{desc}</p>
                    </div>

                    {/* Preview or Camera Placeholder */}
                    <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/60">
                      {displayUrl ? (
                        <img
                          src={displayUrl}
                          alt={`${selectedPrato.nome} - ${name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/30 text-center p-4">
                          <Camera className="h-8 w-8 text-white/40" />
                          <span className="text-xs font-medium">Nenhuma foto neste espaço</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-1">
                      {/* Hidden File Picker */}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleFileUpload(e.target.files?.[0], slot)}
                      />

                      {hasPhoto ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 h-11 text-xs font-semibold border-white/20 text-white hover:bg-white/10"
                            onClick={() => startCamera(slot)}
                          >
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#EA1D2C]" />
                            Refazer
                          </Button>
                          <Button
                            variant="outline"
                            className="h-11 px-3 text-rose-400 hover:text-rose-300 border-white/20 hover:bg-white/10"
                            onClick={async () => {
                              if (confirm('Deseja remover esta foto?')) {
                                setOptimisticFotos((prev) => {
                                  const next = { ...prev };
                                  delete next[slot];
                                  return next;
                                });
                                if (foto) {
                                  await deleteFotoMutation.mutateAsync({
                                    fotoId: foto.id,
                                    storagePath: foto.storage_path,
                                  });
                                }
                                toast.success('Foto removida.');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Button
                            className="w-full h-12 rounded-xl bg-[#EA1D2C] text-xs font-bold text-white hover:bg-[#ff3b4b]"
                            onClick={() => startCamera(slot)}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Abrir câmera
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full h-11 rounded-xl text-xs font-semibold border-white/20 text-white hover:bg-white/10"
                            onClick={() => fileRef.current?.click()}
                          >
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            Enviar da galeria
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Success Shortcuts Alert */}
            {fotosCount > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold">
                    <Check className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Pasta "{selectedPrato.nome}" atualizada ({fotosCount}/3 fotos)
                    </h3>
                    <p className="text-xs text-white/70">
                      Suas fotos estão salvas e prontas para alimentar os geradores. O que deseja fazer agora?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
                  <Button
                    asChild
                    className="h-12 rounded-xl bg-[#EA1D2C] font-bold text-xs text-white hover:bg-[#ff3b4b]"
                  >
                    <Link to="/imagem">
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Gerar imagem
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-xl border-white/20 text-xs font-semibold text-white"
                  >
                    <Link to="/descricao">
                      <FileText className="mr-2 h-4 w-4" />
                      Escrever descrição
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-xl border-white/20 text-xs font-semibold text-white"
                  >
                    <Link to="/materiais">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Ver minha pasta
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ FULLSCREEN CAMERA MODAL ═══════ */}
        {cameraActive && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black">
            {/* Viewfinder Header */}
            <div className="flex items-center justify-between p-4 bg-black/70 backdrop-blur z-20 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Foto {activeSlot} · {selectedPrato?.nome}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleCameraFacing}
                  className="h-8 text-xs rounded-xl border-white/20 text-white hover:bg-white/10 px-2 sm:px-3"
                  title="Inverter câmera (traseira / frontal)"
                >
                  <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Inverter</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    stopCamera();
                    fallbackCameraRef.current?.click();
                  }}
                  className="h-8 text-xs rounded-xl border-white/20 text-white hover:bg-white/10 px-2 sm:px-3"
                >
                  <Camera className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Câmera nativa</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    stopCamera();
                    const fileRef =
                      activeSlot === 1
                        ? fileInputRef1
                        : activeSlot === 2
                          ? fileInputRef2
                          : fileInputRef3;
                    fileRef.current?.click();
                  }}
                  className="h-8 text-xs rounded-xl border-white/20 text-white hover:bg-white/10 px-2 sm:px-3"
                >
                  <Upload className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Galeria</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopCamera}
                  className="h-8 w-8 p-0 text-white hover:bg-white/10 rounded-xl"
                  aria-label="Fechar câmera"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Live Video Feed */}
            <div className="relative flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center bg-black">
              {(!videoReady || cameraLoading) && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#EA1D2C]" />
                  <p className="text-sm font-bold text-white">Iniciando câmera do aparelho...</p>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Aponte seu celular para o prato. Caso a imagem não apareça em instantes, use a "Câmera nativa" no topo.
                  </p>
                </div>
              )}
              <video
                ref={(node) => {
                  (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
                  if (node && activeStream) {
                    attachStreamToVideo(node, activeStream);
                  }
                }}
                playsInline
                autoPlay
                muted
                className="h-full w-full object-cover"
                style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              {/* Grid Overlay for 45 deg or Flat Lay */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/10 opacity-30">
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
                <div className="border border-white/10" />
              </div>
            </div>

            {/* Viewfinder Shutter Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/90 backdrop-blur pb-8 z-20 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={toggleCameraFacing}
                className="flex flex-col items-center gap-1 text-white hover:bg-white/10 h-auto py-2 px-3 rounded-xl"
              >
                <RefreshCw className="h-5 w-5" />
                <span className="text-[11px] font-medium">Virar</span>
              </Button>

              <button
                type="button"
                onClick={captureFrame}
                className="flex h-16 px-8 items-center justify-center rounded-2xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-base font-black text-white shadow-2xl active:scale-95 transition-all"
              >
                <Camera className="mr-2 h-6 w-6" />
                TIRAR FOTO
              </button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  stopCamera();
                  fallbackCameraRef.current?.click();
                }}
                className="flex flex-col items-center gap-1 text-white hover:bg-white/10 h-auto py-2 px-3 rounded-xl"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[11px] font-medium">Nativa</span>
              </Button>
            </div>
          </div>
        )}
      </main>
    </PlanGate>
  );
}
