import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is missing. Emails will not be sent.");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

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
  // If in local dev or missing key, we skip actual sending
  if (!process.env.RESEND_API_KEY) {
    console.log("Mocking email to", to);
    return { success: true };
  }

  const { brandName, domain, mentionsCount, totalRuns, competitorMentions } = data;
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
    const response = await resend.emails.send({
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
