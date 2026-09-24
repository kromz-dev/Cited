import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMonitoredSites } from "@/app/actions/sites";
import { DashboardSites } from "@/components/DashboardSites";

export const metadata = {
  title: "Portefeuille | Cited",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const monitoredSites = await getMonitoredSites();

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <header className="mb-8">
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink">Portefeuille</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-2">
          Gérez vos domaines surveillés et vérifiez leur lisibilité par les IA génératives.
        </p>
      </header>

      <DashboardSites initialSites={monitoredSites.data || []} />
    </div>
  );
}
