import { createFileRoute } from '@tanstack/react-router';
import { MateriaisExplorer } from '@/components/workspace/materiais-explorer';
import { pageHead } from '@/data/mock';

export const Route = createFileRoute('/materiais')({
  head: () => pageHead('Meus materiais', 'Pastas organizadas por prato, fotos e prompts prontos.'),
  component: () => (
    <main className="tool-page max-w-6xl">
      <div className="page-heading">
        <div>
          <h1 className="text-2xl font-black">Meus materiais</h1>
          <p className="text-xs sm:text-sm text-white/60">
            Pastas organizadas para cada prato do seu cardápio, fotos e prompts gerados.
          </p>
        </div>
      </div>
      <MateriaisExplorer mode="pagina" />
    </main>
  ),
});
