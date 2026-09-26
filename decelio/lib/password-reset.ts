import { randomBytes, createHash } from "node:crypto";

/**
 * Jeton de réinitialisation de mot de passe, réutilisant le modèle Prisma
 * `VerificationToken` (identifier / token / expires) sans migration.
 *
 * Le jeton brut (haute entropie, 32 octets) ne quitte jamais le serveur
 * autrement que dans le lien e-mail : seule son empreinte SHA-256 est
 * stockée en base, pour qu'une fuite de la base ne permette pas de
 * réinitialiser un mot de passe.
 */

const IDENTIFIER_PREFIX = "password-reset:";
const TOKEN_BYTES = 32;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 heure

export function passwordResetIdentifier(email: string): string {
  return `${IDENTIFIER_PREFIX}${email}`;
}

export function emailFromPasswordResetIdentifier(identifier: string): string {
  return identifier.slice(IDENTIFIER_PREFIX.length);
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePasswordResetToken(): { token: string; tokenHash: string; expires: Date } {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
  };
}
