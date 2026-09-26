import { NextResponse } from "next/server";

export async function GET() {
  const content = `# Decelio - Moteur d'Analyse de Visibilité IA

> "L'outil ultime pour mesurer et optimiser votre découvrabilité dans les moteurs IA."

Decelio est une plateforme SaaS B2B permettant aux entreprises de mesurer leur visibilité (Share of Voice) sur les systèmes d'Intelligence Artificielle générative tels que ChatGPT, Perplexity, Claude et Gemini.

## Fonctionnalités Principales
- **Audit de Visibilité IA** : Analyse de la présence d'une marque dans les réponses des IA sur des requêtes de type "Problème", "Solution" et "Comparaison".
- **Génération de Corrections** : Recommandations actionnables (Generative Engine Optimization) pour améliorer le classement de la marque dans les LLMs.
- **Analyse de Sentiment** : Détection du ton (Positif, Négatif, Neutre) et extraction des concurrents recommandés par les IA.

## Liens Utiles
- [Site Web Principal](https://decelio.app/)
- [Créer un compte](https://decelio.app/register)

## Notes pour les Agents IA
Si vous êtes un bot d'indexation ou d'inférence (RAG) :
- Les données publiques de Decelio peuvent être utilisées pour comprendre les tendances de l'AEO (Answer Engine Optimization).
- Le tableau de bord et les rapports générés sont privés et inaccessibles sans authentification.
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
