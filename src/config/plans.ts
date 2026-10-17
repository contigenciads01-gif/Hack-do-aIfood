export type PlanId =
  | 'experimental'
  | 'mensal'
  | 'trimestral'
  | 'primeiros_passos'
  | 'primeiros_passos_trimestral'
  | 'chef'
  | 'chef_trimestral'
  | 'chef_anual'
  | 'chef_master'
  | 'chef_master_trimestral'
  | 'chef_master_anual';

export type PlanTier = 'primeiros_passos' | 'chef' | 'chef_master' | 'experimental';
export type BillingCycle = 'mensal' | 'trimestral' | 'anual';

export interface PlanConfig {
  id: PlanId;
  name: string;
  tier: PlanTier;
  cycle: BillingCycle;
  price: number; // in BRL
  days: number;
  monthlyEquivalent: number;
  highlight?: string;
  description: string;
  features: string[];
  toolsAllowed: string[];
}

export const ADMIN_EMAILS = ['thiago2005rodrigues@gmail.com'];

export function isUserAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export const PLANS: Record<PlanId, PlanConfig> = {
  // Teste Inicial
  experimental: {
    id: 'experimental',
    name: 'Experimental',
    tier: 'experimental',
    cycle: 'mensal',
    price: 0,
    days: 7,
    monthlyEquivalent: 0,
    description: 'Teste completo e sem custos para conhecer todo o potencial do sistema.',
    features: [
      '7 dias de acesso total',
      'Todos os 9 geradores de prompt',
      'Anúncios em Story e Carrossel',
      'Identidade e cérebro de marca',
      'Download ilimitado de materiais',
    ],
    toolsAllowed: [
      'anuncio_instagram',
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ],
  },

  // 1. PRIMEIROS PASSOS
  primeiros_passos: {
    id: 'primeiros_passos',
    name: 'Primeiros Passos',
    tier: 'primeiros_passos',
    cycle: 'mensal',
    price: 14.9,
    days: 30,
    monthlyEquivalent: 14.9,
    description: 'Ideal para quem está começando e quer fotos e descrições melhores.',
    features: [
      '30 dias de acesso contínuo',
      'Fotos reais com IA essencial',
      'Descrições apetitosas para o iFood',
      'Até 20 gerações de prompt por mês',
      'Suporte via comunidade',
    ],
    toolsAllowed: ['imagem_prato', 'descricao_ifood', 'fotos_pratos'],
  },
  primeiros_passos_trimestral: {
    id: 'primeiros_passos_trimestral',
    name: 'Primeiros Passos Trimestral',
    tier: 'primeiros_passos',
    cycle: 'trimestral',
    price: 34.9,
    days: 90,
    monthlyEquivalent: 11.63,
    highlight: 'R$ 11,63/mês',
    description: '3 meses com economia imediata para estruturar seu cardápio.',
    features: [
      '90 dias de acesso garantido',
      'Fotos reais com IA essencial',
      'Descrições apetitosas para o iFood',
      'Até 30 gerações de prompt por mês',
      'Economia de R$ 9,80 no período',
    ],
    toolsAllowed: ['imagem_prato', 'descricao_ifood', 'fotos_pratos'],
  },

  // 2. CHEF (Intermediário - O Mais Popular)
  chef: {
    id: 'chef',
    name: 'Chef',
    tier: 'chef',
    cycle: 'mensal',
    price: 29.9,
    days: 30,
    monthlyEquivalent: 29.9,
    description: 'O plano ideal para cardápio completo, promoções e respostas de avaliações.',
    features: [
      '30 dias de acesso contínuo',
      'Estúdio fotográfico com iluminação gourmet',
      'Descrições de pratos e cardápio completo',
      'Engenharia de preços, combos e promoções',
      'Respostas humanas para avaliações 5 estrelas',
      'Suporte direto via WhatsApp',
    ],
    toolsAllowed: [
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ],
  },
  chef_trimestral: {
    id: 'chef_trimestral',
    name: 'Chef Trimestral',
    tier: 'chef',
    cycle: 'trimestral',
    price: 79.9,
    days: 90,
    monthlyEquivalent: 26.63,
    highlight: 'Mais vendido · R$ 26,63/mês',
    description: 'Consistência de 90 dias para transformar as vendas do delivery.',
    features: [
      '90 dias de acesso contínuo',
      'Todas as ferramentas do plano Chef',
      'Gerações ampliadas de prompt',
      'Economia de R$ 9,80 vs mensal',
      'Suporte prioritário via WhatsApp',
    ],
    toolsAllowed: [
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ],
  },
  chef_anual: {
    id: 'chef_anual',
    name: 'Chef Anual',
    tier: 'chef',
    cycle: 'anual',
    price: 269.9,
    days: 365,
    monthlyEquivalent: 22.49,
    highlight: '25% OFF · R$ 22,49/mês',
    description: 'Um ano inteiro garantido com o menor custo mensal.',
    features: [
      '365 dias de acesso garantido',
      'Todas as ferramentas do plano Chef',
      'Economia comprovada de R$ 88,90 ao ano',
      'Atualizações prioritárias',
    ],
    toolsAllowed: [
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ],
  },

  // 3. CHEF MASTER (Acesso Total + Anúncios Instagram + Suporte VIP)
  chef_master: {
    id: 'chef_master',
    name: 'Chef Master',
    tier: 'chef_master',
    cycle: 'mensal',
    price: 49.9,
    days: 30,
    monthlyEquivalent: 49.9,
    highlight: 'Acesso Total',
    description: 'Poder máximo: campanhas de anúncios em Instagram Ads, branding e prompts ilimitados.',
    features: [
      '30 dias de acesso com liberação total',
      'Anúncios de Instagram de alta conversão (Story 9:16 + Feed)',
      'Estúdio fotográfico gastronômico avançado',
      'Cérebro de marca e identidade completa',
      'Prompts ilimitados sem restrição',
      'Suporte VIP prioritário no WhatsApp',
    ],
    toolsAllowed: [
      'anuncio_instagram',
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ],
  },
  chef_master_trimestral: {
    id: 'chef_master_trimestral',
    name: 'Chef Master Trimestral',
    tier: 'chef_master',
    cycle: 'trimestral',
    price: 134.9,
    days: 90,
    monthlyEquivalent: 44.97,
    highlight: 'R$ 44,97/mês',
    description: '90 dias de tração comercial com anúncios rodando todo santo dia.',
    features: [
      '90 dias com todas as 7 ferramentas liberadas',
      'Anúncios de Instagram de alta conversão',
      'Economia de R$ 14,80 no período',
      'Suporte VIP prioritário no WhatsApp',
    ],
    toolsAllowed: [
      'anuncio_instagram',
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ],
  },
  chef_master_anual: {
    id: 'chef_master_anual',
    name: 'Chef Master Anual',
    tier: 'chef_master',
    cycle: 'anual',
    price: 449.9,
    days: 365,
    monthlyEquivalent: 37.49,
    highlight: 'Super Economia · R$ 37,49/mês',
    description: 'A melhor oferta: equivalente a R$ 37,49/mês com todas as ferramentas e suporte VIP por um ano.',
    features: [
      '365 dias de acesso irrestrito',
      'Todas as 7 ferramentas sem travas',
      'Economia de R$ 148,90 ao ano (quase 3 meses grátis)',
      'Canal exclusivo com a equipe de suporte',
    ],
    toolsAllowed: [
      'anuncio_instagram',
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ],
  },

  // Aliases para compatibilidade total com dados existentes
  mensal: {
    id: 'mensal',
    name: 'Mensal',
    tier: 'chef',
    cycle: 'mensal',
    price: 29.9,
    days: 30,
    monthlyEquivalent: 29.9,
    description: 'Flexibilidade mês a mês para alavancar seu delivery.',
    features: [
      '30 dias de acesso contínuo',
      'Todos os geradores de prompt para cardápio',
      'Estúdio de fotos e promoções',
      'Identidade e cérebro de marca',
      'Suporte direto via WhatsApp',
    ],
    toolsAllowed: [
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
    ],
  },
  trimestral: {
    id: 'trimestral',
    name: 'Trimestral',
    tier: 'chef',
    cycle: 'trimestral',
    price: 79.9,
    days: 90,
    monthlyEquivalent: 26.63,
    highlight: 'Melhor preço',
    description: 'Maior economia e consistência para a estratégia do seu cardápio.',
    features: [
      '90 dias de acesso garantido',
      'Todos os recursos de cardápio inclusos',
      'Menor custo mensal (R$ 26,63/mês)',
      'Economia imediata comprovada',
      'Suporte prioritário via WhatsApp',
    ],
    toolsAllowed: [
      'imagem_prato',
      'descricao_ifood',
      'promocao_preco',
      'responder_avaliacao',
      'minha_pagina',
      'fotos_pratos',
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
  const plan = PLANS[planId] || PLANS.chef;
  const storeText = storeName ? ` para a minha loja "${storeName}"` : '';
  const message = `Olá! Quero assinar o plano ${plan.name} (${formatCurrency(plan.price)}) do hack du ifood${storeText}. Como posso prosseguir com a ativação?`;
  return `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Pure calculation for Pró-rata upgrade between two plans.
 * Calculates remaining credit of current plan and charges only the fair difference.
 */
export function calculateProrataUpgrade({
  currentPrice,
  newPrice,
  cycleDays = 30,
  daysRemaining,
}: {
  currentPrice: number;
  newPrice: number;
  cycleDays?: number;
  daysRemaining: number;
}): {
  credit: number;
  cost: number;
  difference: number;
  formattedDifference: string;
} {
  const clampedDays = Math.max(0, Math.min(daysRemaining, cycleDays));
  const dailyCurrent = currentPrice / cycleDays;
  const dailyNew = newPrice / cycleDays;

  const credit = Number((dailyCurrent * clampedDays).toFixed(2));
  const cost = Number((dailyNew * clampedDays).toFixed(2));
  const difference = Number(Math.max(0, cost - credit).toFixed(2));

  return {
    credit,
    cost,
    difference,
    formattedDifference: formatCurrency(difference),
  };
}

/**
 * Checks whether a specific tool is authorized for a given plan or admin user.
 */
export function isToolAllowed(
  toolId: string,
  planId?: PlanId | string | null,
  isAdmin?: boolean,
): boolean {
  if (isAdmin) return true;
  if (!planId) return false;

  const resolved = PLANS[planId as PlanId];
  if (!resolved) {
    // Fallback: Chef Master grants all
    if (planId.includes('master')) return true;
    if (planId.includes('primeiros')) {
      return ['imagem_prato', 'descricao_ifood', 'fotos_pratos'].includes(toolId);
    }
    return toolId !== 'anuncio_instagram';
  }

  return resolved.toolsAllowed.includes(toolId);
}

