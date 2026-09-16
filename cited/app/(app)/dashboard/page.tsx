import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
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
      <PageHeader 
        title="Portefeuille" 
        description="Gérez vos domaines surveillés et vérifiez leur lisibilité par les IA génératives." 
      />

      <DashboardSites initialSites={monitoredSites.data || []} />
    </div>
  );
}
