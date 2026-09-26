import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";
import { decelioUserAgent } from "./agents";

export const MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 10_000;
/** Au-delà, le corps est tronqué : on n'a besoin que du HTML initial. */
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

export interface RedirectHop {
  url: string;
  status: number;
  location: string;
}

export interface CrawlResult {
  /** URL demandée. */
  url: string;
  /** URL de la dernière réponse, après redirections. */
  finalUrl: string;
  userAgent: string;
  /** 0 si aucune réponse exploitable (réseau, SSRF, trop de redirections). */
  status: number;
  /** En-têtes de la réponse finale, noms en minuscules. */
  headers: Record<string, string>;
  html: string;
  redirects: RedirectHop[];
  error?: string;
  errorKind?: CrawlErrorKind;
  durationMs: number;
}

export type CrawlErrorKind = "too_many_redirects" | "network";

export interface CrawlOptions {
  userAgent?: string;
  accept?: string;
  timeoutMs?: number;
  maxRedirects?: number;
  maxBodyBytes?: number;
}

/**
 * Refuse tout ce qui n'est pas http(s) vers une adresse unicast publique.
 * Appelé sur l'URL initiale ET sur chaque `Location`, sans quoi une
 * redirection ouvrirait un accès aux adresses internes.
 */
export async function assertSafeUrl(raw: string): Promise<string> {
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Invalid protocol. Only http/https are allowed.");
  }
  if (url.username || url.password) {
    throw new Error("Credentials in URL are not allowed.");
  }

  // `URL` garde les crochets des littéraux IPv6, que `lookup` refuse.
  const hostname = url.hostname.replace(/^\[(.*)\]$/, "$1");
  let addrs: { address: string }[];
  try {
    addrs = await lookup(hostname, { all: true });
  } catch (e) {
    throw new Error(`DNS resolution failed: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (addrs.length === 0) throw new Error("DNS resolution returned no address");
  for (const addr of addrs) {
    if (!ipaddr.isValid(addr.address) || ipaddr.parse(addr.address).range() !== "unicast") {
      throw new Error(`Forbidden IP resolved: ${addr.address}`);
    }
  }
  return url.toString();
}

function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

async function readBody(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) return response.text();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    text += decoder.decode(value, { stream: true });
    if (received >= maxBytes) {
      await reader.cancel();
      break;
    }
  }
  return text + decoder.decode();
}

/**
 * GET avec suivi manuel des redirections (au plus `maxRedirects`), chaque
 * cible étant revalidée par `assertSafeUrl` avant d'être contactée.
 */
export async function crawlUrl(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  const userAgent = options.userAgent ?? decelioUserAgent();
  const maxRedirects = options.maxRedirects ?? MAX_REDIRECTS;
  const startTime = Date.now();
  const redirects: RedirectHop[] = [];
  let currentUrl = url;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  const fail = (error: unknown, errorKind: CrawlErrorKind = "network"): CrawlResult => ({
    url,
    finalUrl: currentUrl,
    userAgent,
    status: 0,
    headers: {},
    html: "",
    redirects,
    error: error instanceof Error ? error.message : String(error),
    errorKind,
    durationMs: Date.now() - startTime,
  });

  try {
    for (let hop = 0; ; hop++) {
      currentUrl = await assertSafeUrl(currentUrl);

      const response = await fetch(currentUrl, {
        headers: {
          "User-Agent": userAgent,
          Accept: options.accept ?? "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: controller.signal,
        // Jamais "follow" : fetch suivrait la redirection sans revalider la cible.
        redirect: "manual",
      });

      const location = response.headers.get("location");
      if (REDIRECT_STATUSES.has(response.status) && location) {
        await response.body?.cancel().catch(() => {});
        if (hop >= maxRedirects) {
          return fail(new Error(`Too many redirects (max ${maxRedirects})`), "too_many_redirects");
        }
        const next = new URL(location, currentUrl).toString();
        redirects.push({ url: currentUrl, status: response.status, location: next });
        currentUrl = next;
        continue;
      }

      const html = await readBody(response, options.maxBodyBytes ?? MAX_BODY_BYTES);
      return {
        url,
        finalUrl: currentUrl,
        userAgent,
        status: response.status,
        headers: headersToRecord(response.headers),
        html,
        redirects,
        durationMs: Date.now() - startTime,
      };
    }
  } catch (error) {
    return fail(error);
  } finally {
    clearTimeout(timeoutId);
  }
}
