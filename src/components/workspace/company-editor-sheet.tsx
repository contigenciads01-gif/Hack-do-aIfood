import { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Building2,
  Phone,
  MapPin,
  Briefcase,
  Upload,
  Sparkles,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Store,
  X,
} from 'lucide-react';
import { useCompany, useSaveCompany, type CompanyAddress } from '@/lib/data/company';
import { useAuth } from '@/lib/auth';
import {
  uploadCompanyLogo,
  uploadCompanyBanner,
  compressImage,
  getSignedAssetUrl,
  isAcceptedImage,
} from '@/lib/data/storage';
import { LogoStudioModal } from '@/components/brand/LogoStudioModal';
import { brandPacks } from '@/data/brand-packs';
import {
  useCompanyEditorState,
  type CompanyEditorSection,
} from '@/lib/company-editor-state';
import { useRouterState } from '@tanstack/react-router';

const DIAS_SEMANA = [
  { key: 'seg', label: 'Segunda-feira' },
  { key: 'ter', label: 'Terça-feira' },
  { key: 'qua', label: 'Quarta-feira' },
  { key: 'qui', label: 'Quinta-feira' },
  { key: 'sex', label: 'Sexta-feira' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

const FORMAS_ATENDIMENTO_DEFAULT = ['Delivery', 'Retirada no balcão', 'Salão / Mesa'];

const DIFERENCIAIS_SUGESTOES = [
  'Entrega super rápida',
  'Artesanal feito do zero',
  'Porções generosas',
  'Ingredientes premium',
  'Embalagem térmica segura',
  'Receita de família tradicional',
  'Opções sem lactose',
  'Opções vegetarianas',
];

function formatWhatsApp(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCep(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{6})$/.test(hex);
}

export function CompanyEditorSheet() {
  const { open, section, setOpen, setSection } = useCompanyEditorState();
  const { user } = useAuth();
  const { data: company } = useCompany();
  const saveMutation = useSaveCompany();
  const search = useRouterState({ select: (s) => s.location.search }) as Record<string, string>;

  // Check URL query param on mount/search changes
  useEffect(() => {
    if (search && search['secao']) {
      const s = search['secao'] as CompanyEditorSection;
      if (['identidade', 'contato', 'localizacao', 'negocio'].includes(s)) {
        setSection(s);
        setOpen(true);
      }
    } else if (search && (search['minha_empresa'] || search['editor_empresa'])) {
      setOpen(true);
    }
  }, [search, setSection, setOpen]);

  // Section 1: Identidade
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [slogan, setSlogan] = useState('');
  const [temLogo, setTemLogo] = useState(false);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [bannerPath, setBannerPath] = useState<string | null>(null);
  const [cores, setCores] = useState<string[]>(['#EA1D2C', '#1A1A1A']);
  const [showLogoStudio, setShowLogoStudio] = useState(false);
  const [savingIdentidade, setSavingIdentidade] = useState(false);

  // Section 2: Contato
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [site, setSite] = useState('');
  const [emailPublico, setEmailPublico] = useState('');
  const [savingContato, setSavingContato] = useState(false);

  // Section 3: Localização
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [mostrarEnderecoAnuncios, setMostrarEnderecoAnuncios] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [savingLocalizacao, setSavingLocalizacao] = useState(false);

  // Section 4: Negócio
  const [formasAtendimento, setFormasAtendimento] = useState<string[]>(['Delivery']);
  const [horariosSemana, setHorariosSemana] = useState<
    Record<string, { aberto: boolean; inicio: string; fim: string }>
  >({});
  const [diferenciais, setDiferenciais] = useState<string[]>([]);
  const [customDiferencial, setCustomDiferencial] = useState('');
  const [savingNegocio, setSavingNegocio] = useState(false);

  // Sync state whenever modal opens or when company loads for first time
  const prevOpenRef = useRef(false);
  const loadedOnceRef = useRef(false);

  useEffect(() => {
    const isOpening = !prevOpenRef.current && open;
    const isInitialLoad = open && company && !loadedOnceRef.current;

    if (company && (isOpening || isInitialLoad)) {
      loadedOnceRef.current = true;
      setNome(company.nome || '');
      setCategoria(company.categoria || 'Restaurante');
      setSlogan(company.slogan || '');
      setTemLogo(!!company.tem_logo);
      if (company.logo_path) {
        if (company.logo_path.startsWith('http') || company.logo_path.startsWith('data:') || company.logo_path.startsWith('blob:')) {
          setLogoPath(company.logo_path);
        } else {
          setLogoPath(company.logo_path);
          getSignedAssetUrl(company.logo_path).then((url) => {
            if (url) setLogoPath(url);
          });
        }
      } else {
        setLogoPath(null);
      }

      if (company.banner_path) {
        if (company.banner_path.startsWith('http') || company.banner_path.startsWith('data:') || company.banner_path.startsWith('blob:')) {
          setBannerPath(company.banner_path);
        } else {
          setBannerPath(company.banner_path);
          getSignedAssetUrl(company.banner_path).then((url) => {
            if (url) setBannerPath(url);
          });
        }
      } else {
        setBannerPath(null);
      }
      setCores(company.cores && company.cores.length ? company.cores : ['#EA1D2C', '#1A1A1A']);

      setWhatsapp(company.whatsapp ? formatWhatsApp(company.whatsapp) : '');
      setInstagram(company.instagram ? company.instagram.replace(/^@/, '') : '');
      setSite(company.site || '');
      setEmailPublico(company.email_publico || '');

      const end = company.endereco as CompanyAddress | null;
      setCep(end?.cep ? formatCep(end.cep) : '');
      setRua(end?.rua || '');
      setNumero(end?.numero || '');
      setComplemento(end?.complemento || '');
      setBairro(end?.bairro || '');
      setCidade(end?.cidade || company.cidade || '');
      setUf(end?.uf || '');
      setMostrarEnderecoAnuncios(!!company.mostrar_endereco_anuncios);

      setFormasAtendimento(
        Array.isArray(company.formas_atendimento) && company.formas_atendimento.length
          ? company.formas_atendimento
          : ['Delivery'],
      );

      // Horários
      const defaultHorarios: Record<string, { aberto: boolean; inicio: string; fim: string }> = {};
      DIAS_SEMANA.forEach((d) => {
        defaultHorarios[d.key] = { aberto: true, inicio: '11:00', fim: '23:00' };
      });
      if (company.horario_funcionamento && typeof company.horario_funcionamento === 'object') {
        setHorariosSemana({ ...defaultHorarios, ...company.horario_funcionamento });
      } else {
        setHorariosSemana(defaultHorarios);
      }

      setDiferenciais(Array.isArray(company.diferenciais) ? company.diferenciais : []);
    }

    prevOpenRef.current = open;
    if (!open) {
      loadedOnceRef.current = false;
    }
  }, [company, open]);

  // ViaCEP fetch
  const handleCepChange = async (val: string) => {
    const formatted = formatCep(val);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (data && !data.erro) {
          if (data.logradouro) setRua(data.logradouro);
          if (data.bairro) setBairro(data.bairro);
          if (data.localidade) setCidade(data.localidade);
          if (data.uf) setUf(data.uf);
          toast.success('Endereço localizado via CEP!');
        } else {
          toast.warning('CEP não encontrado. Preencha os campos manualmente.');
        }
      } catch {
        toast.warning('Não foi possível consultar o CEP no momento.');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  // Upload Logo
  const handleLogoUpload = async (file?: File) => {
    if (!file || !user?.id) return;

    if (!isAcceptedImage(file)) {
      toast.error('Envie uma imagem válida (PNG, JPG, WebP).');
      return;
    }

    try {
      toast.loading('Enviando logo...', { id: 'sheet-upload-logo' });
      const { path, url } = await uploadCompanyLogo(file, user.id);
      setLogoPath(url || path);
      setTemLogo(true);
      await saveMutation.mutateAsync({
        tem_logo: true,
        logo_path: path,
      });
      toast.success('Logo enviada e salva com sucesso!', { id: 'sheet-upload-logo' });
    } catch {
      toast.error('Erro ao enviar imagem da logo.', { id: 'sheet-upload-logo' });
    }
  };

  // Upload Banner
  const handleBannerUpload = async (file?: File) => {
    if (!file || !user?.id) return;

    if (!isAcceptedImage(file)) {
      toast.error('Envie uma imagem válida (PNG, JPG, WebP).');
      return;
    }

    try {
      toast.loading('Enviando banner de capa...', { id: 'sheet-upload-banner' });
      const { path, url } = await uploadCompanyBanner(file, user.id);
      setBannerPath(url || path);
      await saveMutation.mutateAsync({
        banner_path: path,
      });
      toast.success('Banner de capa salvo com sucesso!', { id: 'sheet-upload-banner' });
    } catch {
      toast.error('Erro ao enviar imagem do banner.', { id: 'sheet-upload-banner' });
    }
  };

  // Color management
  const updateColorAt = (index: number, val: string) => {
    const updated = [...cores];
    updated[index] = val;
    setCores(updated);
  };

  const addColor = () => {
    if (cores.length >= 6) {
      toast.warning('Você pode adicionar no máximo 6 cores.');
      return;
    }
    setCores([...cores, '#FFFFFF']);
  };

  const removeColorAt = (index: number) => {
    if (cores.length <= 1) {
      toast.warning('Mantenha ao menos 1 cor primária.');
      return;
    }
    setCores(cores.filter((_, i) => i !== index));
  };

  const applyCategoryPalette = () => {
    const pack = brandPacks[categoria];
    if (pack && pack.cores && pack.cores.length) {
      // Pick up to 5 colors from category pack
      const sample = ['#EA1D2C', '#1A1A1A', '#FFFFFF', '#FFA500', '#F5F5F5'];
      setCores(sample);
      toast.success(`Paleta padrão da categoria ${categoria} aplicada!`);
    } else {
      setCores(['#EA1D2C', '#1A1A1A', '#FFFFFF']);
      toast.info('Paleta sugerida aplicada.');
    }
  };

  // Save Handlers per Section
  const handleSaveIdentidade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error('Informe o nome da sua empresa.');
      return;
    }

    // Validate colors
    for (const c of cores) {
      if (!isValidHexColor(c)) {
        toast.error(`A cor "${c}" não é um código hexadecimal válido (ex.: #EA1D2C).`);
        return;
      }
    }

    setSavingIdentidade(true);
    try {
      const saved = await saveMutation.mutateAsync({
        nome: nome.trim(),
        slogan: slogan.trim() || null,
        categoria: categoria || company?.categoria || 'Restaurante',
        tem_logo: temLogo,
        logo_path: temLogo ? logoPath : null,
        banner_path: bannerPath || null,
        cores,
      });
      if (saved?.nome) setNome(saved.nome);
      if (saved?.slogan !== undefined) setSlogan(saved.slogan || '');
      toast.success('Identidade da empresa salva com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar identidade.');
    } finally {
      setSavingIdentidade(false);
    }
  };

  const handleSaveContato = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContato(true);
    try {
      await saveMutation.mutateAsync({
        whatsapp: whatsapp.trim() || null,
        instagram: instagram.trim() ? (instagram.startsWith('@') ? instagram : `@${instagram.trim()}`) : null,
        site: site.trim() || null,
        email_publico: emailPublico.trim() || null,
      });
      toast.success('Informações de contato salvas!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar contato.');
    } finally {
      setSavingContato(false);
    }
  };

  const handleSaveLocalizacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLocalizacao(true);
    try {
      const enderecoData: CompanyAddress = {
        cep: cep.trim(),
        rua: rua.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        uf: uf.trim().toUpperCase(),
      };

      await saveMutation.mutateAsync({
        cidade: cidade.trim() || null,
        endereco: enderecoData,
        mostrar_endereco_anuncios: mostrarEnderecoAnuncios,
      });
      toast.success('Localização da empresa atualizada!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar localização.');
    } finally {
      setSavingLocalizacao(false);
    }
  };

  const handleSaveNegocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNegocio(true);
    try {
      await saveMutation.mutateAsync({
        formas_atendimento: formasAtendimento,
        horario_funcionamento: horariosSemana,
        diferenciais,
      });
      toast.success('Dados do negócio e horários atualizados!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar dados do negócio.');
    } finally {
      setSavingNegocio(false);
    }
  };

  const toggleAtendimento = (forma: string) => {
    if (formasAtendimento.includes(forma)) {
      if (formasAtendimento.length <= 1) {
        toast.warning('Selecione ao menos uma forma de atendimento.');
        return;
      }
      setFormasAtendimento(formasAtendimento.filter((f) => f !== forma));
    } else {
      setFormasAtendimento([...formasAtendimento, forma]);
    }
  };

  const toggleDiaSemana = (key: string) => {
    setHorariosSemana((prev) => {
      const cur = prev[key] || { aberto: false, inicio: '11:00', fim: '23:00' };
      return {
        ...prev,
        [key]: { ...cur, aberto: !cur.aberto },
      };
    });
  };

  const setDiaHorario = (key: string, campo: 'inicio' | 'fim', val: string) => {
    setHorariosSemana((prev) => {
      const cur = prev[key] || { aberto: true, inicio: '11:00', fim: '23:00' };
      return {
        ...prev,
        [key]: { ...cur, [campo]: val },
      };
    });
  };

  const addDiferencial = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (diferenciais.includes(trimmed)) return;
    setDiferenciais([...diferenciais, trimmed]);
    setCustomDiferencial('');
  };

  const removeDiferencial = (item: string) => {
    setDiferenciais(diferenciais.filter((d) => d !== item));
  };

  // Helper background style for fallback banner
  const fallbackGradient =
    cores && cores.length >= 2
      ? `linear-gradient(135deg, ${cores[0]} 0%, #111111 50%, ${cores[1] || cores[0]} 100%)`
      : 'linear-gradient(135deg, #EA1D2C 0%, #1A1A1A 100%)';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-[#121214] text-white p-0 border-l border-white/10 flex flex-col h-full overflow-hidden"
      >
        {/* Top Header */}
        <SheetHeader className="p-6 pb-4 border-b border-white/10 bg-[#161618] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EA1D2C] shadow-md shadow-[#EA1D2C]/20">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-lg font-black text-white">Minha empresa</SheetTitle>
                <SheetDescription className="text-xs text-white/60">
                  Edite os dados cadastrais da sua loja. Todas as ferramentas do Agente sincronizam na hora.
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (NO CIRCLES) */}
          <div className="mt-4">
            <Tabs value={section} onValueChange={(v) => setSection(v as CompanyEditorSection)}>
              <TabsList className="grid grid-cols-4 w-full h-11 bg-black/40 p-1 rounded-xl border border-white/10">
                <TabsTrigger
                  value="identidade"
                  className="rounded-lg text-xs font-bold data-[state=active]:bg-[#EA1D2C] data-[state=active]:text-white data-[state=active]:shadow"
                >
                  <Building2 className="h-3.5 w-3.5 mr-1.5 hidden sm:inline-block" />
                  Identidade
                </TabsTrigger>
                <TabsTrigger
                  value="contato"
                  className="rounded-lg text-xs font-bold data-[state=active]:bg-[#EA1D2C] data-[state=active]:text-white data-[state=active]:shadow"
                >
                  <Phone className="h-3.5 w-3.5 mr-1.5 hidden sm:inline-block" />
                  Contato
                </TabsTrigger>
                <TabsTrigger
                  value="localizacao"
                  className="rounded-lg text-xs font-bold data-[state=active]:bg-[#EA1D2C] data-[state=active]:text-white data-[state=active]:shadow"
                >
                  <MapPin className="h-3.5 w-3.5 mr-1.5 hidden sm:inline-block" />
                  Localização
                </TabsTrigger>
                <TabsTrigger
                  value="negocio"
                  className="rounded-lg text-xs font-bold data-[state=active]:bg-[#EA1D2C] data-[state=active]:text-white data-[state=active]:shadow"
                >
                  <Briefcase className="h-3.5 w-3.5 mr-1.5 hidden sm:inline-block" />
                  Negócio
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ═══════ SEÇÃO 1: IDENTIDADE ═══════ */}
          {section === 'identidade' && (
            <form onSubmit={handleSaveIdentidade} className="space-y-6">
              {/* Banner de capa */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">
                  Banner de capa da loja
                </label>
                <div
                  className="relative h-32 w-full rounded-2xl border border-white/15 overflow-hidden flex items-center justify-center shadow-inner"
                  style={{
                    background: bannerPath ? `url(${bannerPath}) center/cover no-repeat` : fallbackGradient,
                  }}
                >
                  <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
                  <div className="relative z-10 flex flex-wrap gap-2 items-center justify-center p-3">
                    <Button asChild size="sm" variant="outline" className="text-xs rounded-xl bg-black/60 border-white/20 hover:bg-black/80">
                      <label className="cursor-pointer">
                        <Upload className="mr-1.5 h-3.5 w-3.5 text-white" />
                        {bannerPath ? 'Trocar banner' : 'Enviar banner de capa'}
                        <input
                          type="file"
                          accept="image/*,.png,.jpg,.jpeg,.webp,.PNG,.JPG,.JPEG,.WEBP"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleBannerUpload(f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </Button>
                    {bannerPath && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          setBannerPath(null);
                          await saveMutation.mutateAsync({ banner_path: null });
                          toast.success('Banner removido. O degradê da marca será exibido.');
                        }}
                        className="text-xs text-rose-300 hover:text-white hover:bg-rose-500/20 rounded-xl"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] text-white/50">
                  Ideal para cabeçalho da loja e materiais promocionais (proporção panorâmica 16:9).
                </p>
              </div>

              {/* Logo da loja */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">
                  Logo oficial
                </label>
                <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                  {/* Square Logo Preview (NO CIRCLE) */}
                  {temLogo && logoPath ? (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-1 shadow-md">
                      <img src={logoPath} alt={nome} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EA1D2C] text-xl font-black text-white shadow-md">
                      {(nome || 'IF').slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline" className="text-xs rounded-xl border-white/20">
                        <label className="cursor-pointer">
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          Enviar arquivo
                          <input
                            type="file"
                            accept="image/*,.png,.jpg,.jpeg,.webp,.PNG,.JPG,.JPEG,.WEBP"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleLogoUpload(f);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowLogoStudio(true)}
                        className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-xl gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Criar no Estúdio
                      </Button>

                      {temLogo ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTemLogo(false);
                            setLogoPath(null);
                            toast.info('Definido como sem logo. Usaremos as iniciais da sua marca.');
                          }}
                          className="text-xs text-white/70 hover:text-white rounded-xl"
                        >
                          Usar sem logo
                        </Button>
                      ) : (
                        <span className="text-[11px] text-amber-300/80 flex items-center">
                          Usando iniciais como logo padrão
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50">
                      Formatos aceitos: PNG (fundo transparente), JPG ou WebP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nome & Slogan */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Nome da loja *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                    placeholder="Ex.: Hamburgueria do Chefe"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Categoria principal
                  </label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                    placeholder="Ex.: Hambúrguer, Pizza, Açaí"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                  Slogan ou Frase de Impacto
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  placeholder="Ex.: O sabor artesanal que conquista no primeiro pedaço"
                />
              </div>

              {/* Paleta de Cores com validação hex */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Paleta de cores oficial (hex 6 dígitos)
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={applyCategoryPalette}
                    className="text-xs text-[#EA1D2C] hover:text-[#ff4b58] h-7 px-2"
                  >
                    Sugerir cores para {categoria || 'o nicho'}
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {cores.map((cor, index) => {
                    const valid = isValidHexColor(cor);
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-9 w-9 shrink-0 rounded-xl border border-white/20 shadow-sm relative overflow-hidden"
                          style={{ backgroundColor: valid ? cor : '#333333' }}
                        >
                          <input
                            type="color"
                            value={valid ? cor : '#EA1D2C'}
                            onChange={(e) => updateColorAt(index, e.target.value.toUpperCase())}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            title="Escolher cor"
                          />
                        </div>

                        <div className="flex-1 relative">
                          <input
                            type="text"
                            maxLength={7}
                            value={cor}
                            onChange={(e) => updateColorAt(index, e.target.value.toUpperCase())}
                            className={`w-full rounded-xl border p-2.5 text-xs font-mono uppercase text-white focus:outline-hidden ${
                              valid
                                ? 'border-white/15 bg-black/50 focus:border-[#EA1D2C]'
                                : 'border-rose-500 bg-rose-500/10 focus:border-rose-400'
                            }`}
                            placeholder="#RRGGBB"
                          />
                          {!valid && (
                            <span className="text-[10px] text-rose-400 mt-1 block">
                              Hexadecimal inválido. Use formato #RRGGBB (6 dígitos).
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeColorAt(index)}
                          disabled={cores.length <= 1}
                          className="h-9 w-9 rounded-xl text-white/50 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {cores.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addColor}
                    className="mt-3 text-xs border-dashed border-white/20 hover:border-white/40 rounded-xl w-full"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Adicionar cor à paleta
                  </Button>
                )}
              </div>

              {/* Botão Salvar Identidade */}
              <div className="pt-4 border-t border-white/10">
                <Button
                  type="submit"
                  disabled={savingIdentidade}
                  className="w-full py-5 text-sm font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b] rounded-xl shadow-lg shadow-[#EA1D2C]/20"
                >
                  {savingIdentidade ? 'Salvando...' : 'Salvar alterações de Identidade'}
                </Button>
              </div>
            </form>
          )}

          {/* ═══════ SEÇÃO 2: CONTATO ═══════ */}
          {section === 'contato' && (
            <form onSubmit={handleSaveContato} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                  WhatsApp para pedidos
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>
                <p className="mt-1 text-[11px] text-white/50">
                  Usado nos links de pedido direto e no CTA dos anúncios.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                  Instagram comercial (@)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-white/40 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
                    placeholder="sualoja"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 pl-8 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>
                <p className="mt-1 text-[11px] text-white/50">
                  O Agente usará este @ na assinatura dos criativos de Stories e Carrossel.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                  Site ou Cardápio Digital (URL)
                </label>
                <input
                  type="url"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="https://suaprincipalpagina.com"
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                  E-mail público de atendimento
                </label>
                <input
                  type="email"
                  value={emailPublico}
                  onChange={(e) => setEmailPublico(e.target.value)}
                  placeholder="contato@sualoja.com.br"
                  className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  type="submit"
                  disabled={savingContato}
                  className="w-full py-5 text-sm font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b] rounded-xl shadow-lg shadow-[#EA1D2C]/20"
                >
                  {savingContato ? 'Salvando...' : 'Salvar informações de Contato'}
                </Button>
              </div>
            </form>
          )}

          {/* ═══════ SEÇÃO 3: LOCALIZAÇÃO ═══════ */}
          {section === 'localizacao' && (
            <form onSubmit={handleSaveLocalizacao} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    CEP (com busca auto)
                  </label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                  {buscandoCep && (
                    <span className="text-[10px] text-amber-300 mt-1 block">Buscando endereço...</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Rua / Avenida
                  </label>
                  <input
                    type="text"
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    placeholder="Ex.: Rua das Flores"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Número
                  </label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="123"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Apto 12, Bloco B"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Centro"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    placeholder="SP"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white uppercase focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Option to show address in ads */}
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex items-center justify-between gap-3 mt-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Mostrar endereço nos anúncios</h4>
                  <p className="text-xs text-white/60">
                    Se ativado, o Agente de Anúncios colocará seu bairro e cidade nos criativos para reforçar a proximidade com o cliente.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={mostrarEnderecoAnuncios}
                  onChange={(e) => setMostrarEnderecoAnuncios(e.target.checked)}
                  className="h-5 w-5 accent-[#EA1D2C] cursor-pointer rounded-md"
                />
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  type="submit"
                  disabled={savingLocalizacao}
                  className="w-full py-5 text-sm font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b] rounded-xl shadow-lg shadow-[#EA1D2C]/20"
                >
                  {savingLocalizacao ? 'Salvando...' : 'Salvar localização'}
                </Button>
              </div>
            </form>
          )}

          {/* ═══════ SEÇÃO 4: NEGÓCIO ═══════ */}
          {section === 'negocio' && (
            <form onSubmit={handleSaveNegocio} className="space-y-6">
              {/* Formas de atendimento */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">
                  Formas de atendimento (seleção múltipla)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {FORMAS_ATENDIMENTO_DEFAULT.map((forma) => {
                    const selected = formasAtendimento.includes(forma);
                    return (
                      <button
                        key={forma}
                        type="button"
                        onClick={() => toggleAtendimento(forma)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          selected
                            ? 'border-[#EA1D2C] bg-[#EA1D2C]/15 text-white shadow-sm'
                            : 'border-white/10 bg-black/40 text-white/60 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span>{forma}</span>
                        {selected && <Check className="h-4 w-4 text-[#EA1D2C]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horários por dia da semana */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">
                  Horário de funcionamento por dia da semana
                </label>
                <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-3">
                  {DIAS_SEMANA.map((dia) => {
                    const info = horariosSemana[dia.key] || {
                      aberto: false,
                      inicio: '11:00',
                      fim: '23:00',
                    };
                    return (
                      <div
                        key={dia.key}
                        className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-xl bg-white/5 border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <input
                            type="checkbox"
                            checked={info.aberto}
                            onChange={() => toggleDiaSemana(dia.key)}
                            className="h-4 w-4 accent-[#EA1D2C] cursor-pointer rounded-md"
                          />
                          <span className={`font-semibold ${info.aberto ? 'text-white' : 'text-white/40'}`}>
                            {dia.label}
                          </span>
                        </div>

                        {info.aberto ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white/40 text-[11px]">Das</span>
                            <input
                              type="time"
                              value={info.inicio}
                              onChange={(e) => setDiaHorario(dia.key, 'inicio', e.target.value)}
                              className="rounded-lg border border-white/15 bg-black/60 px-2 py-1 text-white text-xs"
                            />
                            <span className="text-white/40 text-[11px]">às</span>
                            <input
                              type="time"
                              value={info.fim}
                              onChange={(e) => setDiaHorario(dia.key, 'fim', e.target.value)}
                              className="rounded-lg border border-white/15 bg-black/60 px-2 py-1 text-white text-xs"
                            />
                          </div>
                        ) : (
                          <span className="text-white/40 italic">Fechado</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Diferenciais */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-2">
                  Diferenciais da sua loja
                </label>

                {/* Selected differentials */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {diferenciais.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#EA1D2C]/20 border border-[#EA1D2C]/40 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => removeDiferencial(d)}
                        className="text-white/60 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Suggestion Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-white/50 block">Sugestões rápidas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {DIFERENCIAIS_SUGESTOES.filter((s) => !diferenciais.includes(s)).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addDiferencial(s)}
                        className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Differential */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customDiferencial}
                    onChange={(e) => setCustomDiferencial(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDiferencial(customDiferencial);
                      }
                    }}
                    placeholder="Adicionar diferencial personalizado..."
                    className="flex-1 rounded-xl border border-white/15 bg-black/50 p-2.5 text-xs text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDiferencial(customDiferencial)}
                    className="rounded-xl border-white/20 text-xs px-3"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  type="submit"
                  disabled={savingNegocio}
                  className="w-full py-5 text-sm font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b] rounded-xl shadow-lg shadow-[#EA1D2C]/20"
                >
                  {savingNegocio ? 'Salvando...' : 'Salvar dados do negócio'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Estúdio de Criação de Logo (se aberto dentro da Sheet) */}
        <LogoStudioModal
          open={showLogoStudio}
          onOpenChange={setShowLogoStudio}
          defaultStoreName={nome}
          defaultNiche={categoria}
          onSelectPalette={(paletteColors) => {
            setCores(paletteColors);
            setTemLogo(false);
            setShowLogoStudio(false);
            toast.success('Paleta de cores aplicada ao perfil da empresa!');
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
