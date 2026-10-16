import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/promocoes')({
  beforeLoad: () => {
    throw redirect({
      to: '/agente',
      search: { card: 'promocao_preco' },
    });
  },
  component: () => null,
});
