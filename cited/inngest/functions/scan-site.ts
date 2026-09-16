import { inngest } from "../client";
import { db } from "@/lib/db";
import { runCoreScan } from "@/lib/scanner/core";
import { sendRegressionAlert } from "@/lib/alerting/sendAlert";
import { NonRetriableError } from "inngest";

export const scanSiteJob = inngest.createFunction(
  { 
    id: "scan-single-site",
    concurrency: {
      limit: 10,
    }
  },
  { event: "app/scan.site" },
  async ({ event, step }) => {
    const { siteId } = event.data;

    const site = await step.run("fetch-site", async () => {
      return await db.monitoredSite.findUnique({
        where: { id: siteId },
        include: { user: true }
      });
    });

    if (!site) {
      throw new NonRetriableError(`Site not found: ${siteId}`);
    }

    const gptResult = await step.run("run-scan", async () => {
      const results = await runCoreScan(site.url, ["GPTBot"]);
      const result = results.find((r: any) => r.agent === "GPTBot") || results[0];
      return result;
    });

    const newStatus = gptResult.simpleStatus;
    
    await step.run("log-scan", async () => {
      await db.scanLog.create({
        data: {
          siteId: site.id,
          httpStatus: gptResult.httpStatus,
          payload: JSON.stringify(gptResult)
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

        const isRegression = 
          (oldStatus === "ACTIVE" || oldStatus === "OK") && 
          (newStatus === "BLOQUÉ" || newStatus === "COQUILLE VIDE");

        if (isRegression) {
          await sendRegressionAlert(
            site.user.email,
            site.url,
            oldStatus,
            newStatus
          );
        }
      });
    }

    return { siteId, oldStatus, newStatus };
  }
);
