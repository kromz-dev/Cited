/**
 * Mise en forme de la section Données personnelles (EF-015 / ENF-003).
 *
 * Fonctions pures, sans dépendance à Prisma ni à `@/*`, sur le même principe
 * que `subscription-summary.ts` : Vitest ne résout pas l'alias `@/` pour les
 * modules non mockés.
 */

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Libellé de la date du dernier export, ou `null` si aucun export n'a jamais été fait. */
export function formatExportDateLabel(dataExportedAt: Date | null): string | null {
  if (!dataExportedAt) return null;
  return `Dernier export le ${dateFormatter.format(dataExportedAt)}`;
}

export interface PurgeLabelInput {
  cancelledAt: Date | null;
  purgeAt: Date | null;
}

/**
 * Phrase sur la purge des données. Un compte résilié avec `purgeAt` connu
 * affiche la date exacte programmée par le webhook Stripe (résiliation + 60
 * jours, voir `app/api/webhooks/stripe/route.ts`) ; sinon une phrase factuelle
 * sur la règle appliquée.
 */
export function formatPurgeLabel(input: PurgeLabelInput): string {
  if (input.cancelledAt && input.purgeAt) {
    return `Vos données seront supprimées le ${dateFormatter.format(input.purgeAt)}.`;
  }
  return "En cas de résiliation de l'abonnement, vos données sont conservées 60 jours puis supprimées définitivement.";
}
