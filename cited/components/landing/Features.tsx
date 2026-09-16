import { Activity, ShieldCheck, Zap } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Simulateur d'User-Agents exacts",
      description:
        "Nous avons recréé les environnements exacts utilisés par GPTBot, ClaudeBot, et Perplexity. Voyez précisément ce qu'ils voient lorsqu'ils crawlent vos pages, ligne par ligne de code HTML.",
      icon: <Activity className="h-6 w-6 text-cited" />,
    },
    {
      title: "Monitoring de régression IA",
      description:
        "Un déploiement peut casser le rendu côté serveur par erreur. Cited surveille vos pages critiques en continu et vous alerte instantanément si l'IA ne peut plus lire votre contenu.",
      icon: <ShieldCheck className="h-6 w-6 text-cited" />,
    },
    {
      title: "Correctif Géré (Managed Proxy)",
      description:
        "Pas besoin de réécrire votre app en SSR complexe. Ajoutez simplement notre middleware Edge (Next.js, Cloudflare, etc.). Il détecte les bots et leur sert une version HTML pré-rendue instantanément.",
      icon: <Zap className="h-6 w-6 text-cited" />,
    },
  ];

  return (
    <section id="features" className="relative overflow-hidden bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
            La solution complète pour le <span className="text-cited">SEO IA</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Diagnostiquez vos problèmes de visibilité, surveillez vos régressions et déployez un correctif robuste en moins de 5 minutes.
          </p>
        </div>

        <div className="flex flex-col gap-24">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`flex flex-col gap-12 lg:flex-row lg:items-center ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cited-light shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-ink sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="text-lg leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
              <div className="flex-1">
                {/* Visual Placeholder / Code Mockup */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-ink-soft p-6 shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <pre className="mt-4 overflow-x-auto text-sm text-gray-300">
                    <code>
                      {idx === 0 &&
`> Scanning https://yoursite.com...
[✔] Googlebot: 1200 words
[✖] GPTBot: 0 words (Blank Page)
[✖] ClaudeBot: 0 words (Blank Page)

Recommendation: Implement Prerendering.`}
                      {idx === 1 &&
`> Regression Alert: /pricing
Status: FAILED
Details: "div#root is empty. Missing SSR."
Time: 14:03 UTC

Sending email alert to team@yoursite.com...`}
                      {idx === 2 &&
`import { citedMiddleware } from "@cited/next";

export default citedMiddleware({
  apiKey: process.env.CITED_API_KEY,
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};`}
                    </code>
                  </pre>
                  {/* Decorative glow */}
                  <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-cited/30 blur-3xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
