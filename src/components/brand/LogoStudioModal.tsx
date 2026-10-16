import { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Palette,
  Lightbulb,
  ShieldCheck,
  Flame,
  ArrowRight,
  Store,
  Layers,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogoStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStoreName?: string;
  defaultNiche?: string;
  onSelectPalette?: (colors: string[]) => void;
}

export function LogoStudioModal({
  open,
  onOpenChange,
  defaultStoreName = '',
  defaultNiche = 'Hamburgueria',
  onSelectPalette,
}: LogoStudioModalProps) {
  const [activeTab, setActiveTab] = useState<'modelos' | 'prompt' | 'dicas'>('modelos');
  const [storeName, setStoreName] = useState(defaultStoreName || 'Minha Loja Delivery');
  const [selectedNiche, setSelectedNiche] = useState(defaultNiche || 'Hamburgueria');
  const [selectedStyle, setSelectedStyle] = useState('minimalista');
  const [copied, setCopied] = useState(false);

  // Variedades de nichos com referências, dicas e paletas
  const templates = [
    {
      id: 'hamburgueria',
      nicho: 'Hamburgueria Artesanal',
      icone: '🍔',
      estiloSugerido: 'Mascote Retrô ou Vetor Bold Moderno',
      descricao: 'Linhas grossas de alto contraste, foco no hambúrguer suculento ou elemento de brasa/chapa.',
      cores: ['#EA1D2C', '#F59E0B', '#18181B', '#FFFFFF'],
      dica: 'Evite detalhes minúsculos como gergelins individuais. O contorno externo do smash é o que atrai a atenção na barra de busca do iFood.',
      promptExemplo:
        'Vector flat emblem logo for a smash burger joint called "[NOME]", bold red and amber colors, minimalist icon of a delicious dripping cheeseburger with clean curves, modern sans-serif typography, black background, high contrast, clean vector lines, no raster noise, professional food branding.',
    },
    {
      id: 'pizzaria',
      nicho: 'Pizzaria & Forno a Lenha',
      icone: '🍕',
      estiloSugerido: 'Rústico Italiano ou Geométrico Moderno',
      descricao: 'Formas circulares com fatia em perspectiva ou pá de forno estilizada.',
      cores: ['#DC2626', '#16A34A', '#FBBF24', '#1C1917'],
      dica: 'O queijo derretendo e o formato triangular da fatia comunicam imediatamente a fome do jantar.',
      promptExemplo:
        'Vector logo for an authentic artisan pizzeria named "[NOME]", circular badge design, minimalist stylized melted cheese pizza slice, deep brick red and warm golden yellow, modern vintage typography, isolated on dark background, vector art, Dribbble trending style.',
    },
    {
      id: 'sushi',
      nicho: 'Sushi & Culinária Oriental',
      icone: '🍣',
      estiloSugerido: 'Zen Minimalista / Traço Oriental',
      descricao: 'Linhas extremamente limpas, círculo Enso, peixe estilizado ou tipografia com peso e elegância.',
      cores: ['#EF4444', '#18181B', '#F3F4F6', '#D97706'],
      dica: 'Preto e vermelho transmitem autoridade, frescor e ticket médio mais elevado.',
      promptExemplo:
        'Minimalist luxury logo for a Japanese sushi restaurant named "[NOME]", clean zen circle with a stylized salmon nigiri or wave, crimson red and matte black, Japanese modern aesthetic, sleek sans-serif typography, crisp vector lines, elegant flat design.',
    },
    {
      id: 'doceria',
      nicho: 'Doceria & Confeitaria',
      icone: '🍰',
      estiloSugerido: 'Afetivo / Ilustrado Artesanal',
      descricao: 'Tons suaves de confeitaria, formas arredondadas amigáveis e tipografia delicada.',
      cores: ['#EC4899', '#9333EA', '#FDE047', '#451A03'],
      dica: 'O cérebro associa formas curvas e cores doces com dopamina e conforto imediato.',
      promptExemplo:
        'Adorable and modern flat logo for a pastry and confectionery shop named "[NOME]", stylized cute cupcake or brigadeiro icon, pastel pink and chocolate brown tones, friendly rounded typography, minimalist vector style, charming and appetizing.',
    },
    {
      id: 'marmitaria',
      nicho: 'Marmitaria & Comida Caseira',
      icone: '🍛',
      estiloSugerido: 'Afetuoso Tradicional / Tempero Verde',
      descricao: 'Panela de ferro, tempero fresco, solidez e fartura que transmitem segurança e comida de mãe.',
      cores: ['#D97706', '#15803D', '#78350F', '#FEF3C7'],
      dica: 'Destaque o aroma e o sabor de refeição feita na hora sem ser engordurada.',
      promptExemplo:
        'Warm and welcoming vector logo for a homemade food delivery named "[NOME]", rustic cooking pan or fresh herbs silhouette, warm terracotta orange and forest green, handcrafted typography, honest and appetizing food branding, flat vector icon.',
    },
    {
      id: 'acai',
      nicho: 'Açaí & Sobremesas Geladas',
      icone: '🥤',
      estiloSugerido: 'Pop Vibrante Tropical',
      descricao: 'Tigela estilizada, folhas tropicais, cores energéticas que saltam da tela.',
      cores: ['#6B21A8', '#84CC16', '#F59E0B', '#FFFFFF'],
      dica: 'O roxo do açaí combinado com o verde limão ou amarelo banana cria um dos maiores contrastes do delivery.',
      promptExemplo:
        'Vibrant energetic logo for an açai bowl shop named "[NOME]", stylized açai bowl with tropical leaf, electric purple and neon lime green accents, bold modern display typography, youthful pop art aesthetic, clean vector logo.',
    },
  ];

  // Gera o prompt dinâmico pronto para o ChatGPT ou Midjourney
  const buildPrompt = () => {
    const currentTemplate =
      templates.find((t) => t.nicho.toLowerCase().includes(selectedNiche.toLowerCase())) ||
      templates[0];
    const coresRecomendadas = currentTemplate?.cores ? currentTemplate.cores.join(', ') : '#EA1D2C, #F59E0B, #FFFFFF';

    return `Atue como um designer especialista em identidade visual para marcas de delivery e restaurantes no iFood.
Crie um conceito e o prompt detalhado para gerar a logo da minha loja:

DADOS DA LOJA:
- Nome da marca: "${storeName || 'Minha Loja'}"
- Nicho gastronômico: ${selectedNiche}
- Estilo visual desejado: ${selectedStyle}
- Cores recomendadas: ${coresRecomendadas}

REGRAS DE OURO DA LOGO PARA IFOOD:
1. Deve ser 100% vetorial, plana (flat design) e sem gradientes complexos ou fotos recortadas.
2. Formato quadrado ou circular legível perfeitamente em 32x32 pixels (tamanho do avatar do app).
3. Linhas grossas, poucos elementos e foco em UM único símbolo icônico da culinária.
4. Fundo escuro ou neutro para destacar o ícone principal.

ENTREGA:
1) Conceito da logo (o que o símbolo representa).
2) Sugestão da fonte ideal (tipografia sem serifa forte).
3) O prompt em inglês pronto para eu colar no ChatGPT / DALL-E 3 ou Midjourney v6.`;
  };

  const currentPrompt = buildPrompt();

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt);
      setCopied(true);
      toast.success('Prompt copiado com sucesso! Agora leve para o ChatGPT.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar.');
    }
  };

  const handleOpenChatGPT = () => {
    const encoded = encodeURIComponent(currentPrompt);
    window.open(`https://chatgpt.com/?q=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="border-white/15 bg-[#121214] text-white p-0 overflow-hidden sm:max-w-4xl w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-3xl"
      >
        {/* Cabeçalho do Estúdio */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#161618] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EA1D2C] to-[#ff5967] text-white shadow-md shadow-[#EA1D2C]/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Estúdio de Criação de Logo
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded-md">
                  Guia & Templates
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Variedades, referências visuais e prompts prontos para produzir a logo do seu delivery.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 px-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold"
          >
            Fechar ✕
          </Button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-white/10 px-6 bg-[#141416] shrink-0 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('modelos')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'modelos'
                ? 'border-[#EA1D2C] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4 text-[#EA1D2C]" />
            Variedades por Nicho
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'prompt'
                ? 'border-[#EA1D2C] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            Gerar Prompt para ChatGPT
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dicas')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'dicas'
                ? 'border-[#EA1D2C] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Lightbulb className="h-4 w-4 text-emerald-400" />
            Regras de Sucesso no iFood
          </button>
        </div>

        {/* Conteúdo com rolagem */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ─── ABA 1: MODELOS E VARIEDADES ─── */}
          {activeTab === 'modelos' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-white/80">
                  <strong className="block text-white font-bold mb-1">
                    Como escolher a melhor referência para sua loja:
                  </strong>
                  No delivery, os clientes decidem o que comer em menos de 2 segundos. Sua logo deve
                  comunicar instantaneamente o seu prato principal sem que a pessoa precise ler textos longos.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="rounded-2xl border border-white/10 bg-[#161618] p-5 space-y-4 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{tpl.icone}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-white/80 px-2 py-0.5 rounded-md">
                          {tpl.estiloSugerido}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-white">{tpl.nicho}</h3>
                      <p className="text-xs text-white/60">{tpl.descricao}</p>
                    </div>

                    {/* Paleta de Cores Recomendada */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10">
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span>Paleta oficial de alto apetite:</span>
                        {onSelectPalette && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectPalette(tpl.cores);
                              toast.success(`Paleta de ${tpl.nicho} aplicada à sua loja!`);
                            }}
                            className="text-[#EA1D2C] hover:underline font-bold text-[10px]"
                          >
                            Usar estas cores
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {tpl.cores.map((c, i) => (
                          <div
                            key={i}
                            className="h-6 flex-1 rounded-md border border-white/20 shadow-xs"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Dica de Especialista */}
                    <div className="rounded-xl bg-black/40 p-3 text-[11px] text-amber-200/90 border border-amber-500/20">
                      <strong>Dica de ouro:</strong> {tpl.dica}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNiche(tpl.nicho);
                        setActiveTab('prompt');
                      }}
                      className="w-full text-xs font-bold rounded-xl border-white/15 bg-white/5 hover:bg-[#EA1D2C] hover:text-white hover:border-[#EA1D2C] transition-colors"
                    >
                      Gerar prompt para {tpl.nicho} →
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ABA 2: GERADOR DE PROMPT PARA CHATGPT ─── */}
          {activeTab === 'prompt' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1">
                    Nome da sua Loja
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Smash Bros Burger"
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1">
                    Nicho Culinário
                  </label>
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.nicho} className="bg-[#18181b]">
                        {t.icone} {t.nicho}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block mb-1">
                    Estilo Visual
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white focus:border-[#EA1D2C] focus:outline-hidden"
                  >
                    <option value="minimalista" className="bg-[#18181b]">
                      Minimalista Vetorial (Direto e Limpo)
                    </option>
                    <option value="mascote" className="bg-[#18181b]">
                      Mascote Carismático Retrô
                    </option>
                    <option value="emblema" className="bg-[#18181b]">
                      Emblema Rústico / Artesanal
                    </option>
                    <option value="tipografico" className="bg-[#18181b]">
                      Tipografia Bold em Destaque
                    </option>
                  </select>
                </div>
              </div>

              {/* Caixa do Prompt Pronto */}
              <div className="rounded-2xl border border-white/15 bg-[#161618] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Prompt calibrado para gerar no ChatGPT / DALL-E / Midjourney
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">
                    {currentPrompt.length} caracteres
                  </span>
                </div>

                <pre className="font-mono text-xs text-white/80 bg-black/60 p-4 rounded-xl border border-white/10 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {currentPrompt}
                </pre>

                {/* Ações em 2 passos */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex-1 py-3 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl gap-2 border border-white/10"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Prompt copiado!' : '1. Copiar Prompt'}</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={handleOpenChatGPT}
                    className="flex-1 py-3 text-xs font-bold bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white rounded-xl gap-2 shadow-lg shadow-[#EA1D2C]/30"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>2. Abrir ChatGPT com o Prompt</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ─── ABA 3: DICAS & REGRAS IFOOD ─── */}
          {activeTab === 'dicas' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-[#161618] p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                    <strong className="text-sm font-bold">O que funciona MUITO bem:</strong>
                  </div>
                  <ul className="text-xs text-white/70 space-y-2 list-disc pl-4 pt-1">
                    <li>Contraste forte com o fundo do aplicativo (branco ou preto profundo).</li>
                    <li>
                      Linhas grossas e sólidas que não desaparecem na tela de 6 polegadas do celular.
                    </li>
                    <li>Cores quentes que despertam apetite (vermelho, mostarda, verde tempero).</li>
                    <li>Símbolo único e memorável (fatia, burger, tigela, panela).</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#161618] p-5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Flame className="h-5 w-5" />
                    <strong className="text-sm font-bold">Erros que derrubam vendas:</strong>
                  </div>
                  <ul className="text-xs text-white/70 space-y-2 list-disc pl-4 pt-1">
                    <li>Colocar número de telefone ou endereço dentro da imagem do logo.</li>
                    <li>
                      Usar fotos reais de pratos como foto de perfil (fica borrado e amador).
                    </li>
                    <li>Letras muito finas ou manuscritas ilegíveis em miniatura.</li>
                    <li>Copiar logos de redes famosas sem adaptação própria.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Depois de gerar sua logo no ChatGPT ou Canva:
                </h4>
                <p className="text-xs text-white/60">
                  Salve como imagem (PNG de preferência, fundo transparente ou quadrado de 500x500px) e faça o envio no botão
                  <strong> "Enviar minha logo"</strong>. O sistema extrai automaticamente as cores oficiais para você.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
