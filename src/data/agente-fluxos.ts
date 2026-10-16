import {
  Megaphone,
  ImagePlus,
  FileText,
  Tags,
  MessageSquare,
  Globe,
  Camera,
  Flame,
  Clock,
  Sparkles,
  ShoppingBag,
  Award,
  Calendar,
  Gift,
  Smile,
  Zap,
  TrendingUp,
  Percent,
  CheckCircle2,
  Utensils,
  Star,
  Layers,
  Video,
  Share2,
} from 'lucide-react';

export type TipoPergunta =
  | 'unica'
  | 'multipla'
  | 'prato'
  | 'passos_numericos'
  | 'numero'
  | 'estrelas'
  | 'fala';

export interface AgenteOpcao {
  id: string;
  rotulo: string;
  icone?: any;
  descricao?: string;
  valorPrompt: string;
  palavras: string[];
  fraseExemplo?: string;
  isPromocional?: boolean;
}

export interface AgentePasso {
  id: string;
  pergunta: string;
  subtitulo?: string;
  tipo: TipoPergunta;
  obrigatorio?: boolean;
  variavel: string;
  aviso?: string;
  opcoes?: AgenteOpcao[];
  valorPadrao?: any;
  placeholder?: string;
  condicao?: (answers: Record<string, any>) => boolean;
}

export interface AgenteFluxo {
  id: string;
  titulo: string;
  subtitulo: string;
  icone: any;
  toolId: string;
  isPlus?: boolean;
  passos: AgentePasso[];
}

