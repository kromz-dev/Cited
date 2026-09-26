"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const MAX_NAME_LENGTH = 80;

/**
 * Contrat stable pour les rapports (Claude, T032a/T034).
 * Un site peut rester sans client : `clientId` null est un état valide.
 */
export async function listClients() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Unauthorized" };

    const clients = await db.client.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return { data: clients };
  } catch {
    return { error: "Internal server error" };
  }
}

export async function createClient(name: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Unauthorized" };

    const trimmed = name.trim();
    if (!trimmed || trimmed.length > MAX_NAME_LENGTH) {
      return { error: "Indiquez un nom de client (80 caractères maximum)." };
    }

    const client = await db.client.create({
      data: { name: trimmed, userId },
      select: { id: true, name: true },
    });
    revalidatePath("/dashboard");
    return { data: client };
  } catch {
    return { error: "Internal server error" };
  }
}

export async function assignSiteClient(siteId: string, clientId: string | null) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Unauthorized" };

    if (!siteId) return { error: "Site introuvable" };

    if (clientId) {
      const client = await db.client.findFirst({
        where: { id: clientId, userId },
        select: { id: true },
      });
      if (!client) return { error: "Ce client n'existe pas sur ce compte." };
    }

    const updated = await db.monitoredSite.updateMany({
      where: { id: siteId, userId },
      data: { clientId },
    });
    if (updated.count === 0) return { error: "Site introuvable" };

    revalidatePath("/dashboard");
    return { data: { siteId, clientId } };
  } catch {
    return { error: "Internal server error" };
  }
}
