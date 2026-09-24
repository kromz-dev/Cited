"use server";

import { auth } from "@/auth";
import { maxSitesFor } from "@/lib/billing/plans";
import { db } from "@/lib/db";
import { assertSafeUrl } from "@/lib/scanner/crawler";
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
    return `Limite du plan Solo atteinte (${maxSites} sites). Passez au plan Pro pour continuer.`;
  }
  if (plan === "PRO") {
    return `Limite du plan Pro atteinte (${maxSites} sites). Passez au plan Scale pour continuer.`;
  }
  return `Plafond du plan Scale atteint (${maxSites} sites).`;
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

    let safeUrl: string;
    try {
      safeUrl = await assertSafeUrl(data.url);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "URL refusée",
      };
    }

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
        return { error: "Abonnement requis" as const };
      }

      const maxSites = maxSitesFor(user.plan);
      const count = await tx.monitoredSite.count({ where: { userId } });
      if (count >= maxSites) {
        return { error: quotaReachedMessage(user.plan, maxSites) as const };
      }

      const site = await tx.monitoredSite.create({
        data: {
          name: data.name,
          url: safeUrl,
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

const BULK_LINE_CAP = 100;

function parseBulkLine(line: string): { name: string; url: string } {
  const comma = line.indexOf(",");
  if (comma === -1) {
    const url = /^https?:\/\//i.test(line) ? line : `https://${line}`;
    const name = line.replace(/^https?:\/\//i, "").replace(/\/.*$/, "") || line;
    return { name, url };
  }
  const name = line.slice(0, comma).trim();
  const rawUrl = line.slice(comma + 1).trim();
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  return { name: name || rawUrl, url };
}

export async function addMonitoredSitesBulk(raw: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;
    const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const skipped: { line: string; reason: string }[] = [];
    const capped = lines.slice(0, BULK_LINE_CAP);
    for (const line of lines.slice(BULK_LINE_CAP)) {
      skipped.push({ line, reason: "Trop de lignes (maximum 100)." });
    }

    const checked = await Promise.all(
      capped.map(async (line) => {
        const parsed = parseBulkLine(line);
        try {
          const safe = await assertSafeUrl(parsed.url);
          return { line, name: parsed.name, safe };
        } catch (error) {
          return {
            line,
            error: error instanceof Error ? error.message : "URL refusée",
          };
        }
      }),
    );

    const seen = new Set<string>();
    const candidates: { line: string; name: string; url: string }[] = [];
    for (const row of checked) {
      if ("error" in row) {
        skipped.push({ line: row.line, reason: row.error });
        continue;
      }
      if (seen.has(row.safe)) {
        skipped.push({ line: row.line, reason: "Doublon dans la liste." });
        continue;
      }
      seen.add(row.safe);
      candidates.push({ line: row.line, name: row.name, url: row.safe });
    }

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
        return { error: "Abonnement requis" as const };
      }

      const existing = await tx.monitoredSite.findMany({
        where: { userId },
        select: { url: true },
      });
      const owned = new Set(existing.map((site) => site.url));
      const heldBack: { line: string; reason: string }[] = [];
      const fresh = candidates.filter((candidate) => {
        if (!owned.has(candidate.url)) return true;
        heldBack.push({ line: candidate.line, reason: "Déjà surveillé." });
        return false;
      });

      const maxSites = maxSitesFor(user.plan);
      const count = await tx.monitoredSite.count({ where: { userId } });
      const room = Math.max(0, maxSites - count);
      const accepted = fresh.slice(0, room);
      for (const candidate of fresh.slice(room)) {
        heldBack.push({ line: candidate.line, reason: quotaReachedMessage(user.plan, maxSites) });
      }

      const created = [];
      for (const candidate of accepted) {
        created.push(
          await tx.monitoredSite.create({
            data: {
              name: candidate.name,
              url: candidate.url,
              userId,
              status: "ACTIVE",
            },
          }),
        );
      }

      return { data: { created, skipped: heldBack } };
    });

    if ("error" in result) {
      return result;
    }

    revalidatePath("/dashboard");
    return {
      data: {
        created: result.data.created,
        skipped: [...skipped, ...result.data.skipped],
      },
    };
  } catch (error) {
    return { error: "Internal server error" };
  }
}
