/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { CoverageMatrix } from "@/components/geo/CoverageMatrix";
import { Badge, Panel, PageHeader, Button } from "@/components/ui";
import { Code, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

export default async function SiteDetailPage(props: { params: Promise<{ siteId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  
  const params = await props.params;
  const site = await db.site.findUnique({
    where: { 
      id: params.siteId,
      userId: session.user.id 
    }
  });

  if (!site) notFound();

  // MOCK DATA V3 : Les robots IA qui scannent le web
  const aiBots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"];
  
  // MOCK DATA V3 : Les pages testées sur ce site
  const pagesScanned = ["/", "/tarifs", "/blog", "/a-propos", "/contact"];

  const isFixInstalled = false; // Mock

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <PageHeader 
        eyebrow={`Site · ${site.domain}`} 
        title={site.name} 
        description="Diagnostic du rendu JavaScript reçu par les robots d'Intelligence Artificielle." 
        action={
          <div className="flex items-center gap-5">
            <Button>
              <Activity className="w-4 h-4" /> Relancer le scan
            </Button>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Statut</div>
              <div className="font-heading text-xl text-signal flex items-center gap-2">
                Vulnérable
              </div>
            </div>
          </div>
        } 
      />

      {/* Grille de Rendu (Le Scanner) */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold">Diagnostic de lisibilité</h2>
            <p className="text-sm text-muted mt-1">Ce que les robots IA voient réellement quand ils explorent vos pages.</p>
          </div>
          <Badge tone={isFixInstalled ? "cited" : "signal"}>{isFixInstalled ? "Sécurisé" : "Contenu invisible"}</Badge>
        </div>
        
        {/* On réutilise le composant CoverageMatrix avec nos nouvelles données Pages vs Bots */}
        <CoverageMatrix 
          columns={aiBots} 
          rows={pagesScanned.map((pagePath) => ({ 
            label: pagePath, 
            cells: aiBots.map(() => { 
              // Simulation : Google-Extended lit bien le JS, les autres non
              const isGoogle = Math.random() > 0.5; // Randomisation pour la maquette
              return isGoogle ? "cited" : "absent"; 
            }) 
          }))} 
        />
        
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-cited bg-cited-light"></div>
            <span>Page lue (Rendu OK)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-line bg-paper"></div>
            <span>Page vide (JS non exécuté)</span>
          </div>
        </div>
      </section>

      {/* Installation du Correctif Géré */}
      <section className="pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-semibold">Installer le Correctif Géré</h2>
          {isFixInstalled ? (
            <Badge tone="cited"><CheckCircle2 className="w-3 h-3 mr-1" /> Actif</Badge>
          ) : (
            <Badge tone="default">À configurer</Badge>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Option 1: Middleware */}
          <div className="border border-cited/30 bg-cited/5 rounded-lg p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cited text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">
              Recommandé (Next.js)
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-cited mb-4 shadow-sm">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-medium text-lg mb-2 text-ink">Middleware Edge</h3>
            <p className="text-sm text-muted mb-6 flex-1">
              Idéal si votre site utilise Next.js. Intercepte les requêtes des bots et sert le HTML pré-rendu par Cited.
            </p>
            <Button className="w-full bg-white text-ink hover:bg-paper border border-line">
              Voir le code d'installation
            </Button>
          </div>

          {/* Option 2: Cloudflare Worker */}
          <div className="border border-line bg-paper rounded-lg p-6 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center text-ink mb-4 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-medium text-lg mb-2 text-ink">Cloudflare Worker</h3>
            <p className="text-sm text-muted mb-6 flex-1">
              Pour les sites hébergés derrière Cloudflare (Lovable, Bubble). S'installe en quelques clics sans toucher au code.
            </p>
            <Button className="w-full bg-white text-ink hover:bg-paper border border-line">
              Générer le Worker
            </Button>
          </div>

          {/* Option 3: Reverse Proxy / DNS */}
          <div className="border border-line bg-paper rounded-lg p-6 flex flex-col">
            <div className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center text-ink mb-4 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-medium text-lg mb-2 text-ink">Reverse Proxy</h3>
            <p className="text-sm text-muted mb-6 flex-1">
              Configuration Nginx ou Apache pour rediriger conditionnellement le trafic des bots vers l'infrastructure Cited.
            </p>
            <Button className="w-full bg-white text-ink hover:bg-paper border border-line">
              Afficher la config
            </Button>
          </div>
        </div>
      </section>

      {/* Veille & Alertes */}
      <section className="pt-8">
         <h2 className="text-xl font-heading font-semibold mb-4">Veille & Historique</h2>
         <Panel className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-heading text-lg font-semibold text-ink">Surveillance quotidienne</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                  Dès que le correctif est installé, Cited scanne vos pages chaque jour pour détecter toute modification du <code className="text-xs bg-paper px-1 py-0.5 rounded border border-line">robots.txt</code> ou un blocage pare-feu.
                </p>
              </div>
              <div className="text-center p-4 bg-paper rounded-lg border border-line">
                <div className="text-2xl font-heading font-bold text-ink">0</div>
                <div className="text-xs text-muted uppercase tracking-wider">Jours de veille</div>
              </div>
            </div>
         </Panel>
      </section>
    </div>
  );
}
