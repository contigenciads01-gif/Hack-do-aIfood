import { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  BookOpen,
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
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TutorialStep } from '@/components/tutorial/TutorialStep';

export const Route = createFileRoute('/tutorial')({
  head: () => ({
    meta: [
      { title: 'Tutorial e Guia de Uso — Hack do aiFood' },
      {
        name: 'description',
        content:
          'Aprenda a tirar fotos certas, gerar imagens e metaprompts que vendem mais no iFood e Instagram.',
      },
    ],
  }),
  component: TutorialPage,
});

const SECTIONS = [
  { id: 'primeiros-passos', num: '01', title: 'Primeiros passos', icon: Store, desc: 'Cadastro, logo e cores' },
  { id: 'foto-do-prato', num: '02', title: 'Foto do prato', icon: Camera, desc: 'Iluminação, enquadramento e ângulo' },
  { id: 'gerador-de-imagem', num: '03', title: 'Gerador de imagem', icon: ImagePlus, desc: 'Formatos 1:1, banner e ChatGPT' },
  { id: 'descricao-do-cardapio', num: '04', title: 'Descrição do cardápio', icon: FileText, desc: 'Títulos e regras do iFood' },
  { id: 'cerebro-de-marca', num: '05', title: 'Cérebro de marca', icon: Brain, desc: 'Posicionamento e tom de voz' },
  { id: 'respostas-a-avaliacoes', num: '06', title: 'Respostas a avaliações', icon: MessageSquare, desc: '5 estrelas, 1 estrela e atrasos' },
  { id: 'instagram', num: '07', title: 'Instagram', icon: Instagram, desc: 'Posts, legendas e bio magnética' },
  { id: 'promocoes-e-precificacao', num: '08', title: 'Promoções e precificação', icon: Tags, desc: 'Margem real e combos seguros' },
  { id: 'anuncios', num: '09', title: 'Anúncios', icon: Megaphone, desc: 'Story 9:16 e Carrossel' },
  { id: 'duvidas-frequentes', num: '10', title: 'Dúvidas frequentes', icon: HelpCircle, desc: 'ChatGPT, assinatura e suporte' },
] as const;

