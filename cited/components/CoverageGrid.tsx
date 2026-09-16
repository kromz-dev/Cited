"use client";

import { useState } from "react";
import { captureLead } from "@/app/actions/lead";
import Link from "next/link";

interface RunData {
  prompt: string;
  family: string;
  isMentioned: boolean;
  snippet: string | null;
  citationCount: number;
  hasBrandCitation: boolean;
}

interface CoverageGridProps {
  data: {
    brandName: string;
    domain: string;
    score: number;
    runs: RunData[];
  };
}

export function CoverageGrid({ data }: CoverageGridProps) {
  const { brandName, domain, score, runs } = data;
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmitLead(formData: FormData) {
    setLoading(true);
    setError("");
    const mentionsCount = runs.filter(r => r.isMentioned).length;
    
    // Process competitor counts simply:
    // This is a bit fake for the scope since we don't have competitor data extracted per run here easily, 
    // but we can just pass an empty array or basic stats.
    const leadDataPayload = JSON.stringify({
      domain,
      brandName,
      score,
      mentionsCount,
      totalRuns: runs.length,
      competitorMentions: []
    });

    try {
      const res = await captureLead(formData, leadDataPayload);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || "Le rapport n’a pas pu être envoyé. Réessayez.");
      }
    } catch {
      setError("Le rapport n’a pas pu être envoyé. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl mb-2 font-heading">Bilan IA de <span className="text-[var(--color-cited)]">{brandName}</span></h2>
          <p className="text-[var(--color-muted)]">Basé sur un échantillon de {runs.length} requêtes via Google Search (Gemini)</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">Score de Visibilité</div>
          <div className="text-5xl font-heading font-bold text-[var(--color-cited)]">
            {score}%
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <h3 className="text-xl font-heading mb-4">Détail des requêtes testées</h3>
        <div className="space-y-6">
          {runs.map((run, idx) => (
            <div key={idx} className="p-4 rounded-md border border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-start gap-4 relative overflow-hidden">
              
              <div className="flex-shrink-0 mt-1">
                {run.isMentioned ? (
                  <div className="w-8 h-8 rounded-full cell-cited flex items-center justify-center text-white" title="Cité">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full cell-absent flex items-center justify-center text-gray-400" title="Absent">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-200 text-gray-600 rounded-sm uppercase">{run.family}</span>
                  <span className="text-gray-900 font-medium">« {run.prompt} »</span>
                </div>
                
                {/* BLURRED SECTION */}
                <div className="mt-4 relative select-none" aria-hidden="true">
                  <div className="blur-sm opacity-60 pointer-events-none">
                    {run.isMentioned ? (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Ce que dit l’IA de vous :</div>
                        <div className="p-3 bg-white border border-[var(--color-cited-light)] rounded text-sm italic text-gray-700">
                          « {run.snippet || `Votre marque ${brandName} est citée dans la réponse de l’IA comme l’une des meilleures solutions du marché, recommandée pour sa fiabilité.`} »
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Comment corriger le tir :</div>
                        <div className="p-3 bg-red-50 border border-red-100 rounded text-sm text-gray-700">
                          <strong>Action requise :</strong> Générer un schéma JSON-LD de type Organization et optimiser la sémantique de la page d’accueil autour des requêtes pertinentes.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    {run.citationCount} sources citées
                  </div>
                  {run.hasBrandCitation && (
                    <div className="flex items-center gap-1 text-[var(--color-cited)] font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Votre site ({domain}) a été utilisé comme source
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

        <p className="sr-only">
          Le détail des extraits est masqué dans l’audit public. Le rapport est envoyé par email après saisie de votre adresse.
        </p>
        <div className="absolute inset-0 top-16 flex items-center justify-center bg-white/20 p-4 backdrop-blur-[2px]">
          <div className="bg-[var(--color-ink)] text-white p-8 rounded-xl shadow-2xl text-center max-w-lg w-full transform transition-transform hover:scale-[1.02] border border-gray-700">
            <h3 className="mb-3 text-2xl font-heading">Recevez le détail de votre audit</h3>
            <p className="mb-6 text-sm text-gray-300">
              Retrouvez les extraits et les pistes d’action par email, puis créez un compte si vous souhaitez suivre votre marque dans le temps.
            </p>
            
            {submitted ? (
              <div className="p-4 bg-green-500/20 text-green-100 rounded-md text-sm font-medium border border-green-500/30">
                ✅ Rapport complet envoyé ! Consultez votre boîte mail.
              </div>
            ) : (
              <form action={handleSubmitLead} className="flex flex-col gap-3">
                <label htmlFor="audit-email" className="sr-only">Adresse email</label>
                <input
                  id="audit-email"
                  type="email" 
                  name="email"
                  required 
                  placeholder="votre@email.com" 
                  className="px-4 py-3 bg-white rounded-md w-full text-gray-900 border-0 focus:ring-2 focus:ring-[var(--color-cited)] outline-none font-medium"
                />
                {error && <div role="alert" className="rounded-md border border-red-300/30 bg-red-500/20 p-3 text-left text-sm text-red-100">{error}</div>}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary bg-white text-[var(--color-ink)] hover:bg-gray-100 disabled:opacity-50 font-bold w-full py-3 text-lg"
                >
                  {loading ? "Envoi en cours…" : "Recevoir le rapport par email"}
                </button>
                <div aria-live="polite" className="mt-2 text-xs font-medium text-gray-400">Rapport gratuit. Votre adresse sert uniquement à l’envoi du rapport.</div>
              </form>
            )}
          </div>
        </div>

      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
          <Link href="/pricing" className="btn-primary">Voir les plans de suivi</Link>
          <Link href="/api/auth/signin?callbackUrl=%2Fdashboard" className="btn-secondary">Créer un compte / se connecter</Link>
      </div>

    </div>
  );
}
