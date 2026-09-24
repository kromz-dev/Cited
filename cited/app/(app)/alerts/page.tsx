"use client";

import { useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ArrowUpRight, Check, AlertCircle } from "lucide-react";

type AlertFilter = "all" | "red" | "green";

interface AlertItem {
  id: string;
  domain: string;
  type: "red" | "green";
  title: string;
  description: string;
  tag: string;
  date: string;
}

const initialAlerts: AlertItem[] = [
  {
    id: "1",
    domain: "client-vitrine.bubbleapps.io",
    type: "red",
    title: "client-vitrine.bubbleapps.io est passé au rouge",
    description: "GPTBot reçoit un 403 Forbidden · page testée : /",
    tag: "Bloqué",
    date: "10 sept. · 06:12",
  },
  {
    id: "2",
    domain: "maison-verdier.com",
    type: "red",
    title: "maison-verdier.com est passé au rouge",
    description: "148 caractères utiles servis, sous le seuil de 200",
    tag: "Coquille vide",
    date: "14 sept. · 06:08",
  },
  {
    id: "3",
    domain: "studio-lami.fr",
    type: "green",
    title: "studio-lami.fr est repassé au vert",
    description: "2 884 caractères utiles servis à GPTBot",
    tag: "Résolu",
    date: "8 sept. · 06:05",
  },
  {
    id: "4",
    domain: "studio-lami.fr",
    type: "red",
    title: "studio-lami.fr est passé au rouge",
    description: "Rendu côté client : 96 caractères utiles",
    tag: "Coquille vide",
    date: "5 sept. · 06:07",
  },
  {
    id: "5",
    domain: "cabinet-nore.fr",
    type: "green",
    title: "cabinet-nore.fr est repassé au vert",
    description: "Règle de pare-feu corrigée côté hébergeur",
    tag: "Résolu",
    date: "2 sept. · 06:11",
  },
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
      {/* Header section */}
      <div className="border-b-2 border-line pb-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ae1800] mb-2.5">
          Alertes
        </div>
        <h1 className="font-heading text-3xl md:text-4xl lg:text-[34px] font-bold text-ink tracking-tight">
          Journal des changements de verdict
        </h1>
        <p className="mt-3 text-sm text-muted max-w-[60ch] leading-relaxed">
          Une alerte est créée lorsqu&apos;un domaine change d&apos;état, jamais à chaque scan. Les canaux actifs sont l&apos;e-mail et Slack.
        </p>
      </div>

      {/* Filter and actions bar */}
      <div className="py-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented options */}
          <div className="inline-flex border border-line rounded-lg overflow-hidden bg-white shadow-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3.5 py-2 text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-ink text-white"
                  : "text-ink hover:bg-paper-deep"
              }`}
            >
              Tout
            </button>
            <button
              type="button"
              onClick={() => setFilter("red")}
              className={`px-3.5 py-2 text-xs md:text-sm font-medium border-l border-line transition-colors cursor-pointer ${
                filter === "red"
                  ? "bg-ink text-white"
                  : "text-ink hover:bg-paper-deep"
              }`}
            >
              Passages au rouge
            </button>
            <button
              type="button"
              onClick={() => setFilter("green")}
              className={`px-3.5 py-2 text-xs md:text-sm font-medium border-l border-line transition-colors cursor-pointer ${
                filter === "green"
                  ? "bg-ink text-white"
                  : "text-ink hover:bg-paper-deep"
              }`}
            >
              Retours au vert
            </button>
          </div>

          <span className="text-xs md:text-[13px] text-muted">
            14 alertes sur les 30 derniers jours
          </span>
        </div>

        <Link
          href="/settings"
          className="inline-flex items-center justify-center min-h-[42px] px-4 py-2 border border-line rounded-lg bg-white text-ink text-xs md:text-sm font-semibold hover:bg-paper-deep transition-colors shadow-xs"
        >
          Gérer les canaux
        </Link>
      </div>

      {/* Alerts list */}
      <div className="border border-line rounded-2xl overflow-hidden bg-white shadow-xs divide-y divide-line">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 md:px-6 flex flex-wrap gap-4 items-center hover:bg-paper/40 transition-colors"
            >
              {/* Dot indicator */}
              {alert.type === "red" ? (
                <span
                  className="w-4 h-4 rounded-[5px] bg-[#ec3013] shrink-0"
                  title="Passé au rouge"
                  aria-label="Passé au rouge"
                />
              ) : (
                <span
                  className="w-4 h-4 rounded-[5px] border-2 border-ink shrink-0 bg-transparent"
                  title="Repassé au vert"
                  aria-label="Repassé au vert"
                />
              )}

              {/* Details */}
              <div className="flex-1 min-w-[280px]">
                <div className="font-semibold text-[15px] text-ink">{alert.title}</div>
                <div className="text-[13px] text-muted mt-1">{alert.description}</div>
              </div>

              {/* Status Tag */}
              <span
                className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-[7px] ${
                  alert.tag === "Résolu"
                    ? "bg-[#f8f4f4] text-[#444141] border border-[#d7d3d3]"
                    : "bg-[#fff2ef] text-[#7c1405] border border-[#ffc4b8]"
                }`}
              >
                {alert.tag}
              </span>

              {/* Date */}
              <span className="text-[13px] text-muted min-w-[130px]">{alert.date}</span>

              {/* Action Link */}
              <Link
                href="/dashboard"
                className="text-[13px] font-medium text-ink hover:text-cited underline-offset-4 hover:underline"
              >
                Détail
              </Link>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted">
            Aucune alerte trouvée pour ce filtre.
          </div>
        )}
      </div>

      {/* Bottom informational cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slack message preview */}
        <div className="border border-line rounded-2xl bg-white p-5 md:p-[22px] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-bold text-[19px] text-ink mb-2">
              Aperçu du message Slack
            </h2>
            <div className="bg-[#eae9e9] rounded-[10px] p-4 text-sm leading-[1.6] border border-line/40">
              <div className="font-bold text-ink flex items-center gap-1.5">
                Cited · #veille-clients
              </div>
              <div className="mt-2 text-ink">
                <span className="text-[#ae1800] font-bold">Rouge</span> — client-vitrine.bubbleapps.io ne répond plus à GPTBot (403 Forbidden). Dernier état vert : 9 septembre.
              </div>
            </div>
          </div>
        </div>

        {/* Weekly recap card */}
        <div className="border border-line rounded-2xl bg-white p-5 md:p-[22px] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-bold text-[19px] text-ink mb-2">
              Récapitulatif hebdomadaire
            </h2>
            <p className="text-sm text-muted mb-3 leading-relaxed">
              Envoyé le lundi à 8 h : la liste des domaines au rouge, ceux revenus au vert, et les scans en échec.
            </p>
          </div>
          <div>
            <Link
              href="/settings"
              className="inline-flex items-center justify-center min-h-[42px] px-4 py-2 border border-line rounded-lg bg-white text-ink text-sm font-semibold hover:bg-paper-deep transition-colors shadow-xs"
            >
              Changer la fréquence
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
