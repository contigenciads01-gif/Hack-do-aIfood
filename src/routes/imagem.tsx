import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/imagem')({
  beforeLoad: () => {
    throw redirect({
      to: '/agente',
      search: { card: 'imagem_prato' },
    });
  },
  component: () => null,
});
