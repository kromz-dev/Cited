/**
 * Mise en forme de la section Abonnement (EF-059).
 *
 * Fonctions pures, sans dépendance à Prisma ni à `@/*` : Vitest ne résout pas
 * l'alias `@/` pour les modules non mockés, et la logique d'affichage n'a de
 * toute façon pas besoin d'accès réseau pour être testée.
 */

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  SOLO: "Freelance",
  PRO: "Agence",
  SCALE: "Studio",
};

/** Nom commercial du palier (voir /pricing). FREE et les plans inconnus n'ont pas d'abonnement. */
export function planDisplayName(plan: string): string {
  return PLAN_DISPLAY_NAMES[plan] ?? "Aucun abonnement";
}

/** Libellé du quota de sites surveillés, ex. "7 / 10 sites surveillés". */
export function formatQuotaLabel(siteCount: number, maxSites: number): string {
  return `${siteCount} / ${maxSites} sites surveillés`;
}

const billingDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export interface BillingLabelInput {
  cancelledAt: Date | null;
  stripeCurrentPeriodEnd: Date | null;
}

/**
 * Libellé de la prochaine échéance de facturation.
 *
 * Un abonnement résilié prime sur toute date de fin de période encore
 * présente en base (Stripe peut conserver `stripeCurrentPeriodEnd` jusqu'à la
 * fin de la période déjà payée). `null` signifie qu'il n'y a rien à afficher
 * (aucun abonnement, jamais souscrit).
 */
export function formatBillingLabel(input: BillingLabelInput): string | null {
  if (input.cancelledAt) return "Abonnement résilié";
  if (input.stripeCurrentPeriodEnd) {
    return `Prochain prélèvement le ${billingDateFormatter.format(input.stripeCurrentPeriodEnd)}`;
  }
  return null;
}

export interface SubscriptionSummaryInput {
  plan: string;
  siteCount: number;
  maxSites: number;
  stripeCustomerId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  cancelledAt: Date | null;
}

export interface SubscriptionSummary {
  planName: string;
  quotaLabel: string;
  billingLabel: string | null;
  /** Un client Stripe existe : on peut ouvrir le portail (factures, moyen de paiement, réactivation). */
  showManageButton: boolean;
  /** Palier FREE : proposer de choisir une offre plutôt que d'ouvrir le portail. */
  showPricingLink: boolean;
}

export function buildSubscriptionSummary(input: SubscriptionSummaryInput): SubscriptionSummary {
  return {
    planName: planDisplayName(input.plan),
    quotaLabel: formatQuotaLabel(input.siteCount, input.maxSites),
    billingLabel: formatBillingLabel(input),
    showManageButton: Boolean(input.stripeCustomerId),
    showPricingLink: input.plan === "FREE",
  };
}
