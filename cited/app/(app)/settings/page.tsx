import { SubscriptionSection } from "./SubscriptionSection";
import { SettingsClient } from "./SettingsClient";

export default function SettingsPage() {
  return <SettingsClient subscriptionSection={<SubscriptionSection />} />;
}
