/** EF-032 : 20 secondes par URL, tous les bots compris. */
export const WORST_SECONDS_PER_SITE = 20;
export const SITES_PER_BATCH = 10;
export const SCAN_CONCURRENCY = 10;

/**
 * Pire cas pour ENF-005. 1 000 sites : 100 lots, 10 vagues,
 * 10 × 10 × 20 s = 2 000 s, soit 0,56 h, sous une heure.
 */
export function worstHoursForSites(siteCount: number): number {
  const batches = Math.ceil(siteCount / SITES_PER_BATCH);
  const waves = Math.ceil(batches / SCAN_CONCURRENCY);
  return (waves * SITES_PER_BATCH * WORST_SECONDS_PER_SITE) / 3600;
}
