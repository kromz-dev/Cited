/**
 * Analyse une réponse textuelle pour détecter si une marque y est mentionnée,
 * et à quelle position elle apparaît dans la liste de recommandations.
 *
 * Trois garanties :
 *  1. Les frontières de mot fonctionnent aussi pour les marques multi-mots,
 *     accentuées ou contenant des métacaractères de regex.
 *  2. La position est comptée dans le bloc de liste qui contient réellement la
 *     mention, et vaut `null` si la mention n'est dans aucune liste.
 *  3. Les variantes de marque (`Brand.brandAliases`) sont prises en charge.
 *
 * LIMITE CONNUE (désambiguïsation sémantique) : la détection est purement
 * lexicale. Une marque dont le nom est un mot courant (« Orange », « Free »,
 * « Bouygues » moins, mais « Carrefour », « Fnac »…) produit des faux positifs :
 * « un jus d'orange » est détecté comme une mention d'Orange. Distinguer le
 * fruit de l'opérateur demande une analyse de contexte (embeddings, NER ou un
 * appel LLM de vérification) qui n'a pas sa place dans cette fonction pure.
 * Les faux positifs doivent être filtrés en amont (choix des alias) ou en aval
 * (étape de vérification). Voir le test « mot courant » pour le comportement exact.
 */

export interface MentionResult {
  isMentioned: boolean;
  /** Rang 1-based dans le bloc de liste contenant la mention, sinon `null`. */
  position: number | null;
  snippet: string | null;
  /** Terme (marque ou alias) réellement trouvé, tel qu'il a été fourni. */
  matchedTerm: string | null;
}

/** Caractères considérés comme « intérieur de mot » pour les frontières. */
const WORD_CHAR = "[\\p{L}\\p{N}_]";

/** Puce markdown : `-`, `*`, `+`, `•`, `1.`, `2)`… */
const LIST_ITEM_RE = /^\s{0,3}(?:[-*+•]|\d{1,3}[.)])\s+/;

/** Échappe les métacaractères de regex (sûr sous le drapeau `u`). */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replie casse et accents SANS changer la longueur de la chaîne : chaque point
 * de code de l'entrée produit exactement le même nombre d'unités en sortie.
 * Les index calculés sur le texte replié restent donc valides sur le texte
 * d'origine, d'où sont extraits les snippets.
 */
function foldPreservingLength(value: string): string {
  let out = "";
  for (const char of value) {
    const folded = char
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    // Si le repliage change la longueur (ex. « ß » → « ss », « İ » → « i̇ »),
    // on garde le caractère d'origine pour ne pas décaler les index.
    out += folded.length === char.length ? folded : char;
  }
  return out;
}

/**
 * Construit une regex avec frontières Unicode autour du terme.
 * Les espaces internes acceptent n'importe quelle suite d'espaces.
 */
function buildTermRegExp(foldedTerm: string): RegExp | null {
  const parts = foldedTerm.split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (parts.length === 0) return null;

  const body = parts.join("\\s+");
  const startsWithWordChar = new RegExp(`^${WORD_CHAR}`, "u").test(foldedTerm);
  const endsWithWordChar = new RegExp(`${WORD_CHAR}$`, "u").test(foldedTerm);

  // Lookarounds plutôt que \b : \b est ASCII-only et casserait sur « Café ».
  const prefix = startsWithWordChar ? `(?<!${WORD_CHAR})` : "";
  const suffix = endsWithWordChar ? `(?!${WORD_CHAR})` : "";

  return new RegExp(`${prefix}${body}${suffix}`, "u");
}

interface ListItem {
  start: number;
  end: number;
}

/**
 * Découpe le texte en blocs de liste. Un bloc est une suite de puces ;
 * il se termine sur une ligne non vide qui n'est pas une puce (un paragraphe
 * intercalaire sépare donc une liste d'introduction de la « vraie » liste).
 * Une ligne vide seule ne coupe pas le bloc (listes markdown « loose »).
 */
function findListBlocks(text: string): ListItem[][] {
  const blocks: ListItem[][] = [];
  let current: ListItem[] = [];
  let offset = 0;

  const flush = () => {
    if (current.length > 0) blocks.push(current);
    current = [];
  };

  for (const line of text.split("\n")) {
    const lineStart = offset;
    const lineEnd = offset + line.length;
    offset = lineEnd + 1; // +1 pour le "\n" consommé par le split

    if (LIST_ITEM_RE.test(line)) {
      current.push({ start: lineStart, end: lineEnd });
      continue;
    }
    if (line.trim() === "") continue; // ligne vide : ne coupe pas le bloc
    if (current.length > 0) {
      // Ligne de texte : étend le dernier item si elle est indentée
      // (continuation), sinon ferme le bloc.
      if (/^\s{2,}\S/.test(line)) {
        current[current.length - 1].end = lineEnd;
      } else {
        flush();
      }
    }
  }
  flush();
  return blocks;
}

/** Rang 1-based de la mention dans son bloc de liste, sinon `null`. */
function findPosition(text: string, matchIndex: number): number | null {
  for (const block of findListBlocks(text)) {
    for (let i = 0; i < block.length; i++) {
      const item = block[i];
      const nextStart = i + 1 < block.length ? block[i + 1].start : item.end;
      const itemEnd = Math.max(item.end, nextStart);
      if (matchIndex >= item.start && matchIndex < itemEnd) {
        return i + 1;
      }
    }
  }
  return null;
}

/**
 * @param text      Réponse brute du modèle.
 * @param brandName Nom canonique de la marque.
 * @param aliases   Variantes (`Brand.brandAliases`). Le terme retenu est celui
 *                  qui apparaît le plus tôt dans le texte.
 */
export function detectBrandMention(
  text: string,
  brandName: string,
  aliases: string[] = []
): MentionResult {
  const empty: MentionResult = {
    isMentioned: false,
    position: null,
    snippet: null,
    matchedTerm: null,
  };

  if (!text || !brandName) return empty;

  const terms = [brandName, ...aliases]
    .map((term) => (typeof term === "string" ? term.trim() : ""))
    .filter((term) => term.length > 0);
  if (terms.length === 0) return empty;

  const foldedText = foldPreservingLength(text);

  let matchIndex = -1;
  let matchLength = 0;
  let matchedTerm: string | null = null;

  for (const term of terms) {
    const regex = buildTermRegExp(foldPreservingLength(term));
    if (!regex) continue;
    const match = regex.exec(foldedText);
    if (!match) continue;
    if (matchIndex === -1 || match.index < matchIndex) {
      matchIndex = match.index;
      matchLength = match[0].length;
      matchedTerm = term;
    }
  }

  if (matchIndex === -1) return empty;

  // Snippet extrait du TEXTE BRUT : les index sont valides car le repliage
  // conserve la longueur.
  const start = Math.max(0, matchIndex - 50);
  const end = Math.min(text.length, matchIndex + matchLength + 50);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  return {
    isMentioned: true,
    position: findPosition(text, matchIndex),
    snippet,
    matchedTerm,
  };
}
