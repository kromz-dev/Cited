import { PostHog } from "posthog-node";

let posthogServerClient: PostHog | null | undefined;

function getPostHogServerClient(): PostHog | null {
  if (posthogServerClient !== undefined) return posthogServerClient;

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  // PostHog est optionnel (ADR-001) : l'observabilité ne doit jamais faire
  // échouer une requête utilisateur. Sans configuration, on n'envoie rien.
  if (!token || !host) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "PostHog désactivé côté serveur : NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN et NEXT_PUBLIC_POSTHOG_HOST sont requis.",
      );
    }
    posthogServerClient = null;
    return posthogServerClient;
  }

  posthogServerClient = new PostHog(token, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogServerClient;
}

/**
 * Reports a server-side exception to PostHog and never throws. Used by
 * `instrumentation.ts` (`onRequestError`) to capture unhandled errors from
 * Server Components, Route Handlers and Server Actions (ADR-001, ENF-009).
 *
 * Without `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`/`NEXT_PUBLIC_POSTHOG_HOST` this
 * is a no-op: the request that triggered the original error is never made
 * to fail a second time because of an observability problem.
 */
export async function captureServerException(
  error: unknown,
  distinctId?: string,
  additionalProperties?: Record<string, unknown>,
): Promise<void> {
  const client = getPostHogServerClient();
  if (!client) return;

  try {
    client.captureException(error, distinctId, additionalProperties);
    await client.flush();
  } catch (captureError) {
    if (process.env.NODE_ENV === "development") {
      console.error("PostHog exception capture failed:", captureError);
    }
  }
}
