export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Scannez votre site",
      description: "Entrez votre URL dans notre moteur. Nous simulons immédiatement les bots IA et comparons ce qu'ils voient par rapport à un navigateur normal.",
    },
    {
      number: "02",
      title: "Installez le Middleware",
      description: "Ajoutez un fichier de 5 lignes à votre projet (Next.js, Express, ou Cloudflare Workers). Notre proxy intercepte uniquement le trafic des IA.",
    },
    {
      number: "03",
      title: "Soyez Cité",
      description: "Vos pages sont rendues en HTML pur (via Puppeteer Cloud) et servies aux IA en millisecondes. Vous retrouvez votre visibilité instantanément.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-paper-deep px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Comment ça marche ?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Trois étapes simples pour passer de "invisible" à "cité comme référence".
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col rounded-2xl border border-line bg-white p-8 shadow-sm">
              <span className="mb-4 font-heading text-6xl font-black text-cited/10">
                {step.number}
              </span>
              <h3 className="mb-3 text-xl font-bold text-ink">{step.title}</h3>
              <p className="text-muted leading-relaxed">{step.description}</p>
              
              {idx < steps.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 md:block">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-line">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
