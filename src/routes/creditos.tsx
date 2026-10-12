import { createFileRoute } from '@tanstack/react-router';
import { CreditsPage } from '@/components/workspace/pages';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/creditos')({
  head: () => pageHead('Meus créditos', 'Consulte créditos e pacotes de exemplo.'),
  component: () => <CreditsPage/>,
});
