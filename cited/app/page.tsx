"use client";

import { useState } from "react";
import { AuditForm, type AuditResult } from "@/components/AuditForm";
import { CoverageGrid } from "@/components/CoverageGrid";
import { MarketingHeader } from "@/components/MarketingHeader";

export default function Home() {
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

  return (
    <main className="min-h-screen bg-[var(--color-paper)] flex flex-col">
      <MarketingHeader />

      {/* Contenu */}
      <div className="flex-grow py-12 px-4 sm:px-6">
        <div className="mx-auto mb-12 max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-cited)]">Visibilité dans les réponses IA</p>
          <h1 className="mb-6 font-heading text-5xl font-bold text-[var(--color-ink)] md:text-6xl">
            Comprenez où votre marque apparaît
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
            Lancez un audit public sur un échantillon de requêtes et identifiez les sujets où votre marque est citée ou absente.
          </p>
        </div>

        {!auditData ? (
          <AuditForm onAuditComplete={setAuditData} />
        ) : (
          <div>
            <div className="text-center mb-4">
              <button 
                onClick={() => setAuditData(null)} 
                className="text-sm text-[var(--color-cited)] hover:underline"
              >
                ← Refaire un test
              </button>
            </div>
            <CoverageGrid data={auditData} />
          </div>
        )}
      </div>

      <section id="fonctionnement" className="border-t border-gray-200 bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-cited)]">Un parcours en trois étapes</p>
            <h2 className="mt-2 text-3xl font-heading font-bold text-[var(--color-ink)]">Du premier signal au suivi</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["01", "Testez", "Renseignez votre marque et votre domaine pour lancer un audit public."],
              ["02", "Recevez", "Consultez le score et les requêtes échantillonnées, puis recevez le détail par email."],
              ["03", "Suivez", "Créez votre compte pour retrouver vos marques et choisir un plan de suivi adapté."],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-lg border border-gray-200 p-6">
                <span className="text-sm font-semibold text-[var(--color-cited)]">{number}</span>
                <h3 className="mt-4 text-xl font-heading font-semibold">{title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        © 2026 Cited. Tous droits réservés.
      </footer>
    </main>
  );
}
