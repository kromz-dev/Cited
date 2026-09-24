import { inngest } from "../client";
import { db } from "@/lib/db";
import { transitionForSite } from "@/lib/alerting/alert-digest";
import { sendDailyDigest, suggestFix, type AlertSiteChange } from "@/lib/alerting/sendAlert";

/**
 * Un passage, un e-mail par compte. 4 h 30, après le scan de 3 h.
 * 1 lancement + 1 step = 2 exécutions par jour.
 */
export const alertDigestJob = inngest.createFunction(
  { id: "alert-digest", triggers: [{ cron: "30 4 * * *" }] },
  async ({ step }) => {
    return step.run("send-one-email-per-account", async () => {
      const users = await db.user.findMany({
        select: {
          email: true,
          monitoredSites: {
            select: {
              id: true,
              url: true,
              scanLogs: {
                orderBy: { createdAt: "desc" },
                take: 2,
                select: { createdAt: true, simpleStatus: true, httpStatus: true, cause: true },
              },
              alertEvents: {
                orderBy: { sentAt: "desc" },
                take: 1,
                select: { type: true, sentAt: true },
              },
            },
          },
        },
      });

      let emails = 0;
      for (const user of users) {
        const regressions: AlertSiteChange[] = [];
        const resolutions: AlertSiteChange[] = [];
        for (const site of user.monitoredSites) {
          const change = transitionForSite(site.scanLogs, site.alertEvents[0] ?? null);
          if (!change) continue;
          const item = {
            siteId: site.id,
            domain: site.url,
            cause: change.cause,
            fix: suggestFix(change.cause),
          };
          if (change.kind === "REGRESSION") regressions.push(item);
          else resolutions.push(item);
        }
        if (regressions.length + resolutions.length === 0) continue;
        await sendDailyDigest(user.email, { regressions, resolutions });
        emails += 1;
      }
      return { emails };
    });
  },
);
