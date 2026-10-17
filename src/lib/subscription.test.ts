import { describe, expect, it } from 'vitest';
import { getAccess, type SubscriptionRecord } from './subscription';
import {
  PLANS,
  getTrimestralMonthlyPrice,
  getTrimestralSavings,
  getTrimestralMonthlyPriceFormatted,
  getTrimestralSavingsFormatted,
  getWhatsAppSubscribeUrl,
  calculateProrataUpgrade,
  isToolAllowed,
  isUserAdminEmail,
} from '@/config/plans';

describe('Subscription access and expiration logic', () => {
  const baseDate = new Date('2026-10-15T12:00:00.000Z');

  it('handles null or undefined subscription (sem assinatura)', () => {
    const access = getAccess(null, baseDate);
    expect(access.hasAccess).toBe(false);
    expect(access.status).toBe('sem_assinatura');
    expect(access.plano).toBeNull();
    expect(access.daysRemaining).toBe(0);
    expect(access.hoursRemaining).toBe(0);
    expect(access.isExpiringSoon).toBe(false);
    expect(access.badgeVariant).toBe('danger');
  });

  it('grants access when subscription is active and within expiration time', () => {
    const sub: SubscriptionRecord = {
      plano: 'experimental',
      status: 'ativo',
      inicio: new Date('2026-10-10T12:00:00.000Z').toISOString(),
      fim: new Date('2026-10-17T12:00:00.000Z').toISOString(), // 2 days left
      origem: 'trial',
    };

    const access = getAccess(sub, baseDate);
    expect(access.hasAccess).toBe(true);
    expect(access.status).toBe('ativo');
    expect(access.plano).toBe('experimental');
    expect(access.daysRemaining).toBe(2);
    expect(access.hoursRemaining).toBe(48);
    expect(access.isExpiringSoon).toBe(true);
    expect(access.badgeVariant).toBe('warning');
    expect(access.label).toBe('Experimental · 2 dias');
  });

  it('calculates remaining days accurately when far from expiration', () => {
    const sub: SubscriptionRecord = {
      plano: 'mensal',
      status: 'ativo',
      inicio: new Date('2026-10-01T12:00:00.000Z').toISOString(),
      fim: new Date('2026-10-31T12:00:00.000Z').toISOString(), // 16 days left
      origem: 'manual',
    };

    const access = getAccess(sub, baseDate);
    expect(access.hasAccess).toBe(true);
    expect(access.daysRemaining).toBe(16);
    expect(access.isExpiringSoon).toBe(false);
    expect(access.badgeVariant).toBe('active');
    expect(access.label).toBe('Mensal · 16 dias');
  });

  it('denies access when expired by exactly 1 second', () => {
    const sub: SubscriptionRecord = {
      plano: 'mensal',
      status: 'ativo',
      inicio: new Date('2026-09-15T12:00:00.000Z').toISOString(),
      fim: new Date('2026-10-15T11:59:59.000Z').toISOString(), // 1 second in the past
      origem: 'manual',
    };

    const access = getAccess(sub, baseDate);
    expect(access.hasAccess).toBe(false);
    expect(access.status).toBe('expirado');
    expect(access.daysRemaining).toBe(0);
    expect(access.hoursRemaining).toBe(0);
    expect(access.isExpiringSoon).toBe(false);
    expect(access.badgeVariant).toBe('danger');
    expect(access.label).toBe('Mensal · Expirado');
  });

  it('denies access when status is explicitly cancelado', () => {
    const sub: SubscriptionRecord = {
      plano: 'trimestral',
      status: 'cancelado',
      inicio: new Date('2026-10-01T12:00:00.000Z').toISOString(),
      fim: new Date('2027-01-01T12:00:00.000Z').toISOString(), // future date, but canceled
      origem: 'manual',
    };

    const access = getAccess(sub, baseDate);
    expect(access.hasAccess).toBe(false);
    expect(access.status).toBe('cancelado');
    expect(access.badgeVariant).toBe('danger');
    expect(access.label).toBe('Trimestral · Cancelado');
  });

  it('formats hoursRemaining when less than 24 hours left', () => {
    const sub: SubscriptionRecord = {
      plano: 'experimental',
      status: 'ativo',
      inicio: new Date('2026-10-08T12:00:00.000Z').toISOString(),
      fim: new Date('2026-10-15T17:00:00.000Z').toISOString(), // 5 hours left
      origem: 'trial',
    };

    const access = getAccess(sub, baseDate);
    expect(access.hasAccess).toBe(true);
    expect(access.hoursRemaining).toBe(5);
    expect(access.daysRemaining).toBe(1);
    expect(access.isExpiringSoon).toBe(true);
    expect(access.formattedRemaining).toBe('5 horas');
  });
});

