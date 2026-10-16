import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import {
  Store,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  HelpCircle,
  Shield,
  Palette,
  Eye,
  Plus,
  X,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { brandPacks } from '@/data/brand-packs';
import { useAuth } from '@/lib/auth';
import { useCompany, useSaveCompany, type Company } from '@/lib/data';
import { extractDominantColors, uploadCompanyLogo } from '@/lib/data/storage';

export const Route = createFileRoute('/cadastro')({
  head: () => ({
    meta: [
      { title: 'hack du ifood — Cadastro da Empresa' },
      { name: 'description', content: 'Configure o perfil único da sua marca.' },
    ],
  }),
  component: CadastroPage,
});

const PERSONALIDADES = [
  'divertida',
  'premium',
  'artesanal',
  'jovem',
  'tradicional',
  'saudável',
  'ousada',
];

const TONS_VOZ = ['Divertido', 'Direto', 'Premium', 'Família'];

const PUBLICOS_DEFAULT = [
  'família',
  'jovens',
  'universitários',
  'escritório',
  'fitness',
  'festas',
];

const FAIXAS_PRECO = ['Econômico', 'Médio', 'Premium'];

const DIFERENCIAIS_DEFAULT = [
  'entrega rápida',
  'artesanal',
  'porções generosas',
  'ingredientes premium',
  'embalagem térmica segura',
  'receita de família',
];

const ESTILOS_VISUAIS = ['Escuro', 'Claro', 'Colorido', 'Minimalista'];

function formatWhatsApp(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function CadastroPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: company, isLoading: companyLoading } = useCompany();
  const saveMutation = useSaveCompany();

  const [passo, setPasso] = useState<number>(1);
  const [salvando, setSalvando] = useState(false);

  // Form State
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cidade, setCidade] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [horario, setHorario] = useState('');
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split('T')[0],
  );

  // Step 2: Logo
  const [escolhaLogo, setEscolhaLogo] = useState<'tenho' | 'nao_tenho'>('tenho');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoPath, setLogoPath] = useState<string>('');
  const [cores, setCores] = useState<string[]>([
    '#EA1D2C',
    '#1A1A1A',
    '#FFFFFF',
    '#FFA500',
    '#E5E5E5',
  ]);

  // Step 3: Brand Style
  const [personalidade, setPersonalidade] = useState<string[]>([]);
  const [tom, setTom] = useState('Divertido');
  const [publico, setPublico] = useState<string[]>(['família', 'jovens']);
  const [customPublico, setCustomPublico] = useState('');
  const [faixaPreco, setFaixaPreco] = useState('Médio');
  const [diferenciais, setDiferenciais] = useState<string[]>([
    'entrega rápida',
    'ingredientes premium',
  ]);
  const [customDiferencial, setCustomDiferencial] = useState('');
  const [estiloVisual, setEstiloVisual] = useState('Escuro');
  const [slogan, setSlogan] = useState('');

  // Hydrate if existing
  useEffect(() => {
    if (company) {
      setNome(company.nome || '');
      setCategoria(company.categoria || '');
      setCidade(company.cidade || '');
      setWhatsapp(company.whatsapp || '');
      setInstagram(company.instagram || '');
      setHorario(company.horario || '');
      if (company.data_inicio) setDataInicio(company.data_inicio);

      if (company.tem_logo) {
        setEscolhaLogo('tenho');
        if (company.logo_path) {
          setLogoPath(company.logo_path);
          setLogoPreview(company.logo_path);
        }
      } else if (company.cadastro_passo > 1) {
        setEscolhaLogo('nao_tenho');
      }

      if (company.cores && company.cores.length) setCores(company.cores);
      if (company.personalidade) setPersonalidade(company.personalidade);
      if (company.tom) setTom(company.tom);
      if (company.publico) setPublico(company.publico);
      if (company.faixa_preco) setFaixaPreco(company.faixa_preco);
      if (company.diferenciais) setDiferenciais(company.diferenciais);
      if (company.estilo_visual) setEstiloVisual(company.estilo_visual);
      if (company.slogan) setSlogan(company.slogan);

      if (company.cadastro_passo) {
        setPasso(Math.min(4, Math.max(1, company.cadastro_passo)));
      }
    }
  }, [company]);

  // Handle Logo Upload
  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Envie uma imagem PNG, JPG ou WebP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo de 5 MB.');
      return;
    }

    setSalvando(true);
    try {
      const { path, url } = await uploadCompanyLogo(file, user?.id || 'guest');
      setLogoPath(path);
      setLogoPreview(url);

      // Extract colors
      const extracted = await extractDominantColors(url, 5);
      setCores(extracted);
      toast.success('Logo enviada e cores extraídas com sucesso!');
    } catch {
      toast.error('Erro ao processar imagem.');
    } finally {
      setSalvando(false);
    }
  };

  // When category changes and user has no custom colors, suggest brand pack colors
  const handleCategoriaChange = (cat: string) => {
    setCategoria(cat);
    if (escolhaLogo === 'nao_tenho' && brandPacks[cat]?.cores) {
      // Parse sample colors or fallback
      const sample = ['#EA1D2C', '#2B2B2B', '#FFFFFF', '#F59E0B', '#10B981'];
      setCores(sample);
    }
  };

  const saveCurrentStep = async (nextPasso: number) => {
    setSalvando(true);
    const today = new Date().toISOString().split('T')[0] ?? '';
    try {
      await saveMutation.mutateAsync({
        nome: nome.trim(),
        categoria,
        cidade: cidade.trim() || null,
        whatsapp: whatsapp.trim() || null,
        instagram: instagram.trim() || null,
        horario: horario.trim() || null,
        data_inicio: dataInicio || today,
        tem_logo: escolhaLogo === 'tenho' && !!logoPreview,
        logo_path: logoPath || null,
        cores,
        personalidade,
        tom,
        publico,
        faixa_preco: faixaPreco,
        diferenciais,
        estilo_visual: estiloVisual,
        slogan: slogan.trim() || null,
        cadastro_passo: nextPasso,
      });
      setPasso(nextPasso);
    } catch {
      toast.error('Erro ao salvar progresso.');
    } finally {
      setSalvando(false);
    }
  };

  const handleNextStep1 = () => {
    if (!nome.trim()) {
      toast.error('Informe o nome da sua loja.');
      return;
    }
    if (!categoria) {
      toast.error('Escolha a categoria principal da sua loja.');
      return;
    }
    const today = new Date().toISOString().split('T')[0] ?? '';
    if (dataInicio && today && dataInicio > today) {
      toast.error('A data de início não pode ser no futuro.');
      return;
    }
    saveCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (escolhaLogo === 'tenho' && !logoPreview) {
      toast.error('Faça o envio da sua logo ou selecione "Ainda não tenho logo".');
      return;
    }
    saveCurrentStep(3);
  };

  const handleNextStep3 = () => {
    saveCurrentStep(4);
  };

  const handlePular = (nextPasso: number) => {
    toast('Você pode completar os detalhes da marca mais tarde em Minha empresa.', {
      icon: <HelpCircle className="h-4 w-4 text-amber-400" />,
    });
    saveCurrentStep(nextPasso);
  };

  const togglePersonalidade = (item: string) => {
    if (personalidade.includes(item)) {
      setPersonalidade(personalidade.filter((p) => p !== item));
    } else {
      if (personalidade.length >= 3) {
        toast.error('Escolha no máximo 3 traços de personalidade.');
        return;
      }
      setPersonalidade([...personalidade, item]);
    }
  };

  const addCustomPublico = () => {
    if (customPublico.trim()) {
      const item = customPublico.trim().toLowerCase();
      if (!publico.includes(item)) setPublico([...publico, item]);
      setCustomPublico('');
    }
  };

  const addCustomDiferencial = () => {
    if (customDiferencial.trim()) {
      const item = customDiferencial.trim().toLowerCase();
      if (!diferenciais.includes(item)) setDiferenciais([...diferenciais, item]);
      setCustomDiferencial('');
    }
  };

  const calculateCompletionPercentage = () => {
    let filled = 0;
    let total = 10;
    if (nome) filled++;
    if (categoria) filled++;
    if (cidade) filled++;
    if (whatsapp) filled++;
    if (horario) filled++;
    if (escolhaLogo === 'nao_tenho' || logoPreview) filled++;
    if (cores.length >= 3) filled++;
    if (personalidade.length >= 1) filled++;
    if (tom) filled++;
    if (diferenciais.length >= 1) filled++;
    return Math.round((filled / total) * 100);
  };

  const completionPct = calculateCompletionPercentage();

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#141414]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black italic tracking-tight text-[#EA1D2C]">
              hack du ifood
            </span>
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-white/40 sm:inline-block">
              · Cadastro da Loja
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-white/60">
              Passo {passo} de 4
            </span>
          </div>
        </div>

        {/* Horizontal Progress Bar (NO CIRCLES as required) */}
        <div className="mx-auto mt-4 max-w-4xl">
          <div className="flex h-1.5 w-full gap-2 overflow-hidden bg-white/5">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-full flex-1 transition-all duration-300 ${
                  stepNum < passo
                    ? 'bg-[#EA1D2C]'
                    : stepNum === passo
                      ? 'bg-[#EA1D2C]'
                      : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* ═══════ PASSO 1: SUA LOJA ═══════ */}
        {passo === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <span className="inline-block rounded bg-[#EA1D2C]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                Passo 1
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                Dados da sua loja
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Esses dados são usados uma única vez e preenchem automaticamente todas as suas criações.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#181818] p-6 space-y-6">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Nome da loja <span className="text-[#EA1D2C]">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Burguer do Chefe"
                  className="mt-2 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-white outline-none transition focus:border-[#EA1D2C]"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Categoria principal <span className="text-[#EA1D2C]">*</span>
                </label>
                <select
                  value={categoria}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-white outline-none transition focus:border-[#EA1D2C]"
                >
                  <option value="">Selecione o seu nicho</option>
                  {Object.keys(brandPacks).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cidade ou bairro */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Cidade ou bairro
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex.: Pinheiros, São Paulo - SP"
                  className="mt-2 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-white outline-none transition focus:border-[#EA1D2C]"
                />
              </div>

              {/* WhatsApp e Instagram */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                    WhatsApp da loja
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="mt-2 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-white outline-none transition focus:border-[#EA1D2C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                    Instagram da loja
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@sualoja"
                    className="mt-2 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-white outline-none transition focus:border-[#EA1D2C]"
                  />
                </div>
              </div>

              {/* Horário */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Horário de funcionamento
                </label>
                <input
                  type="text"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  placeholder="Ex.: Terça a Domingo, das 18h às 23h30"
                  className="mt-2 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-white outline-none transition focus:border-[#EA1D2C]"
                />
              </div>

              {/* Data de início */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Data de início no Hack do aiFood <span className="text-[#EA1D2C]">*</span>
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-white outline-none transition focus:border-[#EA1D2C]"
                />
                <p className="mt-1.5 text-xs text-white/50">
                  É daqui que contamos seus 30 dias de evolução.
                </p>
              </div>
            </div>

            <Button
              className="w-full py-4 text-base font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b]"
              disabled={salvando}
              onClick={handleNextStep1}
            >
              Avançar para o Passo 2: Logo da Marca
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {/* ═══════ PASSO 2: SUA LOGO ═══════ */}
        {passo === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <span className="inline-block rounded bg-[#EA1D2C]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                Passo 2
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                Identidade visual e logo
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Sua logo define as cores e a assinatura das fotos e do branding.
              </p>
            </div>

            {/* Two big option cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setEscolhaLogo('tenho')}
                className={`flex flex-col items-start rounded-2xl border p-6 text-left transition ${
                  escolhaLogo === 'tenho'
                    ? 'border-[#EA1D2C] bg-[#EA1D2C]/10 ring-1 ring-[#EA1D2C]'
                    : 'border-white/10 bg-[#181818] hover:border-white/20'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Upload className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">Já tenho logo</h3>
                <p className="mt-1 text-xs text-white/60">
                  Envie sua logo (PNG, JPG ou WebP) e extrairemos as cores oficiais da sua marca automaticamente.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEscolhaLogo('nao_tenho');
                  setLogoPreview('');
                  setLogoPath('');
                }}
                className={`flex flex-col items-start rounded-2xl border p-6 text-left transition ${
                  escolhaLogo === 'nao_tenho'
                    ? 'border-[#EA1D2C] bg-[#EA1D2C]/10 ring-1 ring-[#EA1D2C]'
                    : 'border-white/10 bg-[#181818] hover:border-white/20'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold">Ainda não tenho logo</h3>
                <p className="mt-1 text-xs text-white/60">
                  Usaremos as cores do seu nicho e você poderá gerar uma logo profissional depois com IA.
                </p>
              </button>
            </div>

            {/* If has logo */}
            {escolhaLogo === 'tenho' && (
              <div className="rounded-2xl border border-white/10 bg-[#181818] p-6 space-y-6">
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 p-8 text-center">
                  {logoPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="h-32 w-32 overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-2 shadow-inner">
                        <img
                          src={logoPreview}
                          alt="Prévia da logo"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <span className="mt-3 text-xs text-emerald-400 font-semibold">
                        Logo carregada com sucesso
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-10 w-10 text-white/40" />
                      <p className="mt-3 text-sm font-semibold">
                        Clique para enviar o arquivo da sua logo
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        PNG, JPG ou WebP de até 5 MB
                      </p>
                    </div>
                  )}

                  <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/20">
                    <span>{logoPreview ? 'Trocar arquivo' : 'Selecionar arquivo'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoFile}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300">
                  <strong>Dica de qualidade:</strong> Ideal PNG com fundo transparente, quadrado, a partir de 300 × 300 px.
                </div>

                {/* Color swatches */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Cores dominantes da sua marca (editáveis)
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {cores.map((cor, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center"
                      >
                        <div
                          className="mx-auto h-8 w-full rounded-lg border border-white/20 shadow"
                          style={{ backgroundColor: cor }}
                        />
                        <input
                          type="text"
                          value={cor}
                          onChange={(e) => {
                            const copy = [...cores];
                            copy[idx] = e.target.value;
                            setCores(copy);
                          }}
                          className="mt-2 w-full bg-transparent text-center text-xs font-mono font-semibold uppercase text-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If no logo */}
            {escolhaLogo === 'nao_tenho' && (
              <div className="rounded-2xl border border-white/10 bg-[#181818] p-6 space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#EA1D2C] text-2xl font-black text-white shadow-lg">
                    {nome.slice(0, 2).toUpperCase() || 'LO'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Sem problema!</h3>
                    <p className="mt-1 text-sm text-white/60">
                      No <strong>Cérebro de marca</strong> você poderá criar sua logo do zero com um prompt sob medida.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                    Cores sugeridas para o seu nicho
                  </h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {cores.map((cor, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/10 bg-black/40 p-2.5 text-center"
                      >
                        <div
                          className="mx-auto h-8 w-full rounded-lg border border-white/20 shadow"
                          style={{ backgroundColor: cor }}
                        />
                        <input
                          type="text"
                          value={cor}
                          onChange={(e) => {
                            const copy = [...cores];
                            copy[idx] = e.target.value;
                            setCores(copy);
                          }}
                          className="mt-2 w-full bg-transparent text-center text-xs font-mono font-semibold uppercase text-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 py-4 text-white/70"
                onClick={() => handlePular(3)}
              >
                Pular e completar depois
              </Button>
              <Button
                className="flex-1 py-4 font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b]"
                disabled={salvando}
                onClick={handleNextStep2}
              >
                Avançar para o Passo 3: Estilo da Marca
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* ═══════ PASSO 3: ESTILO DA MARCA ═══════ */}
        {passo === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <span className="inline-block rounded bg-[#EA1D2C]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                Passo 3
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                Estilo, Tom e Posicionamento
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Alimenta a inteligência de todos os prompts para soar exatamente como a sua marca.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#181818] p-6 space-y-6">
              {/* Personalidade */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Personalidade da marca (escolha até 3)
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PERSONALIDADES.map((item) => {
                    const active = personalidade.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => togglePersonalidade(item)}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? 'border-[#EA1D2C] bg-[#EA1D2C] text-white'
                            : 'border-white/15 bg-black/40 text-white/80 hover:border-white/30'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tom de Voz */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Tom de voz
                </label>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {TONS_VOZ.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTom(t)}
                      className={`rounded-xl border py-2.5 text-center text-sm font-medium transition ${
                        tom === t
                          ? 'border-[#EA1D2C] bg-[#EA1D2C] text-white'
                          : 'border-white/15 bg-black/40 text-white/80 hover:border-white/30'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Público */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Público-alvo
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PUBLICOS_DEFAULT.map((p) => {
                    const active = publico.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => {
                          if (active) setPublico(publico.filter((x) => x !== p));
                          else setPublico([...publico, p]);
                        }}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? 'border-[#EA1D2C] bg-[#EA1D2C]/20 text-[#EA1D2C]'
                            : 'border-white/10 bg-black/30 text-white/60'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customPublico}
                    onChange={(e) => setCustomPublico(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomPublico())}
                    placeholder="Adicionar outro público..."
                    className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none"
                  />
                  <Button size="sm" variant="outline" onClick={addCustomPublico}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Faixa de Preço */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Faixa de preço
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {FAIXAS_PRECO.map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setFaixaPreco(f)}
                      className={`rounded-xl border py-2.5 text-center text-sm font-medium transition ${
                        faixaPreco === f
                          ? 'border-[#EA1D2C] bg-[#EA1D2C] text-white'
                          : 'border-white/15 bg-black/40 text-white/80 hover:border-white/30'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diferenciais */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Diferenciais da loja
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DIFERENCIAIS_DEFAULT.map((d) => {
                    const active = diferenciais.includes(d);
                    return (
                      <button
                        type="button"
                        key={d}
                        onClick={() => {
                          if (active) setDiferenciais(diferenciais.filter((x) => x !== d));
                          else setDiferenciais([...diferenciais, d]);
                        }}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                          active
                            ? 'border-[#EA1D2C] bg-[#EA1D2C]/20 text-[#EA1D2C]'
                            : 'border-white/10 bg-black/30 text-white/60'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customDiferencial}
                    onChange={(e) => setCustomDiferencial(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomDiferencial())}
                    placeholder="Adicionar outro diferencial..."
                    className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none"
                  />
                  <Button size="sm" variant="outline" onClick={addCustomDiferencial}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Estilo Visual */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Estilo visual predominante
                </label>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ESTILOS_VISUAIS.map((ev) => (
                    <button
                      type="button"
                      key={ev}
                      onClick={() => setEstiloVisual(ev)}
                      className={`rounded-xl border py-2.5 text-center text-sm font-medium transition ${
                        estiloVisual === ev
                          ? 'border-[#EA1D2C] bg-[#EA1D2C] text-white'
                          : 'border-white/15 bg-black/40 text-white/80 hover:border-white/30'
                      }`}
                    >
                      {ev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slogan */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  Slogan ou Frase marcante (opcional)
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Ex.: O autêntico smash burger da cidade"
                  className="mt-2 block w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3.5 text-base text-white outline-none transition focus:border-[#EA1D2C]"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 py-4 text-white/70"
                onClick={() => handlePular(4)}
              >
                Pular e completar depois
              </Button>
              <Button
                className="flex-1 py-4 font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b]"
                disabled={salvando}
                onClick={handleNextStep3}
              >
                Avançar para o Resumo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* ═══════ PASSO 4: RESUMO ═══════ */}
        {passo === 4 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <span className="inline-block rounded bg-emerald-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
                Passo 4 · Concluído
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                Perfil da sua marca
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Seu cadastro foi salvo com sucesso. Seus dados alimentarão todas as ferramentas.
              </p>
            </div>

            {/* Completion indicator */}
            <div className="rounded-2xl border border-white/10 bg-[#181818] p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Perfil {completionPct}% completo</span>
                <span className="text-xs text-white/60">
                  {completionPct === 100 ? 'Excelente!' : 'Pronto para uso'}
                </span>
              </div>
              <div className="mt-3 flex h-2 gap-1 overflow-hidden bg-white/5">
                {[20, 40, 60, 80, 100].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-all ${
                      completionPct >= step ? 'bg-emerald-500' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Profile Card */}
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-[#1C1C1C] to-[#121212] p-8 space-y-6 shadow-2xl">
              <div className="flex items-center gap-5">
                {logoPreview ? (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-2 shadow-md">
                    <img
                      src={logoPreview}
                      alt={nome}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#EA1D2C] text-2xl font-black text-white shadow-md">
                    {nome.slice(0, 2).toUpperCase() || 'LO'}
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-black tracking-tight">{nome || 'Minha Loja'}</h2>
                  <p className="text-sm text-[#EA1D2C] font-semibold">{categoria || 'Geral'}</p>
                  {cidade && <p className="text-xs text-white/60">{cidade}</p>}
                </div>
              </div>

              {slogan && (
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 italic text-sm text-white/80">
                  "{slogan}"
                </div>
              )}

              {/* Visual Palette */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Cores oficiais
                </h4>
                <div className="mt-2 flex gap-2">
                  {cores.map((c, i) => (
                    <div
                      key={i}
                      className="h-8 w-12 rounded-lg border border-white/20 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Tags Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-white/10">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Tom e Estilo
                  </span>
                  <p className="mt-1 text-sm font-medium">
                    {tom} · Visual {estiloVisual}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Faixa de Preço
                  </span>
                  <p className="mt-1 text-sm font-medium">{faixaPreco}</p>
                </div>

                {personalidade.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Personalidade
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {personalidade.map((p) => (
                        <span
                          key={p}
                          className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {diferenciais.length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Diferenciais
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {diferenciais.map((d) => (
                        <span
                          key={d}
                          className="rounded-lg bg-[#EA1D2C]/15 text-[#EA1D2C] px-2.5 py-1 text-xs font-medium"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 py-5 text-base sm:text-lg font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b] shadow-xl shadow-[#EA1D2C]/25"
                onClick={() => navigate({ to: '/agente' })}
              >
                Ir para o Agente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="py-5 text-base font-semibold border-white/20 hover:border-white/40"
                onClick={() => navigate({ to: '/tutorial' })}
              >
                <BookOpen className="mr-2 h-5 w-5 text-[#EA1D2C]" />
                Ver tutorial
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
