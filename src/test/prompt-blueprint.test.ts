import { describe, it, expect } from 'vitest';
import { buildPromptBlueprint, normalizeToolId } from '@/data/prompt-blueprint';
import {
  calculateBriefingQuality,
  getStepHelp,
  getOptionPreviewPhrase,
  getFluxoDeliverables,
  getFluxoReadyExample,
} from '@/data/agente-guias';
import { AGENTE_FLUXOS } from '@/data/agente-fluxos';

describe('Prompt Blueprint Engine', () => {
  it('normalizes tool IDs correctly', () => {
    expect(normalizeToolId('T3')).toBe('anuncio_instagram');
    expect(normalizeToolId('T1')).toBe('imagem_prato');
    expect(normalizeToolId('T2')).toBe('descricao_ifood');
    expect(normalizeToolId('T5')).toBe('promocao_preco');
    expect(normalizeToolId('T4')).toBe('responder_avaliacao');
    expect(normalizeToolId('T6')).toBe('minha_pagina');
  });

  it('generates 3-part structured XML prompt with all required tags', () => {
    const result = buildPromptBlueprint({
      toolId: 'anuncio_instagram',
      company: {
        nome: 'Burger da Esquina',
        categoria: 'Hamburgueria Artesanal',
        cidade: 'São Paulo - SP',
        cores: ['#EA1D2C', '#000000'],
      },
      answers: {
        prato_ou_tema: 'Smash Burger Especial',
        objetivo: 'Mais pedidos no iFood',
      },
      spokenDetails: 'Caprichar no queijo derretido',
    });

    // 1. Sistema
    expect(result.sistema).toContain('<instrucoes_de_sistema>');
    expect(result.sistema).toContain('<papel>');
    expect(result.sistema).toContain('<marca>');
    expect(result.sistema).toContain('<regras_gerais>');
    expect(result.sistema).toContain('Burger da Esquina');
    expect(result.sistema).toContain('São Paulo - SP');
    expect(result.sistema).toContain('NUNCA invente ingredientes');

    // 2. Pedido
    expect(result.pedido).toContain('<pedido_da_tarefa>');
    expect(result.pedido).toContain('<tarefa>');
    expect(result.pedido).toContain('<entradas>');
    expect(result.pedido).toContain('Smash Burger Especial');
    expect(result.pedido).toContain('Caprichar no queijo derretido');

    // 3. Entregável
    expect(result.entregavel).toContain('<formato_do_entregavel>');
    expect(result.entregavel).toContain('<entregavel>');
    expect(result.entregavel).toContain('<qualidade>');
    expect(result.entregavel).toContain('<checagem_final>');
    expect(result.entregavel).toContain('3 OPÇÕES DE GANCHO');
    expect(result.entregavel).toContain('10 HASHTAGS ESTRATÉGICAS');

    // Checklist
    expect(result.checklist.length).toBeGreaterThan(0);

    // Completo
    expect(result.completo).toContain(result.sistema);
    expect(result.completo).toContain(result.pedido);
    expect(result.completo).toContain(result.entregavel);
  });

  it('handles image_prato tool with English prompt and photography guidelines', () => {
    const result = buildPromptBlueprint({
      toolId: 'imagem_prato',
      company: { nome: 'Pizzaria Bella' },
      answers: { nome_prato: 'Pizza Margherita Especial' },
    });

    expect(result.entregavel).toContain('Midjourney v6 / DALL-E 3');
    expect(result.entregavel).toContain('Hasselblad H6D-100c');
    expect(result.entregavel).toContain('GUIA EM PORTUGUÊS PARA FOTOGRAFIA REAL');
  });

  it('handles descricao_ifood with 45 and 180 character limits', () => {
    const result = buildPromptBlueprint({
      toolId: 'descricao_ifood',
      company: { nome: 'Pastel & Cia' },
      answers: { nome_prato: 'Pastel de Carne com Queijo' },
    });

    expect(result.entregavel).toContain('Máximo 45 caracteres');
    expect(result.entregavel).toContain('MÁXIMO 180 CARACTERES');
  });

  it('handles promocao_preco with fee deduction and margin analysis', () => {
    const result = buildPromptBlueprint({
      toolId: 'promocao_preco',
      company: { nome: 'Açaí Tropical' },
      answers: { nome_prato: 'Açaí 500ml', preco_atual: '25.00', custo: '8.00', comissao: '23' },
    });

    expect(result.entregavel).toContain('DIAGNÓSTICO FINANCEIRO');
    expect(result.entregavel).toContain('ANCORAGEM PSICOLÓGICA (DE / POR)');
    expect(result.entregavel).toContain('ENGENHARIA DE COMBO');
  });

  it('handles responder_avaliacao with 2 response models', () => {
    const result = buildPromptBlueprint({
      toolId: 'responder_avaliacao',
      company: { nome: 'Doceria da Vovó' },
      answers: { nota: '5 estrelas', nome_cliente: 'Camila', comentario: 'Tudo perfeito!' },
    });

    expect(result.entregavel).toContain('MODELO 1: RESPOSTA AFETUOSA');
    expect(result.entregavel).toContain('MODELO 2: RESPOSTA ESTRATÉGICA E EMPÁTICA');
  });

  it('handles minha_pagina with 150-char bio and 4 prioritized buttons', () => {
    const result = buildPromptBlueprint({
      toolId: 'minha_pagina',
      company: { nome: 'Espetinho do Chefe' },
      answers: {},
    });

    expect(result.entregavel).toContain('BIO OTIMIZADA PARA O INSTAGRAM');
    expect(result.entregavel).toContain('ESTRUTURA DE 4 BOTÕES');
  });
});

