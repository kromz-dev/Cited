import { Fragment } from "react";
import styles from "./home.module.css";

type Verdict = "Lu" | "Refusé" | "Vide";

interface PortfolioRow {
  domain: string;
  host: string;
  chatgpt: Verdict;
  claude: Verdict;
  perplexity: Verdict;
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

function verdictClass(v: Verdict) {
  if (v === "Lu") return styles.verdictOk;
  if (v === "Refusé") return styles.verdictStop;
  return styles.verdictWarn;
}

export function PortfolioPanel() {
  return (
    <figure className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>Portefeuille — 5 sites</span>
        <span className={styles.panelDate}>Vérifié il y a 6 minutes</span>
      </div>

      <table className={`${styles.table} ${styles.tabular}`}>
        <caption className="sr-only">
          Exemple de rapport de portefeuille avec verdict par assistant IA
        </caption>
        <thead>
          <tr>
            <th scope="col">Site</th>
            <th scope="col">Hébergeur</th>
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
                  {row.domain}
                </th>
                <td data-label="Hébergeur">{row.host}</td>
                <td data-label="ChatGPT">
                  <span className={`${styles.verdict} ${verdictClass(row.chatgpt)}`}>
                    {row.chatgpt}
                  </span>
                </td>
                <td data-label="Claude">
                  <span className={`${styles.verdict} ${verdictClass(row.claude)}`}>
                    {row.claude}
                  </span>
                </td>
                <td data-label="Perplexity">
                  <span className={`${styles.verdict} ${verdictClass(row.perplexity)}`}>
                    {row.perplexity}
                  </span>
                </td>
              </tr>
              {row.detail && (
                <tr className={styles.detailRow}>
                  <td colSpan={5}>
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
