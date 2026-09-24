import { Fragment } from "react";
import { Verdict, verdictFromStatus } from "@/components/ui/verdict";
import styles from "./home.module.css";

type VerdictLabel = "Lu" | "Refusé" | "Vide";

interface PortfolioRow {
  domain: string;
  host: string;
  chatgpt: VerdictLabel;
  claude: VerdictLabel;
  perplexity: VerdictLabel;
  detail?: {
    since: string;
    cause: string;
    fix: string;
  };
}

const rows: PortfolioRow[] = [
  {
    domain: "cabinet-moreau-avocats.fr",
    host: "OVH",
    chatgpt: "Lu",
    claude: "Lu",
    perplexity: "Lu",
  },
  {
    domain: "boulangerie-lefort.fr",
    host: "Hostinger",
    chatgpt: "Refusé",
    claude: "Refusé",
    perplexity: "Lu",
    detail: {
      since: "Bloqué depuis le 14 septembre, soit 10 jours",
      cause:
        "Le pare-feu de l'hébergeur (Hostinger) renvoie une page de vérification aux robots avant même que WordPress ne réponde.",
      fix: "Demander à l'hébergeur d'autoriser OAI-SearchBot et Claude-SearchBot, ou faire passer le site par Cloudflare pour piloter la règle vous-même.",
    },
  },
  {
    domain: "atelier-kaolin.com",
    host: "o2switch",
    chatgpt: "Lu",
    claude: "Lu",
    perplexity: "Vide",
  },
  {
    domain: "studio-pilates-nantes.fr",
    host: "Cloudflare",
    chatgpt: "Vide",
    claude: "Vide",
    perplexity: "Vide",
  },
  {
    domain: "app.reservio-demo.fr",
    host: "Vercel",
    chatgpt: "Vide",
    claude: "Lu",
    perplexity: "Vide",
  },
];

export function PortfolioPanel() {
  return (
    <figure className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Portefeuille — 5 sites</span>
        <span className={styles.panelDate}>Vérifié il y a 6 minutes</span>
      </div>

      <table className={styles.table}>
        <caption className="sr-only">
          Exemple de rapport de portefeuille avec verdict par assistant IA
        </caption>
        <colgroup>
          <col className={styles.colSite} />
          <col className={styles.colVerdict} />
          <col className={styles.colVerdict} />
          <col className={styles.colVerdict} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Site</th>
            <th scope="col">ChatGPT</th>
            <th scope="col">Claude</th>
            <th scope="col">Perplexity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <Fragment key={row.domain}>
              <tr className={row.detail ? styles.rowFlagged : undefined}>
                <th scope="row" data-label="Site" className={styles.domainCell}>
                  <span className={styles.domainName}>{row.domain}</span>
                  <span className={styles.domainHost}>{row.host}</span>
                </th>
                <td data-label="ChatGPT">
                  <Verdict value={verdictFromStatus(row.chatgpt)} variant="inline" size="sm" />
                </td>
                <td data-label="Claude">
                  <Verdict value={verdictFromStatus(row.claude)} variant="inline" size="sm" />
                </td>
                <td data-label="Perplexity">
                  <Verdict value={verdictFromStatus(row.perplexity)} variant="inline" size="sm" />
                </td>
              </tr>
              {row.detail && (
                <tr className={styles.detailRow}>
                  <td colSpan={4}>
                    <div className={styles.detailBox}>
                      <p className={styles.detailSince}>{row.detail.since}</p>
                      <dl className={styles.detailGrid}>
                        <div>
                          <dt>Cause probable</dt>
                          <dd>{row.detail.cause}</dd>
                        </div>
                        <div>
                          <dt>Correctif</dt>
                          <dd>{row.detail.fix}</dd>
                        </div>
                      </dl>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      <figcaption className={styles.panelCaption}>
        Exemple de rapport, domaines fictifs.
      </figcaption>
    </figure>
  );
}
