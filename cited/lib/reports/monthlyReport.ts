import { db } from "@/lib/db";
import {
  renderMonthlyReportPdf,
  MonthlyReportData,
  ReportVerdictStatus,
  ReportSiteVerdict,
  ReportSiteHistory,
  ReportHistoryEntry,
  ReportIncident,
  ReportIncidentType,
  ReportTechnicalAppendixSite,
  ReportTechnicalEntry,
} from "./renderMonthlyReportPdf";

export interface ReportPeriod {
  start: Date;
  end: Date;
}

export interface ScanLogInput {
  createdAt: Date;
  simpleStatus: string | null;
  cause: string | null;
  payload: string | null;
}

export interface AlertEventInput {
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

export function previousMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0-indexed
  if (month === 0) {
    return `${year - 1}-12`;
  }
  return `${year}-${month.toString().padStart(2, "0")}`;
}

export function monthPeriod(period: string): ReportPeriod {
  const [yearStr, monthStr] = period.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

const KNOWN_STATUSES: ReadonlySet<string> = new Set(["OK", "BLOQUÉ", "COQUILLE VIDE", "ERREUR"]);

function toVerdictStatus(simpleStatus: string | null | undefined): ReportVerdictStatus {
  if (simpleStatus && KNOWN_STATUSES.has(simpleStatus)) {
    return simpleStatus as ReportVerdictStatus;
  }
  return "INCONNU";
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface PayloadBotResult {
  agent?: unknown;
  httpStatus?: unknown;
  reasons?: unknown;
}

export function extractBotResults(payload: string | null): PayloadBotResult[] {
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

export function robotsRuleFor(payload: string | null, bot: string): string | null {
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

export async function getMonthlyReportDataForUser(userId: string, clientId: string, period: ReportPeriod): Promise<{ data: MonthlyReportData } | { error: string }> {
  try {
    const client = await db.client.findFirst({
      where: { id: clientId, userId },
      select: { id: true, name: true },
    });

    if (!client) {
      return { error: "Client introuvable" };
    }

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

export async function generateMonthlyReportForUser(userId: string, clientId: string, periodStr: string): Promise<{ data: { id: string; period: string } } | { error: string }> {
  try {
    const period = monthPeriod(periodStr);
    const dataRes = await getMonthlyReportDataForUser(userId, clientId, period);
    if ("error" in dataRes) {
      return { error: dataRes.error };
    }

    const reportData = dataRes.data;
    const availabilityPct = reportData.sites.length > 0
      ? Math.round(reportData.sites.reduce((acc, s) => acc + (s.availabilityPct ?? 0), 0) / reportData.sites.length)
      : 0;
    const incidentCount = reportData.incidents.length;

    const pdfBuffer = await renderMonthlyReportPdf(reportData);
    
    const report = await db.monthlyReport.upsert({
      where: { clientId_period: { clientId, period: periodStr } },
      update: {
        pdf: pdfBuffer,
        availabilityPct,
        incidentCount,
        generatedAt: new Date(),
      },
      create: {
        clientId,
        period: periodStr,
        pdf: pdfBuffer,
        availabilityPct,
        incidentCount,
        generatedAt: new Date(),
      },
    });

    return { data: { id: report.id, period: report.period } };
  } catch (error) {
    console.error(error);
    return { error: "Internal server error" };
  }
}
