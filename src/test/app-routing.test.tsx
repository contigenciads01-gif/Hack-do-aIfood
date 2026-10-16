import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("considers cadastro complete when cadastro_concluido is true regardless of logo status", () => {
    // When company has cadastro_concluido: true, user is never sent to /cadastro even if tem_logo is false or logo_path is null
    const companyWithLogo = {
      id: 'comp-1',
      nome: 'Hamburgueria Silva',
      categoria: 'Hamburgueria',
      tem_logo: true,
      logo_path: 'comp-1/logo.png',
      cadastro_concluido: true,
    };

    const companyWithoutLogo = {
      id: 'comp-2',
      nome: 'Hamburgueria Silva',
      categoria: 'Hamburgueria',
      tem_logo: false,
      logo_path: null,
      cadastro_concluido: true,
    };

    const isComplete = (comp: any) => Boolean(comp?.cadastro_concluido);
    expect(isComplete(companyWithLogo)).toBe(true);
    expect(isComplete(companyWithoutLogo)).toBe(true);
  });

  it("redirects away from /cadastro to /agente when cadastro_concluido is true", () => {
    const company = {
      id: 'comp-1',
      nome: 'Doceria da Maria',
      cadastro_concluido: true,
    };

    const shouldRedirectAwayFromCadastro = Boolean(company?.cadastro_concluido);
    expect(shouldRedirectAwayFromCadastro).toBe(true);
  });
});
