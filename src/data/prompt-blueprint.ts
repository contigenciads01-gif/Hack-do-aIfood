/**
 * Prompt Blueprint Engine - Arquitetura de Prompt em 3 Partes
 *
 * Gera prompts de alta fidelidade e estruturados em XML legível:
 * 1. <instrucoes_de_sistema>: Papel, Marca e Regras Gerais inegociáveis.
 * 2. <pedido_da_tarefa>: Tarefa de hoje, variáveis, tom, canal e fotos reais.
 * 3. <formato_do_entregavel>: Estrutura rigorosa, limites e checklist de auto-verificação.
 */

export interface PromptBlueprintResult {
  sistema: string;
  pedido: string;
  entregavel: string;
  checklist: string[];
  completo: string;
}

export interface PromptBlueprintParams {
  toolId: string;
  company?: Record<string, any> | null;
  answers: Record<string, any>;
  prato?: {
    nome?: string | undefined;
    ingredientes?: string[] | undefined;
    fotos?: any[] | undefined;
    prato_fotos?: any[] | undefined;
    preco?: number | null | undefined;
    destaque?: string | null | undefined;
    categoria?: string | undefined;
    descricao?: string | undefined;
    [key: string]: any;
  } | null | undefined;
  spokenDetails?: string;
}

// Map from flowId or toolId to canonical tool key
export function normalizeToolId(id: string): string {
  const map: Record<string, string> = {
    anuncio_instagram: 'anuncio_instagram',
    T3: 'anuncio_instagram',
    imagem_prato: 'imagem_prato',
    T1: 'imagem_prato',
    descricao_ifood: 'descricao_ifood',
    T2: 'descricao_ifood',
    promocao_preco: 'promocao_preco',
    T5: 'promocao_preco',
    responder_avaliacao: 'responder_avaliacao',
    T4: 'responder_avaliacao',
    minha_pagina: 'minha_pagina',
    T6: 'minha_pagina',
  };
  return map[id] || id;
}

