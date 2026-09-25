export interface DailyAvailabilityPoint {
  day: string;
  value: number;
  isAlert: boolean;
}

const MONTHS_FR = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

/**
 * Calcule l'historique quotidien de disponibilité du portefeuille de sites
 * pour une période donnée, à partir des journaux de scan réels.
 *
 * Règle : pour chaque jour et chaque site, on retient le statut du dernier
 * scan de la journée. Un site est disponible si son statut est 'OK'.
 * La disponibilité globale du jour est le pourcentage de sites OK parmi
 * l'ensemble des sites scannés ce jour-là.
 */
export function computeDailyPortfolioAvailability(
  logs: { siteId: string; createdAt: Date; simpleStatus: string | null }[],
  period: { start: Date; end: Date },
): DailyAvailabilityPoint[] {
  if (logs.length === 0) return [];

  // Groupement par jour ISO "YYYY-MM-DD" -> Map<siteId, simpleStatus>
  const logsByDay = new Map<string, Map<string, string | null>>();

  for (const log of logs) {
    if (log.createdAt < period.start || log.createdAt > period.end) continue;
    const dayKey = log.createdAt.toISOString().slice(0, 10);
    let siteMap = logsByDay.get(dayKey);
    if (!siteMap) {
      siteMap = new Map();
      logsByDay.set(dayKey, siteMap);
    }
    // Comme les logs sont passés par ordre chronologique ascendant,
    // le dernier scan de la journée écrase le précédent.
    siteMap.set(log.siteId, log.simpleStatus);
  }

  const sortedDays = Array.from(logsByDay.keys()).sort();

  return sortedDays.map((dayKey) => {
    const siteMap = logsByDay.get(dayKey)!;
    let okCount = 0;
    let total = 0;

    for (const status of siteMap.values()) {
      total++;
      if (status === "OK") {
        okCount++;
      }
    }

    const value = total > 0 ? Math.round((okCount / total) * 100) : 0;
    const [, monthStr, dateStr] = dayKey.split("-");
    const monthIdx = parseInt(monthStr, 10) - 1;
    const dayNum = parseInt(dateStr, 10);
    const day = `${dayNum} ${MONTHS_FR[monthIdx] ?? ""}`;

    return {
      day,
      value,
      isAlert: value < 90,
    };
  });
}
