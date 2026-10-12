import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '@/components/workspace/pages';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/conta')({
  head: () => pageHead('Conta', 'Gerencie seu acesso e sua empresa.'),
  component: () => <AccountPage/>,
});
