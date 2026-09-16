import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tarifs — Cited",
  description: "Le prix d'une ligne de maintenance, pas d'un outil de plus. Facturation mensuelle, sans engagement.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f3f2f2] text-[#201e1d] font-body selection:bg-[#ec3013]/20">
      {/* Topbar */}
      <header className="bg-[#201e1d] text-[#f3f2f2]">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-3.5 flex items-center gap-6 sm:gap-7 flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center text-[19px] font-heading font-extrabold tracking-tight text-[#f3f2f2] mr-auto"
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
          <Link
            href="/#fonctionnement"
            className="text-[14px] text-[#f3f2f2] opacity-75 hover:opacity-100 transition-opacity"
          >
            Fonctionnement
          </Link>
          <Link
            href="/pricing"
            className="text-[14px] text-[#f3f2f2] opacity-100 border-b-2 border-[#ec3013] pb-0.5 font-semibold"
          >
            Tarifs
          </Link>
          <Link
            href="/login"
            className="text-[14px] text-[#f3f2f2] opacity-75 hover:opacity-100 transition-opacity"
          >
            Connexion
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b-2 border-[#201e1d]/15">
        <div className="w-full max-w-[1240px] mx-auto px-6 pt-[52px] pb-[36px]">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#ae1800] mb-3.5">
            Tarifs
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-[52px] font-heading font-extrabold leading-[1.03] max-w-[24ch] text-[#201e1d] m-0">
            Le prix d&apos;une ligne de maintenance, pas d&apos;un outil de plus.
          </h1>
          <p className="mt-[18px] mb-0 text-[16px] text-[#201e1d]/80 max-w-[56ch] leading-relaxed">
            Facturation mensuelle, sans engagement. Le scan gratuit d&apos;un domaine reste accessible sans compte.
          </p>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="border-b-2 border-[#201e1d]/15">
        <div className="w-full max-w-[1240px] mx-auto p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#201e1d]/15">
            {/* Tier 1: Scan libre */}
            <div className="bg-[#f3f2f2] p-8 flex flex-col gap-[18px]">
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#201e1d]/60">
                  Scan libre
                </div>
                <div className="font-heading font-extrabold text-[48px] leading-none mt-2.5 text-[#201e1d]">
                  0 €
                </div>
                <p className="mt-2.5 mb-0 text-[14px] text-[#201e1d]/80">
                  Pour vérifier un site avant un rendez-vous client.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-[14px] text-[#201e1d]/90 border-t border-[#201e1d]/15 pt-3.5">
                <div>1 domaine, scan à la demande</div>
                <div>Verdict, code HTTP et texte utile</div>
                <div>Aucun historique, aucune alerte</div>
              </div>
              <Link
                href="/analyse"
                className="mt-auto min-h-[46px] inline-flex items-center justify-center rounded-[10px] border border-[#201e1d]/25 px-5 font-heading text-[14px] font-bold text-[#201e1d] hover:bg-[#201e1d]/5 active:bg-[#201e1d]/10 transition-colors"
              >
                Scanner un site
              </Link>
            </div>

            {/* Tier 2: Agence — recommandé */}
            <div className="bg-[#ec3013] text-[#f3f2f2] p-8 flex flex-col gap-[18px]">
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#f3f2f2]/90">
                  Agence — recommandé
                </div>
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="font-heading font-extrabold text-[48px] leading-none text-[#f3f2f2]">
                    99 €
                  </span>
                  <span className="text-[15px] text-[#f3f2f2]/90">/ mois</span>
                </div>
                <p className="mt-2.5 mb-0 text-[14px] text-[#f3f2f2]/90">
                  Jusqu&apos;à 20 domaines, soit 5 € par site et par mois.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-[14px] text-[#f3f2f2] border-t border-[#f3f2f2]/30 pt-3.5">
                <div>Scan quotidien des 20 domaines</div>
                <div>Alertes e-mail, Slack et webhook</div>
                <div>Historique complet des verdicts</div>
                <div>Rapport mensuel exportable</div>
                <div>Utilisateurs illimités</div>
              </div>
              <Link
                href="/register"
                className="mt-auto min-h-[46px] inline-flex items-center justify-center rounded-[10px] bg-[#f3f2f2] text-[#201e1d] px-5 font-heading text-[14px] font-bold hover:bg-white active:bg-[#f3f2f2] transition-colors shadow-sm"
              >
                Ouvrir un compte
              </Link>
            </div>

            {/* Tier 3: Portefeuille étendu */}
            <div className="bg-[#f3f2f2] p-8 flex flex-col gap-[18px]">
              <div>
                <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#201e1d]/60">
                  Portefeuille étendu
                </div>
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="font-heading font-extrabold text-[48px] leading-none text-[#201e1d]">
                    + 79 €
                  </span>
                  <span className="text-[15px] text-[#201e1d]/80">/ tranche</span>
                </div>
                <p className="mt-2.5 mb-0 text-[14px] text-[#201e1d]/80">
                  Par tranche supplémentaire de 20 domaines.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-[14px] text-[#201e1d]/90 border-t border-[#201e1d]/15 pt-3.5">
                <div>Tout le contenu de l&apos;offre agence</div>
                <div>Scan deux fois par jour</div>
                <div>Accès API et clés multiples</div>
                <div>Interlocuteur dédié</div>
              </div>
              <Link
                href="mailto:contact@cited.io"
                className="mt-auto min-h-[46px] inline-flex items-center justify-center rounded-[10px] border border-[#201e1d]/25 px-5 font-heading text-[14px] font-bold text-[#201e1d] hover:bg-[#201e1d]/5 active:bg-[#201e1d]/10 transition-colors"
              >
                Nous écrire
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="border-b-2 border-[#201e1d]/15">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-[44px]">
          <h2 className="text-[26px] font-heading font-extrabold text-[#201e1d] m-0 mb-[22px]">
            Ce que comprend chaque offre
          </h2>
          <div className="overflow-x-auto rounded-[10px] border border-[#201e1d]/15 bg-[#f3f2f2]">
            <table className="w-full text-left text-[14px] border-collapse">
              <thead>
                <tr className="border-b-2 border-[#201e1d]/15">
                  <th className="py-3 px-4 font-normal">&nbsp;</th>
                  <th className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#201e1d]/60 py-3 px-4">
                    Scan libre
                  </th>
                  <th className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#201e1d]/60 py-3 px-4">
                    Agence
                  </th>
                  <th className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#201e1d]/60 py-3 px-4">
                    Étendu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201e1d]/10">
                <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium">Domaines surveillés</td>
                  <td className="py-3 px-4 font-mono">1 ponctuel</td>
                  <td className="py-3 px-4 font-mono">20</td>
                  <td className="py-3 px-4 font-mono">+ 20 / tranche</td>
                </tr>
                <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium">Fréquence des scans</td>
                  <td className="py-3 px-4">À la demande</td>
                  <td className="py-3 px-4">Quotidienne</td>
                  <td className="py-3 px-4">Deux fois par jour</td>
                </tr>
                <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium">Alertes e-mail et Slack</td>
                  <td className="py-3 px-4 text-[#201e1d]/40">—</td>
                  <td className="py-3 px-4">Incluses</td>
                  <td className="py-3 px-4">Incluses</td>
                </tr>
                <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium">Webhook</td>
                  <td className="py-3 px-4 text-[#201e1d]/40">—</td>
                  <td className="py-3 px-4">Inclus</td>
                  <td className="py-3 px-4">Inclus</td>
                </tr>
                <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium">Historique des verdicts</td>
                  <td className="py-3 px-4 text-[#201e1d]/40">—</td>
                  <td className="py-3 px-4">Illimité</td>
                  <td className="py-3 px-4">Illimité</td>
                </tr>
                <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium">Rapport mensuel par client</td>
                  <td className="py-3 px-4 text-[#201e1d]/40">—</td>
                  <td className="py-3 px-4">Inclus</td>
                  <td className="py-3 px-4">Marque blanche</td>
                </tr>
                <tr className="hover:bg-[#201e1d]/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium">Accès API</td>
                  <td className="py-3 px-4 text-[#201e1d]/40">—</td>
                  <td className="py-3 px-4 text-[#201e1d]/40">—</td>
                  <td className="py-3 px-4">Inclus</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Explanatory 3-Grid Section */}
      <section className="border-b-2 border-[#201e1d]/15">
        <div className="w-full max-w-[1240px] mx-auto p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#201e1d]/15">
            <div className="bg-[#f3f2f2] p-8">
              <h3 className="text-[19px] font-heading font-extrabold text-[#201e1d] m-0 mb-2">
                Ce que vous refacturez
              </h3>
              <p className="m-0 text-[14px] text-[#201e1d]/80 leading-relaxed">
                La plupart des agences intègrent la veille IA à leur forfait de maintenance entre 15 et 30 € par site et par mois. La marge couvre le temps de correction quand une alerte tombe.
              </p>
            </div>
            <div className="bg-[#f3f2f2] p-8">
              <h3 className="text-[19px] font-heading font-extrabold text-[#201e1d] m-0 mb-2">
                Changer d&apos;offre
              </h3>
              <p className="m-0 text-[14px] text-[#201e1d]/80 leading-relaxed">
                Le palier s&apos;ajuste au prorata dès que vous dépassez votre quota de domaines. Aucune interruption de scan, aucune reprise de facturation annuelle.
              </p>
            </div>
            <div className="bg-[#f3f2f2] p-8">
              <h3 className="text-[19px] font-heading font-extrabold text-[#201e1d] m-0 mb-2">
                Résiliation
              </h3>
              <p className="m-0 text-[14px] text-[#201e1d]/80 leading-relaxed">
                En un clic depuis les paramètres. L&apos;historique reste consultable en lecture pendant 30 jours après la fin de l&apos;abonnement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-[#201e1d] text-[#f3f2f2]">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-[52px] flex flex-wrap gap-7 justify-between items-end">
          <h2 className="text-2xl sm:text-3xl md:text-[36px] lg:text-[38px] font-heading font-extrabold leading-[1.08] max-w-[26ch] text-[#f3f2f2] m-0">
            Commencez par un domaine. Ajoutez les autres quand le verdict vous aura convaincu.
          </h2>
          <Link
            href="/register"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[10px] bg-[#ec3013] text-white font-heading font-bold text-[14px] hover:bg-[#dd2b0f] active:bg-[#ae1800] transition-colors shadow-sm shrink-0"
          >
            Ouvrir un compte agence
          </Link>
        </div>
      </section>
    </div>
  );
}