describe('Agente Guias & Usabilidade', () => {
  it('calculates briefing quality accurately from 1 to 5', () => {
    const q1 = calculateBriefingQuality({}, 5, 0, false, '');
    expect(q1.score).toBe(1);
    expect(q1.label).toBe('Básico');

    const q2 = calculateBriefingQuality({ p1: 'a' }, 5, 2, false, '');
    expect(q2.score).toBe(2);
    expect(q2.label).toBe('Em progresso');

    const q3 = calculateBriefingQuality({ p1: 'a', p2: 'b', p3: 'c', p4: 'd' }, 5, 4, false, '');
    expect(q3.score).toBe(3);
    expect(q3.label).toBe('Bom');

    const q4 = calculateBriefingQuality({ p1: 'a', p2: 'b', p3: 'c', p4: 'd' }, 5, 4, true, '');
    expect(q4.score).toBe(4);
    expect(q4.label).toBe('Muito Bom');

    const q5 = calculateBriefingQuality(
      { p1: 'a', p2: 'b', p3: 'c', p4: 'd' },
      5,
      4,
      true,
      'detalhe falado',
    );
    expect(q5.score).toBe(5);
    expect(q5.label).toBe('Excelente');
  });

  it('returns step help guide with paraQue, exemploBom, evite', () => {
    const help = getStepHelp('anuncio_instagram', 'prato');
    expect(help.paraQue).toBeTruthy();
    expect(help.exemploBom).toBeTruthy();
    expect(help.evite).toBeTruthy();
  });

  it('returns option preview phrases for quick feedback', () => {
    const phrase = getOptionPreviewPhrase('mais_pedidos');
    expect(phrase).toContain('iFood');
  });

  it('returns deliverable checklist for each tool', () => {
    const items = getFluxoDeliverables('anuncio_instagram');
    expect(items.length).toBeGreaterThanOrEqual(4);
  });

  it('provides ready examples for real success cases', () => {
    const ex = getFluxoReadyExample('anuncio_instagram');
    expect(ex).not.toBeNull();
    expect(ex?.tituloExemplo).toContain('Smash Burger');
    expect(ex?.answers).toBeTruthy();
  });

  it('anuncio_instagram has exactly 3 steps with 8 styles containing fraseExemplo and condicao', () => {
    const fluxo = AGENTE_FLUXOS['anuncio_instagram']!;
    expect(fluxo).toBeDefined();
    expect(fluxo.passos.length).toBe(3);

    const [passoPrato, passoEstilo, passoOferta] = fluxo.passos;
    expect(passoPrato!.id).toBe('prato');
    expect(passoPrato!.tipo).toBe('prato');

    expect(passoEstilo!.id).toBe('estilo_anuncio');
    expect(passoEstilo!.opcoes?.length).toBe(8);

    // Each style has fraseExemplo and isPromocional defined
    passoEstilo!.opcoes?.forEach((opt: any) => {
      expect(opt.fraseExemplo).toBeTruthy();
      expect(typeof opt.isPromocional).toBe('boolean');
    });

    // passoOferta has condicao that evaluates true only for promotional styles
    expect(passoOferta!.id).toBe('oferta');
    expect(typeof passoOferta!.condicao).toBe('function');

    expect(passoOferta!.condicao?.({ estilo_anuncio_id: 'promocao_preco' })).toBe(true);
    expect(passoOferta!.condicao?.({ estilo_anuncio_id: 'combo_almoco' })).toBe(true);
    expect(passoOferta!.condicao?.({ estilo_anuncio_id: 'urgencia_unidades' })).toBe(true);

    expect(passoOferta!.condicao?.({ estilo_anuncio_id: 'apetite' })).toBe(false);
    expect(passoOferta!.condicao?.({ estilo_anuncio_id: 'bastidores' })).toBe(false);
    expect(passoOferta!.condicao?.({ estilo_anuncio_id: 'fim_de_semana' })).toBe(false);
    expect(passoOferta!.condicao?.({ estilo_anuncio_id: 'novidade' })).toBe(false);
    expect(passoOferta!.condicao?.({ estilo_anuncio_id: 'prova_social' })).toBe(false);
  });

  it('incorporates company schedule, channels, dish price and ingredients with 0 unresolved {{ placeholders', () => {
    const result = buildPromptBlueprint({
      toolId: 'anuncio_instagram',
      company: {
        nome: 'Pizzaria do Bairro',
        categoria: 'Pizzaria & Forno a Lenha',
        cidade: 'Curitiba - PR',
        horario_funcionamento: 'Terça a Domingo das 18h às 23h30',
        formas_atendimento: 'Delivery próprio e iFood',
        endereco: 'Rua XV de Novembro, 100',
        mostrar_endereco_anuncios: true,
      },
      answers: {
        estilo_anuncio: 'Promoção com preço em destaque',
        oferta_detalhe: 'Desconto especial de preço',
        cta: 'Pedir no iFood agora',
      },
      prato: {
        nome: 'Pizza Calabresa Especial',
        ingredientes: ['Massa artesanal', 'Calabresa defumada', 'Cebola roxa', 'Azeitonas pretas'],
        preco: 49.9,
        destaque: 'Mais pedida da casa',
      },
    });

    expect(result.completo).not.toContain('{{');
    expect(result.completo).toContain('Pizzaria do Bairro');
    expect(result.completo).toContain('Terça a Domingo das 18h às 23h30');
    expect(result.completo).toContain('Delivery próprio e iFood');
    expect(result.completo).toContain('Rua XV de Novembro, 100');
    expect(result.completo).toContain('Pizza Calabresa Especial');
    expect(result.completo).toContain('R$ 49,90');
    expect(result.completo).toContain('Calabresa defumada');
    expect(result.completo).toContain('Mais pedida da casa');
  });
});
