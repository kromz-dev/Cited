"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Verdict } from "@/components/ui/verdict";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("abonnement");
  const [copied, setCopied] = useState(false);
  const [brandName, setBrandName] = useState("Atelier Boréal");
  const [brandLogo, setBrandLogo] = useState("logo-atelier-boreal.svg");
  const [brandColor, setBrandColor] = useState("#ec3013");

  const handleCopyKey = () => {
    navigator.clipboard.writeText("ct_live_9f3be48107ac1b992f44c7ac1");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: "abonnement", label: "Abonnement" },
    { id: "alertes", label: "Alertes" },
    { id: "equipe", label: "Équipe" },
    { id: "api", label: "Accès API" },
    { id: "marque-blanche", label: "Marque blanche" },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="border-b border-line pb-8">
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[40px]">
          Paramètres
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm leading-6 text-ink-2">
          Abonnement, alertes, équipe et rapports en marque blanche pour Atelier Boréal.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-8 md:self-start">
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  type="button"
                  className={
                    "rounded-sm px-3 py-2 text-left text-sm whitespace-nowrap transition-colors " +
                    (isActive ? "bg-surface-2 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink")
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          {/* Abonnement */}
          <section id="abonnement" className="scroll-mt-8 border-b border-line pb-8">
            <h2 className="text-xl font-semibold text-ink">Offre agence — 20 domaines</h2>

            <div className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
              <div className="bg-surface p-4.5 sm:p-5">
                <div className="type-caption font-medium text-ink-2">Montant</div>
                <div className="mt-1.5 text-2xl font-semibold text-ink">99 € / mois</div>
              </div>
              <div className="bg-surface p-4.5 sm:p-5">
                <div className="type-caption font-medium text-ink-2">Quota utilisé</div>
                <div className="mt-1.5 text-2xl font-semibold text-ink tnum">18 / 20</div>
              </div>
              <div className="bg-surface p-4.5 sm:p-5">
                <div className="type-caption font-medium text-ink-2">Prochain prélèvement</div>
                <div className="mt-1.5 text-2xl font-semibold text-ink">1 oct.</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Button type="button">Passer à 40 domaines</Button>
              <Button type="button" variant="outline">Télécharger les factures</Button>
              <Button type="button" variant="ghost" className="text-stop hover:bg-stop-soft sm:ml-auto">
                Résilier
              </Button>
            </div>
          </section>

          {/* Alertes */}
          <section id="alertes" className="scroll-mt-8 border-b border-line pb-8">
            <h2 className="text-xl font-semibold text-ink">Alertes</h2>
            <p className="mt-1.5 mb-4.5 text-sm text-ink-2">
              Envoyées uniquement au changement de verdict, par e-mail.
            </p>

            <div className="overflow-hidden rounded-lg border border-line">
              <div className="flex flex-wrap items-center gap-3.5 border-b border-line p-3.5 sm:px-5">
                <Verdict value="lu" variant="glyph" />
                <div className="min-w-[220px] flex-1">
                  <div className="text-sm font-semibold text-ink">E-mail</div>
                  <div className="type-caption text-ink-2">
                    laura@atelier-boreal.fr, theo@atelier-boreal.fr
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm">
                  Modifier
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 border-b border-line p-3.5 sm:px-5">
                <Verdict value="inconnu" variant="glyph" />
                <div className="min-w-[220px] flex-1">
                  <div className="text-sm font-semibold text-ink">Slack</div>
                  <div className="type-caption text-ink-2">Pas encore proposé</div>
                </div>
                <Badge variant="outline">En préparation</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 p-3.5 sm:px-5">
                <Verdict value="inconnu" variant="glyph" />
                <div className="min-w-[220px] flex-1">
                  <div className="text-sm font-semibold text-ink">Webhook</div>
                  <div className="type-caption text-ink-2">Pas encore proposé</div>
                </div>
                <Badge variant="outline">En préparation</Badge>
              </div>
            </div>
          </section>

          {/* Équipe & Accès API */}
          <div className="grid grid-cols-1 gap-8 border-b border-line pb-8 lg:grid-cols-2">
            <section id="equipe" className="scroll-mt-8">
              <div className="mb-4.5 flex items-center gap-2">
                <h2 className="text-xl font-semibold text-ink">Équipe</h2>
                <Badge variant="outline">En préparation</Badge>
              </div>
              <p className="mb-4.5 text-sm text-ink-2">
                Un seul compte par agence pour le moment. L&apos;invitation de membres arrive bientôt.
              </p>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">Membres de l&apos;équipe, exemple</caption>
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className="type-caption px-3.5 py-2.5 font-medium text-ink-2">Membre</th>
                      <th scope="col" className="type-caption px-3.5 py-2.5 font-medium text-ink-2">Rôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    <tr>
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium text-ink">Laura Bréa</div>
                        <div className="type-caption text-ink-2">laura@atelier-boreal.fr</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-ink">Administratrice</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <Button type="button" variant="outline" className="mt-4" disabled>
                Inviter un membre
              </Button>
            </section>

            <section id="api" className="scroll-mt-8">
              <div className="mb-1.5 flex items-center gap-2">
                <h2 className="text-xl font-semibold text-ink">Accès API</h2>
                <Badge variant="outline">En préparation</Badge>
              </div>
              <p className="mb-4 text-sm text-ink-2">
                Interroger vos verdicts depuis votre propre outillage arrive bientôt. Aperçu de la forme prévue
                ci-dessous.
              </p>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="p-key" className="text-sm font-medium text-ink">
                  Clé secrète
                </label>
                <div className="flex flex-wrap gap-2">
                  <Input id="p-key" readOnly value="ct_live_9f3b••••••••••••7ac1" className="min-w-[200px] flex-1 font-mono" />
                  <Button type="button" variant="outline" onClick={handleCopyKey}>
                    {copied ? "Copié" : "Copier"}
                  </Button>
                </div>
              </div>

              <pre className="mt-4.5 overflow-x-auto rounded-md border border-line bg-surface-2 p-3.5 type-caption leading-6 text-ink">
{`GET /v1/domains/{id}/status
{ "verdict": "blocked", "http": 403 }`}
              </pre>

              <Link href="#" className="mt-3.5 inline-block text-sm font-medium text-cobalt hover:underline">
                Documentation de l&apos;API
              </Link>
            </section>
          </div>

          {/* Marque blanche */}
          <section id="marque-blanche" className="scroll-mt-8">
            <h2 className="text-xl font-semibold text-ink">Marque blanche</h2>
            <p className="mt-1.5 mb-4.5 text-sm text-ink-2">
              Les rapports clients portent votre identité, sans mention de Cited.
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="p-brand" className="text-sm font-medium text-ink">
                  Nom affiché
                </label>
                <Input id="p-brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="p-logo" className="text-sm font-medium text-ink">
                  Logo de l&apos;agence
                </label>
                <Input id="p-logo" value={brandLogo} onChange={(e) => setBrandLogo(e.target.value)} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="p-color" className="text-sm font-medium text-ink">
                  Couleur d&apos;accent des rapports
                </label>
                <div className="flex items-center gap-2">
                  <div className="size-8 shrink-0 rounded-md border border-line" style={{ backgroundColor: brandColor }} />
                  <Input
                    id="p-color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
