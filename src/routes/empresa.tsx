import { createFileRoute } from '@tanstack/react-router';
import { CompanyPage } from '@/components/workspace/pages';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/empresa')({
  head: () => pageHead('Minha empresa', 'Dados públicos e identidade da loja.'),
  component: () => <CompanyPage/>,
});
