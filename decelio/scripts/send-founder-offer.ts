/**
 * T047 (EF-066) : déclenchement semi-manuel de l'e-mail d'offre fondatrice.
 *
 * Le fondateur décide à la main qui reçoit l'offre, après avoir lu au moins
 * 3 réponses positives au questionnaire de découverte (kit de prospection
 * §5). Ce script ne lit jamais les réponses ni n'automatise cette décision —
 * il se contente d'envoyer l'e-mail pour l'utilisateur donné.
 *
 * Il ne marque PAS `isFounderMember` : c'est le webhook Stripe qui le fait à
 * l'activation réelle du coupon (T039).
 *
 * Usage :
 *   node_modules/.bin/jiti scripts/send-founder-offer.ts <email> [jours=7]
 *
 * (`npx tsx` est indisponible ici : `tsx` n'est pas installé dans
 * node_modules/.bin et l'instruction du projet interdit toute installation.
 * `jiti` — un chargeur TypeScript déjà présent en dépendance transitive —
 * exécute ce fichier .ts sans rien ajouter au projet. La variable
 * JITI_TSCONFIG_PATHS=true est nécessaire pour résoudre l'alias `@/`.)
 */
import { db } from "@/lib/db";
import { sendFounderOffer } from "@/lib/alerting/sendFounderOffer";

async function main() {
  const [email, daysArg] = process.argv.slice(2);

  if (!email) {
    console.error("Usage: send-founder-offer.ts <email> [jours=7]");
    process.exitCode = 1;
    return;
  }

  const days = daysArg ? Number(daysArg) : 7;
  if (!Number.isFinite(days) || days <= 0) {
    console.error(`Nombre de jours invalide : ${daysArg}`);
    process.exitCode = 1;
    return;
  }

  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`Aucun utilisateur trouvé pour ${email}.`);
      process.exitCode = 1;
      return;
    }

    if (user.isFounderMember) {
      console.error(`${email} est déjà membre fondateur — envoi refusé.`);
      process.exitCode = 1;
      return;
    }

    const deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const result = await sendFounderOffer({ email: user.email, name: user.name, deadline });

    if (!result.success) {
      console.error("Échec de l'envoi :", result.error);
      process.exitCode = 1;
      return;
    }

    console.log(`Offre fondatrice envoyée à ${email} (id: ${result.id ?? "?"}).`);
    console.log(`Date limite d'activation : ${deadline.toISOString()}`);
  } catch (error) {
    console.error("Échec de l'envoi :", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main().finally(() => db.$disconnect());
