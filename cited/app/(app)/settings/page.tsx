"use client";

import { useState } from "react";
import Link from "next/link";

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
    { id: "facturation", label: "Facturation" },
    { id: "marque-blanche", label: "Marque blanche" },
    { id: "securite", label: "Sécurité" },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="-m-6 md:-m-10 min-h-screen bg-[#f3f2f2] text-[#201e1d] font-body selection:bg-[#ec3013]/20">
      {/* Topbar */}
      <header className="bg-[#201e1d] text-[#f3f2f2]">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-3.5 flex items-center gap-6 sm:gap-7 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center text-[19px] font-heading font-extrabold tracking-tight text-[#f3f2f2]"
          >
            <span className="text-[#ec3013] mr-2 inline-flex items-center">
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

          <nav className="flex items-center gap-6 text-[14px]">
            <Link
              href="/dashboard"
              className="text-[#f3f2f2] opacity-75 hover:opacity-100 transition-opacity"
            >
              Portefeuille
            </Link>
            <Link
              href="/alerts"
              className="text-[#f3f2f2] opacity-75 hover:opacity-100 transition-opacity"
            >
              Alertes
            </Link>
            <Link
              href="/reports"
              className="text-[#f3f2f2] opacity-75 hover:opacity-100 transition-opacity"
            >
              Rapports
            </Link>
            <Link
              href="/settings"
              className="text-[#f3f2f2] opacity-100 border-b-2 border-[#ec3013] pb-0.5 font-semibold"
            >
              Paramètres
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3.5">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase opacity-60 hidden sm:inline">
              Atelier Boréal
            </span>
            <div
              className="w-[30px] h-[30px] rounded-full bg-[#ec3013] text-[#f3f2f2] flex items-center justify-center font-heading font-extrabold text-[12px] shrink-0"
              title="Atelier Boréal (Laura Bréa)"
            >
              LB
            </div>
          </div>
        </div>
      </header>

      {/* Main Settings Two-Column Layout */}
      <div className="w-full max-w-[1240px] mx-auto px-0 sm:px-6 grid grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* Subnav Sidebar */}
        <aside className="border-b-2 md:border-b-0 md:border-r-2 border-[#201e1d]/15 py-4 md:py-7">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#201e1d]/60 px-5 pb-3">
            Paramètres
          </div>
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  type="button"
                  className={`text-left py-2.5 px-5 text-[14px] whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-[#f3f2f2] bg-[#201e1d] rounded-none md:rounded-r-[10px] font-semibold"
                      : "text-[#201e1d]/75 hover:text-[#201e1d] hover:bg-[#201e1d]/5 rounded-none md:rounded-r-[10px]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Column */}
        <main className="min-w-0">
          {/* Section: Abonnement */}
          <section id="abonnement" className="border-b-2 border-[#201e1d]/15 p-6 sm:p-8">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#ae1800] mb-2.5">
              Abonnement
            </div>
            <h1 className="text-2xl sm:text-[30px] font-heading font-extrabold text-[#201e1d] m-0">
              Offre agence — 20 domaines
            </h1>

            {/* 3-stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1px] bg-[#201e1d]/15 mt-6 border border-[#201e1d]/15 rounded-[16px] overflow-hidden">
              <div className="bg-[#f3f2f2] p-4.5 sm:p-5">
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#201e1d]/60">
                  Montant
                </div>
                <div className="font-heading font-extrabold text-[26px] text-[#201e1d] mt-1.5">
                  99 € / mois
                </div>
              </div>
              <div className="bg-[#f3f2f2] p-4.5 sm:p-5">
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#201e1d]/60">
                  Quota utilisé
                </div>
                <div className="font-heading font-extrabold text-[26px] text-[#201e1d] mt-1.5">
                  18 / 20
                </div>
              </div>
              <div className="bg-[#f3f2f2] p-4.5 sm:p-5">
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#201e1d]/60">
                  Prochain prélèvement
                </div>
                <div className="font-heading font-extrabold text-[26px] text-[#201e1d] mt-1.5">
                  1 oct.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 mt-5 items-center">
              <button
                type="button"
                className="min-h-[44px] px-5 rounded-[10px] bg-[#ec3013] text-white font-heading font-bold text-[14px] hover:bg-[#dd2b0f] active:bg-[#ae1800] transition-colors shadow-sm cursor-pointer"
              >
                Passer à 40 domaines
              </button>
              <button
                type="button"
                className="min-h-[44px] px-5 rounded-[10px] border border-[#201e1d]/25 text-[#201e1d] font-heading font-bold text-[14px] hover:bg-[#201e1d]/5 active:bg-[#201e1d]/10 transition-colors cursor-pointer"
              >
                Télécharger les factures
              </button>
              <button
                type="button"
                className="min-h-[44px] px-4 rounded-[10px] text-[#ec3013] font-heading font-bold text-[14px] hover:bg-[#ec3013]/10 active:bg-[#ec3013]/20 sm:ml-auto transition-colors cursor-pointer"
              >
                Résilier
              </button>
            </div>
          </section>

          {/* Section: Alertes */}
          <section id="alertes" className="border-b-2 border-[#201e1d]/15 p-6 sm:p-8">
            <h2 className="text-[22px] font-heading font-extrabold text-[#201e1d] m-0 mb-1.5">
              Alertes
            </h2>
            <p className="text-[#201e1d]/60 text-[14px] m-0 mb-4.5">
              Envoyées uniquement au changement de verdict.
            </p>

            <div className="border border-[#201e1d]/15 rounded-[16px] overflow-hidden bg-[#f3f2f2]">
              {/* E-mail */}
              <div className="p-3.5 sm:px-5 border-b border-[#201e1d]/15 flex flex-wrap items-center gap-3.5">
                <span className="w-4 h-4 rounded-[5px] bg-[#ec3013] shrink-0" title="Actif" />
                <div className="flex-1 min-w-[220px]">
                  <div className="font-semibold text-[14px] text-[#201e1d]">E-mail</div>
                  <div className="text-[13px] text-[#201e1d]/60">
                    laura@atelier-boreal.fr, theo@atelier-boreal.fr
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[13px] font-semibold text-[#ec3013] hover:underline cursor-pointer"
                >
                  Modifier
                </button>
              </div>

              {/* Slack */}
              <div className="p-3.5 sm:px-5 border-b border-[#201e1d]/15 flex flex-wrap items-center gap-3.5">
                <span className="w-4 h-4 rounded-[5px] bg-[#ec3013] shrink-0" title="Actif" />
                <div className="flex-1 min-w-[220px]">
                  <div className="font-semibold text-[14px] text-[#201e1d]">Slack</div>
                  <div className="text-[13px] text-[#201e1d]/60">
                    Atelier Boréal · #veille-clients
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[13px] font-semibold text-[#ec3013] hover:underline cursor-pointer"
                >
                  Déconnecter
                </button>
              </div>

              {/* Webhook */}
              <div className="p-3.5 sm:px-5 flex flex-wrap items-center gap-3.5">
                <span
                  className="w-4 h-4 rounded-[5px] border-2 border-[#201e1d] shrink-0"
                  title="Inactif"
                />
                <div className="flex-1 min-w-[220px]">
                  <div className="font-semibold text-[14px] text-[#201e1d]">Webhook</div>
                  <div className="text-[13px] font-mono text-[#201e1d]/60">Non configuré</div>
                </div>
                <button
                  type="button"
                  className="text-[13px] font-semibold text-[#ec3013] hover:underline cursor-pointer"
                >
                  Configurer
                </button>
              </div>
            </div>
          </section>

          {/* Section: Équipe & Accès API (2-col grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-[#201e1d]/15 border-b-2 border-[#201e1d]/15">
            {/* Left Col: Équipe */}
            <section id="equipe" className="bg-[#f3f2f2] p-6 sm:p-8">
              <h2 className="text-[22px] font-heading font-extrabold text-[#201e1d] m-0 mb-4.5">
                Équipe
              </h2>
              <div className="overflow-x-auto rounded-[10px] border border-[#201e1d]/15 bg-[#f3f2f2]">
                <table className="w-full text-left text-[14px] border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#201e1d]/15">
                      <th className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#201e1d]/60 py-2.5 px-3.5">
                        Membre
                      </th>
                      <th className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#201e1d]/60 py-2.5 px-3.5">
                        Rôle
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#201e1d]/10">
                    <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="font-medium text-[#201e1d]">Laura Bréa</div>
                        <div className="text-[12px] text-[#201e1d]/60">laura@atelier-boreal.fr</div>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#201e1d]">Administratrice</td>
                    </tr>
                    <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                      <td className="py-2.5 px-3.5">
                        <div className="font-medium text-[#201e1d]">Théo Manet</div>
                        <div className="text-[12px] text-[#201e1d]/60">theo@atelier-boreal.fr</div>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#201e1d]">Membre</td>
                    </tr>
                    <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                      <td className="py-2.5 px-3.5 text-[#201e1d]/60">
                        <div>jules@atelier-boreal.fr</div>
                        <div className="text-[12px] text-[#201e1d]/40">invitation envoyée</div>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#201e1d]/60">Membre</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="min-h-[42px] mt-4 px-4 rounded-[10px] border border-[#201e1d]/25 text-[#201e1d] font-heading font-bold text-[14px] hover:bg-[#201e1d]/5 active:bg-[#201e1d]/10 transition-colors cursor-pointer"
              >
                Inviter un membre
              </button>
            </section>

            {/* Right Col: Accès API */}
            <section id="api" className="bg-[#f3f2f2] p-6 sm:p-8">
              <h2 className="text-[22px] font-heading font-extrabold text-[#201e1d] m-0 mb-1.5">
                Accès API
              </h2>
              <p className="text-[#201e1d]/60 text-[14px] m-0 mb-4">
                Interrogez les verdicts depuis votre propre outillage.
              </p>

              <div>
                <label
                  htmlFor="p-key"
                  className="block text-[12px] font-medium text-[#201e1d]/70 mb-1.5"
                >
                  Clé secrète
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    id="p-key"
                    readOnly
                    value="ct_live_9f3b••••••••••••7ac1"
                    className="font-mono text-[13px] bg-[#eae9e9] border border-[#201e1d]/20 rounded-[10px] px-3 py-2 min-h-[42px] flex-1 min-w-[200px] text-[#201e1d] outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="min-h-[42px] px-4 rounded-[10px] border border-[#201e1d]/25 text-[#201e1d] font-heading font-bold text-[14px] hover:bg-[#201e1d]/5 active:bg-[#201e1d]/10 transition-colors cursor-pointer"
                  >
                    {copied ? "Copié !" : "Copier"}
                  </button>
                </div>
              </div>

              <div className="font-mono mt-4.5 bg-[#eae9e9] border border-[#201e1d]/15 rounded-[10px] p-3.5 text-[12px] leading-[1.7] overflow-x-auto text-[#201e1d]">
                <div>GET /v1/domains/&#123;id&#125;/status</div>
                <div>→ &#123; &quot;verdict&quot;: &quot;blocked&quot;, &quot;http&quot;: 403 &#125;</div>
              </div>

              <Link
                href="#"
                className="inline-block mt-3.5 text-[13px] font-medium text-[#ec3013] hover:underline"
              >
                Documentation de l&apos;API
              </Link>
            </section>
          </div>

          {/* Section: Marque blanche */}
          <section id="marque-blanche" className="p-6 sm:p-8 pb-12 bg-[#f3f2f2]">
            <h2 className="text-[22px] font-heading font-extrabold text-[#201e1d] m-0 mb-1.5">
              Marque blanche
            </h2>
            <p className="text-[#201e1d]/60 text-[14px] m-0 mb-4.5">
              Les rapports clients portent votre identité, sans mention de Cited.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label
                  htmlFor="p-brand"
                  className="block text-[12px] font-medium text-[#201e1d]/70 mb-1.5"
                >
                  Nom affiché
                </label>
                <input
                  id="p-brand"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-[#eae9e9] border border-[#201e1d]/20 rounded-[10px] px-3 py-2 min-h-[42px] text-[14px] text-[#201e1d] outline-none focus:border-[#ec3013]"
                />
              </div>

              <div>
                <label
                  htmlFor="p-logo"
                  className="block text-[12px] font-medium text-[#201e1d]/70 mb-1.5"
                >
                  Logo de l&apos;agence
                </label>
                <input
                  id="p-logo"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  className="w-full bg-[#eae9e9] border border-[#201e1d]/20 rounded-[10px] px-3 py-2 min-h-[42px] text-[14px] text-[#201e1d] outline-none focus:border-[#ec3013]"
                />
              </div>

              <div>
                <label
                  htmlFor="p-color"
                  className="block text-[12px] font-medium text-[#201e1d]/70 mb-1.5"
                >
                  Couleur d&apos;accent des rapports
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-md border border-[#201e1d]/20 shrink-0"
                    style={{ backgroundColor: brandColor }}
                  />
                  <input
                    id="p-color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-full bg-[#eae9e9] border border-[#201e1d]/20 rounded-[10px] px-3 py-2 min-h-[42px] text-[14px] text-[#201e1d] font-mono outline-none focus:border-[#ec3013]"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
