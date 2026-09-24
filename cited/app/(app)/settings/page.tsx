import { SubscriptionSection } from "./SubscriptionSection";
import { PersonalDataSection } from "./PersonalDataSection";
import { SettingsClient } from "./SettingsClient";

export default function SettingsPage() {
  return (
    <SettingsClient
      subscriptionSection={<SubscriptionSection />}
      personalDataSection={<PersonalDataSection />}
    />
  );
}
