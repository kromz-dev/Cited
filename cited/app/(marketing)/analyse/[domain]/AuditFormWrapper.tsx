"use client";

import { useState } from "react";
import Link from "next/link";
import { AuditForm } from "@/components/AuditForm";
import type { AuditResult } from "@/components/AuditForm";
import { CoverageGrid } from "@/components/CoverageGrid";
import { buttonVariants } from "@/components/ui/button";

export function AuditFormWrapper({ initialDomain }: { initialDomain: string }) {
  const [auditData, setAuditData] = useState<AuditResult | null>(null);

  return (
    <>
      {!auditData ? (
        <AuditForm onAuditComplete={setAuditData} initialDomain={initialDomain} />
      ) : (
        <div>
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={() => setAuditData(null)}
              className="text-sm font-medium text-cobalt hover:underline"
            >
              Refaire un test
            </button>
          </div>
          <CoverageGrid data={auditData} />

          <div className="mt-12 text-center">
            <h3 className="mb-4 text-xl font-semibold text-ink">Passez à la vitesse supérieure</h3>
            <p className="mb-6 text-ink-2">Obtenez les correctifs IA exacts pour améliorer ces scores.</p>
            <Link href="/pricing" className={buttonVariants({ size: "lg" })}>
              Voir nos offres
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
