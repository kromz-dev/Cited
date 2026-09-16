import { Check, X } from "lucide-react";

export function Comparison() {
  return (
    <section id="comparison" className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Cited vs DIY (Faire soi-même)
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Oui, vous pouvez coder votre propre solution avec Puppeteer. Mais est-ce que ça vaut le coût de maintenance ?
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-line">
            <div className="p-6 font-semibold text-muted md:border-r border-line flex items-center">
              Fonctionnalité
            </div>
            <div className="bg-paper-deep p-6 text-center md:border-r border-line">
              <span className="font-heading text-xl font-bold text-ink">DIY (Puppeteer)</span>
            </div>
            <div className="bg-cited/5 p-6 text-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-cited"></div>
              <span className="font-heading text-xl font-bold text-cited">Cited</span>
            </div>
          </div>

          {[
            { label: "Rendu HTML dynamique", diy: true, cited: true },
            { label: "Gestion des caches", diy: false, cited: true },
            { label: "Mise à jour des User-Agents IA", diy: false, cited: true },
            { label: "Infrastructure serveur gérée", diy: false, cited: true },
            { label: "Monitoring et Alertes email", diy: false, cited: true },
            { label: "Coût de mise en place", diy: "1 à 2 semaines", cited: "5 minutes" },
          ].map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 border-b border-line last:border-0">
              <div className="p-6 text-sm font-medium text-ink md:border-r border-line flex items-center">
                {row.label}
              </div>
              <div className="p-6 text-center md:border-r border-line flex items-center justify-center">
                {typeof row.diy === "boolean" ? (
                  row.diy ? <Check className="h-5 w-5 text-muted" /> : <X className="h-5 w-5 text-muted/30" />
                ) : (
                  <span className="text-sm text-muted">{row.diy}</span>
                )}
              </div>
              <div className="bg-cited/5 p-6 text-center flex items-center justify-center">
                {typeof row.cited === "boolean" ? (
                  row.cited ? <Check className="h-5 w-5 text-cited" /> : <X className="h-5 w-5 text-muted/30" />
                ) : (
                  <span className="text-sm font-semibold text-cited">{row.cited}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
