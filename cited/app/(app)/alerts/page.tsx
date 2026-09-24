import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listRecentAlerts } from "@/lib/alerting/sendAlert";
import { AlertsJournal } from "./AlertsJournal";

export const metadata = {
  title: "Alertes | Cited",
};

export default async function AlertsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const rows = await listRecentAlerts(userId);

  return (
    <AlertsJournal
      alerts={rows.map((row) => ({
        id: row.id,
        siteId: row.site.id,
        domain: row.site.url.replace(/^https?:\/\//, ""),
        type: row.type === "RESOLUTION" ? "RESOLUTION" : "REGRESSION",
        cause: row.cause,
        sentAt: row.sentAt.toISOString(),
      }))}
    />
  );
}
