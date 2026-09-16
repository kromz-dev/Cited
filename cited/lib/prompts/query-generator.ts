/**
 * Générateur de requêtes (prompts) intelligent via LLM.
 * 
 * Simule le parcours d'achat (Funnel) d'un client potentiel.
 */

import { groqPlainJson } from "../engines/groq";

export type PromptFamily = "PROBLEM" | "SOLUTION" | "COMPARISON" | "DISCOVERY" | "BRAND";

export interface GeneratedPrompt {
  text: string;
  family: PromptFamily;
}

export async function generateSmartPrompts(domain: string, brandName: string, engine: any): Promise<GeneratedPrompt[]> {
  const prompt = `
    Tu es un expert en référencement SEO et marketing.
    Analyse cette entreprise : Marque = "${brandName}", Site web = "${domain}".
    
    Détermine son secteur d'activité, puis mets-toi dans la peau de ses clients potentiels en France.
    Génère EXACTEMENT 5 requêtes naturelles que ses clients taperaient dans Google ou ChatGPT, réparties ainsi :
    - 2 requêtes de "PROBLÈME" (le client a une douleur/besoin mais ne cherche pas de logiciel, ex: "comment gérer mes notes de frais", "réduire turnover équipe")
    - 2 requêtes de "SOLUTION" (le client cherche une catégorie d'outil, ex: "meilleur logiciel de notes de frais", "outil RH en ligne")
    - 1 requête de "COMPARAISON" (le client compare une alternative au concurrent principal de la marque, ex: "alternative à [Concurrent_Majeur]" ou "[Concurrent] vs [Autre_Concurrent]")
    
    ATTENTION: Ne cite JAMAIS directement la marque "${brandName}" dans les requêtes, sauf si c'est pour la comparer, mais préfère utiliser ses concurrents pour voir si elle apparaît en alternative.
    
    Tu dois absolument répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte autour, avec ce format exact :
    {
      "industry": "Secteur d'activité",
      "competitors": ["Concurrent1", "Concurrent2"],
      "prompts": [
        {"text": "requête problème 1", "family": "PROBLEM"},
        {"text": "requête problème 2", "family": "PROBLEM"},
        {"text": "requête solution 1", "family": "SOLUTION"},
        {"text": "requête solution 2", "family": "SOLUTION"},
        {"text": "requête comparaison 1", "family": "COMPARISON"}
      ]
    }
  `;

  try {
    const schemaHint = `{
      "industry": "string",
      "competitors": ["string", "string"],
      "prompts": [
        {"text": "string", "family": "PROBLEM"}
      ]
    }`;
    const parsed = await groqPlainJson<any>(prompt, schemaHint);
    
    if (parsed.prompts && Array.isArray(parsed.prompts) && parsed.prompts.length === 5) {
      return parsed.prompts;
    }
    throw new Error("Format de prompts invalide");
  } catch (error) {
    console.error("Erreur lors de la génération intelligente des prompts:", error);
    // Fallback de sécurité
    return [
      { text: `Comment résoudre le problème principal résolu par ${brandName} ?`, family: "PROBLEM" },
      { text: `Quels sont les défis liés au domaine de ${brandName} ?`, family: "PROBLEM" },
      { text: `Meilleur outil comme ${brandName}`, family: "SOLUTION" },
      { text: `Solution logicielle pour le secteur de ${brandName}`, family: "SOLUTION" },
      { text: `Alternative à ${brandName}`, family: "COMPARISON" }
    ];
  }
}

import { z } from "zod";

const GenerationSchema = z.object({
  industry: z.string(),
  competitors: z.array(z.object({ name: z.string(), domain: z.string() })).max(5),
  prompts: z.array(z.string()).max(25),
});

export type BrandGeneration = z.infer<typeof GenerationSchema>;

export async function detectBrandContext(domain: string, brandName: string): Promise<BrandGeneration> {
  const prompt = `
    Tu es un expert en référencement SEO et marketing IA.
    Analyse le domaine suivant: ${domain} pour la marque "${brandName}".
    
    1. Détermine le secteur d'activité très court (ex: "Logiciel de facturation", "Vente de chaussures").
    2. Trouve 3 à 5 concurrents directs probables (nom + domaine).
    3. Génère entre 15 et 20 requêtes naturelles que des clients potentiels taperaient dans Google/ChatGPT pour trouver ce type de produit ou de service, en incluant quelques requêtes de comparaison.
  `;
  
  const schemaHint = `
    Retourne STRICTEMENT le format JSON suivant:
    {
      "industry": "string",
      "competitors": [{"name": "string", "domain": "string"}],
      "prompts": ["string"]
    }
  `;

  try {
    const rawData = await groqPlainJson<any>(prompt, schemaHint);
    return GenerationSchema.parse(rawData);
  } catch (error) {
    console.error("Erreur détection marque:", error);
    return {
      industry: "Secteur inconnu",
      competitors: [],
      prompts: [
        `${brandName} avis`,
        `alternative à ${brandName}`,
        `meilleur outil comme ${brandName}`
      ]
    };
  }
}
