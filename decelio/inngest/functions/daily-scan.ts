import { inngest } from "../client";
import { db } from "@/lib/db";

/** Un événement porte 10 sites : 1 lancement + 10 steps = 1,1 exécution par site. */
const SCAN_BATCH_SIZE = 10;

export const dailyScanJob = inngest.createFunction(
  { 
    id: "daily-scan-dispatcher",
    triggers: [{ cron: "0 3 * * *" }],
  },
  async ({ step }) => {
    
    const allSites = await step.run("fetch-all-sites", async () => {
      return await db.monitoredSite.findMany({ select: { id: true } });
    });

    const batches: string[][] = [];
    for (let i = 0; i < allSites.length; i += SCAN_BATCH_SIZE) {
      batches.push(allSites.slice(i, i + SCAN_BATCH_SIZE).map((site) => site.id));
    }

    if (batches.length > 0) {
      await step.sendEvent(
        "dispatch-scan-batches",
        batches.map((siteIds) => ({
          name: "app/scan.site" as const,
          data: { siteIds },
        })),
      );
    }

    return { totalSites: allSites.length, dispatched: allSites.length, batches: batches.length };
  }
);
