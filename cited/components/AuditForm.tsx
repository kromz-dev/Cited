"use client";

import { useState } from "react";

interface AuditFormProps {
  onAuditComplete: (data: any) => void;
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
        throw new Error("Erreur lors de l'audit. Vérifiez que la clé API est valide.");
      }

      const data = await res.json();
      onAuditComplete(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-xl mx-auto">
      <h2 className="text-2xl mb-6">Testez votre marque</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="brandName">Nom de la marque</label>
          <input defaultValue={initialBrandName} required type="text" id="brandName" name="brandName" placeholder="ex: Acme" className="w-full p-3 border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--color-cited)]" />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1" htmlFor="domain">Domaine</label>
          <input defaultValue={initialDomain} required type="text" id="domain" name="domain" placeholder="ex: acme.com" className="w-full p-3 border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--color-cited)]" />
        </div>



        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-4 flex justify-center items-center">
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyse en cours...
            </>
          ) : "Lancer le diagnostic gratuit"}
        </button>
        <p className="text-xs text-center text-[var(--color-muted)] mt-4">Aucune carte bancaire requise. Résultat en 30 secondes.</p>
      </div>
    </form>
  );
}
