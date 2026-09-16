"use client";

import { useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button, Panel } from "@/components/ui";
export type { AuditData as AuditResult } from "@/components/CoverageGrid";

interface AuditFormProps {
  onAuditComplete: (data: import("./CoverageGrid").AuditData) => void;
  initialDomain?: string;
}

export function AuditForm({ onAuditComplete, initialDomain = "" }: AuditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: formData.get("domain") }),
      });
      if (!res.ok) throw new Error("Impossible de scanner ce domaine. Vérifiez l'URL.");
      onAuditComplete(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return <Panel glass className="mx-auto max-w-xl p-6 sm:p-8">
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cited">Scanner Technique</div>
        <h2 className="text-2xl">Vérifiez la lisibilité de votre site</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Saisissez l'URL de votre site pour simuler la visite de ChatGPT et Claude.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="domain">URL de votre site</label>
          <input defaultValue={initialDomain} required type="text" id="domain" name="domain" placeholder="ex : https://mon-site.com" className="w-full rounded-md border border-line bg-paper px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-cited focus:bg-white" />
        </div>
        {error && <div role="alert" className="rounded-md border border-rival/30 bg-rival-light p-3 text-sm text-rival">{error}</div>}
        <Button type="submit" disabled={loading} className="mt-4 w-full">
          {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Analyse en cours...</> : <>Lancer le scan <ArrowRight className="h-4 w-4" /></>}
        </Button>
        <p className="mt-4 text-center text-xs text-muted">Résultat en 15 secondes · Scan gratuit</p>
      </div>
    </form>
  </Panel>;
}
