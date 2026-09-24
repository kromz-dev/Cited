import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callerKey, rateLimit } from "@/lib/rate-limit";
import { hashPassword } from "../../../../../lib/password";
import { passwordResetConfirmSchema } from "../../../../../lib/auth-validation";
import { emailFromPasswordResetIdentifier, hashPasswordResetToken } from "../../../../../lib/password-reset";
import { RESET_CONFIRM_LIMIT_PER_HOUR, RESET_CONFIRM_WINDOW_MS } from "../../../../../lib/auth-password-reset-policy";

export const runtime = "nodejs";

const INVALID_TOKEN_MESSAGE = "Ce lien de réinitialisation est invalide ou a expiré.";

export async function POST(request: Request) {
  const parsed = passwordResetConfirmSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }

  const quota = await rateLimit(callerKey(request, "reset-password-confirm"), RESET_CONFIRM_LIMIT_PER_HOUR, RESET_CONFIRM_WINDOW_MS);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((quota.resetAt.getTime() - Date.now()) / 1000)) } },
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = hashPasswordResetToken(token);

  const record = await db.verificationToken.findUnique({ where: { token: tokenHash } });
  if (!record || record.expires < new Date()) {
    // Un jeton expiré trouvé est nettoyé immédiatement ; un jeton absent (déjà
    // consommé ou jamais émis) ne nécessite rien de plus.
    if (record) {
      await db.verificationToken.delete({ where: { token: tokenHash } }).catch(() => {});
    }
    return NextResponse.json({ error: INVALID_TOKEN_MESSAGE }, { status: 400 });
  }

  const email = emailFromPasswordResetIdentifier(record.identifier);
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    await db.verificationToken.delete({ where: { token: tokenHash } }).catch(() => {});
    return NextResponse.json({ error: INVALID_TOKEN_MESSAGE }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  // Mise à jour du mot de passe et suppression du jeton (usage unique) dans
  // une seule transaction. Les sessions sont des JWT (`auth.config.ts`) : les
  // sessions déjà ouvertes restent valides jusqu'à leur expiration. Les
  // révoquer demanderait une version de session en base, lue dans le
  // callback `jwt`.
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash } }),
    db.verificationToken.delete({ where: { token: tokenHash } }),
  ]);

  return NextResponse.json({ success: true });
}
