/**
 * Guias, Exemplos e Usabilidade para os Fluxos do Agente
 *
 * Fornece dicas estruturadas (Para que serve, Exemplo bom, Evite),
 * frases de pré-visualização ao passar o mouse nas opções,
 * medidor de qualidade do briefing (1 a 5) e exemplos prontos reais.
 */

export interface PassoGuia {
  paraQue: string;
  exemploBom: string;
  evite: string;
}

export interface FluxoExemploPronto {
  tituloExemplo: string;
  answers: Record<string, any>;
  spokenDetails?: string;
}

// ─────────────────────────────────────────────────────────────
// 1. DICAS POR PERGUNTA (PARA QUE SERVE, EXEMPLO BOM, EVITE)
// ─────────────────────────────────────────────────────────────
export const STEP_HELP_GUIDES: Record<string, Record<string, PassoGuia>> = {
  anuncio_instagram: {
    prato: {
      paraQue: 'Define o protagonista do anúncio para a IA focar nos ingredientes e apelo certo.',
      exemploBom: 'Escolha seu prato mais vendido ou o carro-chefe da semana.',
      evite: 'Evite tentar falar de todo o cardápio num único post; post que vende foca em um item por vez.',
    },
    estilo_anuncio: {
      paraQue: 'Define a abordagem e o gancho magnético dos primeiros 3 segundos para converter visualizações em pedidos.',
      exemploBom: 'Apetite / Vontade incontrolável para hamburguerias e delivery no iFood.',
      evite: 'Evite promoções vazias se a sua cozinha não tem margem.',
    },
    oferta: {
      paraQue: 'Define o incentivo decisivo que faz o cliente parar de rolar o feed e pedir.',
      exemploBom: 'Combo com acompanhamento ou 10% de desconto no primeiro pedido.',
      evite: 'Nunca selecione uma promoção que sua cozinha não consiga sustentar financeiramente.',
    },
  },

  imagem_prato: {
    prato: {
      paraQue: 'Identifica o prato para a IA especificar a textura real dos insumos.',
      exemploBom: 'Selecione o prato que você precisa colocar como destaque no cardápio.',
      evite: 'Evite nomes genéricos como "Lanche 1"; use o nome comercial apetitoso.',
    },
    o_que_gerar: {
      paraQue: 'Ajusta a proporção da imagem (quadrada para cardápio ou banner horizontal).',
      exemploBom: 'Foto do prato (1:1 quadrado) para o cardápio do iFood.',
      evite: 'Evite formato de stories para capa do cardápio.',
    },
    modo: {
      paraQue: 'Define se a IA vai criar do zero ou instruir o modelo a refinar sua foto real.',
      exemploBom: 'Aprimorar foto real se você já tirou uma foto na sua cozinha.',
      evite: 'Evite criar do zero pratos com montagens muito específicas que a IA não conhece.',
    },
    estilo: {
      paraQue: 'Escolhe o padrão de luz e reflexo gastronômico da fotografia.',
      exemploBom: 'Estúdio profissional de delivery com luz lateral suave.',
      evite: 'Evite fotos escuras demais que escondem o prato no app do iFood.',
    },
    angulo: {
      paraQue: 'Destaca o que o prato tem de mais bonito (altura ou superfície).',
      exemploBom: '45 graus para hambúrgueres e massas; overhead (vista de cima) para pizzas e bowls.',
      evite: 'Evite ângulos baixos para pratos fundos ou tigelas.',
    },
    fundo: {
      paraQue: 'Cria a ambientação da mesa onde o prato é servido.',
      exemploBom: 'Mesa rústica escura com guardanapo nas cores da marca.',
      evite: 'Evite cenários poluídos com muitos elementos disputando atenção.',
    },
    vapor: {
      paraQue: 'Adiciona sensação térmica de comida quente recém-saída da chapa.',
      exemploBom: 'Sim, vapor sutil para pratos quentes e lanches.',
      evite: 'Evite fumaça pesada que pareça queimado ou cubra o produto.',
    },
  },

  descricao_ifood: {
    prato: {
      paraQue: 'Identifica o item do cardápio para escrever o título e a descrição de venda.',
      exemploBom: 'O prato principal que você quer destacar na categoria topo do iFood.',
      evite: 'Não use nomes em código interno da cozinha.',
    },
    tom: {
      paraQue: 'Determina as palavras sensoriais que vão despertar água na boca.',
      exemploBom: 'Apetitoso e sensorial, focado na crocância e frescor.',
      evite: 'Evite tom corporativo frio que não desperta fome.',
    },
    tamanho: {
      paraQue: 'Garante que o texto caiba na tela do celular sem que o cliente precise clicar em "ver mais".',
      exemploBom: 'Curto e direto (até 180 caracteres) para conversão rápida.',
      evite: 'Evite descrições gigantescas com história da família no cadastro do iFood.',
    },
    destaques: {
      paraQue: 'Evidencia os pontos fortes da receita que justificam o preço.',
      exemploBom: 'Carne fresca 100% bovina, queijo artesanal e molho da casa.',
      evite: 'Evite adjetivos vazios sem fatos concretos dos ingredientes.',
    },
  },

  promocao_preco: {
    prato: {
      paraQue: 'Calcula a viabilidade econômica do item no cardápio.',
      exemploBom: 'Prato com boa margem que você pode tracionar em volume.',
      evite: 'Nunca coloque em promoção um item que já opera no limite do custo.',
    },
    objetivo: {
      paraQue: 'Direciona a estratégia de preço (ganhar novos clientes ou aumentar ticket médio).',
      exemploBom: 'Aumentar o ticket médio com combo inteligente.',
      evite: 'Evite dar desconto por dar sem meta financeira clara.',
    },
    tipo: {
      paraQue: 'Molda o mecanismo comercial (combo, cupom ou desconto de/por).',
      exemploBom: 'Combo com acompanhamento para diluir custo de entrega.',
      evite: 'Evite descontos lineares acima de 30% no delivery.',
    },
    calculo: {
      paraQue: 'Alimenta a simulação matemática com custos reais e taxa do iFood.',
      exemploBom: 'Preço de venda R$ 39,90 e custo de insumos (CMV) R$ 14,00.',
      evite: 'Não esqueça de somar embalagens e sacolas ao custo do prato.',
    },
  },

  responder_avaliacao: {
    estrelas: {
      paraQue: 'Define a abordagem de resposta (celebração pública ou gestão de crise privada).',
      exemploBom: '5 estrelas para fidelizar; 1 a 3 estrelas para recuperar o cliente.',
      evite: 'Nunca ignore avaliações com notas baixas.',
    },
    situacao: {
      paraQue: 'Identifica a causa raiz do elogio ou da queixa do cliente.',
      exemploBom: 'Atraso na entrega do motoboy ou temperatura do alimento.',
      evite: 'Evite generalizar dizendo que tudo foi perfeito se o cliente reclamou.',
    },
    tom: {
      paraQue: 'Calibra a postura da loja perante centenas de futuros compradores.',
      exemploBom: 'Empático, maduro e acolhedor sem admitir culpa precoce.',
      evite: 'NUNCA discuta com o cliente nem responda com ironia.',
    },
    texto_avaliacao: {
      paraQue: 'Permite responder citando pontos específicos do comentário do cliente.',
      exemploBom: '"A comida estava ótima, mas o refri chegou morno."',
      evite: 'Evite usar textos prontos de robô que parecem resposta automática de SAC.',
    },
  },

  minha_pagina: {
    estilo_visual: {
      paraQue: 'Personaliza a estética da página de links para combinar com seu público.',
      exemploBom: 'Moderno e escuro para hamburguerias; claro e artesanal para docerias.',
      evite: 'Evite cores berrantes que cansam o olhar no smartphone.',
    },
    links: {
      paraQue: 'Organiza os botões em ordem de lucratividade para seu restaurante.',
      exemploBom: 'WhatsApp sem taxas no topo, seguido de Cardápio iFood e Endereço.',
      evite: 'Evite colocar links quebrados ou redes sociais inativas.',
    },
    cupom: {
      paraQue: 'Destaca uma vantagem imediata para incentivar o cliente a pedir na hora.',
      exemploBom: 'PRIMEIROPEDIDO (10% OFF no WhatsApp).',
      evite: 'Evite cupons com regras complicadas ou datas expiradas.',
    },
  },
};

