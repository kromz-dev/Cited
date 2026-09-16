import { groqPlainJson } from "../engines/groq";
import { db } from "../db";

interface FailedRun {
  promptText: string;
  family?: string;
  snippet?: string | null;
}

interface CorrectionOutput {
  contentCorrection: string;
  jsonLdCorrection: string;
  llmsTxtCorrection: string;
}

export async function generateCorrectionsForCampaign(campaignId: string, failedRuns: FailedRun[], brandName: string, industry: string | null) {
  if (failedRuns.length === 0) return;

  const queriesList = failedRuns.map(r => `- [${r.family || "UNKNOWN"}] "${r.promptText}"`).join("\n");

  const instruction = `
Tu es un expert SEO spécialisé dans l'optimisation pour les moteurs de réponse IA (AEO / GEO).
La marque "${brandName}" (secteur: ${industry || "Non spécifié"}) est INVISIBLE dans les réponses de l'IA (ChatGPT, Perplexity) pour les requêtes suivantes de clients potentiels :
${queriesList}

Ton but est de fournir un plan d'action AEO ultra-concret basé sur l'étape du parcours client (Funnel) où la marque a échoué :
- Si l'échec est sur un "PROBLEM" (Haut de tunnel) : L'action doit proposer de créer un contenu éducatif/FAQ. Format ciblé AEO : un paragraphe ultra-dense et clair de 40-60 mots avec des puces (bullet points).
- Si l'échec est sur une "SOLUTION" (Milieu de tunnel) : L'action doit optimiser la sémantique de la Landing Page principale.
- Si l'échec est sur une "COMPARISON" (Bas de tunnel) : L'action doit exiger la création d'une page "Alternative à [Concurrent]" et recommander fortement de collecter des avis sur G2/Capterra pour forger un "Entity Consensus" (crucial pour l'IA).

Génère 3 correctifs techniques :
1. "contentCorrection" : La recommandation stratégique de contenu (texte ou plan d'action) selon les règles AEO ci-dessus.
2. "jsonLdCorrection" : Un objet JSON-LD (Schema.org) pertinent (ex: FAQPage, SoftwareApplication ou ItemList) pour structurer cette page.
3. "llmsTxtCorrection" : Le texte Markdown optimisé pour un fichier "/llms.txt" afin que les bots d'IA (GPTBot) comprennent le positionnement de la marque face aux requêtes échouées.

Réponds STRICTEMENT avec ce format JSON valide :
{
  "contentCorrection": "Recommandation AEO détaillée...",
  "jsonLdCorrection": "{ \\"@context\\": \\"https://schema.org\\", ... }",
  "llmsTxtCorrection": "Contenu Markdown pour llms.txt..."
}
`;

  const schemaHint = "JSON output only";

  try {
    const output = await groqPlainJson<CorrectionOutput>(instruction, schemaHint);

    // Save to DB
    await db.correction.createMany({
      data: [
        {
          campaignId,
          type: "CONTENT",
          title: "Ajouter un paragraphe optimisé",
          content: output.contentCorrection,
          priority: "HIGH",
          targetQuery: "Multiples requêtes"
        },
        {
          campaignId,
          type: "JSONLD",
          title: "Intégrer les données structurées",
          content: output.jsonLdCorrection,
          priority: "MEDIUM"
        },
        {
          campaignId,
          type: "LLMS_TXT",
          title: "Créer un fichier llms.txt",
          content: output.llmsTxtCorrection,
          priority: "HIGH"
        }
      ]
    });

  } catch (e) {
    console.error("Erreur lors de la génération des correctifs :", e);
    // On ne fait pas échouer la campagne pour ça
  }
}
