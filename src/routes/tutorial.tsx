import { useState, useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  Store,
  Camera,
  ImagePlus,
  FileText,
  Brain,
  MessageSquare,
  Instagram,
  Tags,
  Megaphone,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  CreditCard,
  FolderOpen,
  Sparkles,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TutorialStep } from '@/components/tutorial/TutorialStep';
import { GoldenBookIcon } from '@/components/ui/golden-book-icon';
import { useTutorialProgress } from '@/lib/tutorial-progress';
import { toast } from 'sonner';

export const Route = createFileRoute('/tutorial')({
  head: () => ({
    meta: [
      { title: 'Tutorial e Guia Oficial — Hack do iFood' },
      {
        name: 'description',
        content:
          'Aprenda a tirar fotos certas, organizar pastas de pratos e usar prompts prontos que vendem mais no iFood e Instagram.',
      },
    ],
  }),
  component: TutorialPage,
});

const SECTIONS = [
  { id: 'primeiros-passos', num: '01', title: 'Primeiros passos', icon: Store, desc: 'Cadastro, logo e cores' },
  { id: 'tirar-foto-prato', num: '02', title: 'Tirar foto (até 3 por prato)', icon: Camera, desc: 'De cima, de lado e detalhe' },
  { id: 'meus-materiais-pastas', num: '03', title: 'Meus materiais e pastas', icon: FolderOpen, desc: 'Pastas por prato e Minha marca' },
  { id: 'anexar-direto-ferramentas', num: '04', title: 'Anexar direto nas ferramentas', icon: Sparkles, desc: 'Botão flutuante e 3 passos para o ChatGPT' },
  { id: 'foto-do-prato', num: '05', title: 'Dicas de fotografia', icon: Camera, desc: 'Iluminação, fundo e nitidez' },
  { id: 'gerador-de-imagem', num: '06', title: 'Gerador de imagem', icon: ImagePlus, desc: 'Formatos 1:1, banner e ChatGPT' },
  { id: 'descricao-do-cardapio', num: '07', title: 'Descrição do cardápio', icon: FileText, desc: 'Títulos e regras do iFood' },
  { id: 'cerebro-de-marca', num: '08', title: 'Tom de voz da marca', icon: Brain, desc: 'Posicionamento e público' },
  { id: 'respostas-a-avaliacoes', num: '09', title: 'Respostas a avaliações', icon: MessageSquare, desc: '5 estrelas, 1 estrela e atrasos' },
  { id: 'instagram', num: '10', title: 'Instagram', icon: Instagram, desc: 'Posts, legendas e bio magnética' },
  { id: 'promocoes-e-precificacao', num: '11', title: 'Promoções e precificação', icon: Tags, desc: 'Margem real e combos seguros' },
  { id: 'anuncios', num: '12', title: 'Anúncios', icon: Megaphone, desc: 'Story 9:16 e Carrossel' },
  { id: 'duvidas-frequentes', num: '13', title: 'Dúvidas frequentes', icon: HelpCircle, desc: 'ChatGPT, assinatura e suporte' },
] as const;

