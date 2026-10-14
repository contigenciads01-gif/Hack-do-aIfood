import { describe, expect, it } from 'vitest';
import {
  calculatePratoChecklist,
  validatePhotoSlot,
  validatePratoNome,
  safeTrim,
  type PratoFoto,
} from './pratos';

describe('Validação do Limite de 3 Fotos por Prato', () => {
  it('permite adicionar a 1ª foto no slot 1 quando não há fotos', () => {
    const existing: { slot: number }[] = [];
    const check = validatePhotoSlot(existing);
    expect(check.canAdd).toBe(true);
    expect(check.slot).toBe(1);
  });

  it('encontra automaticamente o próximo slot livre (ex.: slots 1 e 2 ocupados -> slot 3)', () => {
    const existing = [{ slot: 1 }, { slot: 2 }];
    const check = validatePhotoSlot(existing);
    expect(check.canAdd).toBe(true);
    expect(check.slot).toBe(3);
  });

  it('permite escolher um slot específico de 1 a 3', () => {
    const existing = [{ slot: 1 }];
    const check = validatePhotoSlot(existing, 2);
    expect(check.canAdd).toBe(true);
    expect(check.slot).toBe(2);
  });

  it('recusa rigorosamente uma 4ª foto se os slots 1, 2 e 3 já estiverem preenchidos', () => {
    const existing = [{ slot: 1 }, { slot: 2 }, { slot: 3 }];
    const check = validatePhotoSlot(existing);
    expect(check.canAdd).toBe(false);
    expect(check.error).toContain('limite máximo de 3 fotos');
  });

  it('recusa slots inválidos fora do intervalo 1 a 3', () => {
    const checkSlot0 = validatePhotoSlot([], 0);
    expect(checkSlot0.canAdd).toBe(false);

    const checkSlot4 = validatePhotoSlot([], 4);
    expect(checkSlot4.canAdd).toBe(false);
    expect(checkSlot4.error).toContain('deve ser 1, 2 ou 3');
  });
});

describe('Cálculo de Prato Pronto com 4 Marcas de Conferência', () => {
  const fotoMock: PratoFoto = {
    id: 'f1',
    prato_id: 'p1',
    user_id: 'u1',
    slot: 1,
    storage_path: 'path/1.webp',
    criado_em: '2026-10-14T00:00:00Z',
  };

  it('marca como NÃO pronto se tiver apenas fotos e nenhum material gerado', () => {
    const checklist = calculatePratoChecklist([fotoMock], []);
    expect(checklist.tem_foto).toBe(true);
    expect(checklist.tem_imagem).toBe(false);
    expect(checklist.tem_descricao).toBe(false);
    expect(checklist.tem_anuncio).toBe(false);
    expect(checklist.pronto).toBe(false);
  });

  it('marca como pronto somente quando possui as 4 marcas completas (Foto, Imagem, Descrição, Anúncio)', () => {
    const materiais = [
      { tool: 'imagem' },
      { tool: 'descricao' },
      { tool: 'anuncios' },
    ];

    const checklist = calculatePratoChecklist([fotoMock], materiais);
    expect(checklist.tem_foto).toBe(true);
    expect(checklist.tem_imagem).toBe(true);
    expect(checklist.tem_descricao).toBe(true);
    expect(checklist.tem_anuncio).toBe(true);
    expect(checklist.pronto).toBe(true);
  });

  it('suporta verificação com nomes de templates e tipos de materiais', () => {
    const materiais = [
      { tool: 'T1', tipo: 'imagem' },
      { tool: 'T5', tipo: 'descricao' },
      { tool: 'T_STORY', tipo: 'anuncio' },
    ];

    const checklist = calculatePratoChecklist([fotoMock], materiais);
    expect(checklist.pronto).toBe(true);
  });

  it('identifica pendência se faltar anúncio, mesmo com imagem e descrição', () => {
    const materiais = [
      { tool: 'imagem' },
      { tool: 'descricao' },
    ];

    const checklist = calculatePratoChecklist([fotoMock], materiais);
    expect(checklist.tem_foto).toBe(true);
    expect(checklist.tem_imagem).toBe(true);
    expect(checklist.tem_descricao).toBe(true);
    expect(checklist.tem_anuncio).toBe(false);
    expect(checklist.pronto).toBe(false);
  });
});

