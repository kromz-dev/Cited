import { BotAgent, USER_AGENTS } from "./agents";

export interface CrawlResult {
  agent: BotAgent;
  status: number;
  html: string;
  error?: string;
  durationMs: number;
}

export async function crawlUrl(url: string, agent: BotAgent): Promise<CrawlResult> {
  const userAgentString = USER_AGENTS[agent];
  const startTime = Date.now();
  
  try {
    // Timeout de 10 secondes pour éviter que l'API bloque
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Ajout d'en-têtes classiques pour éviter d'être bloqué pour manque de headers standard
    const response = await fetch(url, {
      headers: {
        "User-Agent": userAgentString,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      signal: controller.signal,
      redirect: "follow", // Suivre les redirections (ex: HTTP -> HTTPS)
    });
    
    clearTimeout(timeoutId);
    
    const html = await response.text();
    const durationMs = Date.now() - startTime;
    
    return {
      agent,
      status: response.status,
      html,
      durationMs
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      agent,
      status: 0,
      html: "",
      error: errorMessage,
      durationMs
    };
  }
}
