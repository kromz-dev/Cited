/**
 * Connecteur Gemini 2.5 Flash avec ancrage Google Search.
 *
 * Pourquoi ce modèle : c'est le seul accès à un moteur de réponse IA avec
 * recherche web réellement gratuit (500 requêtes ancrées/jour au moment de
 * l'écriture). Les modèles 3.x n'ont PAS d'ancrage sur l'offre gratuite.
 *
 * Aucune dépendance : appel REST direct via fetch.
 */

import {
  type EngineConnector,
  type EngineQuery,
  type EngineResponse,
  type EngineCitation,
  EngineError,
  domainOf,
} from "./types";

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** Compteur de session, pour surveiller la consommation du quota gratuit. */
export const geminiUsage = { groundedCalls: 0, plainCalls: 0, errors: 0 };

interface GeminiCandidate {
  content?: { parts?: Array<{ text?: string }> };
  groundingMetadata?: {
    groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
    webSearchQueries?: string[];
  };
}

function apiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new EngineError(
      "GEMINI_API_KEY absente. Crée une clé gratuite sur https://aistudio.google.com/apikey " +
        "puis renseigne-la dans le fichier .env",
      "GEMINI",
      false,
    );
  }
  return key;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(body: unknown, grounded: boolean, maxRetries = 3): Promise<GeminiCandidate> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const started = Date.now();
    let res: Response;
    try {
      res = await fetch(`${ENDPOINT}?key=${apiKey()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90_000),
      });
    } catch (err) {
      geminiUsage.errors++;
      if (attempt < maxRetries - 1) {
        attempt++;
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }
      throw new EngineError(
        `Réseau injoignable après ${Date.now() - started} ms : ${(err as Error).message}`,
        "GEMINI",
        true,
      );
    }

    if (!res.ok) {
      geminiUsage.errors++;
      const detail = await res.text().catch(() => "");
      const retryable = res.status === 429 || res.status >= 500;
      
      if (retryable && attempt < maxRetries - 1) {
        attempt++;
        // Backoff: 2s, 4s, etc.
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      const hint =
        res.status === 429
          ? " — quota gratuit probablement épuisé pour aujourd'hui (500 requêtes ancrées/jour)."
          : res.status === 400 && detail.includes("API key")
            ? " — clé API invalide."
            : "";
      throw new EngineError(
        `Gemini a répondu ${res.status}${hint} ${detail.slice(0, 300)}`,
        "GEMINI",
        retryable,
        res.status,
      );
    }

    if (grounded) geminiUsage.groundedCalls++;
    else geminiUsage.plainCalls++;

    const json = (await res.json()) as { candidates?: GeminiCandidate[] };
    const candidate = json.candidates?.[0];
    if (!candidate) {
      throw new EngineError("Réponse Gemini sans candidat exploitable.", "GEMINI", true);
    }
    return candidate;
  }
  
  throw new EngineError("Max retries exceeded", "GEMINI", true);
}

function textOf(candidate: GeminiCandidate): string {
  return (candidate.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}

function citationsOf(candidate: GeminiCandidate): EngineCitation[] {
  const chunks = candidate.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const out: EngineCitation[] = [];

  chunks.forEach((chunk, i) => {
    const uri = chunk.web?.uri;
    if (!uri) return;
    // Gemini renvoie souvent une URL de redirection vertexaisearch : dans ce cas
    // le vrai domaine n'est lisible que dans le titre.
    const fromUrl = domainOf(uri);
    const isRedirect = fromUrl.includes("vertexaisearch") || fromUrl.includes("googleusercontent");
    const title = chunk.web?.title?.trim();
    const domain = isRedirect && title ? title.replace(/^www\./, "").toLowerCase() : fromUrl;
    if (!domain || seen.has(domain)) return;
    seen.add(domain);
    out.push({ url: uri, domain, title, position: out.length + 1 });
  });

  return out;
}

export const geminiConnector: EngineConnector = {
  id: "GEMINI",
  label: "Gemini (Google Search)",
  costPerCallUsd: 0, // offre gratuite

  async query({ prompt, country, language }: EngineQuery): Promise<EngineResponse> {
    const started = Date.now();
    const candidate = await callGemini(
      {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2 },
        systemInstruction: {
          parts: [
            {
              text:
                `Réponds comme un assistant de recherche grand public, en ${language}, ` +
                `pour un utilisateur situé en ${country}. Sois concret et cite des marques ` +
                `ou produits existants. Si la question appelle une liste, donne une liste numérotée.`,
            },
          ],
        },
      },
      true,
    );

    return {
      rawText: textOf(candidate),
      citations: citationsOf(candidate),
      costUsd: 0,
      latencyMs: Date.now() - started,
      modelVersion: MODEL,
    };
  },
};

/**
 * Appel utilitaire SANS ancrage, pour les tâches internes (génération de
 * requêtes, analyse de sentiment). Ne consomme pas le quota d'ancrage.
 */
export async function geminiPlainJson<T>(instruction: string, schemaHint: string): Promise<T> {
  const candidate = await callGemini(
    {
      contents: [{ parts: [{ text: `${instruction}\n\n${schemaHint}` }] }],
      generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
    },
    false,
  );
  const raw = textOf(candidate);
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/[[{][\s\S]*[\]}]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new EngineError(`Réponse JSON illisible : ${raw.slice(0, 200)}`, "GEMINI", true);
  }
}
