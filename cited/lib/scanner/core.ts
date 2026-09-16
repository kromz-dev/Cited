import { crawlUrl } from "./crawler";
import { analyzeResponse, ScannerStatus } from "./analyzer";
import { BotAgent, DEFAULT_SCAN_BOTS } from "./agents";

export type SimpleStatus = "OK" | "BLOQUÉ" | "COQUILLE VIDE" | "ERREUR";

export interface ScanCoreResult {
  agent: BotAgent;
  simpleStatus: SimpleStatus;
  httpStatus: number;
  durationMs: number;
  wordCount: number;
}

export function mapStatusToSimple(status: ScannerStatus): SimpleStatus {
  switch (status) {
    case "ACCESSIBLE":
      return "OK";
    case "BLOCKED_403":
    case "BLOCKED_CAPTCHA":
      return "BLOQUÉ";
    case "EMPTY_JS_REQUIRED":
      return "COQUILLE VIDE";
    case "ERROR":
      return "ERREUR";
    default:
      return "ERREUR";
  }
}

/**
 * Exécute un scan complet sur une URL donnée pour une liste de bots.
 * Utilise "Browser" comme contrôle pour comparer la quantité de texte (Coquille Vide).
 */
export async function runCoreScan(url: string, bots: BotAgent[] = DEFAULT_SCAN_BOTS.filter(b => b !== "Browser")): Promise<ScanCoreResult[]> {
  // 1. Scan de contrôle avec un vrai navigateur
  const controlResult = await crawlUrl(url, "Browser");
  const controlAnalysis = analyzeResponse(controlResult);
  
  // 2. Scan avec les agents IA en parallèle
  const promises = bots.map(async (bot) => {
    const crawlRes = await crawlUrl(url, bot);
    const analysis = analyzeResponse(crawlRes, controlAnalysis.wordCount);
    return {
      agent: bot,
      simpleStatus: mapStatusToSimple(analysis.status),
      httpStatus: analysis.httpStatus,
      durationMs: analysis.durationMs,
      wordCount: analysis.wordCount,
    };
  });
  
  return Promise.all(promises);
}
