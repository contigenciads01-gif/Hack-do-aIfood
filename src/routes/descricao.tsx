import { createFileRoute } from '@tanstack/react-router';
import { PromptDashboard } from '@/components/workspace/prompt-dashboard';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/descricao')({
  head: () => pageHead('Descrição para o iFood', 'Prepare títulos e descrições dos seus pratos.'),
  component: () => <PromptDashboard toolId="descricao"/>,
});
