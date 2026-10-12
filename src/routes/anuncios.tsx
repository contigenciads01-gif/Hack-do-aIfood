import { createFileRoute } from '@tanstack/react-router';
import { AnunciosPage } from '@/components/workspace/anuncios-page';

export const Route = createFileRoute('/anuncios')({
  head: () => ({
    meta: [
      { title: 'Anúncios (Plus) — Hack do iFood' },
      {
        name: 'description',
        content: 'Crie anúncios profissionais de alta conversão para Instagram Stories e Carrossel.',
      },
    ],
  }),
  component: AnunciosPage,
});
