"use client";

import { useState } from "react";
import { AuditForm } from "@/components/AuditForm";
import type { AuditResult } from "@/components/AuditForm";
import { CoverageGrid } from "@/components/CoverageGrid";
import Link from "next/link";

export function AuditFormWrapper({ initialDomain, initialBrandName }: { initialDomain: string, initialBrandName: string }) {
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

  return (
    <>
      {!auditData ? (
        <AuditForm 
          onAuditComplete={setAuditData} 
          initialDomain={initialDomain} 
          initialBrandName={initialBrandName} 
        />
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
          
          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold mb-4">Passez à la vitesse supérieure</h3>
            <p className="text-gray-600 mb-6">Obtenez les correctifs IA exacts pour améliorer ces scores.</p>
            <Link href="/pricing" className="btn-primary">
              Voir nos offres
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
