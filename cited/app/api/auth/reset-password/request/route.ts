import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callerKey, rateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { passwordResetRequestSchema } from "../../../../../lib/auth-validation";
import { generatePasswordResetToken, passwordResetIdentifier } from "../../../../../lib/password-reset";
import { RESET_REQUEST_LIMIT_PER_HOUR, RESET_REQUEST_WINDOW_MS } from "../../../../../lib/auth-password-reset-policy";

export const runtime = "nodejs";

// Message identique que le compte existe ou non : pas d'énumération de comptes.
const GENERIC_MESSAGE = "Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d'être envoyé.";

export async function POST(request: Request) {
  const parsed = passwordResetRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }

  const quota = await rateLimit(callerKey(request, "reset-password-request"), RESET_REQUEST_LIMIT_PER_HOUR, RESET_REQUEST_WINDOW_MS);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((quota.resetAt.getTime() - Date.now()) / 1000)) } },
    );
  }

  const { email } = parsed.data;
  const identifier = passwordResetIdentifier(email);

  // Une nouvelle demande invalide toujours les précédentes, que le compte
  // existe ou non : évite de révéler l'existence du compte par le timing.
  await db.verificationToken.deleteMany({ where: { identifier } });

  const user = await db.user.findUnique({ where: { email }, select: { passwordHash: true } });
  if (user?.passwordHash) {
    const { token, tokenHash, expires } = generatePasswordResetToken();
    await db.verificationToken.create({ data: { identifier, token: tokenHash, expires } });
    await sendPasswordResetEmail(email, token);
  }

  return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
}
