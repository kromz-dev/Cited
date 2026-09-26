import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listClients } from "@/app/actions/clients";
import { getMonitoredSites } from "@/app/actions/sites";
import { DashboardSites } from "@/components/DashboardSites";
import { db } from "@/lib/db";
import { maxSitesFor } from "@/lib/billing/plans";

export const metadata = {
  title: "Portefeuille | Decelio",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const [monitoredSites, clients, user] = await Promise.all([
    getMonitoredSites(),
    listClients(),
    db.user.findUnique({ where: { id: userId }, select: { plan: true } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <header className="mb-8">
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink">Portefeuille</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-2">
          Gérez vos domaines surveillés et vérifiez leur lisibilité par les IA génératives.
        </p>
      </header>

      <DashboardSites
        initialSites={monitoredSites.data || []}
        initialClients={clients.data || []}
        siteLimit={maxSitesFor(user?.plan ?? "FREE")}
      />
    </div>
  );
}
