import { inngest } from "../client";
import { db } from "@/lib/db";
import { generateMonthlyReportForUser, previousMonth } from "@/lib/reports/monthlyReport";
import { NonRetriableError } from "inngest";

/**
 * T032b (EF-049, EF-051) : automatisation mensuelle du `MonthlyReport`, en
 * plus de la génération à la demande (`generateMonthlyReport`, action
 * serveur). Même schéma en deux temps que `discovery-email.ts` : un
 * dispatcher cron qui fait un `sendEvent` par client, et une fonction par
 * événement qui fait le travail — pour isoler l'échec d'un client sans
 * bloquer les autres.
 *
 * Coûts Inngest Hobby (§8.1 docs/10-plan-technique.md, 50 000 exécutions de
 * step/mois) : le dispatcher est 1 step (+ éventuels steps de `sendEvent`
 * en chunks, non nécessaires ici vu le volume attendu en MVP) une fois par
 * mois ; le générateur est UN SEUL `step.run` par client — jamais un step
 * par site, qui ferait exploser le quota avec le nombre de clients ×
 * sites.
 */
export const monthlyReportDispatcher = inngest.createFunction(
  {
    id: "monthly-report-dispatcher",
    triggers: [{ cron: "TZ=Europe/Paris 0 6 1 * *" }],
  },
  async ({ step }) => {
    const period = previousMonth(new Date());

    // Seuls les clients ayant au moins un site ont quelque chose à
    // rapporter ; `some: {}` évite de générer un rapport vide pour un
    // client sans site.
    const clients = await step.run("fetch-clients-with-sites", async () => {
      return await db.client.findMany({
        where: { sites: { some: {} } },
        select: { id: true, userId: true },
      });
    });

    if (clients.length === 0) {
      return { period, eligible: 0, dispatched: 0 };
    }

    // `id` déterministe par client + période : dédoublonnage Inngest sur
    // 24h, garde-fou si le cron se redéclenche deux fois le même jour, et
    // cohérent avec la clé unique `(clientId, period)` du `MonthlyReport`.
    await step.sendEvent(
      "send-monthly-report-events",
      clients.map((client: { id: string; userId: string }) => ({
        id: `monthly-report-${client.id}-${period}`,
        name: "app/monthly-report.generate",
        data: { clientId: client.id, userId: client.userId, period },
      })),
    );

    return { period, eligible: clients.length, dispatched: clients.length };
  },
);

export const monthlyReportGenerator = inngest.createFunction(
  { id: "monthly-report-generate", triggers: [{ event: "app/monthly-report.generate" }] },
  async ({ event, step }) => {
    const { clientId, userId, period } = event.data;

    // Un seul step.run pour tout le client (rendu PDF + upsert inclus) —
    // voir le commentaire de coût ci-dessus.
    const result = await step.run("generate-report", async () => {
      return await generateMonthlyReportForUser(userId, clientId, period);
    });

    if ("error" in result) {
      // Erreur métier (client introuvable, période invalide) : pas de
      // valeur à retenter, l'événement ne sera jamais rejoué avec succès.
      throw new NonRetriableError(`Monthly report generation failed for ${clientId}/${period}: ${result.error}`);
    }

    return result;
  },
);
