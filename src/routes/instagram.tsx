import { createFileRoute } from '@tanstack/react-router';
import { PromptDashboard } from '@/components/workspace/prompt-dashboard';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/instagram')({ head: () => pageHead('Instagram · posts e stories', 'Monte um metaprompt de instagram · posts e stories para usar no ChatGPT.'), component: () => <PromptDashboard toolId="instagram"/> });
