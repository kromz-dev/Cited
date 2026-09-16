import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";

// La clé de signature est portée par le client (voir inngest/client.ts).
if (!process.env.INNGEST_SIGNING_KEY && process.env.NODE_ENV === "production") {
  throw new Error(
    "INNGEST_SIGNING_KEY est obligatoire en production : sans elle, /api/inngest est déclenchable par n'importe qui.",
  );
}

// Inngest functions will be added back for V3 scans
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
