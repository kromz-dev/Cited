/**
 * Nom de domaine affiché sur la page de détail d'un site (`app/(app)/sites/[siteId]/page.tsx`).
 *
 * T051, principe II de la constitution : le nom affiché est toujours dérivé
 * d'une donnée réelle (`MonitoredSite` ou `Site` legacy). Si ni l'un ni
 * l'autre n'existe pour cet identifiant, on retombe honnêtement sur
 * l'identifiant brut de la route plutôt que d'inventer un domaine de
 * démonstration — la page affiche alors ses états vides habituels (aucun
 * scan, aucune trace) au lieu de laisser croire qu'un site réel existe.
 */
export function resolveDomainName(
  monitoredSite: { url: string } | null,
  legacySite: { domain: string } | null,
  siteId: string,
): string {
  if (monitoredSite) {
    return monitoredSite.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  if (legacySite) {
    return legacySite.domain;
  }
  return siteId;
}
