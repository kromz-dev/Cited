"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { captureLead } from "@/app/actions/lead";
import { Badge, Panel, ResultMark } from "@/components/ui";

interface RunData { prompt: string; family: string; isMentioned: boolean; snippet: string | null; citationCount: number; hasBrandCitation: boolean; }
export interface AuditData { brandName: string; domain: string; score: number; runs: RunData[]; }
interface CoverageGridProps { data: AuditData; }

export function CoverageGrid({ data }: CoverageGridProps) {
  const { brandName, domain, score, runs } = data;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  async function handleSubmitLead(formData: FormData) {
    setLoading(true);
    const result = await captureLead(formData, JSON.stringify({ domain, brandName, score, mentionsCount: runs.filter((run) => run.isMentioned).length, totalRuns: runs.length, competitorMentions: [] }));
    setSubmitted(result.success);
    setLoading(false);
  }
  return <Panel className="mx-auto mt-8 max-w-4xl overflow-hidden">
    <div className="flex flex-col gap-5 border-b border-line p-6 sm:flex-row sm:items-end sm:justify-between">
      <div><Badge tone="cited">Diagnostic terminé</Badge><h2 className="mt-3 text-3xl">Bilan IA de <span className="text-cited">{brandName}</span></h2><p className="mt-2 text-sm text-muted">{runs.length} requêtes mesurées · {domain}</p></div>
      <div className="sm:text-right"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Couverture</div><div className="font-heading text-5xl text-cited">{score}<span className="text-2xl">%</span></div></div>
    </div>
    <div className="p-6"><h3 className="mb-4 text-xl">Lecture par requête</h3><div className="space-y-3">{runs.map((run, index) => <div key={`${run.prompt}-${index}`} className="flex gap-3 rounded-md border border-line bg-paper p-4"><ResultMark mentioned={run.isMentioned} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge tone={run.isMentioned ? "cited" : "default"}>{run.family}</Badge><span className="text-sm font-medium text-ink">{run.prompt}</span></div><p className="mt-3 text-sm leading-6 text-muted">{run.snippet || (run.isMentioned ? "Votre marque est présente dans cette réponse." : "Aucune mention détectée sur cette requête.")}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-muted"><span>{run.citationCount} sources citées</span>{run.hasBrandCitation && <span className="inline-flex items-center gap-1 text-cited"><ExternalLink className="h-3 w-3" /> Votre site utilisé comme source</span>}</div></div></div>)}</div></div>
    <div className="border-t border-line bg-ink p-6 text-paper"><h3 className="text-xl">Recevez le plan d’action</h3><p className="mt-2 max-w-lg text-sm leading-6 text-paper/70">Les recommandations détaillées et les correctifs prioritaires sont envoyés par email.</p>{submitted ? <div className="mt-5 rounded-md border border-cited/50 bg-cited/20 p-4 text-sm text-cited-light">Rapport complet envoyé. Consultez votre boîte mail.</div> : <form action={handleSubmitLead} className="mt-5 flex max-w-lg flex-col gap-3 sm:flex-row"><input aria-label="Adresse email" type="email" name="email" required placeholder="votre@email.com" className="min-w-0 flex-1 rounded-md border border-white/20 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-signal" /><button type="submit" disabled={loading} className="rounded-md bg-paper px-4 py-3 font-heading text-sm font-semibold text-ink hover:bg-cited-light disabled:opacity-50">{loading ? "Envoi..." : "Recevoir mon plan"}</button></form>}</div>
  </Panel>;
}
