import { auth } from "@/auth";
import { Button, Badge } from "@/components/ui";
import { Card } from "@/components/ui/card";
import { Plus, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = {
  title: "Dashboard | Cited",
};

export default async function DashboardPage() {
  const session = await auth();
  
  // Dans un vrai cas, on fetch les sites depuis la BD :
  const sites = await db.site.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink">Vue d'ensemble</h1>
          <p className="text-muted mt-1">Gérez la lisibilité IA de vos domaines.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un site
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-line rounded-xl bg-white">
          <GlobeIcon className="mx-auto h-12 w-12 text-muted/50 mb-4" />
          <h2 className="text-xl font-semibold text-ink">Aucun site surveillé</h2>
          <p className="text-muted mt-2 max-w-md mx-auto mb-6">
            Ajoutez votre premier domaine pour vérifier si les robots IA peuvent le lire correctement.
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Scanner mon premier site
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-ink text-lg truncate" title={site.domain}>
                    {site.domain}
                  </h3>
                  <p className="text-xs text-muted mt-1">Ajouté le {new Date(site.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                {/* On simule le statut. Dans la vraie DB, il faudrait regarder le dernier ScanResult */}
                <Badge tone="signal" className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Vulnérable
                </Badge>
              </div>
              
              <div className="mt-auto pt-6">
                <Link 
                  href={`/dashboard/sites/${site.id}`}
                  className="flex items-center justify-between w-full text-sm font-medium text-cited hover:text-cited-light transition-colors"
                >
                  Voir le diagnostic
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant icône simple pour l'empty state
function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}
