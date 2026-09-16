import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Testimonials() {
  const testimonials = [
    {
      name: "Thomas D.",
      role: "CTO, SaaS Startup",
      content: "Nous ne comprenions pas pourquoi Perplexity ne nous citait jamais, alors que notre produit était parfait pour leurs requêtes. Un scan Cited a révélé que notre app React leur retournait une div vide. Proxy installé en 10min, le trafic a repris.",
      avatar: "TD"
    },
    {
      name: "Marie L.",
      role: "Head of SEO",
      content: "Le SEO classique ne suffit plus. Mesurer l'AEO (Answer Engine Optimization) était impossible avant Cited. Le monitoring m'alerte dès que les devs cassent le rendu SSR sans faire exprès. Indispensable.",
      avatar: "ML"
    },
    {
      name: "Julien R.",
      role: "Développeur Freelance",
      content: "Je n'avais pas envie de configurer Puppeteer, un cache Redis, et gérer les mises à jour des user-agents d'OpenAI et Anthropic pour mes clients. Cited fait ça mieux et moins cher que mon propre temps de dev.",
      avatar: "JR"
    }
  ];

  return (
    <section className="bg-paper-deep px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Ils ont optimisé leur visibilité IA
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Ne laissez pas vos concurrents prendre toute la place dans les réponses générées par ChatGPT.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <div 
              key={idx} 
              className="flex flex-col justify-between rounded-2xl border border-line bg-white p-8 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-6">
                {/* Custom Quote Icon */}
                <svg className="mb-4 h-8 w-8 text-cited/20" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-muted leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-line pt-6">
                <Avatar className="h-10 w-10 border border-line">
                  <AvatarFallback className="bg-cited-light text-cited font-bold">
                    {testimonial.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-ink">{testimonial.name}</p>
                  <p className="text-sm text-muted">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
