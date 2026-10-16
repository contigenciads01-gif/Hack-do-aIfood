import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/avaliacoes')({
  beforeLoad: () => {
    throw redirect({
      to: '/agente',
      search: { card: 'responder_avaliacao' },
    });
  },
  component: () => null,
});