export function TutorialPage() {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-[#141414] p-6 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EA1D2C] text-white shadow-lg">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA1D2C]">
                Guia Oficial de Sucesso
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Como usar o hack du ifood
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-white/70">
                Aprenda a aplicar os metaprompts no ChatGPT para transformar suas vendas, cardápio e anúncios.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="border-white/20">
              <Link to="/planos">
                <CreditCard className="mr-2 h-4 w-4" />
                Ver planos
              </Link>
            </Button>
            <Button asChild className="bg-[#EA1D2C] hover:bg-[#ff3b4b]">
              <Link to="/dashboard">
                Ir para o painel
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
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
              <Button asChild size="sm" variant="outline" className="mt-2.5 w-full text-xs">
                <Link to="/planos">Falar com suporte</Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Content Column (10 Sections) */}
        <div className="space-y-12 lg:col-span-3">
          {/* 1. Primeiros passos */}
          <section id="primeiros-passos" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 01</span>
              <h2 className="text-2xl font-black text-white">Primeiros passos: Cadastro, logo e cores</h2>
              <p className="text-sm text-white/60">
                Como configurar os dados da sua loja para alimentar automaticamente todos os metaprompts.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Cadastre os dados reais da sua loja"
                paragraphs={[
                  'Acesse a tela "Minha empresa" no menu lateral. Preencha o nome exato do seu restaurante, categoria de culinária, cidade de entrega, WhatsApp e Instagram.',
                  'Todos os 9 geradores de prompt utilizam essas variáveis automaticamente, economizando horas de digitação manual.',
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

          {/* 2. Foto do prato */}
          <section id="foto-do-prato" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 02</span>
              <h2 className="text-2xl font-black text-white">Foto do prato: Iluminação e ângulo correto</h2>
              <p className="text-sm text-white/60">
                A foto real é a alma do anúncio. Aprenda a capturar imagens que despertam apetite imediato.
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
                tip="Limpe a lente da câmera do celular com um pano de algodão antes de fotografar; marcas de dedo deixam a foto embaçada."
              />

              <TutorialStep
                stepNumber={2}
                title="Acerte o ângulo: 45 graus ou vista superior (flat lay)"
                paragraphs={[
                  'Para hambúrgueres, pizzas com borda alta e copos de açaí, utilize o ângulo de 45° ou na altura dos olhos.',
                  'Para marmitas, combinados de sushi e pizzas abertas na caixa, fotografe de cima para baixo em 90° (flat lay).',
                ]}
                imageSrc="/tutorial/foto-do-prato-2.webp"
                imageAlt="Comparativo entre ângulos de 45 graus e flat lay de 90 graus"
                tip="Aproxime a câmera sem usar zoom digital acima de 2x para não perder resolução."
              />
            </div>
          </section>

          {/* 3. Gerador de imagem */}
          <section id="gerador-de-imagem" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 03</span>
              <h2 className="text-2xl font-black text-white">Gerador de imagem: Formatos e prompts no ChatGPT</h2>
              <p className="text-sm text-white/60">
                Como utilizar os templates T1, T2 e T3 para produzir imagens profissionais para o iFood.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Escolha o formato: 1:1, Banner ou Ícone"
                paragraphs={[
                  'Foto do prato 1:1 (quadrado 1080x1080) é o padrão para o cardápio do iFood.',
                  'Banner do cardápio (1600x400) é a capa da sua loja na plataforma.',
                  'Ícone da loja (500x500) é a foto de perfil que aparece nas buscas do app.',
                ]}
                imageSrc="/tutorial/gerador-de-imagem-1.webp"
                imageAlt="Seleção dos três formatos de imagem no estúdio do app"
                tip="Gere sempre primeiro a imagem 1:1 do seu prato principal (carro-chefe) antes de montar o banner."
              />

              <TutorialStep
                stepNumber={2}
                title="Copie o metaprompt e cole no ChatGPT com a foto real"
                paragraphs={[
                  'Clique no botão "Copiar prompt" no nosso app.',
                  'Abra o ChatGPT (ou DALL-E / Midjourney). Anexe a foto real que você tirou e cole o metaprompt copiado.',
                  'O prompt instrui a IA a preservar rigorosamente os ingredientes e a proporção real do seu alimento, embelezando o fundo e a iluminação.',
                ]}
                imageSrc="/tutorial/gerador-de-imagem-2.webp"
                imageAlt="Passo a passo colando o prompt e anexando foto no ChatGPT"
                tip="Nunca use comandos vagos como 'faça um hambúrguer bonito'. Use o nosso metaprompt completo que fixa as regras contra alterações falsas."
                exampleToCopy="Aja como fotógrafo e estilista culinário sênior. Melhore a ambientação da foto anexa, mantendo os ingredientes reais do produto intactos. Fundo escuro com iluminação pontual quente."
                exampleLabel="Copiar prompt base"
              />
            </div>
          </section>

          {/* 4. Descrição do cardápio */}
          <section id="descricao-do-cardapio" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 04</span>
              <h2 className="text-2xl font-black text-white">Descrição do cardápio: Textos que vendem</h2>
              <p className="text-sm text-white/60">
                Títulos curtos e descrições claras reduzem cancelamentos e aceleram a decisão de compra.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Títulos de pratos: Direto e apetitoso"
                paragraphs={[
                  'O cliente do iFood lê pelo celular enquanto sente fome. Nomes confusos ou longos demais são ignorados.',
                  'Coloque o tipo do prato + ingrediente nobre + peso/quantidade. Exemplo: "Smash Duplo Bacon 180g" em vez de "Sanduíche especial da casa".',
                ]}
                imageSrc="/tutorial/descricao-do-cardapio-1.webp"
                imageAlt="Exemplo de título bem estruturado no painel do iFood"
                tip="Destaque se serve 1 ou 2 pessoas logo nas primeiras palavras da descrição."
              />

              <TutorialStep
                stepNumber={2}
                title="Metaprompt T4 para descrições completas"
                paragraphs={[
                  'No nosso app, abra "Descrição para o iFood", selecione o prato e liste os ingredientes.',
                  'O gerador entrega uma descrição estruturada em 3 blocos: sabor em destaque, lista de ingredientes e peso aproximado.',
                ]}
                imageSrc="/tutorial/descricao-do-cardapio-2.webp"
                imageAlt="Tela do gerador de descrição com campos preenchidos e prompt resultante"
                exampleToCopy="Dois suculentos hambúrgueres smash de 90g com crostinha crocante, queijo cheddar derretido, fatias de bacon crocante artesanal e maionese defumada no pão brioche amanteigado selado. Acompanha sachê de molho especial. (Aproximadamente 320g · Serve 1 pessoa)"
                exampleLabel="Copiar exemplo de descrição"
              />
            </div>
          </section>

          {/* 5. Cérebro de marca */}
          <section id="cerebro-de-marca" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 05</span>
              <h2 className="text-2xl font-black text-white">Cérebro de marca: Posicionamento e voz</h2>
              <p className="text-sm text-white/60">
                Como criar um tom de voz memorável para que sua loja não pareça mais uma genérica no iFood.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Defina sua personalidade e diferencial"
                paragraphs={[
                  'Uma hamburgueria artesanal noturna fala de forma descontraída e provocativa. Já uma marmitaria caseira para o almoço fala de conforto, afeto e rapidez.',
                  'O template T5 ("Cérebro de marca") formula todo o manual de tom de voz da sua loja em 1 página clara.',
                ]}
                imageSrc="/tutorial/cerebro-de-marca-1.webp"
                imageAlt="Formulário do cérebro de marca com arquétipos e tom de voz"
                tip="Salve o resultado do Cérebro de Marca nos seus materiais: use-o como contexto inicial em qualquer conversa com IA."
              />
            </div>
          </section>

          {/* 6. Respostas a avaliações */}
          <section id="respostas-a-avaliacoes" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 06</span>
              <h2 className="text-2xl font-black text-white">Respostas a avaliações: 5 estrelas e 1 estrela</h2>
              <p className="text-sm text-white/60">
                Respostas atenciosas aumentam o ranqueamento no algoritmo do iFood e revertem clientes insatisfeitos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Revertendo avaliações de 1 estrela sem discussão"
                paragraphs={[
                  'Nunca culpe o cliente ou o motoboy em público. O algoritmo e os futuros clientes analisam sua maturidade.',
                  'Agradeça o toque, peça desculpas pelo ocorrido específico (ex.: embalagem amassada) e convide a pessoa a entrar em contato pelo WhatsApp para um envio de cortesia.',
                ]}
                imageSrc="/tutorial/respostas-a-avaliacoes-1.webp"
                imageAlt="Modelo de resposta a comentário de 1 estrela no painel do iFood"
                exampleToCopy="Olá! Sentimos muito que seu pedido não chegou com o capricho que você merece. Tivemos uma intercorrência com a rota dos entregadores, mas isso não reflete nosso padrão. Por favor, nos chame no WhatsApp para que possamos enviar um novo prato por nossa conta!"
                exampleLabel="Copiar resposta cordial 1 estrela"
              />
            </div>
          </section>

          {/* 7. Instagram */}
          <section id="instagram" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 07</span>
              <h2 className="text-2xl font-black text-white">Instagram: Posts, legendas e bio magnética</h2>
              <p className="text-sm text-white/60">
                Conecte seu Instagram ao iFood com chamadas para ação que geram pedidos nos horários de pico.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Posts nos horários certos (11h e 18h)"
                paragraphs={[
                  'O pico de fome para almoço começa às 11h15; para o jantar, às 18h30.',
                  'Use o gerador de Instagram do app para produzir legendas com gatilhos de urgência e link direto da sua bio para o cardápio.',
                ]}
                imageSrc="/tutorial/instagram-1.webp"
                imageAlt="Exemplo de post no feed com legenda apetitosa e chamada para pedir"
                tip="Coloque sempre o link da sua página própria ou iFood na primeira linha da bio com um emoji de seta."
              />
            </div>
          </section>

          {/* 8. Promoções e precificação */}
          <section id="promocoes-e-precificacao" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 08</span>
              <h2 className="text-2xl font-black text-white">Promoções e precificação: Lucro por pedido</h2>
              <p className="text-sm text-white/60">
                Nunca participe de promoções do iFood sem antes calcular a comissão e as taxas reais.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Fórmula de margem líquida"
                paragraphs={[
                  'Valor líquido = Preço final × (1 − taxa do iFood − desconto concedido). Lucro real = Valor líquido − Custo de produção.',
                  'Nosso gerador T9 calcula exatamente quantos pedidos adicionais você precisa vender para empatar antes de dar qualquer desconto de 20% ou 30%.',
                ]}
                imageSrc="/tutorial/promocoes-e-precificacao-1.webp"
                imageAlt="Planilha de cálculo de margem e simulação de combo lucrativo"
                tip="Dê desconto na bebida ou na sobremesa, onde a margem percentual costuma ser maior que no prato principal."
              />
            </div>
          </section>

          {/* 9. Anúncios */}
          <section id="anuncios" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 09</span>
              <h2 className="text-2xl font-black text-white">Anúncios: Story 9:16 e Carrossel</h2>
              <p className="text-sm text-white/60">
                Crie criativos focados em conversão para campanhas patrocinadas no Instagram e Facebook Ads.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TutorialStep
                stepNumber={1}
                title="Story 9:16 com zonas seguras"
                paragraphs={[
                  'O formato Story (1080x1920) exige zonas de respiro de 250px no topo (foto de perfil) e na base (barra de resposta).',
                  'Nosso metaprompt instrui a IA a concentrar o título curto e a foto irresistível no centro visual, sem cortes.',
                ]}
                imageSrc="/tutorial/anuncios-1.webp"
                imageAlt="Gabarito do Story 9:16 mostrando zonas seguras e foco central"
                tip="Títulos de anúncio devem ter no máximo 5 a 6 palavras. Ex.: 'Bateu a fome? Peça agora!'"
              />

              <TutorialStep
                stepNumber={2}
                title="Carrossel 4:5 de 5 a 7 slides"
                paragraphs={[
                  'Slide 1: Gancho forte com a foto real do prato.',
                  'Slides do meio: Ingredientes especiais, benefícios e prova social de clientes.',
                  'Último slide: Chamada para ação com cupom de primeira compra.',
                ]}
                imageSrc="/tutorial/anuncios-2.webp"
                imageAlt="Sequência de slides de carrossel de Instagram para delivery"
              />
            </div>
          </section>

          {/* 10. Dúvidas frequentes */}
          <section id="duvidas-frequentes" className="scroll-mt-24 space-y-6">
            <div className="border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-[#EA1D2C]">SEÇÃO 10</span>
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
                  Não obrigatoriamente. O ChatGPT gratuito já consegue ler os prompts e fotos perfeitamente. No entanto, o plano ChatGPT Plus oferece o modelo GPT-4o e DALL-E 3 com maior fidelidade de texturas e resolução.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 space-y-2">
                <h3 className="font-bold text-white text-base">
                  O que acontece se meu plano experimental de 7 dias expirar?
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Você nunca perde seus materiais salvos: a aba "Meus materiais" e os dados da "Minha empresa" continuam sempre acessíveis. Apenas a geração de novos prompts fica pausada até a ativação de um plano Mensal ou Trimestral.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 space-y-2">
                <h3 className="font-bold text-white text-base">
                  Como falar diretamente com o suporte técnico?
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Acesse a aba <strong>Planos e assinatura</strong> no menu lateral ou clique no botão abaixo para abrir nosso canal oficial no WhatsApp.
                </p>
                <div className="pt-2">
                  <Button asChild size="sm" className="bg-[#EA1D2C] hover:bg-[#ff3b4b]">
                    <Link to="/planos">
                      Falar com suporte no WhatsApp
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
