import { createFileRoute } from '@tanstack/react-router';
import { FotoStudio } from '@/components/workspace/foto-studio';
import { pageHead } from '@/data/mock';

export const Route = createFileRoute('/foto')({
  head: () =>
    pageHead('Tirar foto do prato', 'Capture até 3 fotos por prato e organize tudo nos seus materiais.'),
  component: () => <FotoStudio />,
});
