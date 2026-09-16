import { inngest } from "../client";
import { db } from "@/lib/db";

export const dailyScanJob = inngest.createFunction(
  { 
    id: "daily-scan-dispatcher"
  },
  { cron: "0 3 * * *" },
  async ({ step }) => {
    const BATCH_SIZE = 500;

    const totalSites = await step.run("get-total-sites", async () => {
      return await db.monitoredSite.count();
    });

    let dispatched = 0;

    for (let offset = 0; offset < totalSites; offset += BATCH_SIZE) {
      const sites = await step.run(`get-batch-${offset}`, async () => {
        return await db.monitoredSite.findMany({
          select: { id: true },
          skip: offset,
          take: BATCH_SIZE
        });
      });

      if (sites.length > 0) {
        await step.sendEvent(`send-events-${offset}`, sites.map(site => ({
          name: "app/scan.site",
          data: { siteId: site.id }
        })));
        dispatched += sites.length;
      }
    }

    return { totalSites, dispatched };
  }
);
