import { createFileRoute } from '@tanstack/react-router';
import { StudioPage } from '@/components/workspace/pages';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/estudio')({
  head: () => pageHead('Estúdio', 'Ferramentas para preparar seus materiais do iFood.'),
  component: () => <StudioPage/>,
});
