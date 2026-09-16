import { inngest } from "../client";
import { db } from "@/lib/db";
import { runCoreScan } from "@/lib/scanner/core";
import { sendRegressionAlert } from "@/lib/alerting/sendAlert";

export const scanSiteJob = inngest.createFunction(
  { 
    id: "scan-single-site",
    concurrency: {
      limit: 10,
    }
  },
  { event: "app/scan.site" },
  async ({ event }) => {
    const { siteId } = event.data;

    const site = await db.monitoredSite.findUnique({
      where: { id: siteId },
      include: { user: true }
    });

    if (!site) {
      throw new Error(`Site not found: ${siteId}`);
    }

    // We use GPTBot for the daily scan check
    const results = await runCoreScan(site.url, ["GPTBot"]);
    const gptResult = results.find((r: any) => r.agent === "GPTBot") || results[0];
    const newStatus = gptResult.simpleStatus;
    
    // Log the result
    await db.scanLog.create({
      data: {
        siteId: site.id,
        httpStatus: gptResult.httpStatus,
        payload: JSON.stringify(gptResult)
      }
    });

    const oldStatus = site.status;

    // If status changed, update and potentially alert
    if (oldStatus !== newStatus) {
      await db.monitoredSite.update({
        where: { id: site.id },
        data: { status: newStatus }
      });

      // Check for regression
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
    }

    return { siteId, oldStatus, newStatus };
  }
);
