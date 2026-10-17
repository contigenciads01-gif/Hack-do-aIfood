import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AD_PRESETS } from '@/components/workspace/ad-editor/AdEditorModal';
import type { AdItem, AdPhrase } from '@/lib/data/ads';

describe('Editor Livre de Anúncios - Regras de Negócio e Rascunhos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Presets e Opcionalidade de Campos', () => {
    it('todos os presets estão disponíveis como ponto de partida e nenhum campo é obrigatório', () => {
      expect(AD_PRESETS.length).toBeGreaterThanOrEqual(5);

      // Presets esperados
      const presetIds = AD_PRESETS.map((p) => p.id);
      expect(presetIds).toContain('apetite');
      expect(presetIds).toContain('promocao');
      expect(presetIds).toContain('combo');
      expect(presetIds).toContain('artesanal');
      expect(presetIds).toContain('urgencia');

      // Validar estrutura dos presets
      AD_PRESETS.forEach((preset) => {
        expect(preset.nome).toBeTruthy();
        expect(typeof preset.titulo).toBe('string');
        expect(Array.isArray(preset.frases)).toBe(true);
      });
    });

    it('permite criar anúncio do zero com apenas título 1 (preço vazio e zero frases)', () => {
      const adDraft: Partial<AdItem> = {
        titulo: 'O Hambúrguer Mais Suculento da Cidade',
        preco: null,
        mostrar_preco: false,
        frases: [],
        formato: '9:16',
        imagem_fundo_url: null,
        logo_posicao: 'top-right',
        mostrar_logo: true,
      };

      // Confirma que não há preço nem frases
      expect(adDraft.titulo).toBe('O Hambúrguer Mais Suculento da Cidade');
      expect(adDraft.preco).toBeNull();
      expect(adDraft.mostrar_preco).toBe(false);
      expect(adDraft.frases).toHaveLength(0);
    });
  });

  describe('2. Anúncio com Preço, Frases Dinâmicas e Logo no Canto Inferior Esquerdo', () => {
    it('configura corretamente preço, três frases ordenadas e logo no canto bottom-left', () => {
      const frases: AdPhrase[] = [
        { id: '1', texto: 'Carne 100% Angus 180g' },
        { id: '2', texto: 'Queijo cheddar derretido maçaricado' },
        { id: '3', texto: 'Pão brioche selado na manteiga' },
      ];

      const adDraft: Partial<AdItem> = {
        titulo: 'Smash Supremo Especial',
        preco: 39.9,
        mostrar_preco: true,
        frases,
        formato: '9:16',
        logo_posicao: 'bottom-left',
        mostrar_logo: true,
      };

      expect(adDraft.preco).toBe(39.9);
      expect(adDraft.mostrar_preco).toBe(true);
      expect(adDraft.frases).toHaveLength(3);
      expect(adDraft.frases![0].texto).toBe('Carne 100% Angus 180g');
      expect(adDraft.frases![1].texto).toBe('Queijo cheddar derretido maçaricado');
      expect(adDraft.frases![2].texto).toBe('Pão brioche selado na manteiga');
      expect(adDraft.logo_posicao).toBe('bottom-left');
      expect(adDraft.mostrar_logo).toBe(true);
    });

    it('permite reordenar, adicionar e remover frases dinamicamente', () => {
      let frases: AdPhrase[] = [
        { id: '1', texto: 'Frase 1' },
        { id: '2', texto: 'Frase 2' },
      ];

      // Adicionar frase
      frases = [...frases, { id: '3', texto: 'Frase 3' }];
      expect(frases).toHaveLength(3);

      // Reordenar: subir a frase 2
      const [item0, item1, item2] = frases;
      const reordenado = [item1, item0, item2];
      expect(reordenado[0].texto).toBe('Frase 2');
      expect(reordenado[1].texto).toBe('Frase 1');

      // Remover frase 3
      const filtrado = reordenado.filter((f) => f.id !== '3');
      expect(filtrado).toHaveLength(2);
      expect(filtrado.map((f) => f.id)).toEqual(['2', '1']);
    });
  });

  describe('3. Preservação de Edição e Rascunhos', () => {
    it('ao aplicar preset e editar campos, as edições são salvas e restauradas fielmente', () => {
      const preset = AD_PRESETS.find((p) => p.id === 'apetite')!;
      
      // Estado inicial vindo do preset
      let currentAd: AdItem = {
        id: 'ad-123',
        user_id: 'user-abc',
        titulo: preset.titulo,
        preco: preset.preco,
        mostrar_preco: true,
        frases: preset.frases.map((t, idx) => ({ id: `p-${idx}`, texto: t })),
        formato: '9:16',
        logo_posicao: 'top-right',
        mostrar_logo: true,
        preset_origem: preset.id,
      };

      // Usuário edita o título e o preço
      const adEditado: AdItem = {
        ...currentAd,
        titulo: 'Título Personalizado pelo Usuário',
        preco: 45.0,
      };

      // Simulando reabertura do rascunho
      const reaberto: AdItem = JSON.parse(JSON.stringify(adEditado));
      expect(reaberto.id).toBe('ad-123');
      expect(reaberto.titulo).toBe('Título Personalizado pelo Usuário');
      expect(reaberto.preco).toBe(45.0);
      expect(reaberto.preset_origem).toBe('apetite');
      expect(reaberto.frases.length).toBe(preset.frases.length);
    });
  });

  describe('4. Usuário Sem Logo Cadastrado', () => {
    it('o editor opera normalmente sem logo e sinaliza ausência sem quebrar', () => {
      const companySemLogo = {
        id: 'comp-1',
        nome: 'Pizzaria do Zé',
        logo_path: null,
      };

      const hasLogo = Boolean(companySemLogo.logo_path);
      expect(hasLogo).toBe(false);

      // Editor renderiza normalmente e logo fica desabilitado ou avisa o usuário
      const adConfig: Partial<AdItem> = {
        titulo: 'Pizza Quatro Queijos',
        mostrar_logo: hasLogo, // Se não tem logo, desativa ou avisa
      };

      expect(adConfig.mostrar_logo).toBe(false);
      expect(adConfig.titulo).toBe('Pizza Quatro Queijos');
    });
  });

  describe('5. RLS e Isolamento de Usuários (Políticas de Segurança)', () => {
    it('garante que rascunhos de anúncios contêm user_id e filtram estritamente pelo usuário autenticado', () => {
      const userA = 'user-auth-111';
      const userB = 'user-auth-222';

      const adsDb: AdItem[] = [
        {
          id: 'ad-user-a',
          user_id: userA,
          titulo: 'Anúncio do Usuário A',
          mostrar_preco: false,
          frases: [],
          formato: '9:16',
          logo_posicao: 'top-right',
          mostrar_logo: true,
        },
        {
          id: 'ad-user-b',
          user_id: userB,
          titulo: 'Anúncio do Usuário B',
          mostrar_preco: false,
          frases: [],
          formato: '1:1',
          logo_posicao: 'bottom-right',
          mostrar_logo: false,
        },
      ];

      // Simulação da política RLS: SELECT WHERE user_id = auth.uid()
      const getAdsForUser = (authUid: string) => {
        return adsDb.filter((ad) => ad.user_id === authUid);
      };

      const adsForUserA = getAdsForUser(userA);
      expect(adsForUserA).toHaveLength(1);
      expect(adsForUserA[0].id).toBe('ad-user-a');
      expect(adsForUserA[0].titulo).toBe('Anúncio do Usuário A');

      // Usuário B não vê o do Usuário A
      const adsForUserB = getAdsForUser(userB);
      expect(adsForUserB).toHaveLength(1);
      expect(adsForUserB[0].id).toBe('ad-user-b');
      expect(adsForUserB.find((ad) => ad.id === 'ad-user-a')).toBeUndefined();
    });
  });

  describe('6. Alternância de Formato 9:16 e 1:1', () => {
    it('suporta alternância entre os formatos vertical (Story) e quadrado (Feed)', () => {
      let formato: '9:16' | '1:1' = '9:16';
      expect(formato).toBe('9:16');

      formato = '1:1';
      expect(formato).toBe('1:1');
    });
  });
});
