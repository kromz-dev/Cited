import { BotAgent, USER_AGENTS } from "./agents";
import { lookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';

export interface CrawlResult {
  agent: BotAgent;
  status: number;
  html: string;
  error?: string;
  durationMs: number;
}

async function assertSafeUrl(raw: string): Promise<string> {
  const url = new URL(raw);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Invalid protocol. Only http/https are allowed.');
  }
  
  try {
    const addrs = await lookup(url.hostname, { all: true });
    for (const addr of addrs) {
      if (ipaddr.isValid(addr.address)) {
        const parsed = ipaddr.parse(addr.address);
        if (parsed.range() !== 'unicast') {
          throw new Error(`Forbidden private IP resolved: ${addr.address}`);
        }
      }
    }
  } catch (e: any) {
    throw new Error(`DNS resolution failed or forbidden IP: ${e.message}`);
  }
  return url.toString();
}

export async function crawlUrl(url: string, agent: BotAgent): Promise<CrawlResult> {
  const userAgentString = USER_AGENTS[agent];
  const startTime = Date.now();
  
  try {
    const safeUrl = await assertSafeUrl(url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // We keep redirect: "manual" or "error" if we are strictly preventing SSRF bounces
    // However, for a production crawler, you'd want to follow redirects manually 
    // and re-validate each Location header with assertSafeUrl.
    // For now, to prevent SSRF DNS rebinding via redirects, we disable them.
    const response = await fetch(safeUrl, {
      headers: {
        "User-Agent": userAgentString,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      signal: controller.signal,
      redirect: "error", // Prevent blind following of internal redirects
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