// Fallback universal para qualquer passo
export const DEFAULT_STEP_HELP: PassoGuia = {
  paraQue: 'Fornece o contexto específico para a IA gerar o material com precisão.',
  exemploBom: 'Escolha a opção mais alinhada com a realidade atual da sua cozinha.',
  evite: 'Evite deixar campos obrigatórios sem resposta para não gerar respostas genéricas.',
};

export function getStepHelp(fluxoId: string, stepId: string): PassoGuia {
  return STEP_HELP_GUIDES[fluxoId]?.[stepId] || DEFAULT_STEP_HELP;
}

// ─────────────────────────────────────────────────────────────
// 2. PRÉ-VISUALIZAÇÃO DE FRASES AO TOCAR / PASSAR O MOUSE
// ─────────────────────────────────────────────────────────────
export const OPTION_PHRASE_PREVIEWS: Record<string, string> = {
  // Objetivos Anúncio
  mais_pedidos: '«Bateu a fome? Peça agora pelo iFood e receba quentinho em menos de 30 minutos!»',
  promocao: '«Oferta especial de hoje: garanta seu prato favorito com desconto exclusivo por tempo limitado!»',
  prato_novo: '«Chegou a novidade mais esperada do cardápio! Experimente hoje mesmo essa criação exclusiva da nossa cozinha.»',
  divulgar_loja: '«Comida de verdade, feita na hora com ingredientes selecionados. Conheça o delivery favorito do bairro!»',
  bastidores: '«Dá uma olhada no cuidado e capricho saindo da chapa agora. É assim que preparamos cada pedido!»',
  depoimento: '«"O melhor que já pedi no delivery!" Veja o que nossos clientes estão falando sobre nós.»',

  // Climas / Tons
  agitado: '«Corre que a chapa tá fervendo! 🔥 Peça agora antes que acabem os estoques de hoje!»',
  divertido: '«E aí, bateu aquela fome monstra? 😋 Relaxa que a gente resolve o seu jantar agora mesmo!»',
  tranquilo: '«Sabor que abraça: feito com tempo, carinho e ingredientes frescos para o seu momento de paz.»',
  elegante: '«Uma composição gastronômica impecável para quem aprecia cortes nobres e preparo autoral.»',
  direto: '«Carne suculenta, queijo derretido no ponto e entrega rápida. Peça já pelo link.»',

  // Ocasiões
  hoje: '«Válido apenas hoje! Toque no botão e garanta o seu almoço/jantar quentinho agora.»',
  fim_de_semana: '«Fim de semana chegou: reúne a galera no sofá que a comida boa fica por nossa conta!»',
  sexta_happy_hour: '«Sextou com S de Sabor! Recompensa merecida para fechar a semana com chave de ouro.»',
  almoco: '«Pausa no trabalho com refeição de verdade. Peça seu almoço rápido e sem complicação.»',
  jantar: '«Noite de descanso pede comida gostosa no conforto de casa. Já escolheu o seu?»',

  // Ofertas
  sem_oferta: '«Foco total na qualidade premium da nossa receita original sem atalhos.»',
  desconto_10: '«Use o cupom BEMVINDO10 e ganhe 10% de desconto no seu pedido agora.»',
  desconto_20: '«Super desconto de 20% no prato principal: oportunidade única para experimentar hoje!»',
  combo: '«Leva o prato completo com batata crocante e bebida gelada por um preço imperdível.»',
  brinde: '«Pediu hoje, ganhou uma sobremesa artesanal cortesia da nossa casa!»',
  frete_gratis: '«Entrega grátis no iFood para todos os pedidos na nossa região hoje!»',

  // Formatos
  reels: '«Roteiro dinâmico de 20 segundos com gancho visual na chapa e cortes rápidos.»',
  carrossel: '«Sequência de slides mostrando montagem, ingredientes e chamada para ação final.»',
  stories: '«Story vertical em 9:16 com texto grande, figurinha de pedir e link direto.»',
  post_unico: '«Foto marcante de capa com legenda envolvente e hashtags estratégicas.»',

  // CTA
  ifood: '«Toque no link abaixo e peça agora direto no nosso cardápio do iFood!»',
  whatsapp: '«Chame nossa equipe pelo WhatsApp no link da bio e faça seu pedido sem taxas!»',
  link_bio: '«Acesse o link da nossa bio para conferir cardápio completo, fotos e promoções!»',
  visita: '«Venha nos visitar hoje no nosso espaço ou peça pelo delivery no conforto de casa!»',

  // Avaliações
  '5_estrelas': '«Que alegria receber seu carinho! Toda a nossa equipe ficou radiante com seu feedback!»',
  '1_3_estrelas': '«Sentimos muito que sua experiência não tenha sido impecável. Queremos te ouvir no WhatsApp e resolver.»',
};

