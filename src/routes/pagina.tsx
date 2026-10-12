import { createFileRoute } from '@tanstack/react-router';
import { PromptDashboard } from '@/components/workspace/prompt-dashboard';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/pagina')({
  head: () => pageHead('Minha página', 'Links e presença digital da sua loja.'),
  component: () => <PromptDashboard toolId="pagina"/>,
});
