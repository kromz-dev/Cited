"use client";

import { useState } from "react";
import { BarChart3, Check, ShieldCheck } from "lucide-react";
import { AuditForm } from "@/components/AuditForm";
import { CoverageGrid } from "@/components/CoverageGrid";
import type { AuditData } from "@/components/CoverageGrid";
import Link from "next/link";
import { Badge, Panel } from "@/components/ui";

export default function Home() {
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  return <main className="min-h-screen bg-paper text-ink">
    <header className="border-b border-line bg-paper/90 px-6 py-5 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-heading text-xl font-semibold tracking-tight">Cited<span className="text-cited">.</span></Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-muted"><Link href="/pricing" className="hover:text-ink">Tarifs</Link><Link href="/dashboard" className="hover:text-ink">Connexion</Link></nav>
      </div>
    </header>
    <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:pt-28">
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-cited-light/70 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div><Badge tone="cited">GEO / visibilité des marques</Badge><h1 className="mt-6 max-w-3xl text-5xl leading-[1.03] sm:text-7xl">La couverture de votre marque, <span className="text-cited">réponse par réponse.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted">Cited mesure si les moteurs de réponse recommandent votre marque — et transforme chaque manque en action claire.</p><div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-muted"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cited" /> Mesure transparente</span><span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4 text-cited" /> Données exploitables</span></div></div>
        {!auditData ? <AuditForm onAuditComplete={setAuditData} /> : <CoverageGrid data={auditData} />}
      </div>
    </section>
    <section className="border-y border-line bg-white px-6 py-12"><div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{["Requêtes métier", "Moteurs de réponse", "Signal de citation"].map((item, index) => <Panel key={item} className="p-5"><div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-cited-light text-cited"><Check className="h-4 w-4" /></div><h2 className="text-lg">{item}</h2><p className="mt-2 text-sm leading-6 text-muted">{["Testez les formulations que vos clients utilisent vraiment.", "Comparez votre présence sur les réponses génératives.", "Comprenez les sources qui font apparaître votre marque."][index]}</p></Panel>)}</div></section>
    <footer className="px-6 py-8 text-center text-sm text-muted">© 2026 Cited · Mesure de visibilité IA</footer>
  </main>;
}