export function TutorialPage() {
  const navigate = useNavigate();
  const { isCompleted, markCompleted } = useTutorialProgress();
  const [activeSection, setActiveSection] = useState<string>('primeiros-passos');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleFinishTutorial = () => {
    markCompleted();
    toast.success('Tutorial concluído! Bom trabalho.');
    navigate({ to: '/dashboard' });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-[#141414] p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg">
              <GoldenBookIcon className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Guia Oficial de Sucesso
                </span>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#EA1D2C]/20 text-[#EA1D2C] border border-[#EA1D2C]/30'
                  }`}
                >
                  {isCompleted ? 'CONCLUÍDO ✓' : 'OBRIGATÓRIO'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                Como usar o Hack do iFood
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-white/70">
                Aprenda a tirar as fotos certas, organizar pastas por prato e aplicar os prompts prontos no ChatGPT.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="border-white/20 rounded-xl">
              <Link to="/planos">
                <CreditCard className="mr-2 h-4 w-4" />
                Ver planos
              </Link>
            </Button>
            <Button
              type="button"
              onClick={handleFinishTutorial}
              className="bg-[#EA1D2C] hover:bg-[#ff3b4b] rounded-xl font-bold"
            >
              <Check className="mr-2 h-4 w-4" />
              {isCompleted ? 'Voltar para Meu cardápio' : 'Concluir tutorial'}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Selector */}
      <div className="sticky top-20 z-20 mb-6 block lg:hidden">
        <div className="rounded-xl border border-white/15 bg-[#181818]/95 p-2 backdrop-blur-md shadow-xl">
          <label htmlFor="mobile-tutorial-nav" className="sr-only">
            Navegar pelas seções do tutorial
          </label>
          <select
            id="mobile-tutorial-nav"
            value={activeSection}
            onChange={(e) => scrollToSection(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-[#EA1D2C]"
          >
            {SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.num}. {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Desktop Index + Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Desktop Fixed/Sticky Sidebar Index */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#141414] p-4 shadow-xl">
            <h2 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-white/50">
              Índice do Tutorial
            </h2>
            <nav className="space-y-1">
              {SECTIONS.map((s) => {
                const isActive = activeSection === s.id;
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#EA1D2C] text-white shadow font-semibold'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#EA1D2C]'}`} />
                      <span className="truncate">{s.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono ${
                        isActive ? 'text-white/90' : 'text-white/40'
                      }`}
                    >
                      {s.num}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/10 pt-4 px-2">
              <p className="text-[11px] text-white/50 leading-relaxed">
                Precisa de ajuda ao vivo? Fale com nosso suporte oficial no WhatsApp.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2.5 w-full text-xs rounded-xl">
                <Link to="/planos">Falar com suporte</Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Content Column */}
        <div className="space-y-12 lg:col-span-3">
          {/* 1. Primeiros passos */}
          <section id="primeiros-passos" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 01</span>
              <h2 className="text-2xl font-black text-white">Primeiros passos: Cadastro, logo e cores</h2>
              <p className="text-sm text-white/60">
                Como configurar os dados da sua loja para alimentar automaticamente todos os prompts prontos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Cadastre os dados reais da sua loja"
                paragraphs={[
                  'Acesse a tela "Minha empresa" no menu lateral. Preencha o nome exato do seu restaurante, categoria de culinária, cidade de entrega, WhatsApp e Instagram.',
                  'Todas as ferramentas de prompt utilizam essas variáveis automaticamente, economizando horas de digitação manual.',
                ]}
                imageSrc="/tutorial/primeiros-passos-1.webp"
                imageAlt="Tela de cadastro de empresa com campos de WhatsApp, cidade e horário"
                tip="Se você mudar seu horário de atendimento ou slogan, basta atualizar no perfil: todos os próximos prompts já sairão com os dados novos."
              />

              <TutorialStep
                stepNumber={2}
                title="Defina sua paleta de cores e anexe sua logo"
                paragraphs={[
                  'Envie o arquivo PNG da sua logo (com fundo transparente de preferência) e escolha de 2 a 3 cores principais da sua marca.',
                  'Quando você gerar um anúncio ou banner, o prompt instruirá o ChatGPT a harmonizar o fundo e as fontes com essas cores exatas.',
                ]}
                imageSrc="/tutorial/primeiros-passos-2.webp"
                imageAlt="Seleção de paleta de cores e upload da logo da loja"
                tip="Nunca use imagens pesadas de celular direto como logo: recorte antes em formato quadrado para manter a nitidez."
              />
            </div>
          </section>

          {/* 2. Tirar foto (até 3 por prato) */}
          <section id="tirar-foto-prato" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 02</span>
              <h2 className="text-2xl font-black text-white">Tirar foto: até 3 fotos por prato</h2>
              <p className="text-sm text-white/60">
                Chega de tirar fotos repetidas. Tire exatamente os 3 ângulos que convertem e salve na pasta do prato.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Os 3 ângulos essenciais: De cima, De lado e Detalhe"
                paragraphs={[
                  'Slot 1 (De cima - 90°): Fotografe o prato visto de cima, mostrando a porção completa e os acompanhamentos. Esta é a foto de capa do cardápio.',
                  'Slot 2 (De lado - 45°): Fotografe na diagonal para evidenciar a altura do hambúrguer, o recheio da fatia de pizza ou a textura do molho.',
                  'Slot 3 (Detalhe): Faça um close-up aproximado no queijo derretendo, na carne dourada ou na calda escorrendo. É o que desperta a fome imediata.',
                ]}
                imageSrc="/tutorial/foto-do-prato-1.webp"
                imageAlt="Os 3 slots de fotos de prato: de cima, de lado e detalhe"
                tip="O sistema limita estritamente em 3 fotos por prato para manter seu catálogo leve, organizado e sem desperdício de tempo."
              />

              <TutorialStep
                stepNumber={2}
                title="Câmera direta no celular com botão de disparo"
                paragraphs={[
                  'Na tela "Tirar foto do prato", escolha o prato desejado e toque no botão "Tirar foto agora".',
                  'A tela cheia da câmera se abre com o botão de disparo circular. Se você não gostar do resultado, basta tocar em "Refazer" ou "Remover".',
                ]}
                imageSrc="/tutorial/foto-do-prato-2.webp"
                imageAlt="Interface da câmera com botão de disparo e opções de refazer"
              />
            </div>
          </section>

          {/* 3. Meus materiais e pastas */}
          <section id="meus-materiais-pastas" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 03</span>
              <h2 className="text-2xl font-black text-white">Meus materiais: Pastas por prato estilo Windows</h2>
              <p className="text-sm text-white/60">
                Uma pasta limpa e dedicada para cada prato, além da pasta "Minha marca".
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Estrutura de pastas automática"
                paragraphs={[
                  'Na tela "Meus materiais", você encontra uma pasta para cada prato cadastrado e uma pasta especial "Minha marca".',
                  'Dentro da pasta de cada prato ficam armazenadas as suas até 3 fotos reais e todos os textos e prompts gerados especificamente para aquele item.',
                ]}
                imageSrc="/tutorial/gerador-de-imagem-1.webp"
                imageAlt="Explorador de materiais com pastas de pratos e pasta minha marca"
                tip="Você pode navegar usando a barra de caminho (breadcrumbs), buscar por nome ou alternar entre visualização em grade e lista."
              />

              <TutorialStep
                stepNumber={2}
                title="Ações rápidas de foto e texto"
                paragraphs={[
                  'Ao abrir a pasta de um prato, você pode copiar uma foto com um clique para a área de transferência ou baixá-la em alta definição.',
                  'Os prompts de descrição e anúncios salvos possuem botão de cópia direta para você colar no portal do iFood ou no Instagram.',
                ]}
                imageSrc="/tutorial/gerador-de-imagem-2.webp"
                imageAlt="Ações de copiar foto e texto na pasta do prato"
              />
            </div>
          </section>

          {/* 4. Anexar direto nas ferramentas */}
          <section id="anexar-direto-ferramentas" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 04</span>
              <h2 className="text-2xl font-black text-white">Anexar direto nas ferramentas e 3 passos para o ChatGPT</h2>
              <p className="text-sm text-white/60">
                Como usar o botão flutuante e levar prompts e fotos para o ChatGPT em poucos segundos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Botão flutuante com a logo da sua loja"
                paragraphs={[
                  'Em todas as ferramentas de prompt, você verá um botão flutuante no canto inferior direito exibindo a logo da sua loja.',
                  'Toque nele para abrir o seletor de materiais em qualquer tela: ao selecionar um prato, o nome e as fotos são anexados imediatamente à ferramenta em que você está.',
                ]}
                imageSrc="/tutorial/anuncios-1.webp"
                imageAlt="Botão flutuante e seletor modal de pratos nas ferramentas"
              />

              <TutorialStep
                stepNumber={2}
                title="Painel de ação em 3 passos para o ChatGPT"
                paragraphs={[
                  'Passo 1: Clique em "Copiar prompt pronto" para copiar o comando compilado.',
                  'Passo 2: Clique em "Copiar foto" para colocar a imagem na área de transferência (ou "Baixar" se preferir).',
                  'Passo 3: Clique em "Abrir ChatGPT", cole com Ctrl+V na conversa e envie!',
                ]}
                imageSrc="/tutorial/anuncios-2.webp"
                imageAlt="Painel com 3 passos para o ChatGPT e botão de salvar na pasta do prato"
                tip="Sempre use o botão 'Salvar na pasta do prato' para guardar a versão gerada no explorador de materiais."
              />
            </div>
          </section>

          {/* 5. Dicas de fotografia */}
          <section id="foto-do-prato" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 05</span>
              <h2 className="text-2xl font-black text-white">Dicas de fotografia: Luz, cenário e limpeza</h2>
              <p className="text-sm text-white/60">
                A foto real é a base de tudo. Aprenda a capturar imagens que despertam apetite imediato.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Use luz natural lateral (janela)"
                paragraphs={[
                  'Evite o flash do celular a todo custo: ele achata o prato e tira o brilho dos molhos e carnes.',
                  'Coloque uma mesinha próxima a uma janela iluminada durante o dia. A luz deve entrar de lado para criar sombras suaves e destacar a textura do prato.',
                ]}
                imageSrc="/tutorial/foto-do-prato-1.webp"
                imageAlt="Esquema de iluminação natural com janela lateral para foto de comida"
              />

              <TutorialStep
                stepNumber={2}
                title="Limpeza da borda e fundo neutro"
                paragraphs={[
                  'Limpe qualquer respingo de molho na borda do prato ou embalagem com papel toalha.',
                  'Use um fundo de madeira escura, ardósia ou bancada limpa. Um fundo neutro faz a cor dos alimentos vibrar na tela do celular do cliente.',
                ]}
                imageSrc="/tutorial/foto-do-prato-2.webp"
                imageAlt="Prato montado com borda limpa sobre fundo de madeira"
                tip="Limpe a lente da câmera do celular na camiseta antes de fotografar: a gordura do dedo deixa a foto embaçada sem você perceber."
              />
            </div>
          </section>

          {/* 6. Gerador de imagem */}
          <section id="gerador-de-imagem" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 06</span>
              <h2 className="text-2xl font-black text-white">Gerador de imagem: Formatos 1:1, banner e ChatGPT</h2>
              <p className="text-sm text-white/60">
                Como transformar sua foto simples em uma foto com aspecto profissional de estúdio.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Modo 'Aprimorar' vs 'Criar do zero'"
                paragraphs={[
                  'Sempre prefira o modo "Aprimorar": você envia a foto real do seu prato e o ChatGPT melhora iluminação, fundo e contraste, mantendo o prato fiel.',
                  'O modo "Criar do zero" deve ser usado apenas para mockups de embalagens, fundos conceituais ou banners da loja.',
                ]}
                imageSrc="/tutorial/gerador-de-imagem-1.webp"
                imageAlt="Comparativo entre prato real e imagem aprimorada por IA"
                tip="O iFood exige que a foto represente fielmente o que o cliente recebe em casa. Não gere pratos com ingredientes que você não entrega!"
              />

              <TutorialStep
                stepNumber={2}
                title="Escolha o formato correto"
                paragraphs={[
                  'Quadrado 1:1 (1200x1200): O formato obrigatório para os itens do cardápio no iFood.',
                  'Horizontal 16:9 (1600x900): Para a capa/banner da sua loja no topo do perfil.',
                  'Ícone da loja (500x500): Para a logo circular do perfil.',
                ]}
                imageSrc="/tutorial/gerador-de-imagem-2.webp"
                imageAlt="Formatos 1:1, 16:9 e ícone"
              />
            </div>
          </section>

          {/* 7. Descrição do cardápio */}
          <section id="descricao-do-cardapio" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 07</span>
              <h2 className="text-2xl font-black text-white">Descrição do cardápio: Textos que vendem</h2>
              <p className="text-sm text-white/60">
                Como escrever títulos apetitosos e descrições claras que evitam cancelamentos e dúvidas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Estrutura de uma descrição perfeita"
                paragraphs={[
                  '1. Gancho sensorial: "Burguer artesanal no ponto perfeito..."',
                  '2. Ingredientes reais e porção: gramatura da carne, tipo de queijo, molho especial e acompanhamentos.',
                  '3. Informações claras: peso estimado, serve quantas pessoas, se contém lactose ou glúten.',
                ]}
                imageSrc="/tutorial/descricao-do-cardapio-1.webp"
                imageAlt="Exemplo de descrição de prato completa no iFood"
                tip="Nunca coloque 'o melhor da cidade' ou promessas vagas. Descreva sabores concretos: defumado, crocante, suculento, derretido."
              />
            </div>
          </section>

          {/* 8. Tom de voz da marca */}
          <section id="cerebro-de-marca" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 08</span>
              <h2 className="text-2xl font-black text-white">Tom de voz da marca: Posicionamento único</h2>
              <p className="text-sm text-white/60">
                Alinhe seu delivery com seu público-alvo: família, jovens, gourmet ou universitários.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Defina a personalidade da sua loja"
                paragraphs={[
                  'Escolha até 3 traços: descontraída, tradicional, artesanal, rápida ou premium.',
                  'Essa escolha dita como o ChatGPT responderá avaliações, criará legendas no Instagram e redigirá promoções.',
                ]}
                imageSrc="/tutorial/cerebro-de-marca-1.webp"
                imageAlt="Configuração de tom de voz e público-alvo"
              />
            </div>
          </section>

          {/* 9. Respostas a avaliações */}
          <section id="respostas-a-avaliacoes" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 09</span>
              <h2 className="text-2xl font-black text-white">Respostas a avaliações: Transforme reclamações em vendas</h2>
              <p className="text-sm text-white/60">
                Respostas educadas e profissionais aumentam a nota do restaurante no iFood e atraem novos clientes.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Avaliação de 1 estrela: nunca bata boca"
                paragraphs={[
                  'Agradeça pelo aviso, peça desculpas com empatia, relate brevemente a solução aplicada na cozinha e convide o cliente para conversar no WhatsApp da loja.',
                  'Outros clientes leem suas respostas para decidir se confiam no seu restaurante.',
                ]}
                imageSrc="/tutorial/respostas-a-avaliacoes-1.webp"
                imageAlt="Exemplo de resposta elegante para avaliação crítica"
              />
            </div>
          </section>

          {/* 10. Instagram */}
          <section id="instagram" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 10</span>
              <h2 className="text-2xl font-black text-white">Instagram: Posts, legendas e bio magnética</h2>
              <p className="text-sm text-white/60">
                Transforme seguidores em pedidos frequentes no iFood ou WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Bio clara com link direto"
                paragraphs={[
                  'A bio precisa responder 3 perguntas em 3 segundos: O que você vende? Onde entrega? Como pedir agora?',
                  'Utilize a ferramenta "Minha página" para criar uma landing page com link direto para o cardápio do iFood.',
                ]}
                imageSrc="/tutorial/instagram-1.webp"
                imageAlt="Estrutura de bio magnética para perfil de delivery"
              />
            </div>
          </section>

          {/* 11. Promoções e precificação */}
          <section id="promocoes-e-precificacao" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 11</span>
              <h2 className="text-2xl font-black text-white">Promoções e precificação: Lucro protegido</h2>
              <p className="text-sm text-white/60">
                Crie combos e cupons calculando a comissão do iFood sem tomar prejuízo no final do mês.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Cálculo da margem com taxa de entrega"
                paragraphs={[
                  'Informe o preço atual, custo de produção e a taxa da plataforma (ex.: 12% a 27%).',
                  'O prompt gera sugestões de ancoragem e combos (ex.: prato + bebida) para aumentar seu ticket médio.',
                ]}
                imageSrc="/tutorial/promocoes-1.webp"
                imageAlt="Calculadora de margem e estrutura de precificação"
              />
            </div>
          </section>

          {/* 12. Anúncios */}
          <section id="anuncios" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 12</span>
              <h2 className="text-2xl font-black text-white">Anúncios: Story 9:16 e Carrossel</h2>
              <p className="text-sm text-white/60">
                Criativos de alta conversão para anúncios patrocinados no Instagram e Meta Ads.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Story 9:16 com zonas seguras"
                paragraphs={[
                  'O formato Story (1080x1920) exige zonas de respiro de 250px no topo e na base.',
                  'Nosso prompt instrui a IA a centralizar a foto apetitosa e o título chamativo no meio da tela.',
                ]}
                imageSrc="/tutorial/anuncios-1.webp"
                imageAlt="Gabarito de Story 9:16 com zonas seguras"
              />
            </div>
          </section>

          {/* 13. Dúvidas frequentes */}
          <section id="duvidas-frequentes" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 13</span>
              <h2 className="text-2xl font-black text-white">Dúvidas frequentes e suporte</h2>
              <p className="text-sm text-white/60">
                Respostas rápidas sobre o funcionamento do ChatGPT, planos e suporte.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 space-y-2">
                <h3 className="font-bold text-white text-base">
                  Preciso ter o ChatGPT Plus (pago) para usar os prompts?
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Não obrigatoriamente. O ChatGPT gratuito já lê os prompts e fotos perfeitamente. No entanto, o plano ChatGPT Plus oferece o modelo GPT-4o e DALL-E 3 com maior resolução e texturas aprimoradas.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 space-y-2">
                <h3 className="font-bold text-white text-base">
                  O que acontece se meu plano experimental de 7 dias expirar?
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Você nunca perde seus materiais salvos: a aba "Meus materiais" e os dados da sua empresa continuam sempre acessíveis. Apenas a geração de novos prompts fica pausada até a ativação de um plano Mensal ou Trimestral.
                </p>
              </div>
            </div>
          </section>

          {/* Final Completion Card */}
          <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-[#181818] to-[#141414] p-8 text-center space-y-4 shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <GoldenBookIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Parabéns! Você completou o tutorial</h2>
              <p className="text-sm text-white/70 max-w-lg mx-auto mt-1">
                Agora você sabe como tirar as 3 fotos dos pratos, organizar seus materiais e levar os prompts prontos direto para o ChatGPT.
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleFinishTutorial}
                className="h-14 px-8 rounded-2xl bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white text-base font-bold shadow-xl shadow-[#EA1D2C]/20 gap-2"
              >
                <Check className="h-5 w-5" />
                Concluir tutorial e ir para Meu cardápio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