export function getOptionPreviewPhrase(optionId: string, fallback: string = ''): string {
  return OPTION_PHRASE_PREVIEWS[optionId] || fallback;
}

// ─────────────────────────────────────────────────────────────
// 3. ITENS ENTREGÁVEIS ("O QUE VOCÊ VAI RECEBER")
// ─────────────────────────────────────────────────────────────
export const FLUXO_DELIVERABLES: Record<string, string[]> = {
  anuncio_instagram: [
    '3 opções de ganchos irresistíveis para os primeiros 3 segundos',
    'Roteiro visual segundo a segundo para vídeo (Reels/Stories) ou arte estática',
    'Legenda persuasiva com limite exato de caracteres e quebras de linha',
    'Chamada para ação (CTA) direta com link para pedidos',
    '10 hashtags estratégicas divididas por nicho culinário e sua cidade',
  ],

  imagem_prato: [
    'Prompt fotográfico ultra-detalhado em inglês para Midjourney v6 e ChatGPT DALL-E',
    'Configuração técnica de estúdio (softbox lateral a 45°, luz de recorte e vapor sutil)',
    'Enquadramento de lente gastronômica (50mm f/2.8) e profundidade de campo',
    'Guia passo a passo em português para fotografar com o próprio celular na cozinha',
  ],

  descricao_ifood: [
    'Título vendedor rigorosamente dentro do limite de 45 caracteres do iFood',
    'Descrição apetitosa com limite estrito de até 180 caracteres (sem o botão "ver mais")',
    'Lista organizada de ingredientes e composição da receita',
    'Avisos profissionais de alérgenos (glúten, lactose, ovos)',
    'Sugestão inteligente de item complementar (cross-sell) para aumentar o ticket médio',
  ],

  promocao_preco: [
    'Diagnóstico financeiro de margem real deduzindo taxas de 12% a 27% do iFood',
    'Estratégia de preço De/Por com ancoragem psicológica de valor',
    'Engenharia de combo para aumentar ticket médio sem canibalizar o prato',
    'Cópia pronta de notificação push e nome de cupom de alta conversão',
  ],

  responder_avaliacao: [
    'Modelo 1: Resposta afetuosa, alegre e memorável para notas 4 ou 5 estrelas',
    'Modelo 2: Resposta empática, madura e sem culpa precoce para notas 1 a 3 estrelas',
    'Convite elegante para resolução privada no WhatsApp da loja protegendo sua reputação',
  ],

  minha_pagina: [
    'Biografia otimizada em 150 caracteres para o perfil do Instagram com proposta de valor',
    'Estrutura estratégica de 4 botões prioritários (WhatsApp sem taxas, iFood, etc.)',
    'Mensagem de boas-vindas calorosa para a página de links e QR code de embalagem',
  ],

  fotos_pratos: [
    '3 fotos profissionais do prato em ângulos aprovados para delivery',
    'Checklist de cardápio completo do prato cadastrado no sistema',
  ],
};

