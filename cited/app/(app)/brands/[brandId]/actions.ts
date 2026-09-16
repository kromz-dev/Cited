"use server"

import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";

export async function launchAuditCampaign(brandId: string) {
  await inngest.send({
    name: "campaign.run",
    data: { brandId }
  });

  // Revalider la page pour afficher l'état "En cours"
  revalidatePath(`/brands/${brandId}`);
}
