/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { detectBrandContext } from "@/lib/prompts/query-generator"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function detectBrand(formData: FormData) {
  const domain = formData.get("domain") as string;
  const brandName = formData.get("brandName") as string;
  
  if (!domain || !brandName) {
    throw new Error("Champs manquants");
  }

  const result = await detectBrandContext(domain, brandName);
  return result;
}

export async function createBrand(data: any) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Non autorisé");

  const brand = await db.brand.create({
    data: {
      userId,
      name: data.brandName,
      brandName: data.brandName,
      domain: data.domain,
      industry: data.industry,
      groundTruth: data.groundTruth,
      prompts: {
        create: data.prompts.map((p: string) => ({
          text: p,
          family: "DISCOVERY" // simplifié pour V1
        }))
      },
      competitors: {
        create: data.competitors.map((c: any) => ({
          brandName: c.name,
          domain: c.domain
        }))
      }
    }
  });

  redirect(`/brands/${brand.id}`);
}