describe('Plan pricing and savings calculations', () => {
  it('has exact prices for experimental, mensal, and trimestral', () => {
    expect(PLANS.experimental.price).toBe(0);
    expect(PLANS.experimental.days).toBe(7);

    expect(PLANS.mensal.price).toBe(29.9);
    expect(PLANS.mensal.days).toBe(30);

    expect(PLANS.trimestral.price).toBe(79.9);
    expect(PLANS.trimestral.days).toBe(90);
    expect(PLANS.trimestral.highlight).toBe('Melhor preço');
  });

  it('computes trimestral monthly price correctly (79.90 / 3)', () => {
    const monthlyEquivalent = getTrimestralMonthlyPrice();
    expect(monthlyEquivalent).toBeCloseTo(26.6333, 2);
    expect(getTrimestralMonthlyPriceFormatted()).toContain('26,63');
  });

  it('computes savings correctly compared to 3 months of mensal', () => {
    // 3 * 29.90 = 89.70
    // 89.70 - 79.90 = 9.80
    const savings = getTrimestralSavings();
    expect(savings).toBeCloseTo(9.8, 2);
    expect(getTrimestralSavingsFormatted()).toContain('9,80');
  });

  it('generates valid WhatsApp subscription link with custom store', () => {
    const url = getWhatsAppSubscribeUrl('trimestral', 'Burger do Cheff');
    expect(url).toContain('wa.me');
    expect(url).toContain(encodeURIComponent('Trimestral'));
    expect(url).toContain(encodeURIComponent('Burger do Cheff'));
  });

  it('configures the new 3-tier matrix: Primeiros Passos, Chef, Chef Master', () => {
    // Primeiros Passos
    expect(PLANS.primeiros_passos.price).toBe(14.9);
    expect(PLANS.primeiros_passos_trimestral.price).toBe(34.9);
    expect(PLANS.primeiros_passos_trimestral.monthlyEquivalent).toBeCloseTo(11.63, 2);

    // Chef
    expect(PLANS.chef.price).toBe(29.9);
    expect(PLANS.chef_trimestral.price).toBe(79.9);
    expect(PLANS.chef_anual.price).toBe(269.9);
    expect(PLANS.chef_anual.monthlyEquivalent).toBeCloseTo(22.49, 2);

    // Chef Master
    expect(PLANS.chef_master.price).toBe(49.9);
    expect(PLANS.chef_master_trimestral.price).toBe(134.9);
    expect(PLANS.chef_master_anual.price).toBe(449.9);
    expect(PLANS.chef_master_anual.monthlyEquivalent).toBeCloseTo(37.49, 2);
  });

  it('calculates Pró-Rata upgrade fairly: Chef (R$29.90) to Chef Master (R$49.90) with 20 days remaining', () => {
    // 20 days remaining out of 30 days
    // Credit: (29.90 / 30) * 20 = 19.93
    // Cost: (49.90 / 30) * 20 = 33.27
    // Difference: 33.27 - 19.93 = 13.34 (or ~13.33)
    const { credit, cost, difference, formattedDifference } = calculateProrataUpgrade({
      currentPrice: 29.9,
      newPrice: 49.9,
      cycleDays: 30,
      daysRemaining: 20,
    });

    expect(credit).toBeCloseTo(19.93, 1);
    expect(cost).toBeCloseTo(33.27, 1);
    expect(difference).toBeCloseTo(13.33, 1);
    expect(formattedDifference).toContain('13,');
  });

  it('enforces tool permissions according to plan tier', () => {
    // Chef Master has all tools
    expect(isToolAllowed('anuncio_instagram', 'chef_master')).toBe(true);
    expect(isToolAllowed('imagem_prato', 'chef_master')).toBe(true);

    // Chef has all except anuncio_instagram
    expect(isToolAllowed('anuncio_instagram', 'chef')).toBe(false);
    expect(isToolAllowed('imagem_prato', 'chef')).toBe(true);
    expect(isToolAllowed('promocao_preco', 'chef')).toBe(true);

    // Primeiros Passos only has essential tools
    expect(isToolAllowed('anuncio_instagram', 'primeiros_passos')).toBe(false);
    expect(isToolAllowed('promocao_preco', 'primeiros_passos')).toBe(false);
    expect(isToolAllowed('imagem_prato', 'primeiros_passos')).toBe(true);
    expect(isToolAllowed('descricao_ifood', 'primeiros_passos')).toBe(true);

    // Admin has all tools regardless of plan
    expect(isToolAllowed('anuncio_instagram', 'primeiros_passos', true)).toBe(true);
  });

  it('recognizes thiago2005rodrigues@gmail.com as superadmin', () => {
    expect(isUserAdminEmail('thiago2005rodrigues@gmail.com')).toBe(true);
    expect(isUserAdminEmail('THIAGO2005RODRIGUES@GMAIL.COM')).toBe(true);
    expect(isUserAdminEmail('outro@restaurante.com')).toBe(false);
  });
});
