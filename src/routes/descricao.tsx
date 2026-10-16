import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/descricao')({
  beforeLoad: () => {
    throw redirect({
      to: '/agente',
      search: { card: 'descricao_ifood' },
    });
  },
  component: () => null,
});
