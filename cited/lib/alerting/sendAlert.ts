import { Resend } from "resend";
import { db } from "@/lib/db";
import { logFailure } from "../log";

export type AlertKind = "REGRESSION" | "RESOLUTION";

export interface AlertSiteChange {
  siteId?: string;
  domain: string;
  cause: string;
  fix: string;
}

const FROM = "Cited <bonjour@cited.app>";

export function suggestFix(cause: string): string {
  if (/robots\.txt/i.test(cause)) {
    return "Retirez la règle qui interdit cet assistant dans robots.txt, puis relancez un scan.";
  }
  if (/javascript|coquille/i.test(cause)) {
    return "Servez le texte principal dans le HTML, sans attendre le JavaScript, puis relancez un scan.";
  }
  if (/injoignable|http 5|erreur/i.test(cause)) {
    return "Vérifiez que le site répond. Une panne ponctuelle n'est pas un blocage. Relancez un scan ensuite.";
  }
  if (/403|challenge|pare-feu|bloqu/i.test(cause)) {
    return "Autorisez les user-agents des assistants dans le pare-feu, puis relancez un scan.";
  }
  return "Ouvrez la fiche du domaine, corrigez la cause indiquée, puis relancez un scan.";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderAlertEmail(input: {
  kind: AlertKind;
  domains: AlertSiteChange[];
}): { subject: string; text: string; html: string } {
  const count = input.domains.length;
  const regression = input.kind === "REGRESSION";
  const subject = regression
    ? count === 1
      ? "Cited — un domaine n'est plus lisible"
      : `Cited — ${count} domaines ne sont plus lisibles`
    : count === 1
      ? "Cited — un domaine est de nouveau lisible"
      : `Cited — ${count} domaines sont de nouveau lisibles`;

  const intro = regression
    ? count === 1
      ? "Un passage du scan vient de constater que ce domaine n'est plus lisible par les assistants."
      : "Un passage du scan vient de constater que ces domaines ne sont plus lisibles par les assistants."
    : count === 1
      ? "Un passage du scan vient de constater que ce domaine est de nouveau lisible par les assistants."
      : "Un passage du scan vient de constater que ces domaines sont de nouveau lisibles par les assistants.";

  const lines = input.domains.map(
    (item) => `${item.domain}\nCause : ${item.cause}\nCorrectif : ${item.fix}`,
  );
  const text = `${intro}\n\n${lines.join("\n\n")}\n`;
  const html = `<div style="font-family: sans-serif; max-width: 600px;">
    <p>${escapeHtml(intro)}</p>
    ${input.domains
      .map(
        (item) => `<h2 style="font-size: 16px;">${escapeHtml(item.domain)}</h2>
      <p><strong>Cause :</strong> ${escapeHtml(item.cause)}</p>
      <p><strong>Correctif :</strong> ${escapeHtml(item.fix)}</p>`,
      )
      .join("")}
  </div>`;

  return { subject, text, html };
}

export function renderDigest(input: {
  regressions: AlertSiteChange[];
  resolutions: AlertSiteChange[];
}): { subject: string; text: string; html: string } {
  if (input.regressions.length > 0 && input.resolutions.length === 0) {
    return renderAlertEmail({ kind: "REGRESSION", domains: input.regressions });
  }
  if (input.resolutions.length > 0 && input.regressions.length === 0) {
    return renderAlertEmail({ kind: "RESOLUTION", domains: input.resolutions });
  }
  const text = [
    renderAlertEmail({ kind: "REGRESSION", domains: input.regressions }).text,
    renderAlertEmail({ kind: "RESOLUTION", domains: input.resolutions }).text,
  ].join("\n");
  return {
    subject: "Cited — changements de lisibilité",
    text,
    html: `<div style="font-family: sans-serif; max-width: 600px;"><pre>${escapeHtml(text)}</pre></div>`,
  };
}

async function deliver(to: string, email: { subject: string; text: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logFailure("alert.missing_api_key", { to });
    return { success: false as const, error: "No API Key" };
  }
  try {
    const response = await new Resend(apiKey).emails.send({
      from: FROM,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return { success: true as const, id: response.data?.id };
  } catch (error) {
    logFailure("alert.send_failed", { to, message: error instanceof Error ? error.message : "unknown" });
    return { success: false as const, error };
  }
}

async function recordAlerts(kind: AlertKind, domains: AlertSiteChange[]) {
  const rows = domains.filter((item) => item.siteId);
  if (rows.length === 0) return;
  await db.alertEvent.createMany({
    data: rows.map((item) => ({
      siteId: item.siteId as string,
      type: kind,
      cause: item.cause,
      fix: item.fix,
      channel: "EMAIL",
    })),
  });
}

/**
 * Un seul e-mail par compte pour un passage du scan, puis une ligne
 * AlertEvent par domaine concerné.
 */
export async function sendDailyDigest(
  to: string,
  input: { regressions: AlertSiteChange[]; resolutions: AlertSiteChange[] },
) {
  if (input.regressions.length + input.resolutions.length === 0) {
    return { success: true as const, skipped: true as const };
  }
  const sent = await deliver(to, renderDigest(input));
  if (!sent.success) return sent;
  await recordAlerts("REGRESSION", input.regressions);
  await recordAlerts("RESOLUTION", input.resolutions);
  return sent;
}

export async function listRecentAlerts(userId: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return db.alertEvent.findMany({
    where: { site: { userId }, sentAt: { gte: since } },
    orderBy: { sentAt: "desc" },
    select: {
      id: true,
      type: true,
      cause: true,
      fix: true,
      sentAt: true,
      site: { select: { id: true, url: true } },
    },
  });
}

/**
 * Un seul e-mail pour tous les domaines d'un compte lors d'un passage du scan.
 */
export async function sendUserDigest(
  to: string,
  kind: AlertKind,
  domains: AlertSiteChange[],
) {
  if (domains.length === 0) return { success: true, skipped: true as const };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logFailure("alert.missing_api_key", { to });
    return { success: false, error: "No API Key" };
  }

  const email = renderAlertEmail({ kind, domains });
  try {
    const response = await new Resend(apiKey).emails.send({
      from: FROM,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    return { success: true, id: response.data?.id };
  } catch (error) {
    logFailure("alert.send_failed", { to, message: error instanceof Error ? error.message : "unknown" });
    return { success: false, error };
  }
}

/** Conservé pour les appelants existants : un domaine, gabarit de régression. */
export async function sendRegressionAlert(
  to: string,
  domain: string,
  _oldStatus: string,
  newStatus: string,
) {
  const cause = newStatus;
  return sendUserDigest(to, "REGRESSION", [{ domain, cause, fix: suggestFix(cause) }]);
}
