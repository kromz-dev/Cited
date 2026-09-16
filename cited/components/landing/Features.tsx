import Link from "next/link";

export function Features() {
  return (
    <div className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--color-divider,#eaeaea)]">
      <div className="absolute left-[-200px] bottom-[-180px] w-[560px] h-[560px] opacity-5 animate-[cited-drift_140s_linear_infinite_reverse] pointer-events-none">
        <svg viewBox="0 0 200 200" width="560" height="560" fill="none" stroke="var(--color-text)" strokeWidth="1">
          <ellipse cx="100" cy="34" rx="90" ry="24"></ellipse>
          <ellipse cx="100" cy="70" rx="70" ry="19"></ellipse>
          <ellipse cx="100" cy="103" rx="52" ry="15"></ellipse>
          <ellipse cx="100" cy="132" rx="35" ry="11"></ellipse>
          <ellipse cx="100" cy="158" rx="19" ry="6"></ellipse>
        </svg>
      </div>
      <div className="max-w-[1080px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start relative z-10">
        <div>
          <h2 className="text-[clamp(26px,3vw,34px)] font-bold mb-4">Le portefeuille, d'un coup d'œil</h2>
          <p className="mb-6 text-[15px] opacity-90 leading-relaxed">
            Une ligne par domaine, le dernier verdict connu, la date du prochain scan. Le référencement IA devient une ligne défendable de votre contrat de maintenance.
          </p>
          <div className="flex flex-col gap-3 text-sm opacity-80 border-t border-[var(--color-divider,#eaeaea)] pt-5">
            <div>Rapport mensuel exportable, à joindre au reporting client.</div>
            <div>Historique des verdicts par domaine, pour situer la régression dans le temps.</div>
            <div>Webhook pour brancher vos alertes sur votre propre outillage.</div>
          </div>
          <Link href="/dashboard" className="inline-flex items-center justify-center h-[46px] px-6 mt-6 border-2 border-[var(--color-text)] rounded-md font-medium hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors">
            Voir le dashboard
          </Link>
        </div>
        <div className="shadow-lg rounded-xl overflow-hidden bg-[var(--color-bg)] border border-[var(--color-divider,#eaeaea)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 border-b border-[var(--color-divider,#eaeaea)]">
              <tr>
                <th className="p-4 font-semibold">Domaine</th>
                <th className="p-4 font-semibold">Statut IA</th>
                <th className="p-4 font-semibold text-right">Dernier scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-divider,#eaeaea)]">
              <tr>
                <td className="p-4 font-mono text-xs">atelier-boreal.fr</td>
                <td className="p-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">OK</span></td>
                <td className="p-4 text-right opacity-60 text-xs">il y a 2 h</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-xs">client-vitrine.bubbleapps.io</td>
                <td className="p-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)] text-[var(--color-bg)]">Bloqué 403</span></td>
                <td className="p-4 text-right opacity-60 text-xs">il y a 2 h</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-xs">maison-verdier.com</td>
                <td className="p-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-accent)] text-[var(--color-bg)]">Coquille vide</span></td>
                <td className="p-4 text-right opacity-60 text-xs">il y a 3 h</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-xs">studio-lami.fr</td>
                <td className="p-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">OK</span></td>
                <td className="p-4 text-right opacity-60 text-xs">il y a 3 h</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
