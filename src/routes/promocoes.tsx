import { createFileRoute } from '@tanstack/react-router';
import { PromptDashboard } from '@/components/workspace/prompt-dashboard';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/promocoes')({ head: () => pageHead('Promoções e preço', 'Monte um metaprompt de promoções e preço para usar no ChatGPT.'), component: () => <PromptDashboard toolId="promocoes"/> });
