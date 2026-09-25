import type { Instrumentation } from "next";

/**
 * Appelé une fois au démarrage du serveur Next.js. Rien à initialiser ici :
 * le client PostHog serveur (`lib/posthog-server.ts`) se crée à la volée, à
 * la première exception, pour rester cohérent avec le patron de
 * `lib/posthog-ai.ts` (absent de configuration = aucun envoi, jamais
 * d'échec).
 *
 * Voir docs Next.js locales : node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md
 */
export function register(): void {}

/**
 * Capture les erreurs serveur non interceptées (Server Components, Route
 * Handlers, Server Actions) et les envoie à PostHog (ADR-001, ENF-009).
 * Ne s'exécute que côté Node.js : le SDK `posthog-node` n'est pas conçu
 * pour le runtime Edge.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { captureServerException } = await import("@/lib/posthog-server");
  await captureServerException(err, undefined, {
    path: request.path,
    method: request.method,
  });
};
