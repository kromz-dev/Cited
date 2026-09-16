/**
 * Analyse une réponse textuelle pour détecter si une marque y est mentionnée.
 * Utilise des expressions régulières simples mais robustes pour éviter
 * les faux positifs (ex: "apple" vs "apple pie" si on cherche Apple).
 */

export interface MentionResult {
  isMentioned: boolean;
  position: number | null; // 1-based index (ex: 1st recommendation)
  snippet: string | null;
}

export function detectBrandMention(text: string, brandName: string): MentionResult {
  if (!text || !brandName) {
    return { isMentioned: false, position: null, snippet: null };
  }

  // Normalisation simple
  const normalizedText = text.toLowerCase();
  const normalizedBrand = brandName.toLowerCase().trim();

  // Recherche d'occurrence exacte (avec frontières de mots si possible)
  // On utilise \b si la marque est alphanumérique
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
    return { isMentioned: false, position: null, snippet: null };
  }

  // Extraction d'un snippet (environ 50 caractères avant/après)
  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(text.length, matchIndex + brandName.length + 50);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  // Tentative d'estimation de la position (très rudimentaire)
  // Cherche des puces ou nombres avant la mention
  const textBefore = normalizedText.substring(0, matchIndex);
  const itemsCount = (textBefore.match(/(?:^|\n)\s*(?:[-*]|\d+\.)/g) || []).length;
  
  // Si on a trouvé des puces dans le texte précédent (incluant celle de la ligne courante),
  // le nombre de puces correspond à la position de l'élément courant.
  const position = itemsCount > 0 ? itemsCount : 1;

  return { isMentioned, position, snippet };
}
