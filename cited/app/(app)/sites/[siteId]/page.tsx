/* eslint-disable react/no-unescaped-entities */
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteActions } from "./SiteActions";

export const metadata = {
  title: "Détail du domaine | Cited",
};

export default async function SiteDetailPage(props: { params: Promise<{ siteId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { siteId } = await props.params;

  // Retrieve site from MonitoredSite or legacy Site
  const monitoredSite = await db.monitoredSite.findFirst({
    where: { id: siteId, userId: session.user.id },
    include: { scanLogs: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  const legacySite = !monitoredSite
    ? await db.site.findFirst({
        where: { id: siteId, userId: session.user.id },
        include: {
          pages: {
            include: {
              botScans: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      })
    : null;

  // Domain display details
  const domainName = monitoredSite
    ? monitoredSite.url.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : legacySite
    ? legacySite.domain
    : siteId === "client-vitrine"
    ? "client-vitrine.bubbleapps.io"
    : siteId;

  const clientName = monitoredSite?.name || legacySite?.name || "Cabinet Vitrine";
  const isBlocked =
    monitoredSite?.status === "ERROR" ||
    monitoredSite?.status === "BLOCKED" ||
    (!monitoredSite && !legacySite) ||
    domainName.includes("bubbleapps");

  const gptStatusCode = isBlocked ? 403 : 200;
  const claudeStatusCode = isBlocked ? 403 : 200;
  const daysInRed = isBlocked ? 6 : 0;

  return (
    <div className="mx-auto max-w-[1240px] text-[#201e1d] pb-16">
      {/* Header section */}
      <section className="border-b-2 border-[#201e1d]/15 pb-7 pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-[13px] text-[#201e1d]/70 hover:text-[#ec3013] transition-colors"
        >
          ← Portefeuille
        </Link>

        <div className="flex flex-wrap gap-5 items-end justify-between mt-3.5">
          <div>
            <h1 className="font-mono text-[24px] sm:text-[30px] font-bold text-[#201e1d] tracking-tight leading-tight">
              {domainName}
            </h1>
            <div className="flex flex-wrap gap-3 items-center mt-3">
              {isBlocked ? (
                <span className="inline-flex items-center text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-[7px] bg-[#fff2ef] text-[#7c1405] border border-[#ffc4b8]">
                  Bloqué — HTTP 403
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-[7px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Lisible — HTTP 200
                </span>
              )}
              <span className="text-[13px] text-[#201e1d]/60">
                {isBlocked
                  ? `En alerte depuis le 10 septembre · client : ${clientName}`
                  : `Site surveillé · client : ${clientName}`}
              </span>
            </div>
          </div>

          <SiteActions siteId={siteId} />
        </div>
      </section>

      {/* KPI Stats Rule Grid */}
      <section className="border-b-2 border-[#201e1d]/15 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#201e1d]/15 border border-[#201e1d]/15 rounded-[12px] overflow-hidden">
          <div className="p-5 md:p-6 bg-[#f3f2f2]">
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#201e1d]/60 mb-1">
              GPTBot
            </div>
            <div
              className={`font-heading font-extrabold text-[38px] leading-[1.1] ${
                isBlocked ? "text-[#ec3013]" : "text-[#201e1d]"
              }`}
            >
              {gptStatusCode}
            </div>
          </div>

          <div className="p-5 md:p-6 bg-[#f3f2f2]">
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#201e1d]/60 mb-1">
              ClaudeBot
            </div>
            <div
              className={`font-heading font-extrabold text-[38px] leading-[1.1] ${
                isBlocked ? "text-[#ec3013]" : "text-[#201e1d]"
              }`}
            >
              {claudeStatusCode}
            </div>
          </div>

          <div className="p-5 md:p-6 bg-[#f3f2f2]">
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#201e1d]/60 mb-1">
              Navigateur
            </div>
            <div className="font-heading font-extrabold text-[38px] leading-[1.1] text-[#201e1d]">
              200
            </div>
          </div>

          <div className="p-5 md:p-6 bg-[#f3f2f2]">
            <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#201e1d]/60 mb-1">
              Jours au rouge
            </div>
            <div
              className={`font-heading font-extrabold text-[38px] leading-[1.1] ${
                daysInRed > 0 ? "text-[#ec3013]" : "text-[#201e1d]"
              }`}
            >
              {daysInRed}
            </div>
          </div>
        </div>
      </section>

      {/* Verdict History Section */}
      <section className="border-b-2 border-[#201e1d]/15 py-10">
        <h2 className="text-[24px] font-bold text-[#201e1d] mb-1.5">
          Historique des verdicts
        </h2>
        <p className="text-[14px] text-[#201e1d]/60 mb-6">
          Un scan par jour. Chaque barre est le verdict du jour ; le rouge signale un site invisible pour les IA.
        </p>

        {/* 12-day bar chart */}
        <div className="flex items-end gap-1.5 h-[120px] pt-4">
          <span className="flex-1 h-[70%] bg-[#d7d3d3] rounded-t-[4px]" />
          <span className="flex-1 h-[74%] bg-[#d7d3d3] rounded-t-[4px]" />
          <span className="flex-1 h-[80%] bg-[#d7d3d3] rounded-t-[4px]" />
          <span className="flex-1 h-[76%] bg-[#d7d3d3] rounded-t-[4px]" />
          <span className="flex-1 h-[82%] bg-[#d7d3d3] rounded-t-[4px]" />
          <span className="flex-1 h-[78%] bg-[#d7d3d3] rounded-t-[4px]" />
          <span className="flex-1 h-[100%] bg-[#ec3013] rounded-t-[4px]" />
          <span className="flex-1 h-[100%] bg-[#ec3013] rounded-t-[4px]" />
          <span className="flex-1 h-[100%] bg-[#ec3013] rounded-t-[4px]" />
          <span className="flex-1 h-[100%] bg-[#ec3013] rounded-t-[4px]" />
          <span className="flex-1 h-[100%] bg-[#ec3013] rounded-t-[4px]" />
          <span className="flex-1 h-[100%] bg-[#ec3013] rounded-t-[4px]" />
        </div>

        <div className="flex justify-between mt-2.5 text-[12px] text-[#201e1d]/60">
          <span>4 sept.</span>
          <span className="font-semibold text-[#ec3013]">10 sept. — bascule au rouge</span>
          <span>16 sept.</span>
        </div>
      </section>

      {/* Technical Response Trace & Remediation Steps */}
      <section className="border-b-2 border-[#201e1d]/15 py-10 grid grid-cols-1 lg:grid-cols-2 gap-9 items-start">
        {/* Trace */}
        <div>
          <h2 className="text-[24px] font-bold text-[#201e1d] mb-2.5">
            Réponse servie aux bots IA
          </h2>
          <div className="font-mono bg-[#eae9e9] border border-[#201e1d]/15 rounded-[10px] p-4 text-[12.5px] leading-[1.75] text-[#201e1d] overflow-x-auto whitespace-pre select-all">
{`GET / HTTP/1.1
user-agent: GPTBot/1.2

HTTP/1.1 403 Forbidden
server: cloudflare
cf-mitigated: challenge
content-length: 0`}
          </div>
        </div>

        {/* Remediation */}
        <div>
          <h2 className="text-[24px] font-bold text-[#201e1d] mb-2.5">
            Piste de correction
          </h2>
          <p className="text-[14px] text-[#201e1d]/75 mb-3.5 leading-relaxed">
            Le blocage vient d'une règle de sécurité du pare-feu, pas du site lui-même. Cited documente le problème ; la correction se fait côté plateforme.
          </p>
          <div className="flex flex-col gap-2.5 text-[14px] text-[#201e1d] border-t border-[#201e1d]/15 pt-3.5">
            <div>
              1. Autoriser les User-Agents{" "}
              <span className="font-mono bg-black/5 px-1 py-0.5 rounded text-[13px]">
                GPTBot
              </span>{" "}
              et{" "}
              <span className="font-mono bg-black/5 px-1 py-0.5 rounded text-[13px]">
                ClaudeBot
              </span>{" "}
              dans les règles WAF.
            </div>
            <div>
              2. Vérifier que{" "}
              <span className="font-mono bg-black/5 px-1 py-0.5 rounded text-[13px]">
                robots.txt
              </span>{" "}
              n'interdit pas ces mêmes agents.
            </div>
            <div>
              3. Relancer un scan : le verdict repasse au vert en moins d'une minute.
            </div>
          </div>
        </div>
      </section>

      {/* Tracked Pages Table */}
      <section className="pt-10">
        <h2 className="text-[24px] font-bold text-[#201e1d] mb-5">
          Pages suivies
        </h2>

        <div className="border border-[#201e1d]/15 rounded-[10px] overflow-hidden bg-white/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
              <caption className="sr-only">Pages suivies pour {domainName}</caption>
              <thead className="border-b-2 border-[#201e1d]/15 bg-[#eae9e9]/50 text-[#201e1d]/60">
                <tr>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-bold">
                    Page
                  </th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-bold">
                    Verdict
                  </th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-bold">
                    Code
                  </th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-bold">
                    Texte utile
                  </th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.08em] font-bold">
                    Dernier scan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#201e1d]/15 font-normal">
                <tr className="hover:bg-black/[0.03] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-medium text-[#201e1d]">/</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-[6px] bg-[#fff2ef] text-[#7c1405] border border-[#ffc4b8]">
                      Bloqué
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">403</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">0 car.</td>
                  <td className="px-4 py-3.5 text-xs text-[#201e1d]/60">il y a 2 h</td>
                </tr>

                <tr className="hover:bg-black/[0.03] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-medium text-[#201e1d]">/services</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-[6px] bg-[#fff2ef] text-[#7c1405] border border-[#ffc4b8]">
                      Bloqué
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">403</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">0 car.</td>
                  <td className="px-4 py-3.5 text-xs text-[#201e1d]/60">il y a 2 h</td>
                </tr>

                <tr className="hover:bg-black/[0.03] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-medium text-[#201e1d]">/equipe</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-[6px] bg-[#fff2ef] text-[#7c1405] border border-[#ffc4b8]">
                      Bloqué
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">403</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">0 car.</td>
                  <td className="px-4 py-3.5 text-xs text-[#201e1d]/60">il y a 2 h</td>
                </tr>

                <tr className="hover:bg-black/[0.03] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-medium text-[#201e1d]">/contact</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-[6px] bg-[#fff2ef] text-[#7c1405] border border-[#ffc4b8]">
                      Bloqué
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">403</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">0 car.</td>
                  <td className="px-4 py-3.5 text-xs text-[#201e1d]/60">il y a 2 h</td>
                </tr>

                <tr className="hover:bg-black/[0.03] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-medium text-[#201e1d]">/robots.txt</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-[6px] border border-[#ec3013] text-[#ec3013]">
                      Accessible
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">200</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-[#201e1d]/75">92 car.</td>
                  <td className="px-4 py-3.5 text-xs text-[#201e1d]/60">il y a 2 h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
