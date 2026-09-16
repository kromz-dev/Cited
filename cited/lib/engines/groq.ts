import { EngineConnector, EngineId, EngineQuery, EngineResponse, EngineError } from "./types";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const groqConnector: EngineConnector = {
  id: "GROQ" as EngineId,
  label: "Groq LLaMA",
  costPerCallUsd: 0,
  
  async query(input: EngineQuery, maxRetries = 3): Promise<EngineResponse> {
    if (!GROQ_API_KEY) {
      throw new EngineError("GROQ_API_KEY manquante", "GROQ" as EngineId, false);
    }

    let attempt = 0;
    while (attempt < maxRetries) {
      const startTime = Date.now();
      
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `Vous êtes un Moteur de Réponse IA (comme Perplexity ou ChatGPT Search) opérant pour des utilisateurs en ${input.country}. 
Votre rôle est de fournir des réponses extrêmement denses, factuelles et impartiales, comme si vous aviez accès à une base de données RAG en temps réel.
RÈGLES STRICTES :
1. Utilisez des listes à puces pour énumérer les outils, logiciels ou solutions.
2. Soyez très spécifique sur les fonctionnalités et citez des noms de marques réelles.
3. Ne faites pas de phrases d'introduction ou de conclusion marketing inutiles. Allez droit au but (format dense 40-60 mots par concept).
4. Citez systématiquement vos sources via des URLs réelles (ou très probables) dans le texte.
5. Lorsque vous répondez à une question ou comparez des outils, basez-vous sur le consensus web (comme les avis G2, Capterra ou articles d'experts).`
              },
              {
                role: "user",
                content: input.prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 1024,
          })
        });

        if (!response.ok) {
          const isRetryable = response.status === 429 || response.status >= 500;
          if (isRetryable && attempt < maxRetries - 1) {
            attempt++;
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
            continue;
          }
          throw new EngineError(`Groq API Erreur ${response.status}: ${await response.text()}`, "GROQ" as EngineId, isRetryable);
        }

        const data = await response.json();
        const rawText = data.choices[0]?.message?.content || "";
        const latencyMs = Date.now() - startTime;

        // Extraire des pseudo-citations à partir des URLs retournées dans le texte
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = rawText.match(urlRegex) || [];
        const citations = Array.from(new Set<string>(urls as string[])).map((url: string, index: number) => {
          let domain = "";
          try {
            domain = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
          } catch(e) {}
          return {
            url,
            domain,
            position: index + 1
          };
        }).filter(c => c.domain);

        return {
          rawText,
          citations,
          costUsd: 0,
          latencyMs,
          modelVersion: data.model || "llama-3.3-70b-versatile"
        };
      } catch (e: any) {
        if (e instanceof EngineError) throw e;
        
        if (attempt < maxRetries - 1) {
          attempt++;
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }
        throw new EngineError(`Groq Request failed: ${e.message}`, "GROQ" as EngineId, true);
      }
    }
    
    throw new EngineError("Max retries exceeded", "GROQ" as EngineId, true);
  }
};

/** Fonction utilitaire pour générer du JSON structuré via Groq */
export async function groqPlainJson<T>(instruction: string, schemaHint: string): Promise<T> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY manquante");
  
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `${instruction}\n${schemaHint}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    })
  });
  
  if (!response.ok) {
    throw new Error(`Groq JSON API Error: ${await response.text()}`);
  }
  
  const data = await response.json();
  const rawText = data.choices[0]?.message?.content || "{}";
  
  try {
    return JSON.parse(rawText) as T;
  } catch (e) {
    // Fallback: the AI might have wrapped the JSON in markdown blocks or text
    const match = rawText.match(/[[{][\s\S]*[\]}]/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch (e2) {}
    }
    console.error("Erreur de parsing JSON Groq:", rawText);
    throw new Error("Groq n'a pas retourné un JSON valide");
  }
}
