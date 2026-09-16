"use server";

import { auth } from "@/auth";
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

export async function addMonitoredSite(data: { name: string; url: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!data.name || !data.url) {
      return { error: "Name and URL are required" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
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

    const site = await db.monitoredSite.create({
      data: {
        name: data.name,
        url: data.url,
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    revalidatePath("/dashboard");
    return { data: site };
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