describe('Helper safeTrim', () => {
  it('retorna string sem espaços nas pontas quando recebe string válida', () => {
    expect(safeTrim('  Smash Burger  ')).toBe('Smash Burger');
  });

  it('retorna string vazia para undefined ou null', () => {
    expect(safeTrim(undefined)).toBe('');
    expect(safeTrim(null)).toBe('');
  });

  it('retorna string vazia para valores não-string (número, boolean, objeto)', () => {
    expect(safeTrim(123)).toBe('');
    expect(safeTrim(true)).toBe('');
    expect(safeTrim({ nome: 'Burger' })).toBe('');
    expect(safeTrim([])).toBe('');
  });
});

describe('Validação do Nome do Prato (validatePratoNome)', () => {
  const existingPratos = [
    { id: 'p1', nome: 'Smash Burger' },
    { id: 'p2', nome: 'Pizza Margherita' },
  ];

  it('recusa nome vazio ou apenas espaços', () => {
    const resEmpty = validatePratoNome('');
    expect(resEmpty.valid).toBe(false);
    expect(resEmpty.error).toBe('O nome do prato é obrigatório.');

    const resSpaces = validatePratoNome('     ');
    expect(resSpaces.valid).toBe(false);
    expect(resSpaces.error).toBe('O nome do prato é obrigatório.');
  });

  it('recusa undefined e null com segurança sem quebrar', () => {
    const resUndefined = validatePratoNome(undefined);
    expect(resUndefined.valid).toBe(false);
    expect(resUndefined.error).toBe('O nome do prato é obrigatório.');

    const resNull = validatePratoNome(null);
    expect(resNull.valid).toBe(false);
    expect(resNull.error).toBe('O nome do prato é obrigatório.');
  });

  it('recusa nome com menos de 2 caracteres', () => {
    const res = validatePratoNome('A');
    expect(res.valid).toBe(false);
    expect(res.error).toBe('O nome deve ter pelo menos 2 caracteres.');
  });

  it('aceita nome no limite inferior de 2 caracteres', () => {
    const res = validatePratoNome('X1');
    expect(res.valid).toBe(true);
    expect(res.trimmed).toBe('X1');
  });

  it('aceita nome no limite superior de 60 caracteres', () => {
    const nome60 = 'A'.repeat(60);
    const res = validatePratoNome(nome60);
    expect(res.valid).toBe(true);
    expect(res.trimmed).toBe(nome60);
  });

  it('recusa nome com mais de 60 caracteres', () => {
    const nome61 = 'A'.repeat(61);
    const res = validatePratoNome(nome61);
    expect(res.valid).toBe(false);
    expect(res.error).toBe('O nome deve ter no máximo 60 caracteres.');
  });

  it('recusa nome duplicado ignorando maiúsculas e minúsculas', () => {
    const resLower = validatePratoNome('smash burger', existingPratos);
    expect(resLower.valid).toBe(false);
    expect(resLower.error).toBe('Você já tem um prato com esse nome.');

    const resUpper = validatePratoNome('SMASH BURGER', existingPratos);
    expect(resUpper.valid).toBe(false);
    expect(resUpper.error).toBe('Você já tem um prato com esse nome.');
  });

  it('permite manter o mesmo nome ao renomear o próprio prato', () => {
    const res = validatePratoNome('Smash Burger', existingPratos, 'p1');
    expect(res.valid).toBe(true);
    expect(res.trimmed).toBe('Smash Burger');
  });

  it('aceita nome novo e devidamente formatado', () => {
    const res = validatePratoNome('  Batata Frita Rústica  ', existingPratos);
    expect(res.valid).toBe(true);
    expect(res.trimmed).toBe('Batata Frita Rústica');
  });
});
