import { ServerCrash, Bot, FileWarning } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Problem() {
  return (
    <section id="problem" className="bg-paper px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-3xl font-bold tracking-tight text-ink md:text-5xl">
          Les IA sont aveugles face à votre site.
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-lg text-muted">
          80% des sites modernes construits avec React, Vue ou d'autres frameworks SPA apparaissent comme une page blanche aux yeux des bots d'Intelligence Artificielle. Vous perdez des milliers de citations potentielles.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
        <Card className="flex flex-col items-center border-none bg-white p-8 text-center shadow-panel transition-transform hover:-translate-y-1">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rival-light text-rival">
            <Bot className="h-8 w-8" />
          </div>
          <h3 className="mb-3 font-heading text-xl font-semibold text-ink">Les Bots rejettent le JS</h3>
          <p className="text-sm leading-relaxed text-muted">
            Contrairement à Googlebot, les crawlers de ChatGPT et Perplexity ne prennent souvent pas le temps (ou n'ont pas la capacité) d'exécuter votre JavaScript.
          </p>
        </Card>

        <Card className="flex flex-col items-center border-none bg-white p-8 text-center shadow-panel transition-transform hover:-translate-y-1">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rival-light text-rival">
            <FileWarning className="h-8 w-8" />
          </div>
          <h3 className="mb-3 font-heading text-xl font-semibold text-ink">Contenu Invisible</h3>
          <p className="text-sm leading-relaxed text-muted">
            Si votre contenu est chargé dynamiquement via des appels API côté client, les IA ne verront qu'une balise div vide. Votre expertise est ignorée.
          </p>
        </Card>

        <Card className="flex flex-col items-center border-none bg-white p-8 text-center shadow-panel transition-transform hover:-translate-y-1">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rival-light text-rival">
            <ServerCrash className="h-8 w-8" />
          </div>
          <h3 className="mb-3 font-heading text-xl font-semibold text-ink">Perte de Trafic</h3>
          <p className="text-sm leading-relaxed text-muted">
            Le futur de la recherche est génératif (GEO/AEO). Si l'IA ne peut pas lire vos informations, elle citera vos concurrents dans ses réponses.
          </p>
        </Card>
      </div>
    </section>
  );
}
