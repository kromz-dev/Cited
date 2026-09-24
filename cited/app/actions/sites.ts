"use server";

import { auth } from "@/auth";
import { PLAN_LIMITS, maxSitesFor } from "@/lib/billing/plans";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getMonitoredSites() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const sites = await db.monitoredSite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return { data: sites };
  } catch (error) {
    return { error: "Internal server error" };
  }
}

function quotaReachedMessage(plan: string, maxSites: number): string {
  if (plan === "SOLO") {
    return `Vous surveillez déjà ${maxSites} sites, le maximum du palier Freelance. Passez au palier Agence (${PLAN_LIMITS.PRO.maxSites} sites) pour en ajouter.`;
  }
  if (plan === "PRO") {
    return `Vous surveillez déjà ${maxSites} sites, le maximum du palier Agence. Passez au palier Studio (${PLAN_LIMITS.SCALE.maxSites} sites) pour en ajouter.`;
  }
  return "Au-delà, chaque site coûte 2 € par mois : contactez-nous pour l'activer.";
}

export async function addMonitoredSite(data: { name: string; url: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!data.name || !data.url) {
      return { error: "Name and URL are required" };
    }

    const userId = session.user.id;

    // Le décompte et l'insertion sont dans la même transaction : deux ajouts
    // simultanés ne peuvent pas tous les deux passer sous la limite.
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { stripeCurrentPeriodEnd: true, plan: true },
      });

      if (
        !user ||
        user.plan === "FREE" ||
        !user.stripeCurrentPeriodEnd ||
        user.stripeCurrentPeriodEnd.getTime() < Date.now()
      ) {
        return { error: "Abonnement requis" };
      }

      const maxSites = maxSitesFor(user.plan);
      const count = await tx.monitoredSite.count({ where: { userId } });
      if (count >= maxSites) {
        return { error: quotaReachedMessage(user.plan, maxSites) };
      }

      const site = await tx.monitoredSite.create({
        data: {
          name: data.name,
          url: data.url,
          userId,
          status: "ACTIVE",
        },
      });

      return { data: site };
    });

    if ("error" in result) {
      return result;
    }

    revalidatePath("/dashboard");
    return result;
  } catch (error) {
    return { error: "Internal server error" };
  }
}

export async function deleteMonitoredSite(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const result = await db.monitoredSite.deleteMany({
      where: { 
        id: id,
        userId: session.user.id 
      },
    });

    if (result.count === 0) {
      return { error: "Site not found or forbidden" };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Internal server error" };
  }
}
