export function consecutiveDaysDown(points: { date: string; degraded: boolean }[]): number {
  const degraded = new Map(points.map((point) => [point.date, point.degraded]));
  const latest = [...degraded.keys()].sort().at(-1);
  if (!latest) return 0;

  let count = 0;
  const cursor = new Date(`${latest}T00:00:00Z`);
  while (degraded.get(cursor.toISOString().slice(0, 10)) === true) {
    count += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}
