/**
 * Rendu headless d'une page, pour comparer le texte brut au texte rendu.
 *
 * Aucun service de navigateur n'est branché pour l'instant : le moteur par
 * défaut ne rend rien et l'analyse JS retombe sur l'heuristique du HTML brut
 * (verdict « likely_js_dependent »). Une implémentation réelle (Browserless,
 * Playwright dans un worker...) doit elle-même refuser les adresses internes
 * et limiter les redirections, comme `crawlUrl`.
 */
export interface Renderer {
  readonly name: string;
  /** HTML après exécution du JavaScript, ou `null` si le rendu est indisponible. */
  render(url: string): Promise<string | null>;
}

export const noopRenderer: Renderer = {
  name: "none",
  render: async () => null,
};

export function getDefaultRenderer(): Renderer {
  return noopRenderer;
}
