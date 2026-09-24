import { Resend } from "resend";

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required to send audit report emails.");
  }
  return new Resend(apiKey);
}

export async function sendAuditReportEmail(
  to: string,
  data: {
    brandName: string;
    domain: string;
    score: number;
    mentionsCount: number;
    totalRuns: number;
    competitorMentions: { name: string; count: number }[];
  }
) {
  const { domain, mentionsCount, totalRuns, competitorMentions } = data;
  const bestCompetitor = competitorMentions.length > 0 ? competitorMentions[0] : null;
  const competitorText = bestCompetitor 
    ? `Son concurrent ${bestCompetitor.name} apparaît dans ${bestCompetitor.count} réponses.` 
    : "Aucun concurrent direct n'a été détecté dans les réponses.";

  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
      <p>Bonjour,</p>
      <p>J'ai fait passer ${domain} dans notre outil de mesure de visibilité IA.</p>
      <p>Votre marque ressort dans ${mentionsCount} réponses sur ${totalRuns}. ${competitorText}</p>
      <p>Le rapport complet est ici : <a href="${process.env.NEXT_PUBLIC_APP_URL}/analyse/${domain}">Voir mon rapport détaillé</a></p>
      <p>Si vous voulez corriger ça, l'outil génère le contenu à modifier, le JSON-LD à ajouter et le fichier llms.txt à mettre en place : <a href="${process.env.NEXT_PUBLIC_APP_URL}">Découvrir Cited</a></p>
      <br />
      <p>À bientôt,<br/>L'équipe Cited</p>
    </div>
  `;

  try {
    const response = await getResend().emails.send({
      from: "Cited <bonjour@cited.app>", // Update with a verified domain
      to,
      subject: `Votre marque est citée ${mentionsCount} fois sur ${totalRuns} par ChatGPT`,
      html,
    });

    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation du mot de passe de votre compte Cited.</p>
      <p><a href="${resetUrl}">Choisir un nouveau mot de passe</a></p>
      <p>Ce lien est valable 1 heure. Ignorez cet e-mail si vous n'êtes pas à l'origine de la demande.</p>
      <br />
      <p>L'équipe Cited</p>
    </div>
  `;

  try {
    const response = await getResend().emails.send({
      from: "Cited <bonjour@cited.app>", // Update with a verified domain
      to,
      subject: "Réinitialisation de votre mot de passe Cited",
      html,
    });

    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
}

// T046 (EF-064/EF-065) : découverte écrite envoyée 3 jours après l'inscription.
// Réponse par simple retour d'e-mail, pas de formulaire — voir docs/06-kit-prospection.md §5.
export async function sendDiscoveryEmail(to: string, name?: string | null) {
  const greeting = name ? `Bonjour ${name},` : "Bonjour,";

  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
      <p>${greeting}</p>
      <p>Pour régler Cited au plus près de votre usage, j'aurais besoin de 5 réponses courtes. Vous pouvez simplement répondre à cet e-mail.</p>
      <ol>
        <li>Combien de sites avez-vous sous contrat récurrent, et chez quels hébergeurs ?</li>
        <li>Que contient votre rapport mensuel aujourd'hui ? Combien de temps vous prend-il ?</li>
        <li>Un client vous a-t-il déjà parlé de ChatGPT ou de Perplexity ? Qu'avez-vous répondu ?</li>
        <li>Avez-vous déjà découvert un blocage (Cloudflare, plugin, hébergeur) <em>après</em> le client ?</li>
        <li>Que devrait contenir le rapport pour que vous l'envoyiez tel quel à vos clients ?</li>
      </ol>
      <br />
      <p>À bientôt,<br/>L'équipe Cited</p>
    </div>
  `;

  try {
    const response = await getResend().emails.send({
      from: "Cited <bonjour@cited.app>", // Update with a verified domain
      to,
      subject: "5 questions pour régler Cited sur votre parc",
      html,
    });

    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error("Failed to send discovery email:", error);
    return { success: false, error };
  }
}
