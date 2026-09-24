import { inngest } from "../client";
import { db } from "@/lib/db";
import { runCoreScan } from "@/lib/scanner/core";
import { NonRetriableError } from "inngest";
import { logFailure } from "../../lib/log";

export const scanSiteJob = inngest.createFunction(
  { 
    id: "scan-single-site",
    concurrency: {
      limit: 10,
    },
    triggers: [{ event: "app/scan.site" }],
  },
  async ({ event, step }) => {
    const { siteId } = event.data;

    const site = await step.run("fetch-site", async () => {
      return await db.monitoredSite.findUnique({
        where: { id: siteId },
        include: { user: true }
      });
    });

    if (!site) {
      logFailure("scan.site_missing", { siteId });
      throw new NonRetriableError(`Site not found: ${siteId}`);
    }

    const scan = await step.run("run-scan", async () => {
      const { report, results } = await runCoreScan(site.url, ["GPTBot"]);
      const summary = results.find((r) => r.agent === "GPTBot") || results[0];
      return { summary, report };
    });

    const gptResult = scan.summary;
    const newStatus = gptResult.simpleStatus;
    
    await step.run("log-scan", async () => {
      await db.scanLog.create({
        data: {
          siteId: site.id,
          httpStatus: gptResult.httpStatus,
          // Les trois résultats (robots.txt, accès, JS) restent séparés dans le journal.
          payload: JSON.stringify(scan)
        }
      });
    });

    const oldStatus = site.status;

    if (oldStatus !== newStatus) {
      await step.run("update-status-and-alert", async () => {
        await db.monitoredSite.update({
          where: { id: site.id },
          data: { status: newStatus }
        });

      });
    }

    return { siteId, oldStatus, newStatus };
  }
);
