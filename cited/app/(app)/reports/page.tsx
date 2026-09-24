"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileText, CheckCircle2, Sliders, ExternalLink } from "lucide-react";

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
      {/* Header section */}
      <div className="border-b-2 border-line pb-8 flex flex-wrap gap-5 justify-between items-end">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ae1800] mb-2.5">
            Rapports
          </div>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-[34px] font-bold text-ink tracking-tight">
            Rapport mensuel de visibilité IA
          </h1>
          <p className="mt-3 text-sm text-muted max-w-[58ch] leading-relaxed">
            À joindre au reporting de maintenance de chaque client. Généré le 1er du mois, exportable en PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month segmented control */}
          <div className="inline-flex border border-line rounded-lg overflow-hidden bg-white shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedMonth("august")}
              className={`px-3.5 py-2 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                selectedMonth === "august"
                  ? "bg-ink text-white"
                  : "text-ink hover:bg-paper-deep"
              }`}
            >
              Août
            </button>
            <button
              type="button"
              onClick={() => setSelectedMonth("september")}
              className={`px-3.5 py-2 text-xs md:text-sm font-medium border-l border-line transition-colors cursor-pointer ${
                selectedMonth === "september"
                  ? "bg-ink text-white"
                  : "text-ink hover:bg-paper-deep"
              }`}
            >
              Septembre
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2 rounded-lg bg-[#ec3013] hover:bg-[#dd2b0f] active:bg-[#ae1800] text-white font-heading font-semibold text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Génération..." : "Exporter en PDF"}
          </button>
        </div>
      </div>

      {/* Stats summary grid */}
      <div className="border-b-2 border-line">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border-x border-line">
          <div className="bg-paper p-5 md:py-[22px] md:px-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted mb-1.5">
              Disponibilité IA moyenne
            </div>
            <div className="font-heading font-extrabold text-3xl md:text-[38px] text-ink leading-tight">
              94 %
            </div>
          </div>

          <div className="bg-paper p-5 md:py-[22px] md:px-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted mb-1.5">
              Scans effectués
            </div>
            <div className="font-heading font-extrabold text-3xl md:text-[38px] text-ink leading-tight">
              540
            </div>
          </div>

          <div className="bg-paper p-5 md:py-[22px] md:px-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ae1800] mb-1.5">
              Incidents
            </div>
            <div className="font-heading font-extrabold text-3xl md:text-[38px] text-[#ec3013] leading-tight">
              4
            </div>
          </div>

          <div className="bg-paper p-5 md:py-[22px] md:px-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted mb-1.5">
              Durée moyenne au rouge
            </div>
            <div className="font-heading font-extrabold text-3xl md:text-[38px] text-ink leading-tight">
              2,4 j
            </div>
          </div>
        </div>
      </div>

      {/* Clients reports table section */}
      <div className="border-b-2 border-line py-10">
        <h2 className="font-heading font-bold text-2xl text-ink mb-5">Par client</h2>
        <div className="border border-line rounded-xl overflow-hidden bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-line bg-paper/40">
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                    Client
                  </th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                    Domaines
                  </th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                    Disponibilité IA
                  </th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                    Incidents
                  </th>
                  <th className="py-3 px-6 text-[11px] font-bold uppercase tracking-[0.08em] text-muted text-right">
                    Rapport
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {clientReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-paper/30 transition-colors"
                  >
                    <td
                      className={`py-3 px-6 ${
                        report.isImportant ? "font-semibold text-ink" : "text-ink"
                      }`}
                    >
                      {report.client}
                    </td>
                    <td className="py-3 px-6 text-ink">{report.domainsCount}</td>
                    <td
                      className={`py-3 px-6 font-mono ${
                        report.hasIncidentWarning
                          ? "text-[#ec3013] font-semibold"
                          : "text-ink"
                      }`}
                    >
                      {report.availability} %
                    </td>
                    <td className="py-3 px-6 text-muted">{report.incidents}</td>
                    <td className="py-3 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Téléchargement du rapport pour ${report.client}...`)}
                        className="text-sm font-medium text-ink hover:text-cited underline-offset-4 hover:underline cursor-pointer"
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
      </div>

      {/* Bottom section: Portfolio availability chart + PDF details */}
      <div className="py-10 grid grid-cols-1 md:grid-cols-2 gap-9 items-start">
        {/* Availability chart */}
        <div className="border border-line rounded-2xl bg-white p-6 md:p-8 shadow-xs">
          <h2 className="font-heading font-bold text-2xl text-ink mb-1.5">
            Disponibilité du portefeuille
          </h2>
          <p className="text-sm text-muted mb-6">
            Part des domaines lisibles par les IA, jour par jour.
          </p>

          <div className="flex items-end gap-1.5 h-[130px] pt-4 px-1">
            {dailyAvailability.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                <div
                  style={{ height: `${item.value}%` }}
                  className={`w-full rounded-t-[4px] transition-all group-hover:opacity-85 ${
                    item.isAlert ? "bg-[#ec3013]" : "bg-[#d7d3d3]"
                  }`}
                />
                {/* Tooltip on hover */}
                <div className="absolute -top-9 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                  <span className="bg-ink text-white text-[11px] font-mono px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                    {item.day}: {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-3 text-xs text-muted font-medium">
            <span>1 sept.</span>
            <span>16 sept.</span>
          </div>
        </div>

        {/* PDF contents details */}
        <div className="border border-line rounded-2xl bg-white p-6 md:p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-bold text-2xl text-ink mb-1.5">
              Ce que contient le PDF
            </h2>
            <div className="flex flex-col gap-3 text-sm text-ink/90 border-t border-line pt-4 mt-4 leading-relaxed">
              <div>Verdict actuel et historique de chaque domaine du client.</div>
              <div>Liste des incidents, avec date d&apos;apparition et de résolution.</div>
              <div>Réponse brute des bots IA, en annexe technique.</div>
              <div>Logo de votre agence en en-tête, sans mention de Cited.</div>
            </div>
          </div>

          <div className="mt-6 pt-2">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 border border-line rounded-lg bg-white text-ink text-sm font-semibold hover:bg-paper-deep transition-colors shadow-xs"
            >
              Personnaliser l&apos;en-tête
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
