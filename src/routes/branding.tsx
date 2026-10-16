import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/branding')({
  beforeLoad: () => {
    throw redirect({
      to: '/agente',
    });
  },
  component: () => null,
});
