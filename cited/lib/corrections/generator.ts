import { groqPlainJson } from "../engines/groq";
import { db } from "../db";
import { z } from "zod";

interface FailedRun {
  promptText: string;
  family?: string;
  snippet?: string | null;
}

const CorrectionOutputSchema = z.object({
  contentCorrection: z.string().trim().min(20).max(8_000),
  jsonLdCorrection: z.string().trim().min(2).max(12_000),
  llmsTxtCorrection: z.string().trim().min(20).max(8_000),
});

type CorrectionOutput = z.infer<typeof CorrectionOutputSchema>;

function validateJsonLd(value: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Le correctif JSON-LD n'est pas un JSON valide.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Le correctif JSON-LD doit être un objet.");
  }
  const record = parsed as Record<string, unknown>;
  if (record["@context"] !== "https://schema.org" || typeof record["@type"] !== "string") {
    throw new Error("Le correctif JSON-LD doit contenir @context Schema.org et @type.");
  }
  return JSON.stringify(parsed, null, 2);
}

export async function generateCorrectionsForCampaign(
  campaignId: string,
  failedRuns: FailedRun[],
  brandName: string,
  industry: string | null,
) {
  if (failedRuns.length === 0) return;

  const queriesList = failedRuns
    .map((run) => `- [${run.family || "UNKNOWN"}] "${run.promptText.slice(0, 500)}"`)
    .join("\n");

  const instruction = `
Tu es un expert SEO spécialisé dans l'optimisation pour les moteurs de réponse IA.
La marque "${brandName}" (secteur: ${industry || "Non spécifié"}) est absente des
réponses pour les requêtes suivantes :
${queriesList}

Génère exactement trois correctifs exploitables :
1. contentCorrection : recommandation ou texte AEO concret adapté à la famille de requête.
2. jsonLdCorrection : une chaîne contenant un objet JSON-LD Schema.org valide.
3. llmsTxtCorrection : un contenu Markdown directement copiable dans /llms.txt.
Le JSON-LD doit avoir "@context": "https://schema.org" et un "@type" pertinent.
`;

  try {
    const rawOutput = await groqPlainJson(instruction, CorrectionOutputSchema);
    const output: CorrectionOutput = {
      ...rawOutput,
      jsonLdCorrection: validateJsonLd(rawOutput.jsonLdCorrection),
    };

    await db.correction.createMany({
      data: [
        {
          campaignId,
          type: "CONTENT",
          title: "Ajouter un contenu optimisé",
          content: output.contentCorrection,
          priority: "HIGH",
          targetQuery: "Multiples requêtes",
        },
        {
          campaignId,
          type: "JSONLD",
          title: "Intégrer les données structurées",
          content: output.jsonLdCorrection,
          priority: "MEDIUM",
        },
        {
          campaignId,
          type: "LLMS_TXT",
          title: "Créer un fichier llms.txt",
          content: output.llmsTxtCorrection,
          priority: "HIGH",
        },
      ],
    });
  } catch (error) {
    console.error("Erreur lors de la génération des correctifs :", error);
  }
}
