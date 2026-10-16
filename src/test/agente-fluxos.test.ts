import { describe, it, expect } from 'vitest';
import { AGENTE_FLUXOS, type AgentePasso } from '@/data/agente-fluxos';
import { matchKeywordsToOptions } from '@/lib/speech';
import { buildMetaprompt } from '@/lib/metaprompt';

describe('Agente Fluxos - Definições e Dados', () => {
  it('contém todos os fluxos especificados', () => {
    const expectedFlows = [
      'anuncio_instagram',
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ];

    expectedFlows.forEach((flowId) => {
      expect(AGENTE_FLUXOS[flowId]).toBeDefined();
      expect(AGENTE_FLUXOS[flowId].titulo).toBeTruthy();
    });
  });

  it('anuncio_instagram está configurado como Plus', () => {
    expect(AGENTE_FLUXOS['anuncio_instagram'].isPlus).toBe(true);
  });

  it('todas as opções dos passos possuem valorPrompt e lista de palavras-chave', () => {
    Object.values(AGENTE_FLUXOS).forEach((fluxo) => {
      fluxo.passos.forEach((passo) => {
        if (passo.opcoes && passo.opcoes.length > 0) {
          passo.opcoes.forEach((opt) => {
            expect(opt.id).toBeTruthy();
            expect(opt.rotulo).toBeTruthy();
            expect(opt.valorPrompt).toBeDefined();
            expect(Array.isArray(opt.palavras)).toBe(true);
            expect(opt.palavras.length).toBeGreaterThan(0);
          });
        }
      });
    });
  });
});

describe('Web Speech - matchKeywordsToOptions', () => {
  const mockPassos: AgentePasso[] = [
    {
      id: 'formato',
      pergunta: 'Qual o formato?',
      tipo: 'unica',
      variavel: 'formato',
      opcoes: [
        {
          id: 'stories',
          rotulo: 'Story (15s)',
          valorPrompt: 'Formato vertical 9:16 para Stories',
          palavras: ['story', 'stories', 'vertical', '15 segundos', 'status'],
        },
        {
          id: 'feed',
          rotulo: 'Post no feed (1:1)',
          valorPrompt: 'Formato quadrado 1:1 para Feed',
          palavras: ['feed', 'quadrado', 'post', 'publicacao'],
        },
        {
          id: 'carrossel',
          rotulo: 'Carrossel (sequência)',
          valorPrompt: 'Formato carrossel sequencial',
          palavras: ['carrossel', 'slides', 'varias fotos', 'arrasta pro lado'],
        },
      ],
    },
  ];

  it('reconhece palavras-chave exatas e variações', () => {
    const match1 = matchKeywordsToOptions('eu quero fazer um story para hoje', mockPassos);
    expect(match1['formato']).toBe('Formato vertical 9:16 para Stories');

    const match2 = matchKeywordsToOptions('vamos criar um post para o feed quadrado', mockPassos);
    expect(match2['formato']).toBe('Formato quadrado 1:1 para Feed');

    const match3 = matchKeywordsToOptions('quero um carrossel com varias fotos', mockPassos);
    expect(match3['formato']).toBe('Formato carrossel sequencial');
  });

  it('reconhece palavras com acentuação e caixa alta/baixa', () => {
    const match = matchKeywordsToOptions('FAZ UMA PUBLICAÇÃO NO FEED', mockPassos);
    expect(match['formato']).toBe('Formato quadrado 1:1 para Feed');
  });

  it('retorna vazio se nenhuma palavra coincidir', () => {
    const match = matchKeywordsToOptions('abobrinha frita com batata', mockPassos);
    expect(match).toEqual({});
  });
});

describe('Agente Metaprompts - Integração com variáveis dos fluxos', () => {
  it('gera metaprompt para Anúncio de Instagram com detalhes falados', () => {
    const result = buildMetaprompt('T8', {
      formato: 'Post no feed (1:1 quadrado)',
      objetivo: 'Atrair novos clientes',
      estilo_tom: 'Descontraído e jovem',
      oferta_desc: 'Combo com bebida grátis',
      chamada_acao: 'Peça agora pelo iFood no link da bio',
      detalhes_falados: 'ênfase que entregamos quentinho em menos de 30 minutos',
    });

    expect(result.text).toContain('Instagram');
    expect(result.text).toContain('Combo com bebida grátis');
    expect(result.text).toContain('DETALHES DITOS PELO CLIENTE: ênfase que entregamos quentinho em menos de 30 minutos');
  });

  it('gera metaprompt para Descrição no iFood com variáveis do fluxo', () => {
    const result = buildMetaprompt('T5', {
      nome_prato: 'Smash Burger Duplo',
      tom: 'Apetitoso: sentidos e textura, frases curtas, vontade imediata',
      gatilho: 'Mais pedido da semana no iFood',
      acompanhamentos: 'Batata rústica crocante e maionese artesanal',
      porcao: 'Serve 1 pessoa bem servida',
    });

    expect(result.text).toContain('Smash Burger Duplo');
  });

  it('gera metaprompt para Resposta de Avaliação', () => {
    const result = buildMetaprompt('T7', {
      estrelas: '5',
      fatos_reais: 'O cliente adorou a comida, elogiou o sabor e a qualidade',
      tom: 'Acolhedor e caloroso',
      proxima_acao: 'Convidar a pedir novamente e experimentar a sobremesa',
    });

    expect(result.text).toContain('5 estrela(s)');
    expect(result.text).toContain('Acolhedor e caloroso');
  });
});
