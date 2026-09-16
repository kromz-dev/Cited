import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, ServerCrash } from "lucide-react";
import { redirect } from "next/navigation";
import { Button, EmptyState, PageHeader, Panel, Badge } from "@/components/ui";

export const metadata = {
  title: "Mes sites | Cited",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) redirect("/login");

  const sites = await db.site.findMany({
    where: { userId },
    include: {
      pages: {
        include: {
          botScans: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Workspace" title="Mes sites" description="Vérifiez que vos pages sont lisibles par les robots IA et gérez vos correctifs de pré-rendu." action={
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">{sites.length}/3 sites</span>
          <Link href="/sites/new">
            <Button><Plus className="h-4 w-4" /> Ajouter un site</Button>
          </Link>
        </div>
      } />

      {sites.length === 0 ? (
        <EmptyState title="Aucun site suivi" description="Ajoutez votre domaine pour scanner le rendu JavaScript reçu par ChatGPT, Claude et Perplexity." action={
          <Link 
            href="/sites/new"
            className="inline-flex rounded-md bg-cited px-4 py-2.5 font-heading text-sm font-semibold text-white hover:bg-ink"
          >
            Scanner mon site
          </Link>
        } />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <caption className="sr-only">Sites suivis et état du rendu</caption>
            <thead className="border-b border-line bg-paper text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">État du Correctif</th>
                <th className="px-4 py-3 font-medium">Pages Saines</th>
                <th className="px-4 py-3 font-medium">Pages Bloquées / Vides</th>
                <th className="px-4 py-3 font-medium text-right">Dernier scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sites.map((site) => {
                const latestBotScan = site.pages[0]?.botScans[0];
                // Mock data pour la maquette V3
                const isFixActive = Math.random() > 0.5; // Temporaire pour la démo UI
                const totalPages = 15;
                const blockedPages = isFixActive ? 0 : 12;
                const healthyPages = totalPages - blockedPages;

                return (
                  <tr key={site.id} className="group hover:bg-paper/70">
                    <td className="px-4 py-4">
                      <Link href={`/sites/${site.id}`} className="block">
                        <div className="font-semibold text-ink">{site.name}</div>
                        <div className="text-muted text-xs">{site.domain}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {isFixActive ? (
                        <Badge tone="cited">Pré-rendu Actif</Badge>
                      ) : (
                        <Badge tone="default">Non configuré</Badge>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-cited">{healthyPages}</span>
                        <span className="text-muted text-xs">/ {totalPages}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {blockedPages > 0 ? (
                        <div className="flex items-center gap-2 text-signal">
                          <ServerCrash className="h-4 w-4" />
                          <span className="font-semibold">{blockedPages}</span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-muted">
                      {latestBotScan?.createdAt ? new Date(latestBotScan.createdAt).toLocaleDateString("fr-FR") : "Aujourd'hui"}
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
