import { Resend } from "resend";

export async function sendRegressionAlert(
  to: string,
  domain: string,
  oldStatus: string,
  newStatus: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not defined. Skipping alert email for", domain);
    return { success: false, error: "No API Key" };
  }
  
  const resend = new Resend(apiKey);
  const html = `
    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
      <h2 style="color: #d9534f;">Alerte : Régression détectée</h2>
      <p>Bonjour,</p>
      <p>Le statut de votre site surveillé <strong>${domain}</strong> a changé.</p>
      <p>Statut précédent : <strong>${oldStatus}</strong></p>
      <p>Nouveau statut : <strong>${newStatus}</strong></p>
      <p>Connectez-vous à votre tableau de bord pour plus de détails.</p>
      <br />
      <p>À bientôt,<br/>L'équipe Cited</p>
    </div>
  `;

  try {
    const response = await resend.emails.send({
      from: "Cited Alerts <alerts@cited.app>", // Update with a verified domain
      to,
      subject: `[Alerte] Le statut de ${domain} est passé à ${newStatus}`,
      html,
    });
    
    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error("Failed to send regression alert email:", error);
    return { success: false, error };
  }
}
