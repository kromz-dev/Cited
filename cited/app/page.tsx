"use client";

import { useState } from "react";
import { AuditForm } from "@/components/AuditForm";
import { CoverageGrid } from "@/components/CoverageGrid";

export default function Home() {
  const [auditData, setAuditData] = useState<any>(null);

  return (
    <main className="min-h-screen bg-[var(--color-paper)] flex flex-col">
      {/* Header simple */}
      <header className="p-6 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="font-heading font-bold text-2xl tracking-tight text-[var(--color-ink)]">
            Cited<span className="text-[var(--color-cited)]">.</span>
          </div>
          <nav className="text-sm font-medium flex gap-4">
            <a href="/pricing" className="text-gray-600 hover:text-[var(--color-cited)] transition-colors">Tarifs</a>
            <a href="/dashboard" className="text-gray-600 hover:text-[var(--color-cited)] transition-colors">Connexion</a>
          </nav>
        </div>
      </header>

      {/* Contenu */}
      <div className="flex-grow py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-[var(--color-ink)]">
            Êtes-vous cité par l'IA ?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Vos futurs clients demandent des recommandations à ChatGPT et Gemini. 
            Découvrez si votre marque apparaît dans leurs réponses.
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

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        © 2026 Cited. Tous droits réservés.
      </footer>
    </main>
  );
}
