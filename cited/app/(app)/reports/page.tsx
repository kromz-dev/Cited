"use client";

import { useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface ClientReport {
  id: string;
  client: string;
  isImportant?: boolean;
  domainsCount: number;
  availability: number;
  incidents: string;
  hasIncidentWarning?: boolean;
}

const clientReports: ClientReport[] = [
  {
    id: "1",
    client: "Cabinet Vitrine",
    isImportant: true,
    domainsCount: 1,
    availability: 80,
    incidents: "1 en cours",
    hasIncidentWarning: true,
  },
  {
    id: "2",
    client: "Maison Verdier",
    isImportant: true,
    domainsCount: 2,
    availability: 93,
    incidents: "1 en cours",
    hasIncidentWarning: true,
  },
  {
    id: "3",
    client: "Studio Lami",
    isImportant: false,
    domainsCount: 3,
    availability: 97,
    incidents: "1 résolu",
  },
  {
    id: "4",
    client: "Cabinet Noré",
    isImportant: false,
    domainsCount: 4,
    availability: 99,
    incidents: "1 résolu",
  },
  {
    id: "5",
    client: "Librairie Pas",
    isImportant: false,
    domainsCount: 2,
    availability: 100,
    incidents: "—",
  },
  {
    id: "6",
    client: "Le Bureau Sud",
    isImportant: false,
    domainsCount: 6,
    availability: 100,
    incidents: "—",
  },
];

const dailyAvailability = [
  { day: "1 sept.", value: 100, isAlert: false },
  { day: "2 sept.", value: 100, isAlert: false },
  { day: "3 sept.", value: 94, isAlert: false },
  { day: "4 sept.", value: 94, isAlert: false },
  { day: "5 sept.", value: 89, isAlert: true },
  { day: "6 sept.", value: 89, isAlert: true },
  { day: "7 sept.", value: 94, isAlert: false },
  { day: "8 sept.", value: 100, isAlert: false },
  { day: "9 sept.", value: 94, isAlert: false },
  { day: "10 sept.", value: 89, isAlert: true },
  { day: "11 sept.", value: 89, isAlert: true },
  { day: "16 sept.", value: 89, isAlert: true },
];

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<"august" | "september">("september");
  const [downloading, setDownloading] = useState(false);

  const handleExportPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.print();
    }, 400);
  };

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-8">
        <div>
          <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[40px]">
            Rapport mensuel de visibilité IA
          </h1>
          <p className="mt-3 max-w-[58ch] text-sm leading-6 text-ink-2">
            À joindre au reporting de maintenance de chaque client. Généré le 1er du mois, exportable en PDF.
            Données d&apos;exemple.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={selectedMonth === "august" ? "default" : "outline"}
              onClick={() => setSelectedMonth("august")}
            >
              Août
            </Button>
            <Button
              type="button"
              size="sm"
              variant={selectedMonth === "september" ? "default" : "outline"}
              onClick={() => setSelectedMonth("september")}
            >
              Septembre
            </Button>
          </div>

          <Button type="button" onClick={handleExportPdf} disabled={downloading}>
            <Download data-icon="inline-start" />
            {downloading ? "Génération…" : "Exporter en PDF"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-x border-y border-line bg-line md:grid-cols-4">
        <div className="bg-surface p-5 md:px-6 md:py-[22px]">
          <div className="type-caption font-medium text-ink-2">Disponibilité IA moyenne</div>
          <div className="mt-1.5 text-3xl leading-tight font-semibold text-ink tnum md:text-[32px]">94 %</div>
        </div>

        <div className="bg-surface p-5 md:px-6 md:py-[22px]">
          <div className="type-caption font-medium text-ink-2">Scans effectués</div>
          <div className="mt-1.5 text-3xl leading-tight font-semibold text-ink tnum md:text-[32px]">540</div>
        </div>

        <div className="bg-surface p-5 md:px-6 md:py-[22px]">
          <div className="type-caption font-medium text-ink-2">Incidents</div>
          <div className="mt-1.5 text-3xl leading-tight font-semibold text-stop tnum md:text-[32px]">4</div>
        </div>

        <div className="bg-surface p-5 md:px-6 md:py-[22px]">
          <div className="type-caption font-medium text-ink-2">Durée moyenne au rouge</div>
          <div className="mt-1.5 text-3xl leading-tight font-semibold text-ink tnum md:text-[32px]">2,4 j</div>
        </div>
      </div>

      <div className="border-b border-line py-10">
        <h2 className="mb-5 text-xl font-semibold text-ink">Par client</h2>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[640px] border-collapse text-left type-table">
            <caption className="sr-only">Disponibilité IA et incidents par client</caption>
            <thead>
              <tr className="border-b border-ink text-left type-caption font-medium text-ink-2">
                <th scope="col" className="px-6 py-3 font-medium">Client</th>
                <th scope="col" className="px-3 py-3 font-medium">Domaines</th>
                <th scope="col" className="px-3 py-3 font-medium">Disponibilité IA</th>
                <th scope="col" className="px-3 py-3 font-medium">Incidents</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">Rapport</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {clientReports.map((report) => (
                <tr key={report.id} className="h-12 hover:bg-paper">
                  <td className={"px-6 py-3 " + (report.isImportant ? "font-semibold text-ink" : "text-ink")}>
                    {report.client}
                  </td>
                  <td className="px-3 py-3 text-ink tnum">{report.domainsCount}</td>
                  <td
                    className={
                      "px-3 py-3 tnum " + (report.hasIncidentWarning ? "font-semibold text-stop" : "text-ink")
                    }
                  >
                    {report.availability} %
                  </td>
                  <td className="px-3 py-3 text-ink-2">{report.incidents}</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Téléchargement du rapport pour ${report.client}...`)}
                      className="font-medium text-ink underline-offset-4 hover:text-cobalt hover:underline"
                    >
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 py-10 md:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-6 md:p-8">
          <h2 className="text-xl font-semibold text-ink">Disponibilité du portefeuille</h2>
          <p className="mt-1.5 text-sm text-ink-2">
            Part des domaines lisibles par les IA, jour par jour. Données d&apos;exemple.
          </p>

          <div className="mt-6 flex h-[130px] items-end gap-1.5 px-1 pt-4">
            {dailyAvailability.map((item, index) => (
              <div key={index} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                <div
                  style={{ height: `${item.value}%` }}
                  className={
                    "w-full rounded-t-xs transition-opacity group-hover:opacity-85 " +
                    (item.isAlert ? "bg-stop" : "bg-line-strong")
                  }
                />
                <div className="pointer-events-none absolute -top-9 z-10 hidden flex-col items-center group-hover:flex">
                  <span className="whitespace-nowrap rounded-xs bg-ink px-2 py-0.5 type-caption tnum text-paper">
                    {item.day} : {item.value} %
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-between type-caption font-medium text-ink-2">
            <span>1 sept.</span>
            <span>16 sept.</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-line bg-surface p-6 md:p-8">
          <div>
            <h2 className="text-xl font-semibold text-ink">Ce que contient le PDF</h2>
            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 text-sm leading-6 text-ink">
              <div>Verdict actuel et historique de chaque domaine du client.</div>
              <div>Liste des incidents, avec date d&apos;apparition et de résolution.</div>
              <div>Réponse brute des bots IA, en annexe technique.</div>
              <div>Logo de votre agence en en-tête, sans mention de Cited.</div>
            </div>
          </div>

          <div className="mt-6">
            <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
              Personnaliser l&apos;en-tête
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
