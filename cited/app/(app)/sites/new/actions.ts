"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function createSite(data: { name: string; domain: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

  const site = await db.site.create({
    data: {
      userId,
      name: data.name,
      domain: data.domain,
    }
  });

  redirect(`/sites/${site.id}`);
}