export const AGENTE_FLUXOS: Record<string, AgenteFluxo> = {
  anuncio_instagram: {
    id: 'anuncio_instagram',
    titulo: 'Anúncio para Instagram',
    subtitulo: 'Crie campanhas irresistíveis de posts, stories ou carrossel.',
    icone: Megaphone,
    toolId: 'T8',
    isPlus: true,
    passos: [
      {
        id: 'prato',
        pergunta: 'Qual prato você quer anunciar?',
        subtitulo: 'Selecione um prato da sua loja ou divulgue o cardápio inteiro.',
        tipo: 'prato',
        obrigatorio: true,
        variavel: 'nome_prato',
        valorPadrao: 'Divulgar a loja toda',
      },
      {
        id: 'estilo_anuncio',
        pergunta: 'Qual o estilo do anúncio?',
        subtitulo: 'A IA direcionará o gancho, as frases e a persuasão para este resultado.',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'estilo_anuncio',
        valorPadrao: 'Apetite / Vontade incontrolável',
        opcoes: [
          {
            id: 'apetite',
            rotulo: 'Apetite / Vontade incontrolável',
            descricao: 'Desperta água na boca imediata destacando o sabor artesanal.',
            fraseExemplo: 'Dá até pra ouvir o queijo estalando... Feito na brasa pra saciar sua maior fome hoje.',
            valorPrompt: 'Apetite / Vontade incontrolável: despertar desejo sensorial incontrolável, foco total no sabor, textura e aroma irresistível',
            palavras: ['apetite', 'vontade', 'fome', 'queijo', 'gostoso', 'agua na boca'],
            isPromocional: false,
          },
          {
            id: 'promocao_preco',
            rotulo: 'Promoção com preço em destaque',
            descricao: 'Oferta agressiva com valor claro para converter na hora.',
            fraseExemplo: 'De R$ 42,90 por apenas R$ 29,90 no iFood só hoje. O sabor que você ama pelo menor preço.',
            valorPrompt: 'Promoção com preço em destaque: oferta imperdível e vantajosa com preço explícito para pedir no impulso',
            palavras: ['promocao', 'preco', 'desconto', 'barato', 'oferta', 'valor'],
            isPromocional: true,
          },
          {
            id: 'combo_almoco',
            rotulo: 'Combo / Almoço completo',
            descricao: 'Prato principal + acompanhamento crocante + bebida gelada por um preço fechado imperdível.',
            fraseExemplo: 'Prato principal + acompanhamento crocante + bebida gelada por um preço fechado imperdível.',
            valorPrompt: 'Combo / Almoço completo: refeição completa com prato, acompanhamento e bebida em oferta única',
            palavras: ['combo', 'almoco', 'completo', 'refeicao', 'bebida'],
            isPromocional: true,
          },
          {
            id: 'bastidores',
            rotulo: 'Bastidores / Artesanal feito do zero',
            descricao: 'Preparo artesanal sem congelados, ingrediente por ingrediente.',
            fraseExemplo: 'Aqui não tem nada congelado: cada receita é preparada à mão todos os dias com ingredientes frescos.',
            valorPrompt: 'Bastidores / Artesanal feito do zero: valorizar o preparo manual, ingredientes frescos e cuidado gastronômico',
            palavras: ['bastidores', 'artesanal', 'fresco', 'zero congelados', 'feito a mao', 'cozinha'],
            isPromocional: false,
          },
          {
            id: 'urgencia_unidades',
            rotulo: 'Urgência / Últimas unidades',
            descricao: 'Gatilho de escassez real para pedir antes que acabe.',
            fraseExemplo: 'Últimas 15 unidades saindo da chapa agora! Corre no iFood antes que esgote o lote de hoje.',
            valorPrompt: 'Urgência / Últimas unidades: escassez de tempo ou lote limitado para gerar pedidos imediatos no iFood',
            palavras: ['urgencia', 'ultimas unidades', 'acabando', 'esgotando', 'lote', 'rapido'],
            isPromocional: true,
          },
          {
            id: 'fim_de_semana',
            rotulo: 'Fim de semana / Compartilhar',
            descricao: 'Mesa cheia, porção caprichada pra galera e entrega quentinha no portão.',
            fraseExemplo: 'Sextou do melhor jeito: mesa cheia, porção caprichada pra galera e entrega quentinha no portão.',
            valorPrompt: 'Fim de semana / Compartilhar: reunir amigos e família, porção farta, celebração e relaxamento',
            palavras: ['fim de semana', 'compartilhar', 'sextou', 'galera', 'amigos', 'familia'],
            isPromocional: false,
          },
          {
            id: 'novidade',
            rotulo: 'Novidade no cardápio',
            descricao: 'Lançamento exclusivo de receita nova no iFood.',
            fraseExemplo: 'Você pediu e ele chegou: experimente nossa nova receita exclusiva que acabou de entrar no iFood.',
            valorPrompt: 'Novidade no cardápio: lançamento de prato novo exclusivo aguçando a curiosidade dos clientes',
            palavras: ['novidade', 'novo', 'lancamento', 'estreia', 'cardapio'],
            isPromocional: false,
          },
          {
            id: 'prova_social',
            rotulo: 'Prova social / O mais pedido',
            descricao: 'Depoimentos, notas altas e o prato campeão de vendas.',
            fraseExemplo: 'Mais de 500 pedidos essa semana e nota 4.9 estrelas. Descubra o campeão indiscutível da casa.',
            valorPrompt: 'Prova social / O mais pedido: segurança de pedir o prato campeão da casa, aprovado por centenas de clientes e nota máxima',
            palavras: ['prova social', 'mais pedido', 'estrelas', 'campeao', 'nota', 'avaliacoes'],
            isPromocional: false,
          },
        ],
      },
      {
        id: 'oferta',
        pergunta: 'Qual é a oferta ou benefício deste anúncio?',
        subtitulo: 'Como o estilo é promocional, defina a condição especial que o cliente vai receber.',
        aviso: 'Só escolha se você vai cumprir de verdade',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'oferta_detalhe',
        valorPadrao: 'Desconto especial de preço',
        condicao: (answers: Record<string, any>) => {
          const estiloId = answers['estilo_anuncio_id'];
          const estiloVal = String(answers['estilo_anuncio'] || '');
          if (answers['estilo_anuncio_is_promocional'] !== undefined) {
            return Boolean(answers['estilo_anuncio_is_promocional']);
          }
          if (['promocao_preco', 'combo_almoco', 'urgencia_unidades'].includes(estiloId)) {
            return true;
          }
          return ['promoção com preço', 'combo / almoço', 'urgência / últimas'].some((k) =>
            estiloVal.toLowerCase().includes(k),
          );
        },
        opcoes: [
          {
            id: 'desconto_especial',
            rotulo: 'Desconto especial de preço',
            descricao: 'Preço reduzido imperdível no iFood.',
            valorPrompt: 'Desconto especial no preço do prato principal',
            palavras: ['desconto', 'preco especial', 'menor preco', 'barato'],
          },
          {
            id: 'combo_refri',
            rotulo: 'Combo com refrigerante ou batata',
            descricao: 'Bebida ou batata grátis ou por valor promocional.',
            valorPrompt: 'Combo promocional com refrigerante ou batata frita inclusos',
            palavras: ['combo', 'refrigerante', 'batata', 'bebida', 'acompanhamento'],
          },
          {
            id: 'compre1_leve2',
            rotulo: 'Compre 1 e leve 2',
            descricao: 'Oferta de volume imbatível.',
            valorPrompt: 'Compre 1 e leve 2 (dobro da quantidade pelo mesmo preço)',
            palavras: ['compre 1 leve 2', 'dobro', '2 por 1', 'duplo'],
          },
          {
            id: 'frete_gratis',
            rotulo: 'Entrega grátis no iFood',
            descricao: 'Taxa zero de entrega nos bairros atendidos.',
            valorPrompt: 'Entrega grátis / frete zero no iFood para os bairros atendidos',
            palavras: ['frete gratis', 'entrega gratis', 'sem taxa', 'taxa zero'],
          },
        ],
      },
    ],
  },

  imagem_prato: {
    id: 'imagem_prato',
    titulo: 'Imagem do prato',
    subtitulo: 'Crie ou aprimore fotos apetitosas para o cardápio.',
    icone: ImagePlus,
    toolId: 'T1',
    passos: [
      {
        id: 'prato',
        pergunta: 'Para qual prato você deseja gerar ou aprimorar a foto?',
        subtitulo: 'Selecione o prato da sua lista.',
        tipo: 'prato',
        obrigatorio: true,
        variavel: 'nome_prato',
      },
      {
        id: 'o_que_gerar',
        pergunta: 'O que você quer criar hoje?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'tipo_imagem',
        valorPadrao: 'Foto do prato para o cardápio',
        opcoes: [
          {
            id: 'foto_prato',
            rotulo: 'Foto do prato (1:1 quadrado)',
            descricao: 'Para o cardápio do iFood, destacando o prato com margem limpa.',
            valorPrompt: 'Foto do prato para o cardápio do iFood (quadrado 1:1)',
            palavras: ['foto', 'prato', 'cardapio', 'quadrado', 'ifood'],
          },
          {
            id: 'capa_loja',
            rotulo: 'Capa da loja (16:9 banner)',
            descricao: 'Banner horizontal para o topo da sua página ou aplicativo.',
            valorPrompt: 'Banner de capa da loja (horizontal 16:9)',
            palavras: ['capa', 'banner', 'topo', 'horizontal'],
          },
          {
            id: 'icone_loja',
            rotulo: 'Ícone da loja (logo quadrada)',
            descricao: 'Ícone simplificado legível até em tamanho minúsculo.',
            valorPrompt: 'Ícone quadrado de marca/loja',
            palavras: ['icone', 'logo', 'marca', 'perfil'],
          },
        ],
      },
      {
        id: 'modo',
        pergunta: 'Qual o modo de criação da imagem?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'modo',
        valorPadrao: 'aprimorar',
        opcoes: [
          {
            id: 'aprimorar',
            rotulo: 'Aprimorar minha foto real (Recomendado)',
            descricao: 'Mantém o prato idêntico ao que você serve e melhora luz, nitidez e fundo.',
            valorPrompt: 'aprimorar',
            palavras: ['aprimorar', 'minha foto', 'foto real', 'melhorar', 'corrigir'],
          },
          {
            id: 'criar',
            rotulo: 'Criar do zero pela descrição',
            descricao: 'Gera uma imagem realista seguindo exatamente os ingredientes informados.',
            valorPrompt: 'criar',
            palavras: ['criar', 'do zero', 'novo', 'gerar'],
          },
        ],
      },
      {
        id: 'estilo',
        pergunta: 'Qual o estilo visual da foto?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'estilo',
        valorPadrao: 'Escuro cinematográfico',
        opcoes: [
          {
            id: 'escuro',
            rotulo: 'Escuro cinematográfico',
            descricao: 'Fundo escuro, iluminação quente e contraste sofisticado.',
            valorPrompt: 'Escuro cinematográfico: fundo escuro em ardósia ou madeira envelhecida, luz lateral quente, realçando texturas com aspecto premium',
            palavras: ['escuro', 'cinematografico', 'preto', 'dark', 'noite'],
          },
          {
            id: 'claro',
            rotulo: 'Claro de cardápio',
            descricao: 'Luz limpa e natural, sensação fresca e apetitosa.',
            valorPrompt: 'Claro de cardápio: iluminação uniforme e brilhante de estúdio, fundo neutro claro, transmitindo frescor e higiene',
            palavras: ['claro', 'branco', 'dia', 'limpo', 'fresco'],
          },
          {
            id: 'vermelho',
            rotulo: 'Vermelho de delivery',
            descricao: 'Tons vibrantes que estimulam o apetite instantâneo.',
            valorPrompt: 'Vermelho de delivery: toques quentes e vibrantes que estimulam apetite imediato e destaque no feed',
            palavras: ['vermelho', 'ifood', 'quente', 'vibrante'],
          },
          {
            id: 'rustico',
            rotulo: 'Rústico e artesanal',
            descricao: 'Tábua de madeira, ferro fundido e atmosfera caseira.',
            valorPrompt: 'Rústico e artesanal: elementos de madeira rústica, toalha de linho e visual feito à mão com alma',
            palavras: ['rustico', 'artesanal', 'caseiro', 'madeira', 'fazenda'],
          },
          {
            id: 'colorido',
            rotulo: 'Colorido e pop',
            descricao: 'Cores alegres e modernas, visual descontraído.',
            valorPrompt: 'Colorido e pop: cores vivas e contrastantes, visual descolado e jovem',
            palavras: ['colorido', 'pop', 'moderno', 'jovem'],
          },
        ],
      },
      {
        id: 'angulo',
        pergunta: 'De qual ângulo o prato deve ser fotografado?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'angulo',
        valorPadrao: '45 graus (visão de quem vai comer)',
        opcoes: [
          {
            id: '45_graus',
            rotulo: '45 graus (visão de quem vai comer)',
            descricao: 'O ângulo mais natural e apetitoso para a maioria dos pratos.',
            valorPrompt: 'Ângulo em 45 graus, visão em perspectiva de quem está sentado à mesa pronto para comer',
            palavras: ['45 graus', 'mesa', 'natural', 'padrao'],
          },
          {
            id: 'de_cima',
            rotulo: 'De cima (Flat lay)',
            descricao: 'Ideal para pizzas, bowls, combos e pratos com muitos acompanhamentos.',
            valorPrompt: 'Ângulo zenital 90 graus (flat lay de cima), prato perfeitamente centralizado com respiro',
            palavras: ['de cima', 'flat lay', 'topo', 'zenital'],
          },
          {
            id: 'de_frente',
            rotulo: 'De frente (Nível dos olhos)',
            descricao: 'Perfeito para hambúrgueres altos, copos, taças e sobremesas em camadas.',
            valorPrompt: 'Ângulo frontal ao nível dos olhos, destacando a altura, camadas e montagem do prato',
            palavras: ['de frente', 'frontal', 'altura', 'hamburguer'],
          },
          {
            id: 'close',
            rotulo: 'Close no detalhe suculento',
            descricao: 'Foco macro no queijo derretendo, na calda escorrendo ou no brilho da carne.',
            valorPrompt: 'Plano fechado macro destacando a textura suculenta e o detalhe mais apetitoso',
            palavras: ['close', 'detalhe', 'macro', 'queijo', 'suculento'],
          },
        ],
      },
      {
        id: 'fundo',
        pergunta: 'Qual o cenário e superfície de fundo?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'fundo',
        valorPadrao: 'Mesa de madeira nobre',
        opcoes: [
          {
            id: 'madeira',
            rotulo: 'Madeira nobre escura',
            descricao: 'Aconchegante e rústico.',
            valorPrompt: 'Tábua ou mesa de madeira escura com veios naturais discretos',
            palavras: ['madeira', 'tabua', 'tronco'],
          },
          {
            id: 'marmore',
            rotulo: 'Mármore elegante',
            descricao: 'Moderno, limpo e sofisticado.',
            valorPrompt: 'Bancada de mármore com veios suaves, visual limpo e refinado',
            palavras: ['marmore', 'pedra', 'chique'],
          },
          {
            id: 'liso_escuro',
            rotulo: 'Ardósia / Fundo cinza escuro',
            descricao: 'Sem distrações, o prato brilha sozinho.',
            valorPrompt: 'Superfície de ardósia ou pedra cinza escura sem reflexos',
            palavras: ['ardosia', 'cinza', 'preto liso', 'pedra escura'],
          },
          {
            id: 'liso_claro',
            rotulo: 'Fundo neutro claro e suave',
            descricao: 'Claridade total, estilo catálogo gourmet.',
            valorPrompt: 'Fundo claro com textura suave e iluminação envolvente',
            palavras: ['claro', 'branco', 'neutro'],
          },
        ],
      },
      {
        id: 'vapor',
        pergunta: 'Deseja efeito de vapor / fumaça saindo do prato?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'vapor',
        valorPadrao: 'Com vapor sutil (indica prato quente feito na hora)',
        opcoes: [
          {
            id: 'com_vapor',
            rotulo: 'Com vapor sutil',
            descricao: 'Indica prato quentinho que acabou de sair da cozinha.',
            valorPrompt: 'Vapor de calor sutil e realista subindo do prato, indicando frescor imediato',
            palavras: ['vapor', 'fumaca', 'quente', 'fumando'],
          },
          {
            id: 'sem_vapor',
            rotulo: 'Sem vapor',
            descricao: 'Para pratos frios, sobremesas, bebidas ou saladas.',
            valorPrompt: 'Sem vapor visível',
            palavras: ['sem vapor', 'frio', 'gelado'],
          },
        ],
      },
      {
        id: 'texto_imagem',
        pergunta: 'Deseja algum texto gráfico na imagem?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'texto_imagem',
        valorPadrao: 'Sem nenhum texto (mais limpo e aprovado no iFood)',
        opcoes: [
          {
            id: 'sem_texto',
            rotulo: 'Sem nenhum texto (Recomendado)',
            descricao: 'Cumpre rigorosamente as diretrizes oficiais do iFood.',
            valorPrompt: 'Sem texto na imagem, foto 100% limpa',
            palavras: ['sem texto', 'limpo', 'foto pura'],
          },
          {
            id: 'nome_prato',
            rotulo: 'Nome do prato discreto',
            descricao: 'Tipografia elegante no canto com contraste.',
            valorPrompt: 'Apenas o nome do prato grafado discretamente com excelente legibilidade',
            palavras: ['nome do prato', 'titulo', 'escrito'],
          },
          {
            id: 'selo_promocao',
            rotulo: 'Selo promocional (apenas para anúncios)',
            descricao: 'Tag discreta de oferta ou novidade.',
            valorPrompt: 'Selo visual discreto de destaque promocional',
            palavras: ['selo', 'tag', 'promocao'],
          },
        ],
      },
    ],
  },

  descricao_ifood: {
    id: 'descricao_ifood',
    titulo: 'Descrição para o iFood',
    subtitulo: 'Textos que abrem o apetite e aumentam a conversão.',
    icone: FileText,
    toolId: 'T5',
    passos: [
      {
        id: 'prato',
        pergunta: 'Qual prato você vai descrever?',
        subtitulo: 'Traz os ingredientes reais cadastrados na pasta do prato.',
        tipo: 'prato',
        obrigatorio: true,
        variavel: 'nome_prato',
      },
      {
        id: 'tom',
        pergunta: 'Qual o tom de voz da descrição?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'tom',
        valorPadrao: 'Apetitoso',
        opcoes: [
          {
            id: 'apetitoso',
            rotulo: 'Apetitoso (texturas, aromas e água na boca)',
            descricao: 'Desperta a vontade imediata de provar.',
            valorPrompt: 'Apetitoso: sentidos e textura, frases curtas, vontade imediata',
            palavras: ['apetitoso', 'gostoso', 'agua na boca', 'suculento'],
          },
          {
            id: 'direto',
            rotulo: 'Direto (o que é, porção e ingredientes)',
            descricao: 'Ideal para quem busca rapidez e clareza objetiva.',
            valorPrompt: 'Direto: o que é, do que é feito, quanto rende, sem enfeite',
            palavras: ['direto', 'simples', 'rapido', 'objetivo'],
          },
          {
            id: 'premium',
            rotulo: 'Premium (gourmet, sofisticação e nobreza)',
            descricao: 'Valoriza itens artesanais de maior ticket.',
            valorPrompt: 'Premium: elegante e sóbrio, destaca a qualidade dos ingredientes',
            palavras: ['premium', 'gourmet', 'chique', 'sofisticado'],
          },
        ],
      },
      {
        id: 'tamanho',
        pergunta: 'Qual a extensão ideal do texto?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'max_palavras',
        valorPadrao: '45',
        opcoes: [
          {
            id: 'curta',
            rotulo: 'Curta (até 25 palavras)',
            descricao: 'Leitura rápida de 3 segundos no celular.',
            valorPrompt: '25',
            palavras: ['curta', 'pequena', 'rapida'],
          },
          {
            id: 'media',
            rotulo: 'Média (até 45 palavras)',
            descricao: 'O equilíbrio perfeito entre apetite e detalhes.',
            valorPrompt: '45',
            palavras: ['media', 'padrao'],
          },
          {
            id: 'longa',
            rotulo: 'Longa e detalhada (até 70 palavras)',
            descricao: 'Ideal para combos completos e pratos especiais.',
            valorPrompt: '70',
            palavras: ['longa', 'detalhada', 'completa'],
          },
        ],
      },
      {
        id: 'destaques',
        pergunta: 'Quais diferenciais desse prato devem brilhar?',
        subtitulo: 'Selecione quantos desejar:',
        tipo: 'multipla',
        obrigatorio: false,
        variavel: 'diferenciais',
        opcoes: [
          {
            id: 'feito_na_hora',
            rotulo: 'Feito na hora',
            valorPrompt: 'Preparado na hora do seu pedido',
            palavras: ['feito na hora', 'quente', 'fresco'],
          },
          {
            id: 'artesanal',
            rotulo: 'Receita artesanal exclusiva',
            valorPrompt: 'Produção artesanal com receita exclusiva da casa',
            palavras: ['artesanal', 'exclusivo', 'caseiro'],
          },
          {
            id: 'generosa',
            rotulo: 'Porção generosa e bem servida',
            valorPrompt: 'Porção farta e generosa que satisfaz de verdade',
            palavras: ['generosa', 'farta', 'grande', 'bem servida'],
          },
          {
            id: 'ingredientes_frescos',
            rotulo: 'Ingredientes selecionados e frescos',
            valorPrompt: 'Ingredientes frescos e de procedência rigorosa',
            palavras: ['frescos', 'selecionados', 'qualidade'],
          },
          {
            id: 'molho_casa',
            rotulo: 'Molho especial da casa',
            valorPrompt: 'Acompanha o famoso molho especial da nossa casa',
            palavras: ['molho', 'molho da casa', 'especial'],
          },
          {
            id: 'serve_dois',
            rotulo: 'Serve 2 pessoas com fartura',
            valorPrompt: 'Ideal para compartilhar (serve 2 pessoas)',
            palavras: ['serve dois', 'duas pessoas', 'casal', 'compartilhar'],
          },
        ],
      },
      {
        id: 'usou_ia',
        pergunta: 'A imagem do cardápio foi gerada ou aprimorada por IA?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'usou_ia',
        valorPadrao: 'não',
        opcoes: [
          {
            id: 'nao',
            rotulo: 'Não (foto 100% natural do restaurante)',
            descricao: 'Sem aviso adicional de imagem ilustrativa.',
            valorPrompt: '',
            palavras: ['nao', 'real', 'natural'],
          },
          {
            id: 'sim',
            rotulo: 'Sim (conterá o aviso legal "Imagem ilustrativa")',
            descricao: 'Protege a loja respeitando as regras do consumidor.',
            valorPrompt: 'sim',
            palavras: ['sim', 'ia', 'inteligencia artificial', 'ilustrativa'],
          },
        ],
      },
    ],
  },

  promocao_preco: {
    id: 'promocao_preco',
    titulo: 'Promoção e preço',
    subtitulo: 'Calcule descontos lucrativos sem ter prejuízo.',
    icone: Tags,
    toolId: 'T9',
    passos: [
      {
        id: 'prato',
        pergunta: 'Para qual prato você quer montar a promoção?',
        tipo: 'prato',
        obrigatorio: true,
        variavel: 'prato',
      },
      {
        id: 'objetivo',
        pergunta: 'Qual o objetivo financeiro da promoção?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'objetivo',
        valorPadrao: 'Atrair novos clientes',
        opcoes: [
          {
            id: 'atrair_novos',
            rotulo: 'Atrair novos clientes',
            descricao: 'Preço de entrada atraente para quem nunca comprou.',
            valorPrompt: 'Atrair novos clientes para a loja com preço de entrada convidativo',
            palavras: ['novos clientes', 'primeira compra', 'atrair'],
          },
          {
            id: 'aumentar_ticket',
            rotulo: 'Aumentar o ticket médio',
            descricao: 'Estimular o cliente a levar acompanhamentos e bebidas.',
            valorPrompt: 'Aumentar o ticket médio por pedido através de combos inteligentes',
            palavras: ['ticket medio', 'aumentar ticket', 'vender mais'],
          },
          {
            id: 'girar_parado',
            rotulo: 'Girar um item com estoque parado',
            descricao: 'Evitar desperdício e movimentar ingredientes estocados.',
            valorPrompt: 'Girar insumos estocados com alta margem antes do vencimento',
            palavras: ['estoque parado', 'girar', 'desperdicio'],
          },
          {
            id: 'horario_fraco',
            rotulo: 'Movimentar horário fraco (ex: 15h às 18h)',
            descricao: 'Garantir pedidos em horários ociosos da cozinha.',
            valorPrompt: 'Preencher horários de menor movimento da cozinha com promoções relâmpago',
            palavras: ['horario fraco', 'ocioso', 'tarde', 'meio de semana'],
          },
        ],
      },
      {
        id: 'tipo',
        pergunta: 'Qual o formato da promoção?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'tipo_promo',
        valorPadrao: 'Combo com acompanhamento',
        opcoes: [
          {
            id: 'combo',
            rotulo: 'Combo com acompanhamento',
            descricao: 'Adiciona batata ou bebida por um valor pequeno.',
            valorPrompt: 'Combo promocional com prato + acompanhamento/bebida',
            palavras: ['combo', 'kit', 'acompanhamento'],
          },
          {
            id: 'desconto_direto',
            rotulo: 'Desconto direto no valor do prato',
            descricao: 'De R$ X por R$ Y bem chamativo.',
            valorPrompt: 'Desconto percentual ou fixo direto no prato',
            palavras: ['desconto', 'de por', 'barato'],
          },
          {
            id: 'brinde',
            rotulo: 'Brinde exclusivo a partir de um valor',
            descricao: 'Ex: "Ganhe uma sobremesa acima de R$ 60".',
            valorPrompt: 'Brinde cortesia para pedidos acima do valor alvo',
            palavras: ['brinde', 'gratis', 'sobremesa'],
          },
          {
            id: 'leve_mais',
            rotulo: 'Leve mais por menos (2ª unidade)',
            descricao: 'Desconto expressivo na segunda unidade do prato.',
            valorPrompt: 'Segunda unidade com desconto progressivo',
            palavras: ['segunda unidade', 'leve mais por menos', '2x1'],
          },
        ],
      },
      {
        id: 'duracao',
        pergunta: 'Qual a duração prevista?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'duracao',
        valorPadrao: '7 dias (uma semana)',
        opcoes: [
          {
            id: 'hoje',
            rotulo: 'Apenas hoje (oferta relâmpago)',
            valorPrompt: 'Válido apenas hoje (oferta relâmpago)',
            palavras: ['hoje', 'relampago'],
          },
          {
            id: 'fds',
            rotulo: 'Fim de semana (sexta a domingo)',
            valorPrompt: 'Durante o fim de semana',
            palavras: ['fim de semana', 'fds'],
          },
          {
            id: 'semana',
            rotulo: '7 dias (uma semana para testar)',
            valorPrompt: 'Campanha de 7 dias de validação',
            palavras: ['7 dias', 'semana'],
          },
          {
            id: 'mes',
            rotulo: '30 dias (campanha mensal)',
            valorPrompt: 'Campanha de 30 dias contínuos',
            palavras: ['30 dias', 'mes'],
          },
        ],
      },
      {
        id: 'calculo',
        pergunta: 'Preço atual e custo de preparo:',
        subtitulo: 'Informe os valores para a IA calcular a margem de segurança.',
        tipo: 'passos_numericos',
        obrigatorio: true,
        variavel: 'preco_atual',
        valorPadrao: { preco: '39.90', custo: '15.00', comissao: '23' },
      },
    ],
  },

  responder_avaliacao: {
    id: 'responder_avaliacao',
    titulo: 'Responder avaliação',
    subtitulo: 'Respostas humanas, educadas e sem bate-boca.',
    icone: MessageSquare,
    toolId: 'T7',
    passos: [
      {
        id: 'estrelas',
        pergunta: 'Quantas estrelas o cliente deixou?',
        tipo: 'estrelas',
        obrigatorio: true,
        variavel: 'estrelas',
        valorPadrao: '5',
      },
      {
        id: 'situacao',
        pergunta: 'Qual foi a situação ou motivo do feedback?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'fatos_reais',
        valorPadrao: 'Elogio à comida e ao sabor',
        opcoes: [
          {
            id: 'elogio',
            rotulo: 'Elogio sincero à comida e sabor',
            descricao: 'Cliente adorou a experiência e quer agradecer.',
            valorPrompt: 'O cliente adorou a comida, elogiou o sabor e a qualidade',
            palavras: ['elogio', 'adorou', 'amou', 'maravilhoso', 'delicia', '10/10'],
          },
          {
            id: 'demora',
            rotulo: 'Demora na entrega',
            descricao: 'Atraso de trânsito ou chuva do entregador.',
            valorPrompt: 'Houve atraso no transporte/motoboy devido à alta demanda ou chuva na região',
            palavras: ['demora', 'atraso', 'demorou', 'motoboy', 'espera'],
          },
          {
            id: 'item_faltando',
            rotulo: 'Item faltando no pacote',
            descricao: 'Bebida, molho ou sobremesa esquecida na montagem.',
            valorPrompt: 'Um item do pedido foi esquecido na conferência da embalagem antes do envio',
            palavras: ['faltando', 'faltou', 'esqueceu', 'sem refrigerante', 'sem molho'],
          },
          {
            id: 'comida_fria',
            rotulo: 'Comida fria ou problema na temperatura',
            descricao: 'Trajeto longo ou entrega compartilhada que esfriou.',
            valorPrompt: 'A comida perdeu a temperatura ideal durante a rota de entrega do motoboy',
            palavras: ['fria', 'comida fria', 'gelada', 'esfriou'],
          },
          {
            id: 'embalagem',
            rotulo: 'Embalagem amassada ou vazou',
            descricao: 'Acidente de transporte que prejudicou a apresentação.',
            valorPrompt: 'A embalagem foi danificada ou revirada durante o percurso da entrega',
            palavras: ['embalagem', 'vazou', 'amassado', 'virou', 'derramou'],
          },
          {
            id: 'atendimento',
            rotulo: 'Atendimento pelo chat do app',
            descricao: 'Dificuldade na comunicação.',
            valorPrompt: 'Houve ruído na comunicação pelo chat da plataforma',
            palavras: ['atendimento', 'chat', 'resposta', 'suporte'],
          },
        ],
      },
      {
        id: 'tom',
        pergunta: 'Qual o tom de voz da resposta?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'tom',
        valorPadrao: 'Empático e acolhedor',
        opcoes: [
          {
            id: 'empatico',
            rotulo: 'Empático e acolhedor',
            descricao: 'Reconhece o sentimento do cliente sem discutir.',
            valorPrompt: 'Empático, caloroso e humano, demonstrando cuidado genuíno com o cliente',
            palavras: ['empatico', 'acolhedor', 'humano', 'carinhoso'],
          },
          {
            id: 'objetivo',
            rotulo: 'Objetivo e profissional',
            descricao: 'Direto, educado e focado na solução.',
            valorPrompt: 'Educado, formal e resolutivo, demonstrando compromisso com a melhoria',
            palavras: ['objetivo', 'profissional', 'formal', 'direto'],
          },
          {
            id: 'recuperacao',
            rotulo: 'Recuperação de cliente insatisfeito',
            descricao: 'Transforma uma nota baixa em uma oportunidade de fidelização.',
            valorPrompt: 'Focado em reverter a má impressão, reconquistar a confiança e convidar para uma nova chance',
            palavras: ['recuperacao', 'reconquistar', 'segunda chance', 'desculpas'],
          },
        ],
      },
      {
        id: 'texto_avaliacao',
        pergunta: 'O que o cliente escreveu na avaliação?',
        subtitulo: 'Cole o texto do app ou fale com o microfone:',
        tipo: 'fala',
        obrigatorio: true,
        variavel: 'avaliacao_texto',
        placeholder: 'Cole aqui o comentário exato deixado pelo cliente...',
      },
      {
        id: 'oferta',
        pergunta: 'Você decidiu oferecer alguma compensação real?',
        subtitulo: 'Atenção: só mencione se sua loja for realmente cumprir.',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'oferta',
        valorPadrao: 'Nenhuma oferta compensatória',
        opcoes: [
          {
            id: 'nenhuma',
            rotulo: 'Nenhuma oferta (apenas pedido de desculpas sincero)',
            descricao: 'Agradece o toque para melhorar os processos internos.',
            valorPrompt: '',
            palavras: ['nenhuma', 'sem oferta', 'apenas desculpas'],
          },
          {
            id: 'cupom',
            rotulo: 'Cupom de desconto especial para o próximo pedido',
            descricao: 'Um incentivo para o cliente voltar e ter uma experiência perfeita.',
            valorPrompt: 'Um cupom especial de desconto para a próxima experiência conosco',
            palavras: ['cupom', 'desconto proximo', 'cupom de desconto'],
          },
          {
            id: 'refazer',
            rotulo: 'Refazer ou enviar o item cortesia',
            descricao: 'Resolver na hora pelo canal de suporte.',
            valorPrompt: 'O reenvio imediato do item correto sem custo adicional',
            palavras: ['refazer', 'reenviar', 'cortesia'],
          },
        ],
      },
    ],
  },

  minha_pagina: {
    id: 'minha_pagina',
    titulo: 'Minha página',
    subtitulo: 'Página de links e cardápio para sua bio e embalagens.',
    icone: Globe,
    toolId: 'T6',
    passos: [
      {
        id: 'estilo_visual',
        pergunta: 'Qual o estilo visual da sua página de links?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'estilo_visual',
        valorPadrao: 'Escuro cinematográfico',
        opcoes: [
          {
            id: 'escuro',
            rotulo: 'Escuro e moderno',
            descricao: 'Fundo preto/grafite com detalhes vibrantes da marca.',
            valorPrompt: 'Design escuro e sofisticado com botões de alto contraste nas cores da marca',
            palavras: ['escuro', 'preto', 'dark', 'grafite'],
          },
          {
            id: 'claro',
            rotulo: 'Claro e minimalista',
            descricao: 'Fundo branco ou off-white, limpo e direto.',
            valorPrompt: 'Design minimalista claro e elegante com tipografia forte',
            palavras: ['claro', 'branco', 'minimalista'],
          },
          {
            id: 'colorido',
            rotulo: 'Colorido e pop',
            descricao: 'Cores alegres que transmitem energia e apetite.',
            valorPrompt: 'Design pop vibrante com cores energéticas da gastronomia',
            palavras: ['colorido', 'pop', 'alegre'],
          },
        ],
      },
      {
        id: 'links',
        pergunta: 'Quais links devem estar ativos na sua página?',
        subtitulo: 'Selecione os botões que os clientes verão:',
        tipo: 'multipla',
        obrigatorio: true,
        variavel: 'links_ativos',
        opcoes: [
          {
            id: 'ifood',
            rotulo: 'Cardápio no iFood',
            valorPrompt: 'Pedir no iFood',
            palavras: ['ifood', 'cardapio ifood', 'pedir'],
          },
          {
            id: 'whatsapp',
            rotulo: 'Pedidos pelo WhatsApp',
            valorPrompt: 'Chamar no WhatsApp',
            palavras: ['whatsapp', 'zap', 'whats'],
          },
          {
            id: 'instagram',
            rotulo: 'Nosso Instagram oficial',
            valorPrompt: 'Seguir no Instagram',
            palavras: ['instagram', 'insta', 'perfil'],
          },
          {
            id: 'localizacao',
            rotulo: 'Como chegar (Google Maps)',
            valorPrompt: 'Como chegar (Localização)',
            palavras: ['maps', 'localizacao', 'endereco', 'chegar'],
          },
          {
            id: 'cardapio_pdf',
            rotulo: 'Ver cardápio completo',
            valorPrompt: 'Ver cardápio completo',
            palavras: ['cardapio', 'menu', 'pdf'],
          },
        ],
      },
      {
        id: 'cupom',
        pergunta: 'Deseja destacar algum cupom de desconto no topo da página?',
        tipo: 'unica',
        obrigatorio: true,
        variavel: 'cupom',
        valorPadrao: 'Sem cupom no momento',
        opcoes: [
          {
            id: 'sem_cupom',
            rotulo: 'Sem cupom no momento',
            valorPrompt: '',
            palavras: ['sem cupom', 'nenhum'],
          },
          {
            id: 'primeira_compra',
            rotulo: 'Cupom de Primeira Compra (ex: BEMVINDO10)',
            descricao: 'Para conquistar o cliente que acabou de conhecer a loja.',
            valorPrompt: 'Cupom BEMVINDO10 para 10% de desconto no primeiro pedido',
            palavras: ['primeira compra', 'bem vindo', 'desconto'],
          },
          {
            id: 'cupom_dia',
            rotulo: 'Cupom do Dia / Especial de Hoje',
            descricao: 'Incentivo com urgência imediata.',
            valorPrompt: 'Cupom especial do dia com vantagem exclusiva',
            palavras: ['cupom do dia', 'hoje', 'especial'],
          },
        ],
      },
    ],
  },

  fotos_pratos: {
    id: 'fotos_pratos',
    titulo: 'Fotos dos pratos',
    subtitulo: 'Tire 3 fotos com o celular ou envie da galeria.',
    icone: Camera,
    toolId: 'FOTO_STUDIO',
    passos: [],
  },
};
