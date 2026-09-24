"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

if (typeof window !== "undefined") {
  const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  // PostHog est optionnel (voir .env.example) : sans configuration, on
  // prévient en développement au lieu de faire planter toute l'application.
  if (process.env.NODE_ENV === "development" && (!projectToken || !host)) {
    console.warn(
      "PostHog désactivé : NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN et NEXT_PUBLIC_POSTHOG_HOST sont requis pour envoyer des événements.",
    );
  }

  if (projectToken && host) {
    posthog.init(projectToken, {
      api_host: host,
      defaults: "2026-01-30",
      // ADR-001 : aucun cookie ni localStorage, donc pas de traceur soumis à
      // consentement (règle « pas de cookie » de T006 sur les pages
      // marketing). L'identifiant ne vit que le temps de la page.
      persistence: "memory",
      // Pas de profil de personne pour les visiteurs anonymes.
      person_profiles: "identified_only",
      capture_exceptions: true,
      capture_pageview: false,
      capture_pageleave: true,
      debug: process.env.NODE_ENV === "development",
    });
  }
}

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

