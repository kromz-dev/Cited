import { CrawlResult } from "./crawler";

export type ScannerStatus = 
  | "ACCESSIBLE" 
  | "BLOCKED_403" 
  | "BLOCKED_CAPTCHA" 
  | "EMPTY_JS_REQUIRED"
  | "ERROR";

export interface AnalyzerResult {
  agent: string;
  status: ScannerStatus;
  wordCount: number;
  hasAppRoot: boolean;
  httpStatus: number;
  durationMs: number;
}

/**
 * Nettoie le HTML pour ne garder que le texte visible.
 * Fonction pure et basique pour éviter de charger de grosses dépendances comme JSDOM ou Cheerio.
 */
function extractVisibleText(html: string): string {
  if (!html) return "";
  
  // Extraire uniquement le contenu du body s'il existe
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let content = bodyMatch ? bodyMatch[1] : html;
  
  // Supprimer les balises script et style et leur contenu
  content = content.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  content = content.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  content = content.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
  
  // Remplacer toutes les autres balises par un espace
  content = content.replace(/<[^>]+>/g, ' ');
  
  // Décoder les entités basiques
  content = content.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  
  // Normaliser les espaces
  return content.replace(/\s+/g, ' ').trim();
}

/**
 * Détecte les signatures classiques des SPAs non pré-rendues.
 */
function detectSpaRoot(html: string): boolean {
  if (!html) return false;
  // Détecte <div id="root">, <div id="app">, <div id="__next">, etc. sans contenu ou très peu.
  return (
    /<div[^>]+id=["'](root|app|__next)["'][^>]*>\s*<\/div>/i.test(html) ||
    /<div[^>]+id=["'](root|app|__next)["'][^>]*>\s*(<!--[\s\S]*?-->\s*)*<\/div>/i.test(html)
  );
}

/**
 * Analyse la réponse d'un bot.
 */
export function analyzeResponse(result: CrawlResult, controlWordCount?: number): AnalyzerResult {
  if (result.error || result.status === 0) {
    return {
      agent: result.agent,
      status: "ERROR",
      wordCount: 0,
      hasAppRoot: false,
      httpStatus: result.status,
      durationMs: result.durationMs,
    };
  }

  // Vérification des blocages serveurs (WAF)
  if (result.status === 403 || result.status === 401) {
    return {
      agent: result.agent,
      status: "BLOCKED_403",
      wordCount: 0,
      hasAppRoot: false,
      httpStatus: result.status,
      durationMs: result.durationMs,
    };
  }
  
  // Vérification de blocages type Captcha (Cloudflare 403/200 avec "Just a moment...")
  if (result.html.includes("Just a moment...") && result.html.includes("cloudflare")) {
    return {
      agent: result.agent,
      status: "BLOCKED_CAPTCHA",
      wordCount: 0,
      hasAppRoot: false,
      httpStatus: result.status,
      durationMs: result.durationMs,
    };
  }

  const text = extractVisibleText(result.html);
  
  // Comptage de mots performant sans allocation de gros tableaux
  let wordCount = 0;
  for (const _ of text.matchAll(/\S{2,}/g)) {
    wordCount++;
  }
  
  const hasAppRoot = detectSpaRoot(result.html);
  
  let status: ScannerStatus = "ACCESSIBLE";
  
  // Si on a moins de 50 mots, c'est généralement une page blanche ou presque
  // Surtout si le navigateur de contrôle (Browser) en a trouvé beaucoup plus
  if (wordCount < 50) {
    status = "EMPTY_JS_REQUIRED";
  } else if (controlWordCount !== undefined && wordCount < controlWordCount * 0.2) {
    // Si le bot voit moins de 20% des mots du navigateur normal, il manque l'essentiel
    status = "EMPTY_JS_REQUIRED";
  }

  return {
    agent: result.agent,
    status,
    wordCount,
    hasAppRoot,
    httpStatus: result.status,
    durationMs: result.durationMs,
  };
}
