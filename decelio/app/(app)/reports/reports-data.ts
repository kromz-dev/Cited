import { previousMonth } from "@/lib/reports/monthlyReport";
import type { DailyAvailabilityPoint } from "@/lib/reports/portfolio";

export interface ClientReportItem {
  id: string;
  name: string;
  sitesCount: number;
  reports: {
    id: string;
    period: string;
    availabilityPct: number | null;
    incidentCount: number;
    generatedAt: string;
  }[];
}

export interface PeriodOption {
  period: string;
  label: string;
  shortLabel: string;
}

export interface ReportsClientProps {
  initialClients: ClientReportItem[];
  availablePeriods: PeriodOption[];
  defaultPeriod: string;
  dailyAvailabilityByPeriod: Record<string, DailyAvailabilityPoint[]>;
}

export interface ReportsKpiResult {
  avgAvailability: number | null;
  totalDomains: number;
  totalIncidents: number;
  readyReportsCount: number;
}

const MONTH_NAMES_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function formatPeriodLabel(periodStr: string): { label: string; shortLabel: string } {
  const [yearStr, monthStr] = periodStr.split("-");
  const monthIdx = parseInt(monthStr, 10) - 1;
  const shortLabel = MONTH_NAMES_FR[monthIdx] ?? periodStr;
  const label = `${shortLabel} ${yearStr}`;
  return { label, shortLabel };
}

export function buildAvailablePeriods(
  existingPeriods: string[],
  referenceDate: Date = new Date(),
): PeriodOption[] {
  const currentPeriod = `${referenceDate.getUTCFullYear()}-${String(
    referenceDate.getUTCMonth() + 1,
  ).padStart(2, "0")}`;
  const prevPeriod = previousMonth(referenceDate);

  const periodsSet = new Set<string>();
  periodsSet.add(prevPeriod);
  periodsSet.add(currentPeriod);

  for (const p of existingPeriods) {
    if (p && /^\d{4}-\d{2}$/.test(p)) {
      periodsSet.add(p);
    }
  }

  const sortedPeriods = Array.from(periodsSet).sort().reverse();

  return sortedPeriods.map((p) => {
    const { label, shortLabel } = formatPeriodLabel(p);
    return {
      period: p,
      label,
      shortLabel,
    };
  });
}

export function calculateReportsKpi(
  clients: ClientReportItem[],
  selectedPeriod: string,
): ReportsKpiResult {
  const clientsWithReports = clients.map((client) => ({
    ...client,
    currentReport: client.reports.find((r) => r.period === selectedPeriod),
  }));

  const reportsForSelectedPeriod = clientsWithReports
    .map((c) => c.currentReport)
    .filter((r): r is NonNullable<typeof r> => !!r);

  const validAvailabilities = reportsForSelectedPeriod
    .map((r) => r.availabilityPct)
    .filter((v): v is number => typeof v === "number");

  const avgAvailability =
    validAvailabilities.length > 0
      ? Math.round(
          validAvailabilities.reduce((sum, val) => sum + val, 0) / validAvailabilities.length,
        )
      : null;

  const totalDomains = clients.reduce((sum, c) => sum + c.sitesCount, 0);
  const totalIncidents = reportsForSelectedPeriod.reduce(
    (sum, r) => sum + r.incidentCount,
    0,
  );
  const readyReportsCount = reportsForSelectedPeriod.length;

  return {
    avgAvailability,
    totalDomains,
    totalIncidents,
    readyReportsCount,
  };
}
