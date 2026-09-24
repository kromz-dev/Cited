import { auth } from "@/auth";
import { db } from "@/lib/db";
import { whiteLabelFor } from "@/lib/billing/plans";
import { SubscriptionSection } from "./SubscriptionSection";
import { PersonalDataSection } from "./PersonalDataSection";
import { SettingsClient } from "./SettingsClient";

/**
 * Route Paramètres : lit la session pour transmettre à `SettingsClient` les
 * quelques données réelles dont ses sections encore sommaires ont besoin
 * (e-mail du compte, nom, accès marque blanche du palier), plutôt que
 * d'afficher des exemples inventés.
 */
export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const user = userId
    ? await db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, plan: true },
      })
    : null;

  const whiteLabelAccess = user ? whiteLabelFor(user.plan) : false;

  return (
    <SettingsClient
      subscriptionSection={<SubscriptionSection />}
      personalDataSection={<PersonalDataSection />}
      userName={user?.name ?? null}
      userEmail={user?.email ?? null}
      whiteLabelAccess={whiteLabelAccess}
    />
  );
}
