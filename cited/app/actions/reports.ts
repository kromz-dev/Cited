"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import type {
  MonthlyReportData,
  ReportVerdictStatus,
  ReportSiteVerdict,
  ReportSiteHistory,
  ReportHistoryEntry,
  ReportIncident,
  ReportIncidentType,
  ReportTechnicalAppendixSite,
  ReportTechnicalEntry,
} from "@/lib/reports/renderMonthlyReportPdf";

/**
 * T032a — Agrégation des données d'un client sur une période, pour le
 * rapport mensuel en marque blanche (EF-047, EF-049, EF-051).
 *
 * Séparation volontaire : `aggregateMonthlyReport` est une fonction pure
 * (aucun accès base, entièrement testable avec des fixtures) ; seule
 * `getMonthlyReportData` touche Prisma. Cette action ne fait aucune
 * écriture en base — la persistance du `MonthlyReport` (PDF, compteurs)
 * est T032b.
 */

export interface ReportPeriod {
  start: Date;
  end: Date;
}

interface ScanLogInput {
  createdAt: Date;
  simpleStatus: string | null;
  cause: string | null;
  payload: string | null;
}

interface AlertEventInput {
  type: string;
  cause: string;
  fix: string | null;
  sentAt: Date;
}

export interface AggregateMonthlySiteInput {
  id: string;
  name: string;
  url: string;
  scanLogs: ScanLogInput[];
  alertEvents: AlertEventInput[];
}

export interface AggregateMonthlyReportInput {
  clientName: string;
  period: ReportPeriod;
  sites: AggregateMonthlySiteInput[];
}

/** Seules valeurs réellement écrites dans `ScanLog.simpleStatus` par le scan (lib/scanner/core.ts `SimpleStatus`). */
const KNOWN_STATUSES: ReadonlySet<string> = new Set(["OK", "BLOQUÉ", "COQUILLE VIDE", "ERREUR"]);

/** Convertit `ScanLog.simpleStatus` (texte libre nullable en base) vers le type strict du rapport. */
function toVerdictStatus(simpleStatus: string | null | undefined): ReportVerdictStatus {
  if (simpleStatus && KNOWN_STATUSES.has(simpleStatus)) {
    return simpleStatus as ReportVerdictStatus;
  }
  return "INCONNU";
}

/** Clé de jour AAAA-MM-JJ en UTC, pour rester déterministe indépendamment du fuseau du serveur. */
function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Sous-ensemble utile de `ScanCoreResult` (lib/scanner/core.ts) tel que sérialisé dans `ScanLog.payload`. */
interface PayloadBotResult {
  agent?: unknown;
  httpStatus?: unknown;
  reasons?: unknown;
}

/**
 * Extrait la liste des résultats par assistant d'un payload de `ScanLog`.
 * Le format réellement écrit (inngest/functions/scan-site.ts) est
 * `{ summary: ScanCoreResult, report: ScanReport }` — un seul assistant. On
 * accepte aussi `{ results: ScanCoreResult[] }` (plusieurs assistants, forme
 * de `runCoreScan`/`CoreScanOutput` dans lib/scanner/core.ts) pour rester
 * utile si l'appelant change de forme un jour.
 *
 * `payload` est `String?` en base et devient `null` après la purge T056
 * (inngest/functions/prune-scan-logs.ts, qui préserve `simpleStatus`/`cause`
 * mais vide `payload`) ; le JSON peut aussi être absent ou inattendu. On ne
 * lance jamais dans ces cas : on retourne `[]`.
 */
function extractBotResults(payload: string | null): PayloadBotResult[] {
  if (!payload) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];
  const obj = parsed as Record<string, unknown>;
  if (Array.isArray(obj.results)) {
    return obj.results.filter((r): r is PayloadBotResult => !!r && typeof r === "object");
  }
  if (obj.summary && typeof obj.summary === "object") {
    return [obj.summary as PayloadBotResult];
  }
  return [];
}

/** Règle robots.txt appliquée à `bot`, lue dans `report.robots.policies` du même payload. */
function robotsRuleFor(payload: string | null, bot: string): string | null {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as { report?: { robots?: { policies?: unknown } } };
    const policies = parsed?.report?.robots?.policies;
    if (!Array.isArray(policies)) return null;
    const policy = policies.find(
      (p): p is { bot?: unknown; verdict?: unknown; token?: unknown } =>
        !!p && typeof p === "object" && (p as { bot?: unknown }).bot === bot,
    );
    if (!policy || typeof policy.verdict !== "string") return null;
    const token = typeof policy.token === "string" ? policy.token : bot;
    return `${policy.verdict} (${token})`;
  } catch {
    return null;
  }
}

/**
 * Agrège les données d'un client sur une période en `MonthlyReportData`
 * (type consommé par `renderMonthlyReportPdf`, EF-047/049/051). Fonction
 * pure : aucun accès base.
 *
 * Règle de disponibilité (`availabilityPct`) : pour chaque jour où AU MOINS
 * un scan existe, on retient le statut du DERNIER scan de ce jour-là ; un
 * jour sans aucun scan est exclu du dénominateur (ni OK ni dégradé) et
 * n'apparaît pas dans l'historique. `availabilityPct` = (jours OK / jours
 * scannés) × 100, arrondi à l'entier le plus proche ; 0 si aucun scan sur la
 * période.
 *
 * `degradedDays` compte les jours consécutifs en état non-OK en partant du
 * dernier jour scanné de la période et en remontant, jusqu'au premier jour
 * OK (les jours sans scan sont absents de cette séquence, donc ils ne
 * l'interrompent pas par eux-mêmes).
 */
