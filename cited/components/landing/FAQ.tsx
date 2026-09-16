import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      q: "Qu'est-ce que Cited ?",
      a: "Cited est un scanner technique et un proxy géré pour les sites modernes (React, SPA). Il permet à votre contenu d'être lu et cité par les moteurs de recherche IA comme Perplexity, ChatGPT et Claude."
    },
    {
      q: "Pourquoi les IA ne peuvent-elles pas lire mon site ?",
      a: "La plupart des crawlers IA n'exécutent pas le JavaScript. Si votre site génère son contenu dynamiquement côté client (SPA), les bots IA ne voient qu'une page vide et ignorent votre contenu."
    },
    {
      q: "Comment fonctionne le proxy (Managed Fix) de Cited ?",
      a: "Notre proxy détecte les requêtes provenant des bots IA. Il redirige ces requêtes vers notre infrastructure cloud qui exécute le JavaScript et renvoie le HTML pur instantanément à l'IA."
    },
    {
      q: "Cela impacte-t-il mes utilisateurs normaux ?",
      a: "Non. Le middleware Cited identifie précisément les User-Agents des IA. Vos visiteurs humains continuent d'utiliser votre application React/SPA normalement sans aucun ralentissement."
    },
    {
      q: "Puis-je coder cela moi-même avec Puppeteer ?",
      a: "Oui, mais maintenir un cluster Puppeteer coûte cher et demande du temps. Il faut aussi gérer les caches et maintenir à jour la liste des User-Agents IA. Cited fait tout cela pour vous."
    },
    {
      q: "Quelles IA sont prises en charge ?",
      a: "Nous simulons et optimisons pour GPTBot (OpenAI), ClaudeBot (Anthropic), PerplexityBot, Google-Extended (Gemini), et OmgiliBot. La liste est mise à jour en continu."
    }
  ];

  // Schema Markup for SEO
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <section id="faq" className="bg-white px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Questions Fréquentes
          </h2>
          <p className="text-lg text-muted">
            Tout ce que vous devez savoir sur la visibilité IA (AEO).
          </p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <Accordion className="w-full space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem 
              key={idx} 
              value={`item-${idx}`} 
              className="rounded-xl border border-line bg-paper-deep/50 px-6 data-[state=open]:bg-white data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left font-semibold text-ink hover:text-cited hover:no-underline [&[data-state=open]]:text-cited">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
