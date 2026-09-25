"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// L'initialisation de PostHog vit désormais dans `instrumentation-client.ts`
// (convention Next.js 16, exécutée avant l'hydratation) : ce fichier ne fait
// plus que consommer le client déjà configuré pour la page vue et
// l'identification.

export function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog.has_opted_out_capturing() === false) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

type AuthSession = {
  user?: {
    id?: string;
  };
};

export function PostHogIdentify() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("posthog_reset")) {
      posthog.reset();
      url.searchParams.delete("posthog_reset");
      window.history.replaceState(null, "", url);
    }

    void fetch("/api/auth/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((session: AuthSession | null) => {
        const user = session?.user;
        if (!user?.id) return;

        // ADR-001 : l'identifiant interne suffit à relier les événements
        // d'un compte. Ni e-mail ni nom ne partent chez PostHog.
        posthog.identify(user.id);
      })
      .catch(() => undefined);
  }, []);

  return null;
}

