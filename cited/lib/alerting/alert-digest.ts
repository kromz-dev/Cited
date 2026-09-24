import type { AlertKind } from "./sendAlert";

export interface DigestLog {
  createdAt: Date;
  simpleStatus: string | null;
  httpStatus: number;
  cause: string | null;
}

const DEGRADED = new Set(["BLOQUÉ", "COQUILLE VIDE", "ERREUR", "ERROR", "BLOCKED"]);

export function isDegraded(log: DigestLog): boolean {
  if (log.simpleStatus) return DEGRADED.has(log.simpleStatus);
  return log.httpStatus >= 400;
}

/**
 * Compare les deux derniers journaux. Deux scans identiques après une
 * régression déjà envoyée ne produisent pas une nouvelle alerte.
 */
export function transitionForSite(
  logsNewestFirst: DigestLog[],
  lastAlert?: { type: string; sentAt: Date } | null,
): { kind: AlertKind; cause: string } | null {
  const latest = logsNewestFirst[0];
  const previous = logsNewestFirst[1];
  if (!latest || !previous) return null;

  const latestDown = isDegraded(latest);
  const previousDown = isDegraded(previous);
  if (latestDown === previousDown) return null;

  const kind: AlertKind = latestDown ? "REGRESSION" : "RESOLUTION";
  if (lastAlert && lastAlert.type === kind && lastAlert.sentAt >= previous.createdAt) {
    return null;
  }

  const cause = latest.cause?.trim() || (latestDown ? `HTTP ${latest.httpStatus}` : "le site répond de nouveau");
  return { kind, cause };
}
