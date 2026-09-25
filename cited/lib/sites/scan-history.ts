const DEGRADED_STATUSES = new Set([
  "BLOQUÉ",
  "COQUILLE VIDE",
  "ERREUR",
  "ERROR",
  "BLOCKED",
]);

export interface ScanHistoryInput {
  createdAt: Date;
  simpleStatus: string | null;
  httpStatus: number;
}

export interface ScanHistoryPoint {
  date: string;
  label: string;
  degraded: boolean;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isDegraded(log: ScanHistoryInput): boolean {
  if (log.simpleStatus && DEGRADED_STATUSES.has(log.simpleStatus)) return true;
  if (!log.simpleStatus && log.httpStatus >= 400) return true;
  return false;
}

/**
 * Série chronologique du site, un point par jour. Le dernier scan du jour
 * l'emporte. Une liste vide reste vide : aucun historique fictif partagé.
 */
export function buildScanHistory(logs: ScanHistoryInput[]): ScanHistoryPoint[] {
  const lastByDay = new Map<string, ScanHistoryInput>();
  for (const log of [...logs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())) {
    lastByDay.set(dayKey(log.createdAt), log);
  }

  return [...lastByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, log]) => ({
      date,
      label: new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      degraded: isDegraded(log),
    }));
}
