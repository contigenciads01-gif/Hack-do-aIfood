export const creditBalance = 5;
export const creditHistory = [
  { date: '08/10/2026', action: 'Imagem do prato · exemplo', credits: '-1', balance: 5 },
  { date: '07/10/2026', action: 'Descrição · exemplo', credits: '-1', balance: 6 },
  { date: '06/10/2026', action: 'Branding · exemplo', credits: '-1', balance: 7 },
];
export const packages = [
  { name: 'Pacote inicial', credits: 15, price: 'R$ 49,90' },
  { name: 'Chef Pro', credits: 50, price: 'R$ 119,90', popular: true },
  { name: 'Restaurante Escala', credits: 150, price: 'R$ 269,90' },
];
export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} — Hack do aiFood` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} — Hack do aiFood` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}
