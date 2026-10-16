import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/foto')({
  beforeLoad: () => {
    throw redirect({
      to: '/agente',
      search: { card: 'fotos_pratos' },
    });
  },
  component: () => null,
});
