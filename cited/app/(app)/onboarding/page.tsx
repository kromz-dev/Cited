"use client";

import { useState, useTransition, ChangeEvent, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialDomains = `client-vitrine.bubbleapps.io
atelier-boreal.fr
maison-verdier.com
studio-lami.fr
cabinet-nore.fr
librairie-pas.fr`;

  const [domainsText, setDomainsText] = useState(initialDomains);
  const [recapSchedule, setRecapSchedule] = useState("Lundi matin");
  const [threshold, setThreshold] = useState("200 car.");

  // Alert channels
  const [emailActive, setEmailActive] = useState(true);
  const [slackActive, setSlackActive] = useState(true);
  const [webhookActive, setWebhookActive] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isScanning, setIsScanning] = useState(false);

  // Compute number of non-empty domain lines
  const domainsList = domainsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const domainCount = domainsList.length;

  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const lines = content
          .split(/[\r\n]+/)
          .map((l) => l.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
          .filter(
            (l) =>
              l.length > 0 &&
              !l.toLowerCase().startsWith("url") &&
              !l.toLowerCase().startsWith("domaine")
          );

        if (lines.length > 0) {
          setDomainsText(lines.slice(0, 20).join("\n"));
        }
      }
    };
    reader.readAsText(file);
  };

  const handleStartScan = () => {
    setIsScanning(true);
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/dashboard");
    });
  };

  return (
    <div className="-m-6 md:-m-10 min-h-screen flex flex-col bg-[#f3f2f2] text-[#201e1d]">
      {/* Topbar */}
      <header className="bg-[#201e1d] text-[#f3f2f2]">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center font-heading font-extrabold text-[19px] tracking-tight text-[#f3f2f2] hover:opacity-90 transition-opacity mr-auto"
          >
            <span className="text-[#ec3013] mr-2">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M4 6.5h16" />
                <path d="M6.5 12h11" />
                <path d="M10 17.5h5" />
              </svg>
            </span>
            Cited<span className="text-[#ec3013]">.</span>
          </Link>
          <span className="text-[11px] uppercase tracking-[0.12em] font-medium opacity-60">
            Étapes 2 et 3 sur 3
          </span>
        </div>
      </header>

      {/* Progress Bar (2/3 completed) */}
      <div className="flex h-[6px] bg-[#201e1d]/15">
        <span className="flex-[2] bg-[#ec3013]" />
        <span className="flex-1" />
      </div>

      {/* Main 2-column layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Étape 2 · Ajouter les domaines */}
        <div className="p-6 sm:p-12 flex justify-center border-b lg:border-b-0 lg:border-r-2 border-[#201e1d]/15 bg-[#f3f2f2]">
          <div className="w-full max-w-[460px]">
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#ae1800] mb-3">
              Étape 2 · Ajouter les domaines
            </div>
            <h1 className="font-heading text-[28px] sm:text-[32px] font-bold leading-[1.08] text-[#201e1d] mb-2.5">
              Collez votre portefeuille, un domaine par ligne
            </h1>
            <p className="text-[14px] text-[#201e1d]/75 mb-[22px] leading-relaxed">
              Le premier scan démarre dès la validation. Comptez une minute pour vingt domaines.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="o-doms" className="block text-[12px] font-semibold text-[#201e1d]/70">
                Domaines
              </label>
              <textarea
                id="o-doms"
                rows={8}
                value={domainsText}
                onChange={(e) => setDomainsText(e.target.value)}
                className="w-full bg-[#eae9e9] border border-[#201e1d]/20 rounded-[10px] p-3 font-mono text-[13px] leading-[1.8] text-[#201e1d] focus:border-[#ec3013] focus:outline-none focus:ring-1 focus:ring-[#ec3013] transition-colors"
                placeholder="exemple.com"
              />
            </div>

            <div className="flex justify-between items-center border-t border-[#201e1d]/15 pt-3.5 mt-3.5 text-[13px] text-[#201e1d]/80">
              <span>{domainCount} domaines sur 20 utilisés</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#ae1800] hover:text-[#ec3013] font-medium transition-colors cursor-pointer"
              >
                Importer un CSV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleCsvUpload}
              />
            </div>

            <div className="flex flex-wrap gap-2.5 mt-[22px]">
              <Button
                type="button"
                onClick={handleStartScan}
                disabled={isPending || isScanning}
                className="min-h-[48px] flex-[1_1_200px] bg-[#ec3013] hover:bg-[#dd2b0f] text-white font-bold rounded-[10px] text-sm shadow-none cursor-pointer transition-colors"
              >
                {isPending || isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Scan en cours...
                  </>
                ) : (
                  "Lancer le premier scan"
                )}
              </Button>
              <Link
                href="/register"
                className="min-h-[48px] inline-flex items-center justify-center px-6 rounded-[10px] border border-[#201e1d]/20 hover:bg-[#201e1d]/5 font-bold text-sm text-[#201e1d] transition-colors cursor-pointer"
              >
                Retour
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Étape 3 · Choisir les alertes */}
        <div className="p-6 sm:p-12 flex justify-center bg-[#eae9e9]">
          <div className="w-full max-w-[460px]">
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#ae1800] mb-3">
              Étape 3 · Choisir les alertes
            </div>
            <h2 className="font-heading text-[28px] sm:text-[32px] font-bold leading-[1.08] text-[#201e1d] mb-2.5">
              Qui est prévenu quand un site passe au rouge
            </h2>
            <p className="text-[14px] text-[#201e1d]/75 mb-[22px] leading-relaxed">
              Une alerte part au changement de verdict, jamais à chaque scan.
            </p>

            {/* Alert Channels List */}
            <div className="bg-[#f3f2f2] border border-[#201e1d]/15 rounded-[16px] overflow-hidden">
              {/* Channel 1: Email */}
              <div
                onClick={() => setEmailActive(!emailActive)}
                className="p-4 sm:px-4.5 sm:py-4 border-b border-[#201e1d]/15 flex items-start gap-3 cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded-[5px] shrink-0 mt-0.5 transition-colors ${
                    emailActive ? "bg-[#ec3013]" : "border-2 border-[#201e1d]"
                  }`}
                />
                <div>
                  <div className="font-semibold text-[14px] text-[#201e1d]">E-mail</div>
                  <div className="text-[13px] text-[#201e1d]/60">laura@atelier-boreal.fr</div>
                </div>
              </div>

              {/* Channel 2: Slack */}
              <div
                onClick={() => setSlackActive(!slackActive)}
                className="p-4 sm:px-4.5 sm:py-4 border-b border-[#201e1d]/15 flex items-start gap-3 cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded-[5px] shrink-0 mt-0.5 transition-colors ${
                    slackActive ? "bg-[#ec3013]" : "border-2 border-[#201e1d]"
                  }`}
                />
                <div>
                  <div className="font-semibold text-[14px] text-[#201e1d]">Slack</div>
                  <div className="text-[13px] text-[#201e1d]/60">#veille-clients · connecté</div>
                </div>
              </div>

              {/* Channel 3: Webhook */}
              <div
                onClick={() => setWebhookActive(!webhookActive)}
                className="p-4 sm:px-4.5 sm:py-4 flex items-start gap-3 cursor-pointer select-none hover:bg-black/[0.02] transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded-[5px] shrink-0 mt-0.5 transition-colors ${
                    webhookActive ? "bg-[#ec3013]" : "border-2 border-[#201e1d]"
                  }`}
                />
                <div>
                  <div className="font-semibold text-[14px] text-[#201e1d]">Webhook</div>
                  <div className="text-[13px] text-[#201e1d]/60">POST JSON vers votre outillage</div>
                </div>
              </div>
            </div>

            {/* Weekly Recap Segment */}
            <div className="mt-[22px]">
              <label className="block text-[12px] font-semibold text-[#201e1d]/70 mb-1.5">
                Récapitulatif hebdomadaire
              </label>
              <div className="inline-flex border border-[#201e1d]/20 rounded-[10px] overflow-hidden bg-white/40">
                {["Lundi matin", "Vendredi", "Aucun"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRecapSchedule(opt)}
                    className={`px-3 py-1.5 text-[13px] cursor-pointer transition-colors border-r border-[#201e1d]/20 last:border-r-0 ${
                      recapSchedule === opt
                        ? "bg-[#201e1d] text-[#f3f2f2] font-semibold"
                        : "text-[#201e1d] hover:bg-black/5"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty Shell Threshold Segment */}
            <div className="mt-[18px]">
              <label className="block text-[12px] font-semibold text-[#201e1d]/70 mb-1.5">
                Seuil de coquille vide
              </label>
              <div className="inline-flex border border-[#201e1d]/20 rounded-[10px] overflow-hidden bg-white/40">
                {["100 car.", "200 car.", "500 car."].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setThreshold(opt)}
                    className={`px-3 py-1.5 text-[13px] cursor-pointer transition-colors border-r border-[#201e1d]/20 last:border-r-0 ${
                      threshold === opt
                        ? "bg-[#201e1d] text-[#f3f2f2] font-semibold"
                        : "text-[#201e1d] hover:bg-black/5"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <span className="block text-[12px] text-[#201e1d]/60 mt-1.5">
                En dessous de ce volume de texte utile, le verdict passe au rouge.
              </span>
            </div>

            {/* Complete Button */}
            <Link
              href="/dashboard"
              className="w-full min-h-[48px] bg-[#ec3013] hover:bg-[#dd2b0f] text-white font-bold rounded-[10px] text-sm flex items-center justify-center transition-colors mt-6 shadow-none"
            >
              Terminer et voir le dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
