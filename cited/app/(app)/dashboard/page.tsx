import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Mes marques | Cited",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) redirect("/login");

  const brands = await db.brand.findMany({
    where: { userId },
    include: {
      campaigns: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: {
          runs: true
        }
      }
    }
  });

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-title font-semibold">Mes marques</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{brands.length} marque{brands.length > 1 ? "s" : ""} suivie{brands.length > 1 ? "s" : ""}</span>
          <Link 
            href="/brands/new"
            className="flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded text-sm font-medium hover:bg-ink/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une marque
          </Link>
        </div>
      </header>

      {brands.length === 0 ? (
        <div className="border border-muted/40 rounded-lg p-12 text-center">
          <p className="text-muted mb-4">Vous ne suivez aucune marque pour le moment.</p>
          <Link 
            href="/brands/new"
            className="inline-flex items-center gap-2 bg-cited text-paper px-4 py-2 rounded text-sm font-medium hover:bg-cited/90 transition-colors"
          >
            Commencer le suivi
          </Link>
        </div>
      ) : (
        <div className="border border-muted/40 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Marques suivies et dernières mesures</caption>
            <thead className="bg-muted/10 border-b border-muted/40 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Marque</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Variation</th>
                <th className="px-4 py-3 font-medium">Mini-grille</th>
                <th className="px-4 py-3 font-medium text-right">Dernière mesure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/40">
              {brands.map((brand) => {
                const latestCampaign = brand.campaigns[0];
                const score = latestCampaign?.visibilityScore !== null ? latestCampaign?.visibilityScore : null;
                // mock variation for now
                const variation = score !== null ? "+2%" : "-";
                return (
                  <tr key={brand.id} className="hover:bg-muted/5 transition-colors group">
                    <td className="px-4 py-4">
                      <Link href={`/brands/${brand.id}`} className="block">
                        <div className="font-semibold text-ink">{brand.name}</div>
                        <div className="text-muted text-xs">{brand.domain}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {score !== null && score !== undefined ? `${Math.round(score)}/100` : "En attente"}
                    </td>
                    <td className="px-4 py-4 text-signal">
                      {variation}
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid grid-cols-4 gap-[2px] w-[60px]">
                        {/* Mock 12-cells mini grid */}
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 ${i % 3 === 0 ? 'bg-cited' : 'bg-paper border border-muted/40'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-muted">
                      {latestCampaign?.startedAt ? new Date(latestCampaign.startedAt).toLocaleDateString("fr-FR") : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
