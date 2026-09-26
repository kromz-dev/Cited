export interface BotSnapshot {
  agent: string;
  httpStatus: number | null;
  cause: string;
  fix: string;
}

export interface LatestScan {
  httpStatus: number;
  simpleStatus: string | null;
  cause: string | null;
  payload: string | null;
  createdAt: Date;
}

function fixFor(cause: string): string {
  if (/robots\.txt/i.test(cause)) return "Retirez la règle qui interdit cet assistant dans robots.txt, puis relancez un scan.";
  if (/javascript/i.test(cause)) return "Servez le texte principal dans le HTML, puis relancez un scan.";
  if (/injoignable|erreur/i.test(cause)) return "Vérifiez que le site répond, puis relancez un scan.";
  return "Corrigez la cause indiquée, puis relancez un scan.";
}

export function assistantSnapshots(log: LatestScan | null): BotSnapshot[] {
  if (!log) return [];
  if (log.payload) {
    try {
      const parsed = JSON.parse(log.payload) as { results?: { agent?: string; httpStatus?: number; cause?: string }[] };
      if (Array.isArray(parsed.results) && parsed.results.length > 0) {
        return parsed.results.map((result) => {
          const cause = result.cause?.trim() || log.cause || "Cause non précisée";
          return {
            agent: result.agent || "Assistant",
            httpStatus: typeof result.httpStatus === "number" ? result.httpStatus : log.httpStatus,
            cause,
            fix: fixFor(cause),
          };
        });
      }
    } catch {
      // Un ancien journal sans JSON exploitable retombe sur les colonnes.
    }
  }
  const cause = log.cause?.trim() || (log.httpStatus >= 400 ? `HTTP ${log.httpStatus}` : "Dernier scan enregistré");
  return [{ agent: "Dernier scan", httpStatus: log.httpStatus, cause, fix: fixFor(cause) }];
}
