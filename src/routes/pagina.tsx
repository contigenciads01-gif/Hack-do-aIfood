import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/pagina')({
  beforeLoad: () => {
    throw redirect({
      to: '/agente',
      search: { card: 'minha_pagina' },
    });
  },
  component: () => null,
});
