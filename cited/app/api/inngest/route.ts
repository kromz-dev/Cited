import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { runCampaign } from "@/inngest/functions";

// La clé de signature est portée par le client (voir inngest/client.ts).
// On refuse simplement de démarrer en production sans elle : un endpoint de
// déclenchement non authentifié laisse lancer des campagnes sur n'importe
// quelle marque, et le `matcher` du middleware exclut /api.
if (!process.env.INNGEST_SIGNING_KEY && process.env.NODE_ENV === "production") {
  throw new Error(
    "INNGEST_SIGNING_KEY est obligatoire en production : sans elle, /api/inngest est déclenchable par n'importe qui.",
  );
}

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runCampaign],
});
