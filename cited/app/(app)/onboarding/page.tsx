import { auth } from "@/auth";
import { db } from "@/lib/db";
import { maxSitesFor } from "@/lib/billing/plans";
import { shouldSkipPlanStep } from "./onboarding-plan";
import { OnboardingPlanStep } from "./OnboardingPlanStep";
import { OnboardingClient } from "./OnboardingClient";

/**
 * Route Onboarding : lit la session pour savoir si l'étape de choix du plan
 * doit s'afficher (EF-063, T045). Un compte sans abonnement actif voit
 * `OnboardingPlanStep` et ne peut pas dépasser le scan gratuit sans passer
 * par Stripe Checkout ; un compte déjà abonné va directement aux étapes
 * domaines/alertes existantes.
 */
export default async function OnboardingPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const user = userId
    ? await db.user.findUnique({
        where: { id: userId },
        select: { plan: true, stripeCurrentPeriodEnd: true, email: true },
      })
    : null;

  const skipPlanStep = user
    ? shouldSkipPlanStep({ plan: user.plan, stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd })
    : false;

  if (!skipPlanStep) {
    return <OnboardingPlanStep />;
  }

  return <OnboardingClient userEmail={user?.email ?? null} maxSites={maxSitesFor(user?.plan ?? "FREE")} />;
}
