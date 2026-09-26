/**
 * Mise en forme de la section Alertes.
 *
 * Fonctions pures, sans dépendance à Prisma ni à `@/*`, même principe que
 * `subscription-summary.ts` : Vitest ne résout pas l'alias `@/` pour les
 * modules non mockés. Seul le canal e-mail (Resend) est réellement branché
 * (EF-006) ; Slack et le webhook n'existent pas encore et ne doivent jamais
 * apparaître comme actifs.
 */

export interface AlertChannel {
  id: "email" | "slack" | "webhook";
  label: string;
  /** Détail affiché sous le libellé : adresse réelle, ou statut neutre. */
  detail: string;
  available: boolean;
}

/**
 * Canaux d'alerte et leur statut. `accountEmail` est l'adresse réelle du
 * compte connecté ; `null` si elle n'a pas pu être lue côté serveur, auquel
 * cas on affiche un libellé neutre plutôt qu'une donnée inventée.
 */
export function buildAlertChannels(accountEmail: string | null): AlertChannel[] {
  return [
    {
      id: "email",
      label: "E-mail",
      detail: accountEmail ?? "Adresse e-mail du compte",
      available: true,
    },
    {
      id: "slack",
      label: "Slack",
      detail: "Pas encore proposé",
      available: false,
    },
    {
      id: "webhook",
      label: "Webhook",
      detail: "Pas encore proposé",
      available: false,
    },
  ];
}
