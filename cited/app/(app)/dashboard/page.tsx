import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { Button, EmptyState, PageHeader, Panel } from "@/components/ui";
import { CoverageCell } from "@/components/geo/CoverageCell";

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
        take: 2,
        include: {
          runs: true
        }
      }
    }
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Workspace" title="Mes marques" description="Suivez la couverture réelle de vos marques dans les moteurs de réponse." action={
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">{brands.length}/3 marques</span>
          <Link href="/brands/new">
            <Button><Plus className="h-4 w-4" /> Ajouter une marque</Button>
          </Link>
        </div>
      } />

      {brands.length === 0 ? (
        <EmptyState title="Aucune marque suivie" description="Ajoutez une marque pour commencer à mesurer sa couverture dans les réponses IA." action={
          <Link 
            href="/brands/new"
            className="inline-flex rounded-md bg-cited px-4 py-2.5 font-heading text-sm font-semibold text-white hover:bg-ink"
          >
            Commencer le suivi
          </Link>
        } />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <caption className="sr-only">Marques suivies et dernières mesures</caption>
            <thead className="border-b border-line bg-paper text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Marque</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Variation</th>
                <th className="px-4 py-3 font-medium">Mini-grille</th>
                <th className="px-4 py-3 font-medium text-right">Dernière mesure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {brands.map((brand) => {
                const latestCampaign = brand.campaigns[0];
                const previousCampaign = brand.campaigns[1];
                const score = latestCampaign?.visibilityScore !== null ? latestCampaign?.visibilityScore : null;
                const variation = score !== null && score !== undefined &&
                  previousCampaign?.visibilityScore !== null &&
                  previousCampaign?.visibilityScore !== undefined
                  ? `${Math.round(score - previousCampaign.visibilityScore)} pts`
                  : "-";
                return (
                  <tr key={brand.id} className="group hover:bg-paper/70">
                    <td className="px-4 py-4">
                      <Link href={`/brands/${brand.id}`} className="block">
                        <div className="font-semibold text-ink">{brand.name}</div>
                        <div className="text-muted text-xs">{brand.domain}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {score !== null && score !== undefined ? `${Math.round(score)}/100` : "En attente"}
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {variation === "-" ? <span title="Une seule campagne terminée ne permet pas de comparer la variation." aria-label="Variation indisponible : aucune campagne précédente">—</span> : variation}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1" aria-label={latestCampaign?.runs?.length ? `${latestCampaign.runs.filter((run) => run.brandMentioned).length} citations sur ${latestCampaign.runs.length}` : "Aucune mesure"}>
                        {latestCampaign?.runs?.slice(0, 8).map((run) => <CoverageCell key={run.id} state={run.status === "DONE" ? (run.brandMentioned ? "cited" : "absent") : "pending"} label={run.promptText} />) || <span className="text-xs text-muted">—</span>}
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
        </Panel>
      )}
    </div>
  );
}
