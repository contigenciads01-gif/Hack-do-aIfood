import { createFileRoute } from '@tanstack/react-router';
import { PromptDashboard } from '@/components/workspace/prompt-dashboard';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/branding')({
  head: () => pageHead('Cérebro de marca', 'Direção de marca e posicionamento para seu restaurante.'),
  component: () => <PromptDashboard toolId="branding"/>,
});
