import { createFileRoute } from '@tanstack/react-router';
import { AgenteWorkspace } from '@/components/workspace/agente-workspace';
import { pageHead } from '@/data/mock';

export interface AgenteSearch {
  card?: string | undefined;
}

export const Route = createFileRoute('/agente')({
  validateSearch: (search: Record<string, unknown>): AgenteSearch => ({
    card: typeof search['card'] === 'string' ? String(search['card']) : undefined,
  }),
  head: () => pageHead('Agente', 'Central única de criação e geração de conteúdo para seu delivery.'),
  component: () => <AgenteWorkspace />,
});
