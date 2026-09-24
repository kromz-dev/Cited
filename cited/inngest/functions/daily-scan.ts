import { inngest } from "../client";
import { db } from "@/lib/db";

const BATCH_SIZE = 500;

export const dailyScanJob = inngest.createFunction(
  { 
    id: "daily-scan-dispatcher",
    triggers: [{ cron: "0 3 * * *" }],
  },
  async ({ step }) => {
    
    const allSites = await step.run("fetch-all-sites", async () => {
      return await db.monitoredSite.findMany({ select: { id: true } });
    });

    let dispatched = 0;
    const chunks = [];
    for (let i = 0; i < allSites.length; i += BATCH_SIZE) {
      chunks.push(allSites.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      await step.sendEvent(`send-events-${i}`, chunk.map((site: { id: string }) => ({
        name: "app/scan.site",
        data: { siteId: site.id }
      })));
      dispatched += chunk.length;
    }

    return { totalSites: allSites.length, dispatched };
  }
);
