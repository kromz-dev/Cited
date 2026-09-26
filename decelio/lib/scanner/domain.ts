/**
 * Validation du paramètre `domain` de `/analyse/[domain]`.
 *
 * C'est un nom de domaine nu (pas une URL : pas de schéma, pas de port, pas
 * de chemin) saisi dans un segment d'URL public. La protection SSRF réelle
 * reste faite par `assertSafeUrl` (voir `lib/scanner/crawler.ts`), rejouée
 * côté serveur par `/api/scan` sur l'URL construite ici et sur chaque
 * redirection : cette fonction n'est qu'un filtre de forme, pour décider si
 * la page tente un scan ou affiche « domaine invalide ».
 */

const LABEL = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export function isValidDomainName(input: string): boolean {
  const domain = input.trim().toLowerCase();
  if (!domain || domain.length > 253) return false;
  // Pas de schéma, d'identifiants, de port, de chemin ni d'espace.
  if (/[\s/@:?#]/.test(domain)) return false;

  const labels = domain.split(".");
  if (labels.length < 2) return false;

  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/.test(tld)) return false;

  return labels.every((label) => LABEL.test(label));
}

/** Construit l'URL à passer à `/api/scan` (toujours en https, minuscules). */
export function domainToScanUrl(input: string): string {
  return `https://${input.trim().toLowerCase()}`;
}
