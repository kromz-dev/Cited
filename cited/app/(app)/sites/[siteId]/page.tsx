import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SiteActions } from "./SiteActions";
import { Card, CardContent } from "@/components/ui/card";
import { Verdict } from "@/components/ui/verdict";
import { buildScanHistory } from "@/lib/sites/scan-history";

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
    include: { scanLogs: { orderBy: { createdAt: "desc" }, take: 60 } },
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

  const history = buildScanHistory(monitoredSite?.scanLogs ?? []);
  const gptStatusCode = isBlocked ? 403 : 200;
  const claudeStatusCode = isBlocked ? 403 : 200;
  const daysInRed = isBlocked ? 6 : 0;

  return (
    <div className="mx-auto max-w-[1240px] pb-16 text-ink">
      {/* En-tête */}
      <section className="border-b border-line pb-7 pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
          Portefeuille
        </Link>

        <div className="mt-3.5 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink">
              {domainName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Verdict value={isBlocked ? "refuse" : "lu"} detail={isBlocked ? "403" : "200"} />
              <span className="text-sm text-ink-2">
                {isBlocked
                  ? `En alerte depuis le 10 septembre, client : ${clientName}`
                  : `Site surveillé, client : ${clientName}`}
              </span>
            </div>
          </div>

          <SiteActions siteId={siteId} />
        </div>
      </section>

      {/* Indicateurs clés */}
      <section className="border-b border-line py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card size="sm">
            <CardContent>
              <div className="type-caption text-ink-2">GPTBot</div>
              <div className={`mt-1 text-[28px] leading-8 font-semibold tnum ${isBlocked ? "text-stop" : "text-ink"}`}>
                {gptStatusCode}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <div className="type-caption text-ink-2">ClaudeBot</div>
              <div className={`mt-1 text-[28px] leading-8 font-semibold tnum ${isBlocked ? "text-stop" : "text-ink"}`}>
                {claudeStatusCode}
              </div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <div className="type-caption text-ink-2">Navigateur</div>
              <div className="mt-1 text-[28px] leading-8 font-semibold text-ink tnum">200</div>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent>
              <div className="type-caption text-ink-2">Jours au rouge</div>
              <div className={`mt-1 text-[28px] leading-8 font-semibold tnum ${daysInRed > 0 ? "text-stop" : "text-ink"}`}>
                {daysInRed}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Historique des verdicts */}
      <section className="border-b border-line py-10">
        <h2 className="text-[22px] leading-7 font-semibold text-ink">Historique des verdicts</h2>
        <p className="mt-1.5 mb-6 text-sm text-ink-2">
          Un scan par jour. Chaque barre est le verdict du jour ; l&apos;encre rouge signale un site invisible pour les IA.
        </p>

        {history.length === 0 ? (
          <p className="text-sm text-ink-2">Aucun scan n&apos;a encore été enregistré pour ce domaine.</p>
        ) : (
          <>
            <div className="flex h-[120px] items-end gap-1.5 pt-4" role="img" aria-label="Historique des scans de ce domaine">
              {history.map((point) => (
                <span
                  key={point.date}
                  title={`${point.label} : ${point.degraded ? "dégradé" : "lisible"}`}
                  className={`flex-1 rounded-t-xs ${point.degraded ? "h-full bg-stop" : "h-[70%] bg-line"}`}
                />
              ))}
            </div>
            <div className="mt-2.5 flex justify-between text-xs text-ink-2">
              <span>{history[0]?.label}</span>
              <span>{history[history.length - 1]?.label}</span>
            </div>
          </>
        )}
      </section>

      {/* Trace technique et piste de correction */}
      <section className="grid grid-cols-1 items-start gap-9 border-b border-line py-10 lg:grid-cols-2">
        {/* Trace */}
        <div>
          <h2 className="mb-2.5 text-[22px] leading-7 font-semibold text-ink">
            Réponse servie aux bots IA
          </h2>
          <div className="overflow-x-auto whitespace-pre rounded-lg border border-line bg-surface-2 p-4 font-mono text-[12.5px] leading-[1.75] text-ink select-all">
{`GET / HTTP/1.1
user-agent: GPTBot/1.2

HTTP/1.1 403 Forbidden
server: cloudflare
cf-mitigated: challenge
content-length: 0`}
          </div>
        </div>

        {/* Correctif */}
        <div>
          <h2 className="mb-2.5 text-[22px] leading-7 font-semibold text-ink">
            Piste de correction
          </h2>
          <p className="mb-3.5 text-sm leading-relaxed text-ink-2">
            Le blocage vient d&apos;une règle de sécurité du pare-feu, pas du site lui-même. Cited documente le problème ; la correction se fait côté plateforme.
          </p>
          <div className="flex flex-col gap-2.5 border-t border-line pt-3.5 text-sm text-ink">
            <div>
              1. Autoriser les user-agents{" "}
              <span className="rounded-xs bg-surface-2 px-1 py-0.5 font-mono text-[13px]">
                GPTBot
              </span>{" "}
              et{" "}
              <span className="rounded-xs bg-surface-2 px-1 py-0.5 font-mono text-[13px]">
                ClaudeBot
              </span>{" "}
              dans les règles du pare-feu applicatif (WAF).
            </div>
            <div>
              2. Vérifier que{" "}
              <span className="rounded-xs bg-surface-2 px-1 py-0.5 font-mono text-[13px]">
                robots.txt
              </span>{" "}
              n&apos;interdit pas ces mêmes agents.
            </div>
            <div>
              3. Relancer un scan : le verdict repasse à Lu en moins d&apos;une minute.
            </div>
          </div>
        </div>
      </section>

      {/* Pages suivies */}
      <section className="pt-10">
        <h2 className="mb-5 text-[22px] leading-7 font-semibold text-ink">
          Pages suivies
        </h2>

        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left type-table">
              <caption className="sr-only">Pages suivies pour {domainName}</caption>
              <thead className="border-b border-ink text-ink-2">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Page</th>
                  <th scope="col" className="px-3 py-2 font-medium">Verdict</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Code</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Texte utile</th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">Dernier scan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr className="h-11 hover:bg-paper">
                  <td className="px-3 py-2 font-medium text-ink">/</td>
                  <td className="px-3 py-2"><Verdict value="refuse" variant="inline" /></td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">403</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">0 car.</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">il y a 2 h</td>
                </tr>

                <tr className="h-11 hover:bg-paper">
                  <td className="px-3 py-2 font-medium text-ink">/services</td>
                  <td className="px-3 py-2"><Verdict value="refuse" variant="inline" /></td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">403</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">0 car.</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">il y a 2 h</td>
                </tr>

                <tr className="h-11 hover:bg-paper">
                  <td className="px-3 py-2 font-medium text-ink">/equipe</td>
                  <td className="px-3 py-2"><Verdict value="refuse" variant="inline" /></td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">403</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">0 car.</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">il y a 2 h</td>
                </tr>

                <tr className="h-11 hover:bg-paper">
                  <td className="px-3 py-2 font-medium text-ink">/contact</td>
                  <td className="px-3 py-2"><Verdict value="refuse" variant="inline" /></td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">403</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">0 car.</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">il y a 2 h</td>
                </tr>

                <tr className="h-11 hover:bg-paper">
                  <td className="px-3 py-2 font-medium text-ink">/robots.txt</td>
                  <td className="px-3 py-2"><Verdict value="lu" variant="inline" /></td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">200</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">92 car.</td>
                  <td className="px-3 py-2 text-right text-ink-2 tnum">il y a 2 h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
