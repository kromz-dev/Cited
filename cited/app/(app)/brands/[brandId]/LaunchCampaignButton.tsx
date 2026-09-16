"use client";

import { useTransition } from "react";
import { launchAuditCampaign } from "./actions";

export default function LaunchCampaignButton({ brandId, isRunning }: { brandId: string, isRunning: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleLaunch = () => {
    startTransition(async () => {
      await launchAuditCampaign(brandId);
    });
  };

  return (
    <button
      onClick={handleLaunch}
      disabled={isPending || isRunning}
      className="px-4 py-2 bg-ink text-paper text-sm font-medium rounded hover:bg-ink/90 disabled:opacity-50 transition-colors"
    >
      {isPending || isRunning ? "Audit en cours..." : "Lancer l'audit complet"}
    </button>
  );
}
