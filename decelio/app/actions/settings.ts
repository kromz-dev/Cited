"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
// Import relatif : `whiteLabelFor` n'est pas mocké dans settings.test.ts (on
// y teste la vraie logique de palier), et Vitest ne résout pas l'alias `@/`
// pour une dépendance chargée réellement plutôt que mockée dans ce dépôt.
import { whiteLabelFor } from "../../lib/billing/plans";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/** Chaîne vide -> `undefined` : un champ logo laissé vide dans le formulaire n'est pas une URL invalide, juste une absence de logo. */
const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const brandSettingsSchema = z.object({
  agencyName: z
    .string()
    .trim()
    .min(1, "Le nom de l'agence est requis.")
    .max(80, "Le nom de l'agence doit faire au plus 80 caractères."),
  accentColor: z
    .string()
    .trim()
    .regex(HEX_COLOR_RE, "La couleur d'accent doit être au format hexadécimal #rrggbb."),
  logoUrl: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(2048, "L'URL du logo doit faire au plus 2048 caractères.")
      .refine((value) => value.startsWith("https://"), {
        message: "L'URL du logo doit être en https://.",
      })
      .optional()
  ),
});

export interface UpdateBrandSettingsInput {
  agencyName: string;
  accentColor: string;
  logoUrl?: string;
}

/**
 * Enregistre les réglages de marque blanche du rapport mensuel (EF-048,
 * EF-050). Réservé aux paliers `PRO`/`SCALE` (`whiteLabelFor`, seule
 * autorité sur les paliers — lib/billing/plans.ts) : un compte sans accès se
 * voit refuser explicitement, avant toute validation ou écriture.
 *
 * L'URL du logo n'est validée ici que sur sa forme (https://, longueur) :
 * le chargement effectif — résolu, revérifié contre le SSRF, typé et borné
 * en taille — se fait uniquement au moment du rendu PDF, via
 * `lib/reports/brandLogo.ts::loadBrandLogo`.
 */
export async function updateBrandSettings(input: UpdateBrandSettingsInput) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user || !whiteLabelFor(user.plan)) {
      return { error: "La marque blanche est incluse à partir du palier Agence." };
    }

    const parsed = brandSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Réglages de marque invalides." };
    }

    const brandSettings = await db.brandSettings.upsert({
      where: { userId },
      update: {
        agencyName: parsed.data.agencyName,
        accentColor: parsed.data.accentColor,
        logoUrl: parsed.data.logoUrl ?? null,
      },
      create: {
        userId,
        agencyName: parsed.data.agencyName,
        accentColor: parsed.data.accentColor,
        logoUrl: parsed.data.logoUrl ?? null,
      },
    });

    revalidatePath("/settings");
    return { data: brandSettings };
  } catch {
    return { error: "Internal server error" };
  }
}
