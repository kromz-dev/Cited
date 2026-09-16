import { groqPlainJson } from "../engines/groq";
import { z } from "zod";

const JudgeResultSchema = z.object({
  isMentioned: z.boolean(),
  position: z.number().nullable(),
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).nullable(),
  competitorsRecommended: z.array(z.string()),
  snippet: z.string().nullable(),
  metrics: z.object({
    claimsGenerated: z.number(),
    claimsCorrect: z.number(),
    hallucinations: z.boolean(),
    positionScore: z.number(),
    entitySalience: z.number()
  }).nullable()
});

export type JudgeResult = z.infer<typeof JudgeResultSchema>;

export async function evaluateBrandMention(text: string, brandName: string, groundTruth?: string | null): Promise<JudgeResult> {
  if (!text || !brandName) {
    return { isMentioned: false, position: null, sentiment: null, competitorsRecommended: [], snippet: null, metrics: null };
  }

  const prompt = `
    Tu es un juge IA ultra-strict spécialisé en Analyse de Sentiment et évaluation RAG (Retrieval-Augmented Generation).
    Je vais te fournir la réponse d'un moteur de recherche IA. Ton but est d'analyser cette réponse pour la marque "${brandName}".
    
    ${groundTruth ? `\nVÉRITÉ TERRAIN (Ground Truth) de la marque :\n"${groundTruth}"\nUtilise cela pour vérifier les hallucinations.` : ""}

    RÈGLES D'ÉVALUATION:
    1. isMentioned : true SI ET SEULEMENT SI la marque "${brandName}" est EXPLICITEMENT nommée ou recommandée dans le texte.
    2. position : Si isMentioned est true, indique à quelle position (1, 2, 3...) la marque apparaît dans la liste des recommandations ou des paragraphes. Si pas de liste, met 1.
    3. sentiment : "POSITIVE" si la marque est recommandée ou félicitée. "NEGATIVE" si elle est déconseillée ou critiquée. "NEUTRAL" si elle est juste citée à titre d'information neutre.
    4. competitorsRecommended : Liste des noms des outils/entreprises concurrents explicitement recommandés dans le texte au lieu ou en plus de la marque. (Garde les noms courts).
    5. snippet : Un extrait court (1-2 phrases maximum) du texte justifiant l'analyse.

    MÉTRIQUES AVANCÉES (RAGChecker, ARES, GEO):
    6. claimsGenerated : Le nombre total d'affirmations factuelles sur la marque.
    7. claimsCorrect : Le nombre d'affirmations correctes par rapport à la VÉRITÉ TERRAIN (si non fournie, égale à claimsGenerated).
    8. hallucinations : true si le texte contient de fausses informations flagrantes par rapport à la VÉRITÉ TERRAIN.
    9. positionScore : 1.0 si la marque est citée au début, 0.5 au milieu, 0.1 à la fin. (0 si absente).
    10. entitySalience : Score de 0.0 à 1.0 mesurant si la marque est le SUJET CENTRAL (1.0) ou juste mentionnée en passant (0.1).

    TEXTE À ANALYSER:
    """
    ${text}
    """
  `;

  const schemaHint = `
    Retourne STRICTEMENT le format JSON suivant:
    {
      "isMentioned": boolean,
      "position": number | null,
      "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE" | null,
      "competitorsRecommended": ["string"],
      "snippet": "string",
      "metrics": {
        "claimsGenerated": number,
        "claimsCorrect": number,
        "hallucinations": boolean,
        "positionScore": number,
        "entitySalience": number
      }
    }
  `;

  try {
    const rawData = await groqPlainJson<any>(prompt, schemaHint);
    
    // Normalisation basique
    if (rawData.isMentioned === false) {
      rawData.position = null;
      rawData.sentiment = null;
      rawData.snippet = null;
      if (rawData.metrics) {
        rawData.metrics.positionScore = 0;
        rawData.metrics.entitySalience = 0;
      }
    }

    return JudgeResultSchema.parse(rawData);
  } catch (error) {
    console.error("Erreur lors du jugement LLM, fallback sur Regex:", error);
    // Fallback Regex en cas d'erreur de l'IA
    return fallbackRegexDetect(text, brandName);
  }
}

// Fallback Regex si l'API Groq est down ou format invalide
function fallbackRegexDetect(text: string, brandName: string): JudgeResult {
  const normalizedText = text.toLowerCase();
  const normalizedBrand = brandName.toLowerCase().trim();
  const isAlphaNum = /^[a-z0-9]+$/i.test(normalizedBrand);
  
  let isMentioned = false;
  let matchIndex = -1;

  if (isAlphaNum) {
    const regex = new RegExp(`\\b${normalizedBrand}\\b`, 'i');
    const match = regex.exec(normalizedText);
    if (match) {
      isMentioned = true;
      matchIndex = match.index;
    }
  } else {
    matchIndex = normalizedText.indexOf(normalizedBrand);
    isMentioned = matchIndex !== -1;
  }

  if (!isMentioned) {
    return { isMentioned: false, position: null, sentiment: null, competitorsRecommended: [], snippet: null, metrics: null };
  }

  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(text.length, matchIndex + brandName.length + 50);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  const textBefore = normalizedText.substring(0, matchIndex);
  const itemsCount = (textBefore.match(/(?:^|\n)\s*(?:[-*]|\d+\.)/g) || []).length;
  const position = itemsCount > 0 ? itemsCount : 1;

  return { 
    isMentioned, 
    position, 
    sentiment: "NEUTRAL", // Regex cannot detect sentiment reliably
    competitorsRecommended: [], 
    snippet,
    metrics: null
  };
}
