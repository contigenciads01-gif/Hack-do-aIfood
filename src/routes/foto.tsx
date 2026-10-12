import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage } from '@/components/workspace/pages';
import { pageHead } from '@/data/mock';
export const Route = createFileRoute('/foto')({
  head: () => pageHead('Tirar foto do prato', 'Use a câmera ou envie a foto do prato.'),
  component: () => <PlaceholderPage path="/foto"/>,
});
