import { Metadata } from "next";
import Link from "next/link";
import { AuditFormWrapper } from "./AuditFormWrapper";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const domain = decodeURIComponent((await params).domain);
  return {
    title: `Visibilité IA de ${domain} | Cited`,
    description: `Mesurez la couverture de ${domain} dans les moteurs de réponse.`,
  };
}

export default async function AnalyseDomainPage({ params }: PageProps) {
  const domain = decodeURIComponent((await params).domain);

  return (
    <main className="min-h-screen bg-paper px-6 py-8 text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Cited<span className="text-cobalt">.</span>
        </Link>
        <nav className="flex gap-5 text-sm text-ink-2">
          <Link href="/pricing" className="hover:text-ink">Tarifs</Link>
          <Link href="/dashboard" className="hover:text-ink">Connexion</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-4xl py-20 text-center">
        <Badge variant="info">Audit public · {domain}</Badge>
        <h1 className="mt-6 text-5xl leading-tight sm:text-6xl">
          Votre marque est-elle <span className="text-cobalt">visible</span> dans les réponses IA ?
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink-2">
          Un diagnostic lisible de votre couverture sur des requêtes qui comptent.
        </p>
        <div className="mt-12">
          <AuditFormWrapper initialDomain={domain} />
        </div>
      </section>
    </main>
  );
}
