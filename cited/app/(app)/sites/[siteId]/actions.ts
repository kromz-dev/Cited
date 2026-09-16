"use server";

import { inngest } from "@/inngest/client";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function launchAuditCampaign(siteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Non authentifié.");
  }

  const site = await db.site.findFirst({
    where: { id: siteId, userId: session.user.id },
    select: { id: true },
  });

  if (!site) {
    throw new Error("Site introuvable.");
  }

  await inngest.send({
    name: "campaign.run",
    data: { siteId: site.id },
  });

  revalidatePath(`/sites/${site.id}`);
}