export function buildPromptBlueprint({
  toolId,
  company = {},
  answers = {},
  prato = null,
  spokenDetails = '',
}: PromptBlueprintParams): PromptBlueprintResult {
  const canonical = normalizeToolId(toolId);

  // ─────────────────────────────────────────────────────────────
  // 1. DADOS DA EMPRESA E MARCA
  // ─────────────────────────────────────────────────────────────
  const nomeLoja = (company && company['nome']) || 'Minha Loja Gastronômica';
  const categoria = (company && company['categoria']) || 'Restaurante & Delivery';
  const cidade = (company && company['cidade']) ? `${company['cidade']}` : 'Brasil';
  const slogan = (company && company['slogan']) || '';
  const diferencial =
    company && Array.isArray(company['diferenciais']) && company['diferenciais'].length > 0
      ? company['diferenciais'].join(', ')
      : (company && company['diferenciais']) || 'Ingredientes frescos e preparo artesanal';
  const publico =
    company && Array.isArray(company['publico']) && company['publico'].length > 0
      ? company['publico'].join(', ')
      : (company && company['publico']) || 'Pessoas que buscam sabor autêntico e qualidade no delivery';
  const cores =
    company && Array.isArray(company['cores']) && company['cores'].length > 0
      ? company['cores'].join(', ')
      : '#EA1D2C, #1A1A1A, #FFFFFF';
  const personalidade = (company && company['personalidade']) || 'Acolhedora, autêntica e focada no cliente';
  const tomPadrao = answers['tom'] || (company && company['tom']) || 'Apetitoso, direto e caloroso';

  // ─────────────────────────────────────────────────────────────
  // 2. PARTE 1: INSTRUÇÕES DE SISTEMA (COPIAR UMA VEZ)
  // ─────────────────────────────────────────────────────────────
  const sistema = `<instrucoes_de_sistema>
<papel>
Você é um estrategista e copywriter gastronômico de elite, especialista em restaurantes, dark kitchens e delivery no Brasil. Você domina os algoritmos do Instagram, as diretrizes de conversão do iFood e as técnicas de neuromarketing para alimentação. Seu foco é gerar vendas reais, reter clientes e aumentar o ticket médio sem queimar margem de lucro.
</papel>

<marca>
- Nome do negócio: ${nomeLoja}
- Segmento culinário: ${categoria}
- Localização: ${cidade}
${slogan ? `- Slogan / Promessa: ${slogan}` : ''}
- Diferenciais reais: ${diferencial}
- Público-alvo: ${publico}
- Identidade visual / Cores: ${cores}
- Personalidade da marca: ${personalidade}
- Estilo e tom de voz: ${tomPadrao}
</marca>

<regras_gerais>
1. Veracidade estrita: NUNCA invente ingredientes, processos ou acompanhamentos que o prato não possua comprovadamente.
2. Precisão financeira: NUNCA sugira descontos ou ofertas agressivas sem calcular o impacto da margem e das taxas de comissão (12% a 27% do iFood).
3. Português brasileiro natural e vendedor: Sem formalidades burocráticas, sem estrangeirismos desnecessários e com escrita viva.
4. Fim dos clichês vazios: É terminantemente PROIBIDO usar chavões batidos como "uma verdadeira explosão de sabores", "o melhor da cidade", "venha conferir", "não perca essa oportunidade" ou "delicie-se". Use descrições sensoriais táteis e apetitosas de verdade (ex: "crosta dourada crocante", "queijo derretido no ponto", "molho reduzido lentamente").
</regras_gerais>
</instrucoes_de_sistema>`;

  // ─────────────────────────────────────────────────────────────
  // 3. PARTE 2: PEDIDO DA TAREFA (O QUE MUDA A CADA USO)
  // ─────────────────────────────────────────────────────────────
  const nomePrato =
    prato?.nome ||
    answers['nome_prato'] ||
    answers['prato_ou_tema'] ||
    answers['prato'] ||
    'Prato Principal';

  const ingredientes =
    prato?.ingredientes && prato.ingredientes.length > 0
      ? prato.ingredientes.join(', ')
      : answers['ingredientes']
        ? String(answers['ingredientes'])
        : 'Ingredientes originais da receita da casa';

  const hasPhoto = Boolean(
    (prato?.fotos && prato.fotos.length > 0) ||
      (prato?.prato_fotos && prato.prato_fotos.length > 0),
  );

  let tarefaDesc = '';
  let entradasEspecificas = '';

  switch (canonical) {
    case 'anuncio_instagram': {
      const objetivo = answers['objetivo'] || 'Vender no almoço ou jantar hoje';
      const formato = answers['formato'] || 'Vídeo curto (Reels ou Stories)';
      const ganchoEstilo = answers['estilo_gancho'] || 'Curiosidade ou apetite imediato';
      const cta = answers['cta'] || 'Tocar no link da bio para pedir no iFood ou WhatsApp';

      tarefaDesc = `Criar uma campanha de anúncio de alta conversão para o Instagram divulgando o prato "${nomePrato}" com foco em ${objetivo}.`;
      entradasEspecificas = `- Formato do post: ${formato}
- Estilo do gancho de abertura: ${ganchoEstilo}
- Chamada para ação (CTA): ${cta}
- Prato em destaque: ${nomePrato}
- Ingredientes e composição: ${ingredientes}
- Tom da campanha: ${tomPadrao}`;
      break;
    }

    case 'imagem_prato': {
      const estiloFoto = answers['estilo'] || 'Foto profissional de cardápio iFood com iluminação de estúdio';
      const angulo = answers['angulo'] || '45 graus apetitoso com foco no ingrediente principal';
      const cenario = answers['cenario'] || 'Mesa rústica escura com acessórios sutis nas cores da marca';

      tarefaDesc = `Gerar um prompt fotográfico ultra-detalhado para ser renderizado em IAs de imagem (Midjourney v6, DALL-E 3 ou ChatGPT) ou usado como briefing para fotógrafo gastronômico, reproduzindo com fidelidade absoluta o prato "${nomePrato}".`;
      entradasEspecificas = `- Prato: ${nomePrato}
- Ingredientes visíveis reais: ${ingredientes}
- Estilo visual desejado: ${estiloFoto}
- Ângulo de câmera: ${angulo}
- Cenário e superfície: ${cenario}
- Cores da marca a incorporar em detalhes sutis: ${cores}`;
      break;
    }

    case 'descricao_ifood': {
      const diferencialPrato = answers['diferencial'] || 'Artesanal e feito na hora';
      const tamanhoPorcao = answers['porcao'] || 'Individual bem servido';
      const sugestaoBebida = answers['combina_com'] || 'Bebida gelada ou sobremesa da casa';

      tarefaDesc = `Criar o título vendedor e a descrição apetitosa perfeita para cadastrar o prato "${nomePrato}" no cardápio do iFood, otimizada para o app mobile e decisão de compra em menos de 5 segundos.`;
      entradasEspecificas = `- Prato: ${nomePrato}
- Ingredientes reais: ${ingredientes}
- Tamanho da porção / Serve: ${tamanhoPorcao}
- Diferencial de preparo: ${diferencialPrato}
- Sugestão de cross-sell (combina com): ${sugestaoBebida}`;
      break;
    }

    case 'promocao_preco': {
      const precoAtual = answers['preco_atual'] || '39.90';
      const custo = answers['custo'] || '15.00';
      const comissao = answers['comissao'] || '23';
      const tipoPromo = answers['tipo_promo'] || 'Combo promocional para aumentar ticket médio';

      tarefaDesc = `Realizar a análise de engenharia de cardápio, precificação psicológica e estratégia promocional lucrativa para o prato "${nomePrato}" no iFood.`;
      entradasEspecificas = `- Preço de venda atual no cardápio: R$ ${precoAtual}
- Custo dos insumos (CMV estimado): R$ ${custo}
- Taxa de comissão do iFood considerada: ${comissao}%
- Tipo de ação desejada: ${tipoPromo}`;
      break;
    }

    case 'responder_avaliacao': {
      const nota = answers['nota'] || '5 estrelas';
      const comentario = answers['comentario'] || 'Comida maravilhosa, chegou super quente e no tempo certo!';
      const nomeCliente = answers['nome_cliente'] || 'Cliente';

      tarefaDesc = `Elaborar respostas humanas, autênticas e estratégicas para a avaliação deixada no iFood/Google pelo cliente "${nomeCliente}".`;
      entradasEspecificas = `- Nota da avaliação: ${nota}
- Comentário do cliente: "${comentario}"
- Nome do cliente: ${nomeCliente}
- Nome do restaurante: ${nomeLoja}`;
      break;
    }

    case 'minha_pagina': {
      const objetivo = answers['objetivo'] || 'Direcionar pedidos para o WhatsApp sem taxa e para o iFood';
      const enderecoOuRegiao = (company && company['cidade']) || 'Atendimento local';
      const destaques = answers['destaques'] || `${nomePrato}, combos da casa e novidades`;

      tarefaDesc = `Estruturar a biografia perfeita para o perfil do Instagram e o conteúdo da página de links (link da bio e QR code de embalagem) para ${nomeLoja}.`;
      entradasEspecificas = `- Estabelecimento: ${nomeLoja} (${categoria})
- Cidade / Região de entrega: ${enderecoOuRegiao}
- Destaques do cardápio: ${destaques}
- Objetivo prioritário da página: ${objetivo}`;
      break;
    }

    default: {
      tarefaDesc = `Executar a criação de material gastronômico profissional para ${nomeLoja}.`;
      entradasEspecificas = `- Prato / Tema: ${nomePrato}
- Ingredientes: ${ingredientes}`;
    }
  }

  const fotoInstrucao = hasPhoto
    ? `\n- INSTRUÇÃO DE FOTO ANEXADA: Há foto real cadastrada deste prato (${nomePrato}). Ao receber a imagem, analise minuciosamente a disposição dos ingredientes, ponto de cocção, espessura, corte, brilho e apresentação física para ancorar o resultado na realidade do restaurante.`
    : '';

  const vozInstrucao = spokenDetails.trim()
    ? `\n- DETALHES DITADOS POR VOZ PELO PROPRIETÁRIO: "${spokenDetails.trim()}". Considere estas instruções verbais como prioridade máxima de contexto.`
    : '';

  const pedido = `<pedido_da_tarefa>
<tarefa>
${tarefaDesc}
</tarefa>

<entradas>
${entradasEspecificas}${fotoInstrucao}${vozInstrucao}
</entradas>
</pedido_da_tarefa>`;

  // ─────────────────────────────────────────────────────────────
  // 4. PARTE 3: FORMATO DO ENTREGÁVEL (ALTA FIDELIDADE)
  // ─────────────────────────────────────────────────────────────
  let entregavel = '';
  let checklist: string[] = [
    'Mencionei apenas os ingredientes reais confirmados?',
    'O tom combina com a personalidade e identidade da marca?',
    'A chamada para ação (CTA) está direta e clara?',
    'Eliminei 100% dos clichês proibidos e chavões vazios?',
  ];

  switch (canonical) {
    case 'anuncio_instagram': {
      entregavel = `<formato_do_entregavel>
<entregavel>
Entregue a resposta organizada exatamente nestas 5 seções obrigatórias:

1. [3 OPÇÕES DE GANCHO (HOOKS)]
- Variação 1 (Sensorial direto): Primeiros 3 segundos que despertam fome imediata.
- Variação 2 (Curiosidade / Quebra de padrão): Foco no segredo ou técnica do prato.
- Variação 3 (Alívio / Urgência do almoço/jantar): Foco na conveniência de receber quente em casa.

2. [ROTEIRO VISUAL SEGUNDO A SEGUNDO]
(Se for vídeo: cena a cena de 15 a 30 segundos com indicação do que mostrar na tela, enquadramento e texto sobreposto. Se for imagem estática: descrição exata da composição fotográfica e texto que vai sobre a arte).

3. [LEGENDA PERSUASIVA]
- Limite máximo: até 2.200 caracteres.
- Estrutura: Gancho forte + Linha em branco + Desenvolvimento sensorial do preparo de ${nomePrato} + Informações práticas (horário, entrega) + Chamada para ação irrecusável.

4. [CHAMADA PARA AÇÃO (CTA)]
- Frase única e potente indicando exatamente onde clicar (link da bio / botão pedir agora / WhatsApp).

5. [10 HASHTAGS ESTRATÉGICAS]
- 4 Hashtags de nicho alimentício específico
- 3 Hashtags locais da região / cidade (${cidade})
- 3 Hashtags amplas de delivery e gastronomia
</entregavel>

<qualidade>
- Ritmo dinâmico sem enrolação nas primeiras frases.
- Sem usar emojis em excesso (máximo 4 a 6 bem posicionados).
</qualidade>

<checagem_final>
[ ] Respeitou os limites de caracteres e formato das 5 seções?
[ ] As 10 hashtags estão divididas entre nicho, locais e amplas?
[ ] Não há nenhum dos clichês proibidos?
</checagem_final>
</formato_do_entregavel>`;
      break;
    }

    case 'imagem_prato': {
      entregavel = `<formato_do_entregavel>
<entregavel>
Entregue 2 formatos prontos para uso:

FORMATO A: PROMPT COMPLETO EM INGLÊS (Otimizado para Midjourney v6 / DALL-E 3)
Fotografia gastronômica comercial profissional de "${nomePrato}".
- Lighting: Softbox lateral 45 degrees, gentle rim light emphasizing steam and sauce sheen.
- Lens & Camera: Hasselblad H6D-100c, 50mm f/2.8 lens, shallow depth of field, sharp focus on ${ingredientes.split(',')[0] || 'main ingredient'}.
- Styling: Styled on a dark textured background, linen napkin with subtle brand colors (${cores}), delicate hot steam rising naturally.
- Realism: Natural authentic restaurant dish, true food proportions, hyperrealistic textures, no artificial over-exaggeration, commercial food photography style, 8k resolution.
- Parameters: --ar 4:5 --style raw --v 6.0

FORMATO B: GUIA EM PORTUGUÊS PARA FOTOGRAFIA REAL (Celular ou Câmera)
1. Posição da luz: Onde posicionar a luz da janela ou luminária em relação ao prato.
2. Ângulo recomendado e altura da lente para valorizar ${nomePrato}.
3. Truques de "food styling": Como posicionar os ingredientes reais para evidenciar brilho e textura.
4. O que NUNCA fazer na foto deste prato (erros que estragam o apetite).
</entregavel>

<qualidade>
- Proporções realistas: O prato gerado deve parecer possível de ser entregue pelo restaurante, evitando expectativas falsas no cliente.
- Fidelidade estrita aos ingredientes: ${ingredientes}.
</qualidade>

<checagem_final>
[ ] O prompt fotográfico especifica iluminação, lente, profundidade e texturas?
[ ] A composição incorpora sutilmente as cores da marca?
[ ] Os ingredientes solicitados são estritamente os reais?
</checagem_final>
</formato_do_entregavel>`;
      break;
    }

    case 'descricao_ifood': {
      entregavel = `<formato_do_entregavel>
<entregavel>
Entregue o cadastro completo do item pronto para copiar e colar no Portal do Parceiro iFood:

1. [TÍTULO VENDEDOR NO IFOOD]
- Limite rigoroso: Máximo 45 caracteres.
- Direto, apetitoso e com o nome comercial claro do prato.

2. [DESCRIÇÃO APETITOSA DE ALTA CONVERSÃO]
- Limite rigoroso: MÁXIMO 180 CARACTERES (otimizado para caber inteiro na tela do celular sem ser cortado por 'ver mais').
- Texto que vende pelo sensorial, destacando ponto, frescor e sabor real.

3. [LISTA DE INGREDIENTES DESTACADOS]
- Lista em bullet points de cada componente que acompanha ${nomePrato}.

4. [ALÉRGENOS E AVISOS IMPORTANTES]
- Indicação clara de glúten, lactose, nozes ou ovos se aplicável, transmitindo confiança profissional.

5. [SUGESTÃO DE ITEM COMPLEMENTAR (CROSS-SELL)]
- Sugestão sutil de acompanhamento ou bebida para compor a sessão "Combina perfeitamente com..." e aumentar o ticket médio.
</entregavel>

<qualidade>
- O limite de 180 caracteres da descrição é inegociável para leitura rápida no app.
- Texto claro para quem decide a compra com fome e pressa.
</qualidade>

<checagem_final>
[ ] O título tem até 45 caracteres?
[ ] A descrição apetitosa tem até 180 caracteres?
[ ] Os ingredientes destacados são estritamente os da receita?
</checagem_final>
</formato_do_entregavel>`;
      break;
    }

    case 'promocao_preco': {
      entregavel = `<formato_do_entregavel>
<entregavel>
Apresente a estratégia comercial estruturada em 4 blocos analíticos:

1. [DIAGNÓSTICO FINANCEIRO & IMPACTO DA TAXA IFOOD]
- Análise de margem de contribuição bruta com a taxa do iFood considerada.
- Margem de segurança mínima para o desconto não gerar prejuízo na operação.

2. [ESTRATÉGIA DE ANCORAGEM PSICOLÓGICA (DE / POR)]
- Preço âncora recomendado ("De R$ XX,XX").
- Preço promocional atrativo ("Por R$ YY,YY") preservando margem saudável.
- Explicação do gatilho mental utilizado.

3. [ENGENHARIA DE COMBO (AUMENTO DE TICKET MÉDIO)]
- Sugestão de combo inteligente unindo ${nomePrato} a um acompanhamento de alto valor percebido e baixo custo de produção (alto markup).
- Preço final do combo e ticket médio projetado.

4. [CÓPIA PRONTA PARA CUPOM / NOTIFICAÇÃO PUSH]
- Título do push no iFood (até 35 caracteres com emoji).
- Texto da mensagem push (até 90 caracteres direto ao ponto).
- Nome sugerido para o cupom (ex: BATEUFOME, QUERO${nomeLoja.toUpperCase().slice(0, 5)}).
</entregavel>

<qualidade>
- Raciocínio matemático explícito demonstrando lucro por pedido.
- Proteção da saúde financeira do restaurante.
</qualidade>

<checagem_final>
[ ] A margem líquida foi calculada após deduzir taxas e custos?
[ ] A ancoragem psicológica está realista e honesta?
[ ] O texto do push cabe nos limites do iFood?
</checagem_final>
</formato_do_entregavel>`;
      break;
    }

    case 'responder_avaliacao': {
      entregavel = `<formato_do_entregavel>
<entregavel>
Entregue 2 modelos de resposta personalizadas e prontas para uso:

MODELO 1: RESPOSTA AFETUOSA PARA NOTAS ALTAS (4 OU 5 ESTRELAS)
- Tom: Caloroso, agradecido e memorável.
- Extensão: 3 a 5 linhas.
- Conteúdo: Agradece citando nominalmente o cliente, reforça o carinho com que a equipe preparou o pedido e faz um convite simpático para a próxima experiência.

MODELO 2: RESPOSTA ESTRATÉGICA E EMPÁTICA PARA NOTAS BAIXAS (1 A 3 ESTRELAS)
- Tom: Maduro, acolhedor e profissional.
- Extensão: 4 a 6 linhas.
- Regras inegociáveis:
  * NUNCA responder com grosseria, ironia ou justificativas defensivas.
  * NUNCA admitir culpa jurídica prematura.
  * Demonstrar escuta ativa e empatia pelo desapontamento com a refeição.
  * Convidar com elegância para contato direto no WhatsApp da loja para entender a fundo o ocorrido e recompensar o cliente.
</entregavel>

<qualidade>
- Linguagem humana, sem parecer mensagem automática de robô de SAC.
- Valorização da reputação pública do restaurante perante futuros compradores.
</qualidade>

<checagem_final>
[ ] A resposta negativa mantém a compostura e convida para o canal privado?
[ ] A resposta positiva soa espontânea e afetiva?
[ ] O nome do cliente e da loja foram aplicados naturalmente?
</checagem_final>
</formato_do_entregavel>`;
      break;
    }

    case 'minha_pagina': {
      entregavel = `<formato_do_entregavel>
<entregavel>
Entregue a estrutura completa de presença digital em 3 partes:

1. [BIO OTIMIZADA PARA O INSTAGRAM]
- Linha 1: Proposta de valor clara em uma frase (o que faz de melhor).
- Linha 2: Região atendida / Horário de funcionamento resumido.
- Linha 3: Diferencial marcante (${diferencial}).
- Linha 4 (CTA do Link): Chamada com seta apontando para o link da bio.

2. [ESTRUTURA DE 4 BOTÕES PARA A PÁGINA DE LINKS]
- Botão 1 (Prioritário): "💬 Peça direto pelo WhatsApp (Cardápio sem taxa)"
- Botão 2: "🛵 Peça no iFood com entrega rápida"
- Botão 3: "📍 Como chegar / Endereço da loja física"
- Botão 4: "⭐ Avalie nossa experiência no Google"
(Incluir justificativa de conversão de cada botão).

3. [MENSAGEM DE BOAS-VINDAS / TOPO DA PÁGINA]
- Frase de recepção calorosa que o cliente lê logo ao abrir a página pelo link da bio ou escaneando o QR Code da embalagem em casa.
</entregavel>

<qualidade>
- Clareza visual e facilidade de navegação para o cliente no smartphone.
- Incentivo ao canal de venda direta (WhatsApp) para redução de taxas.
</qualidade>

<checagem_final>
[ ] A bio do Instagram cabe nos 150 caracteres permitidos pela plataforma?
[ ] Os 4 botões estão em ordem de prioridade de receita para o negócio?
[ ] A mensagem de recepção transmite hospitalidade gastronômica?
</checagem_final>
</formato_do_entregavel>`;
      break;
    }

    default: {
      entregavel = `<formato_do_entregavel>
<entregavel>
Estruture a resposta com título claro, corpo persuasivo e checklist de ação para o restaurante.
</entregavel>
<checagem_final>
[ ] Resposta clara, apetitosa e sem jargões vazios?
</checagem_final>
</formato_do_entregavel>`;
    }
  }

  // Completo: Junta as 3 partes com cabeçalho explicativo
  const completo = `${sistema}\n\n${pedido}\n\n${entregavel}`;

  return {
    sistema,
    pedido,
    entregavel,
    checklist,
    completo,
  };
}
