import type { VerdictValue } from "@/components/ui/verdict";

/** BLOQUÉ et ERREUR ne partagent pas le même badge. */
export function verdictForSiteStatus(status: string): VerdictValue {
  if (status === "BLOQUÉ" || status === "BLOCKED") return "refuse";
  if (status === "COQUILLE VIDE") return "vide";
  if (status === "ERREUR" || status === "ERROR") return "inconnu";
  if (status === "OK" || status === "ACTIVE") return "lu";
  return "inconnu";
}
