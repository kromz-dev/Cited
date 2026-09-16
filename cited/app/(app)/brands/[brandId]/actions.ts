"use server";

import { inngest } from "@/inngest/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Lance une campagne d'audit sur une marque.
 *
 * Une Server Action est un point d'entrée public au même titre qu'une route
 * d'API : le middleware ne la protège pas. L'identité et la propriété de la
 * marque doivent donc être vérifiées ici, et nulle part ailleurs.
 */
export async function launchAuditCampaign(brandId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié.");
  }

  // Le brandId vient du client : il ne prouve rien tant qu'on ne l'a pas
  // rattaché à l'utilisateur connecté.
  const brand = await db.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
    select: { id: true },
  });

  if (!brand) {
    // Volontairement indiscernable d'une marque inexistante : l'existence
    // d'une marque appartenant à un autre compte ne doit pas être révélée.
    throw new Error("Marque introuvable.");
  }

  await inngest.send({
    name: "campaign.run",
    data: { brandId: brand.id },
  });

  revalidatePath(`/brands/${brand.id}`);
}
