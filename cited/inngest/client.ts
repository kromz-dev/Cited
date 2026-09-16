import { Inngest } from "inngest";

// La clé de signature authentifie les appels entrants sur /api/inngest.
// Sans elle, cet endpoint accepte n'importe quel POST anonyme et déclenche
// une campagne sur n'importe quelle marque : le `matcher` du middleware
// exclut /api, donc rien d'autre ne le protège.
export const inngest = new Inngest({
  id: "cited",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
