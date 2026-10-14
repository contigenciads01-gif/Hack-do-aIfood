export type PlanId = 'experimental' | 'mensal' | 'trimestral';

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number; // in BRL
  days: number;
  highlight?: string;
  description: string;
  features: string[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  experimental: {
    id: 'experimental',
    name: 'Experimental',
    price: 0,
    days: 7,
    description: 'Teste completo e sem custos para conhecer todo o potencial do sistema.',
    features: [
      '7 dias de acesso total',
      'Todos os 9 geradores de prompt',
      'Anúncios em Story e Carrossel',
      'Identidade e cérebro de marca',
      'Download ilimitado de materiais',
    ],
  },
  mensal: {
    id: 'mensal',
    name: 'Mensal',
    price: 29.9,
    days: 30,
    description: 'Flexibilidade mês a mês para alavancar seu delivery.',
    features: [
      '30 dias de acesso contínuo',
      'Todos os 9 geradores de prompt',
      'Anúncios em Story e Carrossel',
      'Identidade e cérebro de marca',
      'Suporte direto via WhatsApp',
    ],
  },
  trimestral: {
    id: 'trimestral',
    name: 'Trimestral',
    price: 79.9,
    days: 90,
    highlight: 'Melhor preço',
    description: 'Maior economia e consistência para a estratégia do seu cardápio.',
    features: [
      '90 dias de acesso garantido',
      'Todos os recursos inclusos',
      'Menor custo mensal',
      'Economia imediata comprovada',
      'Suporte prioritário via WhatsApp',
    ],
  },
};

/** Formats a numeric value to Brazilian Real currency string (e.g. R$ 29,90) */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Calculates the monthly equivalent price for a quarterly plan (79.90 / 3) */
export function getTrimestralMonthlyPrice(): number {
  return PLANS.trimestral.price / 3;
}

/** Formatted monthly price for quarterly plan */
export function getTrimestralMonthlyPriceFormatted(): string {
  return `${formatCurrency(getTrimestralMonthlyPrice())}/mês`;
}

/** Calculates the total savings of the quarterly plan compared to 3 months of monthly plan */
export function getTrimestralSavings(): number {
  return PLANS.mensal.price * 3 - PLANS.trimestral.price;
}

/** Formatted savings string */
export function getTrimestralSavingsFormatted(): string {
  return formatCurrency(getTrimestralSavings());
}

/** Support WhatsApp number configured for direct subscription */
export const SUPPORT_PHONE = '5511999999999';

/** Generates a pre-filled WhatsApp link to subscribe to a plan */
export function getWhatsAppSubscribeUrl(planId: PlanId, storeName?: string): string {
  const plan = PLANS[planId];
  const storeText = storeName ? ` para a minha loja "${storeName}"` : '';
  const message = `Olá! Quero assinar o plano ${plan.name} (${formatCurrency(plan.price)}) do hack du ifood${storeText}. Como posso prosseguir com a ativação?`;
  return `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
}
