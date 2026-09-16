import { Metadata } from "next";
import { AuditFormWrapper } from "./AuditFormWrapper";
import { MarketingHeader } from "@/components/MarketingHeader";

interface PageProps {
  params: Promise<{
    domain: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain } = await params;
  const decodedDomain = decodeURIComponent(domain);

  return {
    title: `La marque ${decodedDomain} est-elle citée par les IA ? | Cited`,
    description: `Découvrez la visibilité de ${decodedDomain} sur ChatGPT, Claude, Gemini et Perplexity. Obtenez un audit SEO IA immédiat.`,
    openGraph: {
      title: `Visibilité IA pour ${decodedDomain}`,
      description: `Testez ${decodedDomain} sur les moteurs de réponses IA.`,
    }
  };
}

export default async function AnalyseDomainPage({ params }: PageProps) {
  const { domain } = await params;
  const decodedDomain = decodeURIComponent(domain);
  // On devine le nom de marque en supprimant l'extension
  const guessedBrandName = decodedDomain.split(".")[0];
  const formattedBrandName = guessedBrandName.charAt(0).toUpperCase() + guessedBrandName.slice(1);

  return (
    <main className="min-h-screen bg-[var(--color-paper)] flex flex-col">
      <MarketingHeader />

      <div className="flex-grow py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-[var(--color-ink)]">
            Est-ce que <span className="text-[var(--color-cited)]">{decodedDomain}</span> est recommandé par ChatGPT ?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Obtenez une première mesure de visibilité IA sur un échantillon de requêtes. Le résultat sert de point de départ pour votre suivi.
          </p>
        </div>

        {/* Le formulaire client */}
        <AuditFormWrapper initialDomain={decodedDomain} initialBrandName={formattedBrandName} />
      </div>

      <footer className="py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Cited. Tous droits réservés.
      </footer>
    </main>
  );
}
