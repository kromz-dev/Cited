import Link from "next/link";

export function PricingPreview() {
  return (
    <div className="py-16 lg:py-24 border-b border-[var(--color-divider,#eaeaea)]">
      <div className="max-w-[1080px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent-700,#ec3013)] mb-4">
            Offre agence
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-extrabold text-[clamp(44px,6vw,64px)] leading-none tracking-tight">99 €</span>
            <span className="text-[15px] opacity-80">par mois, sans engagement</span>
          </div>
          <p className="m-0 text-[15px] opacity-90 max-w-[48ch] leading-relaxed">
            Jusqu'à 20 domaines surveillés, scan quotidien, alertes Slack et e-mail, historique complet. Soit 5 € par site et par mois à refacturer dans votre contrat de maintenance.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/register" className="flex items-center justify-center min-h-[48px] px-6 rounded-md font-medium text-[var(--color-bg)] bg-[var(--color-text)] transition-transform duration-160 hover:-translate-y-0.5 w-full">
            Ouvrir un compte agence
          </Link>
          <Link href="/pricing" className="flex items-center justify-center min-h-[48px] px-6 rounded-md font-medium border-2 border-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors w-full">
            Comparer les offres
          </Link>
          <p className="text-xs opacity-60 m-0 text-center mt-2">
            Le scan gratuit ne demande ni compte ni carte.
          </p>
        </div>
      </div>
    </div>
  );
}
