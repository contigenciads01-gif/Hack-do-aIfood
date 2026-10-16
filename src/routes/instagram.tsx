import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/instagram')({
  beforeLoad: () => {
    throw redirect({
      to: '/agente',
      search: { card: 'anuncio_instagram' },
    });
  },
  component: () => null,
});
