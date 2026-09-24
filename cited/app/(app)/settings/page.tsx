import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SubscriptionSection } from "./SubscriptionSection";
import { PersonalDataSection } from "./PersonalDataSection";
import { WhiteLabelSection } from "./WhiteLabelSection";
import { SettingsClient } from "./SettingsClient";

/**
 * Route Paramètres : lit la session pour transmettre à `SettingsClient` les
 * quelques données réelles dont ses sections encore sommaires ont besoin
 * (e-mail du compte, nom), plutôt que d'afficher des exemples inventés.
 */
export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const user = userId
    ? await db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      })
    : null;

  return (
    <SettingsClient
      subscriptionSection={<SubscriptionSection />}
      personalDataSection={<PersonalDataSection />}
      whiteLabelSection={<WhiteLabelSection />}
      userName={user?.name ?? null}
      userEmail={user?.email ?? null}
    />
  );
}
