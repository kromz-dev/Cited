"use client";

import { useState } from "react";
import { captureLead } from "@/app/actions/lead";
import { Badge, Panel } from "@/components/ui";
import { CoverageMatrix } from "@/components/geo/CoverageMatrix";
import { ShieldCheck, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DEFAULT_SCAN_BOTS } from "@/lib/scanner/agents";

export interface RunData {
  agent: string;
  status: string;
  wordCount: number;
  hasAppRoot: boolean;
  httpStatus: number;
  durationMs: number;
}

export interface PageScanResult {
  path: string;
  runs: RunData[];
}

export interface AuditData {
  domain: string;
  score: number;
  pages: PageScanResult[];
}

interface CoverageGridProps {
  data: AuditData;
}

export function CoverageGrid({ data }: CoverageGridProps) {
  const { domain, score, pages } = data;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadError, setLeadError] = useState("");
  
  async function handleSubmitLead(formData: FormData) {
    setLoading(true);
    setLeadError("");
    const result = await captureLead(formData, JSON.stringify({ domain, score, type: "v3-technical-scan" }));
    setSubmitted(result.success);
    if (!result.success) setLeadError("L'envoi par email a échoué, vous pouvez réessayer.");
    setLoading(false);
  }

  // Obtenir la liste des bots (sans le Browser de base)
  const aiBots = DEFAULT_SCAN_BOTS.filter(b => b !== "Browser");
  
  // Convertir les résultats de l'API pour le CoverageMatrix
  const matrixRows = pages.map((page) => {
    return {
      label: page.path,
      cells: aiBots.map(botName => {
        const run = page.runs.find(r => r.agent === botName);
        if (!run) return "absent";
        return run.status === "ACCESSIBLE" ? "cited" : "absent";
      })
    };
  });

  const isVulnerable = score < 100;

  return (
    <Panel className="mx-auto mt-8 max-w-4xl overflow-hidden">
      <div className="flex flex-col gap-5 border-b border-line p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="cited">Scan Terminé</Badge>
          <h2 className="mt-3 text-3xl">
            Diagnostic de <span className="text-cited">{domain}</span>
          </h2>
          <p className="mt-2 text-sm text-muted">
            Ce que les robots IA voient réellement sur votre site.
          </p>
        </div>
        <div className="sm:text-right">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Statut</div>
          <div className={`font-heading text-3xl flex items-center gap-2 ${isVulnerable ? 'text-signal' : 'text-cited'}`}>
            {isVulnerable ? "Vulnérable" : "Sécurisé"}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="mb-4 text-xl">Grille de lisibilité IA</h3>
        <CoverageMatrix 
            columns={aiBots} 
            rows={matrixRows} 
          />
          
          {isVulnerable ? (
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 bg-signal/10 border border-signal/20 rounded-lg">
              <div>
                 <h4 className="font-semibold text-signal flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Correctif recommandé</h4>
                 <p className="text-sm text-ink mt-1">Vos pages apparaissent vides ou inaccessibles pour certains bots IA. Installez le Middleware Edge Cited pour servir une version pré-rendue.</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 bg-cited/10 border border-cited/20 rounded-lg">
              <div>
                 <h4 className="font-semibold text-cited flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Site Optimisé</h4>
                 <p className="text-sm text-ink mt-1">Félicitations, votre site est parfaitement lisible par tous les robots IA majeurs.</p>
              </div>
            </div>
          )}
      </div>

      <div className="border-t border-line bg-ink p-6 text-paper">
        <h3 className="text-xl flex items-center gap-2"><Mail className="w-5 h-5"/> Recevez le guide d'installation</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 text-paper/70">Nous vous envoyons le code exact à copier-coller (Next.js, Cloudflare Worker ou Nginx) pour corriger ce problème.</p>
        {leadError && <div role="alert" className="mt-4 rounded-md border border-signal/50 bg-signal/10 p-3 text-sm text-signal-light">{leadError}</div>}
        {submitted ? (
          <div className="mt-5 rounded-md border border-cited/50 bg-cited/20 p-4 text-sm text-cited-light">Guide envoyé. Consultez votre boîte mail.</div>
        ) : (
          <form action={handleSubmitLead} className="mt-5 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input aria-label="Adresse email" type="email" name="email" required placeholder="votre@email.com" className="min-w-0 flex-1 rounded-md border border-white/20 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-signal" />
            <button type="submit" disabled={loading} className="min-h-11 rounded-md bg-paper px-4 py-3 font-heading text-sm font-semibold text-ink hover:bg-cited-light disabled:opacity-50">
              {loading ? "Envoi..." : "Recevoir le correctif"}
            </button>
          </form>
        )}
      </div>
    </Panel>
  );
}
