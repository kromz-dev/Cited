/**
 * Mise en forme de la section Marque blanche.
 *
 * La marque blanche des rapports (logo, nom, couleur d'accent) est la Phase 5
 * (T033) : elle n'est pas encore implémentée. Cette section se contente donc
 * d'annoncer factuellement à qui elle est réservée, sans formulaire ni donnée
 * inventée. `hasWhiteLabelAccess` vient de `PLAN_LIMITS[plan].whiteLabel`
 * (lib/billing/plans.ts), seule autorité sur les paliers.
 */
export function whiteLabelMessage(hasWhiteLabelAccess: boolean): string {
  return hasWhiteLabelAccess
    ? "Arrive avec les rapports mensuels."
    : "Incluse à partir du palier Agence.";
}
