"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Export RGPD (EF-015 / ENF-003).
 *
 * `exportUserData` assemble l'intégralité des données personnelles de
 * l'utilisateur CONNECTÉ — jamais un id transmis par le client, toujours
 * `session.user.id`. Livraison choisie : un Route Handler
 * (`GET /api/account/export`, voir `app/api/account/export/route.ts`) plutôt
 * qu'un fetch + Blob côté client, parce qu'un simple lien `<a href download>`
 * suffit à déclencher le téléchargement sans JavaScript supplémentaire, à
 * l'image de `app/api/pdf/diagnostic/route.ts`. La logique d'assemblage vit
 * ici pour rester testable sans dépendre du Web Fetch/Response de Next.
 *
 * Champs volontairement exclus :
 * - `passwordHash` (secret d'authentification)
 * - toute ligne `Account`/`Session` (jetons OAuth, jetons de session)
 * - les secrets Stripe : seuls des identifiants (stripeCustomerId,
 *   stripeSubscriptionId, stripePriceId) et des dates sont exposés, jamais de
 *   clé API ni de jeton webhook (ceux-ci ne sont d'ailleurs pas stockés en base)
 *
 * Limite de volume : les 90 derniers scans (`ScanLog`) par site surveillé,
 * pour garder l'export exploitable sur un compte actif depuis longtemps —
 * même logique de bornage que `SiteDetailPage` (qui n'affiche que les 10
 * derniers), documentée ici explicitement.
 */
const SCAN_LOG_EXPORT_LIMIT = 90;

export async function exportUserData() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const [user, monitoredSites, clients, brandSettings, legacySites] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          stripePriceId: true,
          stripeCurrentPeriodEnd: true,
          cancelledAt: true,
          purgeAt: true,
          dataExportedAt: true,
          isFounderMember: true,
          founderOfferAt: true,
          createdAt: true,
        },
      }),
      db.monitoredSite.findMany({
        where: { userId },
        include: {
          scanLogs: { orderBy: { createdAt: "desc" }, take: SCAN_LOG_EXPORT_LIMIT },
          alertEvents: { orderBy: { sentAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.client.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.brandSettings.findUnique({ where: { userId } }),
      db.site.findMany({
        where: { userId },
        include: {
          pages: {
            select: { id: true, url: true, path: true, isActive: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!user) {
      return { error: "Unauthorized" };
    }

    await db.user.update({
      where: { id: userId },
      data: { dataExportedAt: new Date() },
    });

    return {
      data: {
        exportedAt: new Date().toISOString(),
        profile: user,
        monitoredSites,
        clients,
        brandSettings,
        legacySites,
      },
    };
  } catch {
    return { error: "Internal server error" };
  }
}
