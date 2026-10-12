import { createFileRoute } from '@tanstack/react-router';
import { MaterialsPage } from '@/components/workspace/materials-page';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/materiais')({
  head: () => pageHead('Meus materiais', 'Reúna seus arquivos e textos em um lugar.'),
  component: () => <MaterialsPage/>,
});
