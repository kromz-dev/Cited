/**
 * Interface commune à tous les moteurs de réponse IA.
 *
 * C'est l'ADR-002 du cahier des charges : ajouter un moteur (Perplexity, ChatGPT,
 * Google AI Overviews...) ne doit toucher AUCUN fichier hors de ce dossier.
 * Ce fichier est destiné à être copié tel quel dans le SaaS.
 */

export type EngineId = "GEMINI" | "CHATGPT" | "PERPLEXITY" | "GOOGLE_AIO" | "CLAUDE" | "GROQ";

/**
 * Distinction structurante du produit.
 *
 * "GROUNDED" : le moteur interroge réellement le web au moment de l'appel et
 * rend les URLs qu'il a consultées. Les citations sont des observations. Seul
 * ce type de moteur peut servir à MESURER la présence d'une marque.
 *
 * "UNGROUNDED" : le moteur répond de mémoire (poids du modèle). Toute URL qu'il
 * produit est une reconstruction plausible, pas une source relevée. Utilisable
 * comme juge (classification, sentiment) ou comme générateur (prompts), JAMAIS
 * comme instrument de mesure : les citations seraient de la donnée fabriquée.
 *
 * Valeur par défaut volontairement pessimiste : un connecteur qui ne déclare
 * rien est traité comme non ancré (voir `groundingOf`).
 */
export type EngineGrounding = "GROUNDED" | "UNGROUNDED";

export interface EngineQuery {
  prompt: string;
  country: string;   // "FR"
  language: string;  // "fr"
}

export interface EngineCitation {
  url: string;
  domain: string;
  title?: string;
  /**
   * Rang de la source. Voir la documentation du connecteur : selon le moteur,
   * c'est soit l'ordre d'apparition dans le texte rendu, soit le simple ordre
   * de la liste renvoyée par l'API. Ne pas présumer que c'est un classement.
   */
  position: number;
}

/** Détail de consommation d'un appel, tel que rendu par le fournisseur. */
export interface EngineUsage {
  inputTokens?: number;
  outputTokens?: number;
  /** Nombre de requêtes facturables d'ancrage web déclenchées par l'appel. */
  groundedRequests?: number;
}

export interface EngineResponse {
  rawText: string;
  citations: EngineCitation[];
  /**
   * Coût réel de l'appel en dollars, calculé à partir de la consommation
   * rendue par le fournisseur. 0 uniquement si l'appel est réellement tombé
   * dans un palier gratuit.
   */
  costUsd: number;
  /**
   * true quand `costUsd` n'a pas pu être calculé à partir de la consommation
   * réelle et repose sur une hypothèse (le fournisseur n'a rien rendu).
   */
  costIsEstimate?: boolean;
  /** Consommation brute, conservée pour auditer la facture. */
  usage?: EngineUsage;
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
  /**
   * Coût indicatif par appel, pour l'estimation AVANT exécution (budget).
   * Le coût réellement rendu est dans `EngineResponse.costUsd`.
   */
  readonly costPerCallUsd: number;
  /**
   * Nature de l'accès aux sources. Absent = non ancré (défaut prudent).
   * Un moteur non ancré est refusé par `getMeasurementEngine`.
   */
  readonly grounding?: EngineGrounding;
  query(input: EngineQuery): Promise<EngineResponse>;
}

/** Nature d'un moteur, avec le défaut prudent "UNGROUNDED". */
export function groundingOf(engine: Pick<EngineConnector, "grounding">): EngineGrounding {
  return engine.grounding ?? "UNGROUNDED";
}

/** true si le moteur peut servir d'instrument de mesure. */
export function isGrounded(engine: Pick<EngineConnector, "grounding">): boolean {
  return groundingOf(engine) === "GROUNDED";
}

/** Extrait un nom de domaine propre depuis une URL, sans "www.". */
export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}
