import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-ink py-32 text-center">
      {/* Background decoration */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cited/20 blur-[120px]" />
      
      <div className="relative mx-auto max-w-4xl px-6">
        <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
          Ne laissez plus l'IA <br className="hidden md:block" />
          <span className="text-cited-light">citer vos concurrents.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-300">
          Vérifiez votre site gratuitement aujourd'hui et installez notre proxy en moins de 5 minutes pour retrouver votre visibilité dans ChatGPT et Perplexity.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/register">
            <Button size="lg" className="bg-cited text-lg font-bold text-white hover:bg-cited/90 px-8 py-6 rounded-full shadow-[0_0_40px_rgba(20,120,102,0.4)] transition-all hover:scale-105">
              Créer un compte gratuit <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-gray-600 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white px-8 py-6 rounded-full text-lg transition-all">
              Voir les tarifs
            </Button>
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-gray-400">
          Aucune carte bancaire requise · Installation en 5 min
        </p>
      </div>
    </section>
  );
}
