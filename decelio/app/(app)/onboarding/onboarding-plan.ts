/**
 * Choix du plan pendant l'onboarding (EF-063).
 *
 * Fonctions et données pures, sans dépendance à Prisma ni à `@/*` : même
 * contrainte que `../settings/subscription-summary.ts` et
 * `../settings/alerts-summary.ts`, Vitest ne résout pas l'alias `@/` pour les
 * modules non mockés.
 *
 * Noms et prix alignés sur `/pricing` (`app/(marketing)/pricing/page.tsx`) ;
 * quotas alignés sur `PLAN_LIMITS` (`lib/billing/plans.ts`). Ces deux fichiers
 * restent la seule autorité côté serveur pour le tarif Stripe réellement
 * facturé et le quota réellement appliqué ; si l'un d'eux change, reporter le
 * changement ici.
 */

export type OnboardingPlanId = "SOLO" | "PRO" | "SCALE";

export interface OnboardingPlanOption {
  id: OnboardingPlanId;
  name: string;
  price: string;
  priceUnit: string;
  maxSites: number;
  /** Libellé du bouton : indique ce qui se passe au clic, jamais une promesse vague. */
  ctaLabel: string;
}

export const ONBOARDING_PLANS: OnboardingPlanOption[] = [
  {
    id: "SOLO",
    name: "Freelance",
    price: "39 €",
    priceUnit: "/mois",
    maxSites: 10,
    ctaLabel: "Choisir Freelance : paiement sur Stripe",
  },
  {
    id: "PRO",
    name: "Agence",
    price: "99 €",
    priceUnit: "/mois",
    maxSites: 30,
    ctaLabel: "Choisir Agence : paiement sur Stripe",
  },
  {
    id: "SCALE",
    name: "Studio",
    price: "249 €",
    priceUnit: "/mois",
    maxSites: 100,
    ctaLabel: "Choisir Studio : paiement sur Stripe",
  },
];

export interface SubscriptionStatusInput {
  plan: string;
  stripeCurrentPeriodEnd: Date | null;
}

/**
 * Décide si l'étape de choix du plan doit être sautée pendant l'onboarding.
 *
 * On saute l'étape seulement si le palier n'est pas FREE *et* que la période
 * déjà payée court encore : un abonnement expiré (résilié ou simplement pas
 * renouvelé) ne doit pas laisser passer un utilisateur sans nouveau paiement.
 */
export function shouldSkipPlanStep(input: SubscriptionStatusInput, now: Date = new Date()): boolean {
  return (
    input.plan !== "FREE" &&
    input.stripeCurrentPeriodEnd !== null &&
    input.stripeCurrentPeriodEnd.getTime() > now.getTime()
  );
}