export function aggregateMonthlyReport(input: AggregateMonthlyReportInput): MonthlyReportData {
  const sites: ReportSiteVerdict[] = [];
  const history: ReportSiteHistory[] = [];
  const incidents: ReportIncident[] = [];
  const technicalAppendix: ReportTechnicalAppendixSite[] = [];

  for (const site of input.sites) {
    const logsAsc = [...site.scanLogs].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    const lastLogByDay = new Map<string, ScanLogInput>();
    for (const log of logsAsc) {
      lastLogByDay.set(dayKey(log.createdAt), log);
    }
    const sortedDayKeys = [...lastLogByDay.keys()].sort();
    const entries: ReportHistoryEntry[] = sortedDayKeys.map((key) => {
      const log = lastLogByDay.get(key)!;
      return { date: log.createdAt.toISOString(), status: toVerdictStatus(log.simpleStatus) };
    });
    history.push({ site: site.name, entries });

    const okDays = entries.filter((e) => e.status === "OK").length;
    const availabilityPct = entries.length === 0 ? 0 : Math.round((okDays / entries.length) * 100);

    let degradedDays = 0;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].status === "OK") break;
      degradedDays++;
    }

    const latestLog = logsAsc[logsAsc.length - 1] as ScanLogInput | undefined;
    const currentStatus = toVerdictStatus(latestLog?.simpleStatus);

    sites.push({ name: site.name, url: site.url, currentStatus, availabilityPct, degradedDays });

    for (const event of site.alertEvents) {
      incidents.push({
        site: site.name,
        type: (event.type === "RESOLUTION" ? "RESOLUTION" : "REGRESSION") as ReportIncidentType,
        cause: event.cause,
        fix: event.fix ?? undefined,
        occurredAt: event.sentAt.toISOString(),
      });
    }

    const botResults = latestLog ? extractBotResults(latestLog.payload) : [];
    const technicalEntries: ReportTechnicalEntry[] = botResults.map((result) => {
      const bot = typeof result.agent === "string" ? result.agent : "inconnu";
      const lastHttpStatus = typeof result.httpStatus === "number" ? result.httpStatus : null;
      const reasonList = Array.isArray(result.reasons)
        ? result.reasons.filter((r): r is string => typeof r === "string")
        : [];
      const cause = reasonList.length > 0 ? reasonList.join("; ") : (latestLog?.cause ?? null);
      return { bot, lastHttpStatus, robotsRule: robotsRuleFor(latestLog?.payload ?? null, bot), cause };
    });
    technicalAppendix.push({ site: site.name, entries: technicalEntries });
  }

  incidents.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  return {
    period: { start: input.period.start.toISOString(), end: input.period.end.toISOString() },
    clientName: input.clientName,
    sites,
    history,
    incidents,
    technicalAppendix,
  };
}

/**
 * Action serveur : charge le client du compte CONNECTÉ (jamais un id
 * transmis tel quel — toujours filtré par `session.user.id`, sur le modèle
 * de `exportUserData` dans `app/actions/gdpr.ts`), ses sites et les
 * journaux/alertes de la période, puis délègue à `aggregateMonthlyReport`.
 * Aucune écriture en base (voir T032b).
 */
export async function getMonthlyReportData(
  clientId: string,
  period: ReportPeriod,
): Promise<{ data: MonthlyReportData } | { error: string }> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "Unauthorized" };
    }

    if (
      !clientId ||
      !(period.start instanceof Date) ||
      !(period.end instanceof Date) ||
      period.start.getTime() > period.end.getTime()
    ) {
      return { error: "Requête invalide" };
    }

    // Filtre par userId : un client d'un autre compte est introuvable, pas
    // "interdit" — même refus explicite que `deleteMonitoredSite` (sites.ts).
    const client = await db.client.findFirst({
      where: { id: clientId, userId },
      select: { id: true, name: true },
    });

    if (!client) {
      return { error: "Client introuvable" };
    }

    // Les sites sont scopés par clientId (déjà vérifié propriété ci-dessus),
    // avec une fenêtre de dates et des champs sélectionnés sur les relations
    // — jamais un `include` non borné.
    const sites = await db.monitoredSite.findMany({
      where: { clientId: client.id },
      select: {
        id: true,
        name: true,
        url: true,
        scanLogs: {
          where: { createdAt: { gte: period.start, lte: period.end } },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true, simpleStatus: true, cause: true, payload: true },
        },
        alertEvents: {
          where: { sentAt: { gte: period.start, lte: period.end } },
          orderBy: { sentAt: "asc" },
          select: { type: true, cause: true, fix: true, sentAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const data = aggregateMonthlyReport({ clientName: client.name, period, sites });

    return { data };
  } catch {
    return { error: "Internal server error" };
  }
}
