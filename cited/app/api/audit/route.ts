import { NextResponse } from "next/server";
import { rateLimit, callerKey } from "@/lib/rate-limit";
import { z } from "zod";
import { BotAgent, DEFAULT_SCAN_BOTS } from "@/lib/scanner/agents";
import { crawlUrl } from "@/lib/scanner/crawler";
import { analyzeResponse, AnalyzerResult, ScannerStatus } from "@/lib/scanner/analyzer";

export const runtime = "nodejs";
export const maxDuration = 30; // 30s max (comme défini dans le cahier des charges)

const AUDIT_LIMIT_PER_HOUR = 10; // On peut augmenter un peu la limite vu que c'est moins coûteux qu'un LLM
const ONE_HOUR_MS = 60 * 60 * 1000;

const AuditInput = z.object({
  domain: z
    .string()
    .trim()
    .min(4)
    .max(253)
    .regex(
      /^https?:\/\/(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+.*$/i,
      "L'URL doit commencer par http:// ou https:// et être un domaine valide."
    )
    .or(
      z.string().trim().regex(
        /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+.*$/i,
        "Domaine invalide."
      ).transform(val => `https://${val}`)
    ),
});

export interface RunData {
  agent: string;
  status: ScannerStatus;
  wordCount: number;
  hasAppRoot: boolean;
  httpStatus: number;
  durationMs: number;
}

export interface PageScanResult {
  path: string;
  runs: RunData[];
}

function calculateGlobalScore(pages: PageScanResult[]): number {
  if (pages.length === 0) return 0;
  
  let totalBots = 0;
  let accessibleBots = 0;
  
  for (const page of pages) {
    // On ignore le navigateur normal pour le score
    const aiRuns = page.runs.filter(r => r.agent !== "Browser");
    totalBots += aiRuns.length;
    accessibleBots += aiRuns.filter(r => r.status === "ACCESSIBLE").length;
  }
  
  if (totalBots === 0) return 0;
  return Math.round((accessibleBots / totalBots) * 100);
}

export async function POST(req: Request) {
  try {
    const parsed = AuditInput.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Requête invalide", details: parsed.error.issues },
        { status: 400 },
      );
    }
    const { domain: baseUrl } = parsed.data;

    const quota = await rateLimit(
      callerKey(req, "audit"),
      AUDIT_LIMIT_PER_HOUR,
      ONE_HOUR_MS,
    );
    if (!quota.allowed) {
      return NextResponse.json(
        { error: "Trop d'audits demandés. Réessaie plus tard." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((quota.resetAt.getTime() - Date.now()) / 1000)) },
        },
      );
    }

    console.log(`\n🔍 [V3 SCANNER] Démarrage de l'analyse pour : ${baseUrl}`);
    
    // Pour l'audit gratuit, on scanne la page d'accueil et 2 pages génériques
    // Si elles retournent 404, on le verra.
    const urlObj = new URL(baseUrl);
    const pathsToScan = ["/", "/pricing", "/blog"];
    
    const pagesResults: PageScanResult[] = [];

    // On scanne les chemins un par un pour ne pas surcharger le serveur cible
    for (const path of pathsToScan) {
      const targetUrl = new URL(path, urlObj.origin).toString();
      console.log(`\n▶ Scannage de ${targetUrl}...`);
      
      // 1. D'abord on scanne avec le "Browser" pour avoir la référence (baseline)
      const browserCrawl = await crawlUrl(targetUrl, "Browser");
      const browserAnalysis = analyzeResponse(browserCrawl);
      
      console.log(`  [Browser] Code: ${browserAnalysis.httpStatus}, Mots: ${browserAnalysis.wordCount}`);
      
      // Si la page d'accueil est complètement en erreur (404, DNS introuvable, etc), on arrête.
      if (path === "/" && (browserAnalysis.httpStatus === 0 || browserAnalysis.httpStatus >= 500)) {
        return NextResponse.json(
          { error: `Impossible d'accéder au site (HTTP ${browserAnalysis.httpStatus}).` },
          { status: 400 }
        );
      }
      
      // Si la sous-page n'existe pas (404), on la saute
      if (path !== "/" && browserAnalysis.httpStatus === 404) {
        console.log(`  Skipping ${path} (404 Not Found)`);
        continue;
      }
      
      const runs: AnalyzerResult[] = [browserAnalysis];
      const aiBots = DEFAULT_SCAN_BOTS.filter(b => b !== "Browser");
      
      // 2. On scanne avec tous les bots IA en parallèle
      const botPromises = aiBots.map(async (agent) => {
        const crawl = await crawlUrl(targetUrl, agent);
        // On passe le wordCount du navigateur comme contrôle
        return analyzeResponse(crawl, browserAnalysis.wordCount);
      });
      
      const botResults = await Promise.all(botPromises);
      runs.push(...botResults);
      
      botResults.forEach(res => {
         console.log(`  [${res.agent}] Statut: ${res.status}, Mots: ${res.wordCount}`);
      });
      
      pagesResults.push({
        path,
        runs: runs.map(r => ({
          agent: r.agent,
          status: r.status,
          wordCount: r.wordCount,
          hasAppRoot: r.hasAppRoot,
          httpStatus: r.httpStatus,
          durationMs: r.durationMs
        }))
      });
    }

    const globalScore = calculateGlobalScore(pagesResults);

    return NextResponse.json({
      domain: baseUrl,
      score: globalScore,
      pages: pagesResults
    });

  } catch (error) {
    console.error("Erreur Scanner API:", error);
    return NextResponse.json(
      { error: "Erreur lors du scan" }, 
      { status: 500 }
    );
  }
}
