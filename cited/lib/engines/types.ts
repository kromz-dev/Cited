/**
 * Interface commune à tous les moteurs de réponse IA.
 *
 * C'est l'ADR-002 du cahier des charges : ajouter un moteur (Perplexity, ChatGPT,
 * Google AI Overviews...) ne doit toucher AUCUN fichier hors de ce dossier.
 * Ce fichier est destiné à être copié tel quel dans le SaaS.
 */

export type EngineId = "GEMINI" | "CHATGPT" | "PERPLEXITY" | "GOOGLE_AIO" | "CLAUDE" | "GROQ";

export interface EngineQuery {
  prompt: string;
  country: string;   // "FR"
  language: string;  // "fr"
}

export interface EngineCitation {
  url: string;
  domain: string;
  title?: string;
  position: number;
}

export interface EngineResponse {
  rawText: string;
  citations: EngineCitation[];
  /** Coût réel de l'appel en dollars. 0 sur une offre gratuite. */
  costUsd: number;
  latencyMs: number;
  modelVersion: string;
}

export class EngineError extends Error {
  constructor(
    message: string,
    readonly engine: EngineId,
    /** true si réessayer plus tard a une chance d'aboutir (quota, 5xx, réseau) */
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = "EngineError";
  }
}

export interface EngineConnector {
  readonly id: EngineId;
  readonly label: string;
  /** Coût indicatif par appel, pour l'estimation avant exécution. */
  readonly costPerCallUsd: number;
  query(input: EngineQuery): Promise<EngineResponse>;
}

/** Extrait un nom de domaine propre depuis une URL, sans "www.". */
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}
