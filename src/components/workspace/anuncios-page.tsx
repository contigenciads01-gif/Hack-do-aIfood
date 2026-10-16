import { useState } from 'react';
import {
  Megaphone,
  Smartphone,
  Layers,
  Sparkles,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCompany, isCompanyPlus } from '@/lib/data/company';
import { buildMetaprompt } from '@/lib/metaprompt';
import { PlusUpgradeModal } from './plus-upgrade-modal';
import { ToolPage } from './pages';
import { openCompanyEditor } from '@/lib/company-editor-state';

export function AnunciosPage() {
  const { data: company, isLoading } = useCompany();
  const isPlus = isCompanyPlus(company);

  const [formato, setFormato] = useState<'T_STORY' | 'T_CARROSSEL'>('T_STORY');
  const [objetivo, setObjetivo] = useState('Promoção relâmpago');
  const [produtoOferta, setProdutoOferta] = useState('');
  const [precoCondicao, setPrecoCondicao] = useState('');
  const [cta, setCta] = useState('Pedir no iFood agora');

  const [promptGerado, setPromptGerado] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Missing fields checking
  const missingCompanyFields: string[] = [];
  if (!company?.nome) missingCompanyFields.push('Nome da loja');
  if (!company?.categoria) missingCompanyFields.push('Categoria / Nicho');

  const handleGerarPrompt = () => {
    if (!produtoOferta.trim()) {
      toast.error('Informe o produto ou oferta principal do anúncio.');
      return;
    }

    const companyValues: Record<string, any> = {
      nome_loja: company?.nome || 'Minha Loja',
      responsavel: company?.responsavel || '',
      categoria: company?.categoria || '',
      cidade: company?.cidade || '',
      whatsapp: company?.whatsapp || '',
      instagram: company?.instagram || '',
      cores_marca: (company?.cores || []).join(', '),
      tom: company?.tom || 'Divertido e apetitoso',
    };

    const adValues: Record<string, any> = {
      objetivo,
      produto_oferta: produtoOferta.trim(),
      preco_condicao: precoCondicao.trim(),
      cta,
    };

    const res = buildMetaprompt(formato, adValues, companyValues);
    setPromptGerado(res.text);
    toast.success('Prompt de anúncio gerado com sucesso!');
  };

  const handleCopy = async () => {
    if (!promptGerado) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promptGerado);
      } else {
        // Fallback for mobile / insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = promptGerado;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiado(true);
      toast.success('Prompt copiado para a área de transferência!');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error('Não foi possível copiar automaticamente.');
    }
  };

  const handleDownloadLogo = () => {
    if (!company?.logo_path) {
      toast.error('Sua empresa não possui logo cadastrada no perfil.');
      return;
    }

    const link = document.createElement('a');
    link.href = company.logo_path;
    link.download = `logo-${company.nome || 'empresa'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Download da logo iniciado!');
  };

  if (isLoading) {
    return (
      <ToolPage
        title="Anúncios"
        description="Carregando permissões da sua conta..."
        icon={Megaphone}
      >
        <div className="tool-card">
          <p className="text-white/60">Verificando dados da empresa...</p>
        </div>
      </ToolPage>
    );
  }

  // Strict paywall block for non-Plus users
  if (!isPlus) {
    return (
      <ToolPage
        title="Anúncios (Exclusivo Plus)"
        description="Gere anúncios de Stories e Carrosséis de alta conversão para o seu delivery."
        icon={Megaphone}
      >
        <section className="tool-card overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#1c1c1c] to-[#121212] p-8 text-center text-white shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EA1D2C] to-[#ff5967] shadow-lg shadow-[#EA1D2C]/40">
            <Lock className="h-8 w-8 text-white" />
          </div>

          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            RECURSO EXCLUSIVO DO PLANO PLUS
          </span>

          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
            Acesso Restrito ao Plano Plus
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-white/70">
            A ferramenta de Anúncios utiliza metaprompts avançados calibrados para campanhas de
            Stories 9:16 e Carrosséis 4:5 no Instagram e iFood. Faça o upgrade agora para desbloquear.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#EA1D2C] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#EA1D2C]/40 transition hover:bg-[#ff3b4b]"
            >
              Assinar o Plus
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <PlusUpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
      </ToolPage>
    );
  }

  return (
    <ToolPage
      title="Anúncios (Plus)"
      description="Gere anúncios de Stories e Carrosséis que multiplicam suas vendas no delivery."
      icon={Megaphone}
    >
      {/* Alerta de Perfil Incompleto se faltarem dados */}
      {missingCompanyFields.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <strong>Complete o perfil da sua loja</strong>
            <p className="mt-0.5 text-xs text-amber-200/80">
              Para um anúncio 100% calibrado, preencha: {missingCompanyFields.join(', ')} no seu{' '}
              <button
                type="button"
                onClick={() => openCompanyEditor('identidade')}
                className="underline font-bold hover:text-white cursor-pointer"
              >
                perfil da empresa
              </button>
              .
            </p>
          </div>
        </div>
      )}

      <div className="tool-grid">
        {/* Formulário de Configuração do Anúncio */}
        <section className="tool-card space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60">
              1. Escolha o Formato do Anúncio
            </label>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setFormato('T_STORY');
                  setCta('Pedir no iFood agora');
                }}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  formato === 'T_STORY'
                    ? 'border-[#EA1D2C] bg-[#EA1D2C]/15 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Smartphone className={`mt-0.5 h-5 w-5 ${formato === 'T_STORY' ? 'text-[#EA1D2C]' : ''}`} />
                <div>
                  <strong className="block text-sm font-bold">Story 9:16</strong>
                  <span className="text-xs text-white/50">1080 × 1920 px · Zonas seguras e título em até 6 palavras</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormato('T_CARROSSEL');
                  setCta('Arrasta pro link da bio');
                }}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  formato === 'T_CARROSSEL'
                    ? 'border-[#EA1D2C] bg-[#EA1D2C]/15 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Layers className={`mt-0.5 h-5 w-5 ${formato === 'T_CARROSSEL' ? 'text-[#EA1D2C]' : ''}`} />
                <div>
                  <strong className="block text-sm font-bold">Carrossel 4:5</strong>
                  <span className="text-xs text-white/50">1080 × 1350 px · 5 a 7 slides narrativos com prova e oferta</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60">
              2. Objetivo da Campanha
            </label>
            <select
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#EA1D2C]"
            >
              <option value="Promoção relâmpago" className="bg-[#181818]">Promoção relâmpago</option>
              <option value="Combo especial" className="bg-[#181818]">Combo especial / Novidade</option>
              <option value="Prato mais vendido" className="bg-[#181818]">Prato mais vendido da casa</option>
              <option value="Institucional / Marca" className="bg-[#181818]">Institucional / Por que escolher a gente</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60">
              3. Produto ou Oferta Principal *
            </label>
            <input
              type="text"
              value={produtoOferta}
              onChange={(e) => setProdutoOferta(e.target.value)}
              placeholder="Ex.: Smash Burger Duplo + Fritas Crocantes"
              className="mt-1.5 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#EA1D2C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60">
              4. Preço ou Condição Especial (Opcional)
            </label>
            <input
              type="text"
              value={precoCondicao}
              onChange={(e) => setPrecoCondicao(e.target.value)}
              placeholder="Ex.: R$ 29,90 ou Entrega Grátis até 23h"
              className="mt-1.5 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#EA1D2C]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60">
              5. Chamada para Ação (CTA)
            </label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              placeholder="Ex.: Pedir no iFood agora ou Toque no link da bio"
              className="mt-1.5 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#EA1D2C]"
            />
          </div>

          <Button
            onClick={handleGerarPrompt}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA1D2C] py-4 text-base font-bold text-white shadow-lg shadow-[#EA1D2C]/30 transition hover:bg-[#ff3b4b]"
          >
            <Sparkles className="h-5 w-5" />
            Gerar prompt
          </Button>
        </section>

        {/* Caixa de Resultado e Ações */}
        <section className="tool-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Prompt do Anúncio</h2>
            {company?.tem_logo && company?.logo_path && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadLogo}
                className="gap-1.5 text-xs border-white/20 hover:bg-white/10"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar logo
              </Button>
            )}
          </div>

          {promptGerado ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl border border-white/10 bg-black/50 p-4 font-mono text-xs leading-relaxed text-white/90">
                <pre className="whitespace-pre-wrap break-words">{promptGerado}</pre>
              </div>

              {/* Aviso Solicitado */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                <span className="font-bold">Instrução de uso:</span> Cole no ChatGPT e anexe sua
                logo e a foto real do prato.
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={handleCopy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-black transition hover:bg-white/90 active:scale-[0.99]"
                >
                  {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {copiado ? 'Copiado!' : 'Copiar prompt'}
                </Button>

                {company?.logo_path && (
                  <Button
                    variant="outline"
                    onClick={handleDownloadLogo}
                    className="flex items-center justify-center gap-2 rounded-2xl border-white/20 py-3 text-sm font-semibold hover:bg-white/10"
                  >
                    <Download className="h-4 w-4" />
                    Baixar logo
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state py-12 text-center text-white/50">
              <Megaphone className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">
                Preencha os dados ao lado e clique em <strong>"Gerar prompt"</strong>.
              </p>
              <p className="mt-1 text-xs text-white/40">
                O prompt será formatado respeitando a paleta e os dados cadastrados da sua loja.
              </p>
            </div>
          )}
        </section>
      </div>
    </ToolPage>
  );
}
