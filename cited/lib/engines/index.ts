import type { EngineConnector, EngineId } from "./types";
import { geminiConnector } from "./gemini";
import { groqConnector } from "./groq";

/**
 * Registre des moteurs disponibles.
 * Pour en ajouter un : écrire le connecteur dans ce dossier et l'inscrire ici.
 * Aucun autre fichier du projet ne doit être modifié.
 */
export const ENGINES: Record<string, EngineConnector> = {
  GEMINI: geminiConnector,
  GROQ: groqConnector,
};

export function getEngine(id: EngineId | string): EngineConnector {
  const engine = ENGINES[id];
  if (!engine) {
    throw new Error(`Moteur inconnu : ${id}. Disponibles : ${Object.keys(ENGINES).join(", ")}`);
  }
  return engine;
}

export * from "./types";
