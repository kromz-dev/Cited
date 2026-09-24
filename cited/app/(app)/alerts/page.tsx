"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Verdict, type VerdictValue } from "@/components/ui/verdict";

type AlertFilter = "all" | "red" | "green";

interface AlertItem {
  id: string;
  domain: string;
  type: "red" | "green";
  verdict: VerdictValue;
  title: string;
  description: string;
  date: string;
  handled?: boolean;
}

const initialAlerts: AlertItem[] = [
  {
    id: "1",
    domain: "client-vitrine.bubbleapps.io",
    type: "red",
    verdict: "refuse",
    title: "client-vitrine.bubbleapps.io est passé au rouge",
    description: "GPTBot reçoit un 403 Forbidden · page testée : /",
    date: "10 sept. · 06:12",
  },
  {
    id: "2",
    domain: "maison-verdier.com",
    type: "red",
    verdict: "vide",
    title: "maison-verdier.com est passé au rouge",
    description: "148 caractères utiles servis, sous le seuil de 200",
    date: "14 sept. · 06:08",
  },
  {
    id: "3",
    domain: "studio-lami.fr",
    type: "green",
    verdict: "lu",
    title: "studio-lami.fr est repassé au vert",
    description: "2 884 caractères utiles servis à GPTBot",
    date: "8 sept. · 06:05",
    handled: true,
  },
  {
    id: "4",
    domain: "studio-lami.fr",
    type: "red",
    verdict: "vide",
    title: "studio-lami.fr est passé au rouge",
    description: "Rendu côté client : 96 caractères utiles",
    date: "5 sept. · 06:07",
  },
  {
    id: "5",
    domain: "cabinet-nore.fr",
    type: "green",
    verdict: "lu",
    title: "cabinet-nore.fr est repassé au vert",
    description: "Règle de pare-feu corrigée côté hébergeur",
    date: "2 sept. · 06:11",
    handled: true,
  },
];

const filters: { id: AlertFilter; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "red", label: "Passages au rouge" },
  { id: "green", label: "Retours au vert" },
];

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertFilter>("all");

  const filteredAlerts = initialAlerts.filter((item) => {
    if (filter === "red") return item.type === "red";
    if (filter === "green") return item.type === "green";
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="border-b border-line pb-8">
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[40px]">
          Journal des changements de verdict
        </h1>
        <p className="mt-3 max-w-[60ch] text-sm leading-6 text-ink-2">
          Une alerte est créée lorsqu&apos;un domaine change d&apos;état, jamais à chaque scan. Les alertes
          partent par e-mail.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                variant={filter === f.id ? "default" : "outline"}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <span className="type-table text-ink-2">
            {initialAlerts.length} alertes sur les 30 derniers jours · données d&apos;exemple
          </span>
        </div>

        <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Gérer les alertes
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-line">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={
                  "flex flex-wrap items-center gap-4 p-5 md:px-6 " + (alert.handled ? "opacity-70" : "")
                }
              >
                <Verdict value={alert.verdict} variant="glyph" size="lg" />

                <div className="min-w-[280px] flex-1">
                  <div className="text-[15px] leading-5 font-semibold text-ink">{alert.title}</div>
                  <div className="mt-1 text-[13px] leading-5 text-ink-2">{alert.description}</div>
                </div>

                <Verdict value={alert.verdict} variant="inline" />

                <span className="type-table min-w-[130px] text-ink-2 tnum">{alert.date}</span>

                <Link
                  href="/dashboard"
                  className="type-table font-medium text-ink underline-offset-4 hover:text-cobalt hover:underline"
                >
                  Détail
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-ink">Aucune alerte pour ce filtre.</p>
            <p className="mt-1 text-sm text-ink-2">Choisissez « Tout » pour revoir les 30 derniers jours.</p>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aperçu de l&apos;e-mail d&apos;alerte</CardTitle>
            <CardDescription>Envoyé à chaque changement de verdict, jamais à chaque scan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-line bg-paper p-4 text-sm leading-6">
              <div className="font-semibold text-ink">Cited — client-vitrine.bubbleapps.io</div>
              <div className="mt-2 text-ink">
                <Verdict value="refuse" variant="inline" /> — GPTBot ne répond plus (403 Forbidden). Dernier
                état lu : 9 septembre.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif hebdomadaire</CardTitle>
            <CardDescription>
              Envoyé le lundi à 8 h par e-mail : les domaines refusés, ceux redevenus lisibles, et les scans en
              échec.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Changer la fréquence
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
