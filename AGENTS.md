<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Wrap non-login routes in the shared WorkspaceShell, keeping the original dashboard body intact; this adds navigation without replacing existing content.
- O aplicativo usa Supabase (Auth, Postgres com RLS e Storage); todas as tabelas têm RLS ativada (user_id = auth.uid()).
- O aplicativo NÃO chama IA diretamente; os prompts são montados localmente pelo motor puro buildMetaprompt usando templates e pacotes de categoria.
- Nunca guardar imagens em base64 no localStorage; arquivos e logos devem ser comprimidos e salvos no Storage do Supabase (bucket company-assets).
- Use Radix-backed Sheet panels para navegação e edição de metaprompt, mantendo foco modal acessível e fechamento com Escape.
- Todas as rotas protegidas exigem autenticação ativa do Supabase.
