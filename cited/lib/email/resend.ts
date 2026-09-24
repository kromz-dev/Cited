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
