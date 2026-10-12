import { createFileRoute } from '@tanstack/react-router';
import { PromptDashboard } from '@/components/workspace/prompt-dashboard';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/avaliacoes')({ head: () => pageHead('Respostas a avaliações', 'Monte um metaprompt de respostas a avaliações para usar no ChatGPT.'), component: () => <PromptDashboard toolId="avaliacoes"/> });
