"use client";

import { useState } from "react";

export interface AuditResult {
  brandName: string;
  domain: string;
  score: number;
  runs: Array<{
    prompt: string;
    family: string;
    isMentioned: boolean;
    snippet: string | null;
    citationCount: number;
    hasBrandCitation: boolean;
  }>;
}

interface AuditFormProps {
  onAuditComplete: (data: AuditResult) => void;
  initialDomain?: string;
  initialBrandName?: string;
}

export function AuditForm({ onAuditComplete, initialDomain = "", initialBrandName = "" }: AuditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      domain: formData.get("domain"),
      brandName: formData.get("brandName"),
    };

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("L’audit n’a pas pu être lancé. Vérifiez le domaine puis réessayez.");
      }

      const data = (await res.json()) as AuditResult;
      onAuditComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="mx-auto max-w-xl rounded-lg border border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="mb-2 text-2xl">Testez votre marque</h2>
      <p className="mb-6 text-sm text-gray-600">Un audit public pour obtenir un premier repère, sans carte bancaire.</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="brandName">Nom de la marque</label>
          <input autoComplete="organization" defaultValue={initialBrandName} required type="text" id="brandName" name="brandName" placeholder="ex: Acme" className="w-full rounded-md border border-gray-200 bg-gray-50 p-3 focus:border-[var(--color-cited)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-cited)]/20" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="domain">Domaine</label>
          <input autoComplete="url" defaultValue={initialDomain} required type="text" id="domain" name="domain" placeholder="ex: acme.com" className="w-full rounded-md border border-gray-200 bg-gray-50 p-3 focus:border-[var(--color-cited)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-cited)]/20" />
        </div>



        {error && <div role="alert" aria-live="assertive" className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-4 flex justify-center items-center">
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Audit en cours…
            </>
          ) : "Lancer le diagnostic gratuit"}
        </button>
        <p className="mt-4 text-center text-xs text-[var(--color-muted)]">Aucune carte bancaire requise. La durée dépend du traitement des requêtes.</p>
      </div>
    </form>
  );
}