export function getFluxoDeliverables(fluxoId: string): string[] {
  return (
    FLUXO_DELIVERABLES[fluxoId] || [
      'Prompt estruturado em 3 partes pronto para o ChatGPT',
      'Diretrizes de posicionamento da sua marca',
      'Checklist de auto-verificação da resposta da IA',
    ]
  );
}

// ─────────────────────────────────────────────────────────────
// 4. EXEMPLOS PRONTOS REAIS ("VER EXEMPLO PRONTO")
// ─────────────────────────────────────────────────────────────
export const FLUXO_READY_EXAMPLES: Record<string, FluxoExemploPronto> = {
  anuncio_instagram: {
    tituloExemplo: 'Smash Burger Duplo Cheddar (Hamburgueria do Zé)',
    answers: {
      nome_prato: 'Smash Burger Duplo com Cheddar Inglês',
      estilo_anuncio: 'Apetite / Vontade incontrolável: despertar desejo sensorial incontrolável, foco total no sabor, textura e aroma irresistível',
      estilo_anuncio_id: 'apetite',
      oferta_detalhe: 'Sem oferta especial (preço normal)',
    },
    spokenDetails:
      'Destacar o queijo derretendo na chapa, bacon bem crocante e nossa maionese da casa verde feita artesanalmente.',
  },

  imagem_prato: {
    tituloExemplo: 'Smash Burger em Estúdio Gastronômico',
    answers: {
      nome_prato: 'Smash Burger Duplo com Crosta Caramelizada',
      tipo_imagem: 'Foto do prato (1:1 quadrado)',
      modo: 'criar_novo',
      estilo: 'Foto profissional de estúdio gastronômico com luz suave lateral',
      angulo: '45 graus apetitoso com foco no ingrediente principal',
      fundo: 'Mesa de madeira rústica escura com guardanapo de linho',
      vapor: 'Sim, vapor sutil saindo do burger recém-saído da chapa',
      texto_imagem: 'Nenhum texto na imagem (apenas foto pura)',
    },
    spokenDetails: 'Pão brioche dourado e brilhante com gergelim, queijo escorrendo na lateral e carne com crostinha perfeita.',
  },

  descricao_ifood: {
    tituloExemplo: 'Smash Burger no Cardápio iFood',
    answers: {
      nome_prato: 'Smash Burger Duplo Especial',
      tom: 'Apetitoso e sensorial',
      tamanho: 'Curto e direto (até 180 caracteres)',
      diferencial: 'Duas carnes de 90g smash com crosta perfeita',
      porcao: 'Individual bem servido',
      combina_com: 'Batata rústica com páprica e maionese da casa',
      usou_ia: 'Foto real da nossa cozinha',
    },
    spokenDetails: 'Acompanha maionese da casa em pote separado de 30ml.',
  },

  promocao_preco: {
    tituloExemplo: 'Engenharia de Combo Smash + Batata',
    answers: {
      nome_prato: 'Combo Smash Burger + Batata Rústica + Refri',
      objetivo: 'Aumentar o ticket médio com combo inteligente',
      tipo_promo: 'Combo promocional para aumentar ticket médio',
      duracao: 'Durante o mês todo no delivery',
      preco_atual: {
        preco: '44.90',
        custo: '15.50',
        comissao: '23',
      },
    },
    spokenDetails: 'Queremos aumentar o ticket médio mantendo margem mínima de 35% limpa.',
  },

  responder_avaliacao: {
    tituloExemplo: 'Resposta para Avaliação de 5 Estrelas',
    answers: {
      estrelas: '5 estrelas',
      nome_cliente: 'Mariana Silva',
      situacao: 'Comida excelente, entrega super rápida e quentinha',
      tom: 'Caloroso e acolhedor',
      texto_avaliacao: 'O melhor burger que já comi no delivery! Chegou muito quente, o bacon super crocante e a entrega levou só 25 minutos. Com certeza vou pedir de novo!',
      oferta: 'Sem compensação financeira (apenas agradecimento caloroso)',
    },
    spokenDetails: 'Agradecer muito pelo elogio ao motoboy e à equipe da cozinha.',
  },

  minha_pagina: {
    tituloExemplo: 'Página de Links Hamburgueria do Zé',
    answers: {
      objetivo: 'Direcionar pedidos para o WhatsApp sem taxa e para o iFood',
      estilo_visual: 'Moderno e escuro',
      destaques: 'Smash burgers artesanais, porções crocantes e milkshakes',
      links: [
        'WhatsApp direto (sem taxa)',
        'Cardápio completo no iFood',
        'Endereço e como chegar',
        'Avaliações no Google',
      ],
      cupom: 'QUEROZE10 (10% OFF no primeiro pedido pelo WhatsApp)',
    },
    spokenDetails: 'Foco total em fazer o cliente pedir pelo WhatsApp para economizar na comissão.',
  },
};

