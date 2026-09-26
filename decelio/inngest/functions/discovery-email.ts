import { inngest } from "../client";
import { db } from "@/lib/db";
import { sendDiscoveryEmail } from "@/lib/email/resend";

// T046 (EF-064/EF-065) : fenêtre de sélection des comptes créés il y a
// exactement 3 jours pleins. Bornes [now-4j, now-3j[ : un cron quotidien qui
// tourne toujours à la même heure ne repasse jamais deux fois sur le même
// compte, sans avoir besoin d'un champ "discoveryEmailSentAt" en base.
export function discoveryWindow(now: Date): { gte: Date; lt: Date } {
  const gte = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const lt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  return { gte, lt };
}

export const discoveryEmailDispatcher = inngest.createFunction(
  {
    id: "send-discovery-email",
    triggers: [{ cron: "TZ=Europe/Paris 0 9 * * *" }],
  },
  async ({ step }) => {
    const { gte, lt } = discoveryWindow(new Date());

    const users = await step.run("fetch-eligible-users", async () => {
      return await db.user.findMany({
        where: {
          createdAt: { gte, lt },
          email: { not: "" },
        },
        select: { id: true, email: true, name: true },
      });
    });

    if (users.length === 0) {
      return { eligible: 0, dispatched: 0 };
    }

    // `id` déterministe par utilisateur : déduplication Inngest sur 24h,
    // garde-fou si le cron se redéclenche deux fois le même jour.
    await step.sendEvent(
      "send-discovery-email-events",
      users.map((user: { id: string; email: string; name: string | null }) => ({
        id: `discovery-email-${user.id}`,
        name: "app/discovery-email.send",
        data: { userId: user.id, email: user.email, name: user.name },
      })),
    );

    return { eligible: users.length, dispatched: users.length };
  },
);

export const discoveryEmailSender = inngest.createFunction(
  { id: "discovery-email-send", triggers: [{ event: "app/discovery-email.send" }] },
  async ({ event, step }) => {
    await step.run("send-discovery-email", async () => {
      return await sendDiscoveryEmail(event.data.email, event.data.name);
    });
  },
);
