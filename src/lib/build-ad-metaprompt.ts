/**
 * Ad Image Metaprompt Builder
 *
 * Constrói o Meta Prompt estruturado (System Prompt + Tarefa + Comando Obrigatório)
 * para forçar o ChatGPT (DALL-E 3) a gerar a arte publicitária visual do anúncio
 * com base no questionário simples preenchido pelo usuário e nos dados da empresa.
 */

export interface BuildAdImageMetapromptParams {
  formato: '9:16' | '1:1';
  pratoNome?: string | null;
  pratoIngredientes?: string[];
  pratoFotoUrl?: string | null;
  titulo?: string | null;
  preco?: number | null;
  mostrarPreco?: boolean;
  frases?: Array<{ id: string; texto: string }>;
  logoPosicao?: 'top-right' | 'top-left' | 'bottom-left' | 'bottom-right';
  mostrarLogo?: boolean;
  company?: Record<string, any> | null;
  estiloVisual?: string | null;
}

export interface AdMetapromptResult {
  sistema: string;
  pedido: string;
  comandoImagem: string;
  completo: string;
}

export function buildAdImageMetaprompt({
  formato,
  pratoNome,
  pratoIngredientes = [],
  pratoFotoUrl,
  titulo,
  preco,
  mostrarPreco = true,
  frases = [],
  logoPosicao = 'top-right',
  mostrarLogo = true,
  company = {},
  estiloVisual,
}: BuildAdImageMetapromptParams): AdMetapromptResult {
  // 1. Dados da empresa / marca
  const nomeLoja = (company && company['nome']) || 'Minha Loja de Delivery';
  const categoria = (company && company['categoria']) || 'Restaurante & Delivery';
  const cidade = (company && company['cidade']) ? `${company['cidade']}` : 'Brasil';
  const slogan = (company && company['slogan']) || '';
  const cores =
    company && Array.isArray(company['cores']) && company['cores'].length > 0
      ? company['cores'].join(', ')
      : '#EA1D2C, #FFFFFF, #1A1A1A';
  const tom = (company && company['tom']) || 'Apetitoso, direto e acolhedor';
  const publico =
    company && Array.isArray(company['publico']) && company['publico'].length > 0
      ? company['publico'].join(', ')
      : (company && company['publico']) || 'Clientes que buscam sabor autêntico e qualidade no delivery';

  // 2. Mapeamento de Posição da Logo
  const mapPosicaoLogo: Record<string, string> = {
    'top-right': 'superior direito',
    'top-left': 'superior esquerdo',
    'bottom-left': 'inferior esquerdo',
    'bottom-right': 'inferior direito',
  };
  const posicaoLogoTexto = mapPosicaoLogo[logoPosicao] || 'superior direito';

  // 3. Tratamento de campos
  const pratoFinal = (pratoNome && pratoNome.trim()) || 'Prato Especial da Casa';
  const ingredientesTexto =
    pratoIngredientes.length > 0
      ? pratoIngredientes.join(', ')
      : '';
  const tituloLimpo = (titulo && titulo.trim()) || null;
  const precoValido = Number.isFinite(preco) && (preco as number) > 0 ? (preco as number) : null;
  const precoFormatado = precoValido ? precoValido.toFixed(2).replace('.', ',') : null;
  const frasesAtivas = frases.map((f) => f.texto.trim()).filter((t) => t.length > 0);
  const frasesFormatadas =
    frasesAtivas.length > 0
      ? frasesAtivas.map((f) => `  * "${f}"`).join('\n')
      : null;

  // 4. Instruções de Sistema (System Prompt)
  const sistema = `<instrucoes_de_sistema>
<papel>
Você é um diretor de arte e fotógrafo gastronômico de alta conversão para negócios de delivery e restaurantes no Brasil. Você é especialista em criar anúncios publicitários visuais que despertam desejo imediato e fome irresistível, utilizando o gerador de imagem integrado (DALL-E 3 / ferramenta de criação de imagem do ChatGPT).
</papel>

<dados_da_marca>
- Nome do estabelecimento: ${nomeLoja}
- Categoria / Culinária: ${categoria}
- Localização: ${cidade}
${slogan ? `- Slogan da marca: "${slogan}"` : ''}
- Cores da marca: ${cores}
- Tom de comunicação: ${tom}
- Público-alvo: ${publico}
</dados_da_marca>

<regras_visuais_inegociaveis>
1. Autenticidade e Apetite: O prato deve ter aparência 100% autêntica, fresca e suculenta da gastronomia brasileira. Texturas naturais de comida de verdade, queijo derretido no ponto, crostas douradas, sem brilho artificial ou aspecto plástico.
2. Fidelidade estrita aos ingredientes: Mostre estritamente os ingredientes reais informados. Não invente ingredientes estranhos nem altere a receita do prato.
3. Iluminação comercial de estúdio gastronômico: Luz suave lateral (estilo softbox 45º) com contraluz sutil destacando o vapor quente e as texturas apetitosas.
4. Tipografia de anúncio profissional: Qualquer texto grafado deve estar em português do Brasil impecável, nítido, moderno e com alto contraste, sem erros de ortografia e perfeitamente legível em telas pequenas de celular.
5. Zonas de respiro e segurança: Deixe margem de respiro de 10% nas bordas para evitar cortes em aplicativos móveis e stories.
</regras_visuais_inegociaveis>
</instrucoes_de_sistema>`;

  // 5. Pedido da Tarefa
  const formatoDescricao =
    formato === '9:16'
      ? 'Vertical 9:16 (1080 × 1920 px) para Stories do Instagram / Reels'
      : 'Quadrado 1:1 (1080 × 1080 px) para Feed do Instagram / iFood';

  const pedido = `<pedido_da_tarefa>
<tarefa>
Criar a arte visual publicitária completa de alta conversão para o anúncio no formato ${formato === '9:16' ? 'Story 9:16' : 'Feed 1:1'}, destacando o item "${pratoFinal}".
</tarefa>

<especificacoes_do_criativo>
- Proporção da imagem: ${formatoDescricao}
- Prato principal em primeiro plano: ${pratoFinal}
${ingredientesTexto ? `- Ingredientes e detalhes reais: ${ingredientesTexto}` : ''}
${estiloVisual ? `- Direção de estilo visual: ${estiloVisual}` : ''}
${
  tituloLimpo
    ? `- Título principal do anúncio: "${tituloLimpo}" (grafado com tipografia comercial forte, moderna e legível)`
    : '- Título: Foco visual absoluto na foto apetitosa do prato, com visual limpo e sofisticado.'
}
${
  mostrarPreco && precoFormatado
    ? `- Preço em destaque: "R$ ${precoFormatado}" (em um selo/badge elegante com as cores da marca)`
    : '- Preço: Sem exibição de preço na arte.'
}
${
  frasesFormatadas
    ? `- Destaques de apoio / Frases de valor:\n${frasesFormatadas}`
    : '- Frases adicionais: Nenhuma frase secundária.'
}
${
  mostrarLogo
    ? `- Espaço para Logotipo: Manter o canto ${posicaoLogoTexto} limpo e harmonioso para o logotipo da marca "${nomeLoja}".`
    : '- Logotipo: Não incluir nem reservar espaço para logotipo.'
}
${pratoFotoUrl ? `- Referência da foto real do prato anexada: manter a porção e fidelidade ao prato real.` : ''}
</especificacoes_do_criativo>
</pedido_da_tarefa>`;

  // 6. Comando Obrigatório de Forçar a Imagem pelo ChatGPT
  const comandoImagem = `<comando_obrigatorio_geracao_de_imagem>
ATENÇÃO CHATGPT: ESTA É UMA INSTRUÇÃO FINAL E OBRIGATÓRIA.
NÃO RESPONDA APENAS COM TEXTO, EXPLICAÇÕES, CÓDIGO OU DICAS.
SUA TAREFA IMEDIATA É ACIONAR A SUA FERRAMENTA DE GERAÇÃO DE IMAGENS (DALL-E 3 / GERADOR DE IMAGEM) E RENDERIZAR AGORA A IMAGEM PUBLICITÁRIA COMPLETA DESTE ANÚNCIO.

A imagem gerada DEVE conter:
1. Fotografia gastronômica comercial ultra-apetitosa do prato "${pratoFinal}", com iluminação quente de restaurante e texturas reais.
2. Proporção exata: ${formato === '9:16' ? '9:16 (vertical para stories)' : '1:1 (quadrada para feed)'}.
${tituloLimpo ? `3. O texto do título "${tituloLimpo}" grafado de forma legível e profissional.` : ''}
${mostrarPreco && precoFormatado ? `4. O selo de preço promocional "R$ ${precoFormatado}" com alto contraste visual.` : ''}
${frasesAtivas.length > 0 ? `5. Elementos visuais destacando os diferenciais informados.` : ''}
${mostrarLogo ? `6. O canto ${posicaoLogoTexto} livre e reservado para a identidade da marca "${nomeLoja}".` : ''}

Gere e envie a imagem publicitária final imediatamente na sua primeira resposta.
</comando_obrigatorio_geracao_de_imagem>`;

  const completo = `${sistema}\n\n${pedido}\n\n${comandoImagem}`;

  return {
    sistema,
    pedido,
    comandoImagem,
    completo,
  };
}
