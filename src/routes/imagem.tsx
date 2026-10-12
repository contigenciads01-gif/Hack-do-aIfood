import { createFileRoute } from '@tanstack/react-router';
import { PromptDashboard } from '@/components/workspace/prompt-dashboard';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/imagem')({
  head: () => pageHead('Gerar imagem do prato', 'Foto, ingredientes, formato e estilo para seu criativo.'),
  component: () => <PromptDashboard toolId="imagem"/>,
});
