"use client";

import { useTransition } from "react";
import { launchAuditCampaign } from "./actions";
import { Button } from "@/components/ui/button";

export default function LaunchCampaignButton({ brandId, isRunning }: { brandId: string, isRunning: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleLaunch = () => {
    startTransition(async () => {
      await launchAuditCampaign(brandId);
    });
  };

  return (
    <Button onClick={handleLaunch} disabled={isPending || isRunning}>
      {isPending || isRunning ? "Audit en cours" : "Lancer l'audit complet"}
    </Button>
  );
}
