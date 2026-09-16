import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import LaunchCampaignButton from "./LaunchCampaignButton";

export default async function BrandDetailPage(props: { params: Promise<{ brandId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  
  const params = await props.params;
  const brand = await db.brand.findUnique({
    where: { 
      id: params.brandId,
      userId: session.user.id 
    },
    include: {
      prompts: true,
      campaigns: {
        orderBy: { startedAt: "desc" },
        take: 1,
        include: { runs: true, corrections: true }
      }
    }
  });

  if (!brand) notFound();

  const latestCampaign = brand.campaigns[0];
  const runs = latestCampaign?.runs || [];
  const corrections = latestCampaign?.corrections || [];
  const isRunning = latestCampaign?.status === "RUNNING";

  const engines = ["GROQ", "GEMINI", "CHATGPT", "PERPLEXITY", "GOOGLE_AIO"];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end border-b border-muted/40 pb-4">
        <div>
          <h1 className="text-3xl font-title font-semibold">{brand.name}</h1>
          <p className="text-muted">{brand.domain}</p>
        </div>
        <div className="text-right flex items-center space-x-6">
          <LaunchCampaignButton brandId={brand.id} isRunning={isRunning} />
          <div>
            <div className="text-sm text-muted mb-1">Dernier score</div>
            <div className="text-4xl font-title font-bold text-ink">
              {latestCampaign?.visibilityScore !== null && latestCampaign?.visibilityScore !== undefined ? Math.round(latestCampaign.visibilityScore) : "-"}
            </div>
          </div>
        </div>
      </header>

      {/* Matrice de couverture */}
      <section>
        <h2 className="text-xl font-title font-semibold mb-4">Matrice de couverture</h2>
        <div className="overflow-x-auto border border-muted/40 rounded-lg">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/10 border-b border-muted/40 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Requête</th>
                {engines.map(eng => (
                  <th key={eng} className="px-4 py-3 font-medium text-center">{eng}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/40">
              {brand.prompts.map((prompt: any) => (
                <tr key={prompt.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink max-w-sm truncate" title={prompt.text}>
                    {prompt.text}
                  </td>
                  {engines.map(eng => {
                    const run = runs.find((r: any) => r.promptId === prompt.id && r.engine === eng);
                    return (
                      <td key={eng} className="px-4 py-3 text-center">
                        {run ? (
                          run.brandMentioned ? (
                            <div className="w-5 h-5 mx-auto bg-cited rounded-sm" title="Cité" />
                          ) : (
                            <div className="w-5 h-5 mx-auto border border-muted/40 bg-paper rounded-sm" title="Absent" />
                          )
                        ) : (
                          <div className="w-5 h-5 mx-auto border border-muted/40 border-dashed rounded-sm" title="En attente" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {/* Détails de l'Analyse (L'Electrochoc) */}
      <section className="pt-8">
        <h2 className="text-xl font-title font-semibold mb-4">Analyse Sémantique & Évaluation RAG</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {runs.filter((r: any) => r.status === "DONE").map((run: any) => {
            let competitors = [];
            try {
              if (run.competitorsFound) competitors = JSON.parse(run.competitorsFound);
            } catch (e) {}

            return (
              <div key={run.id} className="border border-muted/40 rounded-lg p-5 bg-paper flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-semibold text-ink">{run.engine}</div>
                  <div className={`text-xs px-2 py-1 rounded font-medium ${
                    run.sentiment === "POSITIVE" ? "bg-green-100 text-green-700" :
                    run.sentiment === "NEGATIVE" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {run.sentiment || "NEUTRAL"}
                  </div>
                </div>
                
                <div className="text-sm text-muted mb-4 line-clamp-2">
                  "{brand.prompts.find((p: any) => p.id === run.promptId)?.text}"
                </div>

                {/* Métriques RAG */}
                <div className="grid grid-cols-2 gap-2 mb-4 bg-muted/5 p-3 rounded-lg border border-muted/10">
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Hallucinations</div>
                    <div className={`text-sm font-medium ${run.hallucinations ? "text-red-500" : "text-green-500"}`}>
                      {run.hallucinations === true ? "Détectées" : run.hallucinations === false ? "Aucune" : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Précision Factuelle</div>
                    <div className="text-sm font-medium text-ink">
                      {run.claimsCorrect !== null && run.claimsGenerated ? `${Math.round((run.claimsCorrect / run.claimsGenerated) * 100)}%` : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Score de Position</div>
                    <div className="text-sm font-medium text-ink">{run.positionScore ?? "-"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted uppercase tracking-wide">Saillance (Sujet Central)</div>
                    <div className="text-sm font-medium text-ink">{run.entitySalience ?? "-"}</div>
                  </div>
                </div>

                {competitors.length > 0 && (
                  <div className="mt-auto pt-2 border-t border-muted/10">
                    <div className="text-xs text-muted mb-2">Concurrents recommandés par l'IA :</div>
                    <div className="flex flex-wrap gap-2">
                      {competitors.map((comp: string, i: number) => (
                        <span key={i} className="inline-block bg-muted/10 border border-muted/20 text-ink text-[11px] px-2 py-1 rounded-full">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {runs.filter((r: any) => r.status === "DONE").length === 0 && (
             <div className="col-span-2 text-center text-muted border border-muted/40 rounded-lg p-8">
               Aucune analyse complète récente. Lancez un audit pour voir les résultats.
             </div>
          )}
        </div>
      </section>

      {corrections.length > 0 && (
        <section className="pt-8">
          <h2 className="text-2xl font-title font-semibold mb-6">Correctifs générés</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {corrections.map((corr: any) => (
              <div key={corr.id} className="border border-muted/40 rounded-lg p-5 bg-paper flex flex-col">
                <div className="text-xs font-semibold uppercase tracking-wider text-cited mb-2">{corr.type}</div>
                <h3 className="font-title font-medium text-lg mb-4">{corr.title}</h3>
                <div className="bg-muted/5 border border-muted/20 rounded p-3 text-sm flex-1 font-mono text-muted whitespace-pre-wrap overflow-y-auto max-h-64">
                  {corr.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pt-8">
         <h2 className="text-xl font-title font-semibold mb-4">Évolution</h2>
         <div className="h-64 border border-muted/40 rounded-lg flex items-center justify-center text-muted">
            [Graphique d'évolution - Bientôt disponible]
         </div>
      </section>
    </div>
  );
}