export function getFluxoReadyExample(fluxoId: string): FluxoExemploPronto | null {
  return FLUXO_READY_EXAMPLES[fluxoId] || null;
}

// ─────────────────────────────────────────────────────────────
// 5. MEDIDOR DE QUALIDADE DO BRIEFING (1 A 5)
// ─────────────────────────────────────────────────────────────
export interface BriefingQuality {
  score: 1 | 2 | 3 | 4 | 5;
  label: 'Básico' | 'Em progresso' | 'Bom' | 'Muito Bom' | 'Excelente';
  percent: number;
  advice: string;
}

export function calculateBriefingQuality(
  answers: Record<string, any>,
  totalSteps: number,
  answeredCount: number,
  hasRealPhoto: boolean = false,
  spokenDetails: string = '',
): BriefingQuality {
  const hasVoice = Boolean(spokenDetails.trim());
  const completionRatio = totalSteps > 0 ? answeredCount / totalSteps : 0;

  if (completionRatio < 0.3) {
    return {
      score: 1,
      label: 'Básico',
      percent: 20,
      advice: 'Escolha mais opções para dar contexto à IA.',
    };
  }

  if (completionRatio < 0.7) {
    return {
      score: 2,
      label: 'Em progresso',
      percent: 40,
      advice: 'Complete as perguntas principais do cardápio.',
    };
  }

  if (completionRatio >= 0.7 && !hasVoice && !hasRealPhoto) {
    return {
      score: 3,
      label: 'Bom',
      percent: 60,
      advice: 'Fale um detalhe no microfone ou tire uma foto para chegar a Excelente.',
    };
  }

  if ((hasVoice && !hasRealPhoto) || (hasRealPhoto && !hasVoice)) {
    return {
      score: 4,
      label: 'Muito Bom',
      percent: 85,
      advice: hasRealPhoto
        ? 'Adicione um detalhe por voz para alcançar 100% de precisão.'
        : 'Adicione uma foto real do prato para chegar a Excelente.',
    };
  }

  return {
    score: 5,
    label: 'Excelente',
    percent: 100,
    advice: 'Briefing impecável! Seu prompt terá o máximo de fidelidade.',
  };
}
