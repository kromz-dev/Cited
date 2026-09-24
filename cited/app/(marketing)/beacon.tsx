"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function Beacon() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const payload = JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      });
      
      // Utilisation de fetch + keepalive plutôt que sendBeacon (mieux supporté)
      fetch("/api/beacon", {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
      }).catch(() => {}); // ignorer silencieusement si bloqué
    } catch {
      // Ignore
    }
  }, [pathname]);

  return null;
}
