import Link from "next/link";
import { ScanForm } from "@/components/landing/ScanForm";
import { PortfolioPanel } from "./PortfolioPanel";
import { schibsted } from "./fonts";
import tokens from "./tokens.module.css";
import styles from "./home.module.css";

const causes = [
  {
    term: "Le bouton « Bloquer les robots IA » de Cloudflare",
    body: "Une case à cocher dans Sécurité → Bots. Elle se coche en quelques secondes lors d'un durcissement de la sécurité, et rien dans l'interface WordPress n'en garde la trace.",
  },
  {
    term: "Les réglages anti-robots de Wordfence",
    body: "Pensés contre le spam et le scraping, ils limitent aussi le débit des robots légitimes. GPTBot, ClaudeBot et PerplexityBot peuvent être ralentis ou bloqués sans qu'aucune alerte ne remonte.",
  },
  {
    term: "Le blocage GPTBot en un clic de Yoast SEO",
    body: "Une option de confidentialité dans les réglages Yoast. Elle vise l'entraînement, mais elle est parfois activée sans que le client ou l'agence ne s'en souvienne.",
  },
  {
    term: "Un robots.txt imposé par l'hébergement mutualisé",
    body: "Certains hébergeurs WordPress managés servent leur propre robots.txt, impossible à modifier depuis l'administration du site, et parfois fermé aux robots IA par défaut.",
  },
  {
    term: "Une page vide sans JavaScript",
    body: "Les sites construits en React, Vue ou toute application à page unique n'envoient qu'une coquille HTML. Un robot qui n'exécute pas le script ne lit rien.",
  },
];

const steps = [
  {
    title: "Ajoutez les sites de votre portefeuille",
    body: "L'URL de chaque client suffit. Vous pouvez aussi déposer le logo de votre agence, utilisé sur le rapport mensuel.",
  },
  {
    title: "Cited vérifie chaque site, chaque jour",
    body: "Trois contrôles honnêtes : le robots.txt par robot IA, la réponse au pare-feu ou au challenge de sécurité, et la présence du texte utile sans JavaScript.",
  },
  {
    title: "Vous recevez la cause, pas juste l'alerte",
    body: "Un e-mail dès qu'un site casse, avec la cause probable et le correctif en français. Un rapport mensuel récapitule tout le portefeuille, à votre marque.",
  },
];

const checks = [
  {
    check: "robots.txt par robot IA",
    detail:
      "Autorisé ou interdit pour OAI-SearchBot, Claude-SearchBot, PerplexityBot, GPTBot et ClaudeBot, selon le fichier robots.txt du site.",
    reliability: "Certain" as const,
  },
  {
    check: "Réponse au pare-feu ou au challenge",
    detail:
      "Le site répond normalement, ou renvoie une page de vérification (Cloudflare, Wordfence, protection d'hébergeur).",
    reliability: "Certain" as const,
  },
  {
    check: "Contenu sans JavaScript",
    detail:
      "Le texte utile est présent dans le HTML brut, avant toute exécution de script.",
    reliability: "Certain" as const,
  },
  {
    check: "Requête avec un robot IA imité",
    detail:
      "Comment le serveur répond à une requête qui se présente comme le robot. Un indice de comportement, jamais une preuve que le vrai robot passe.",
    reliability: "Indicatif" as const,
  },
  {
    check: "Intégration Cloudflare en lecture seule",
    detail:
      "Les visites réelles des robots vérifiés, telles qu'enregistrées dans les journaux Cloudflare du client.",
    reliability: "En préparation" as const,
  },
  {
    check: "Alertes Slack et webhook",
    detail: "Notification instantanée dans vos outils, en plus de l'e-mail.",
    reliability: "En préparation" as const,
  },
];

const plans = [
  { name: "Freelance", price: "39 €", sites: "10 sites suivis" },
  { name: "Agence", price: "99 €", sites: "30 sites suivis", featured: true },
  { name: "Studio", price: "249 €", sites: "100 sites suivis" },
];

const faqs = [
  {
    q: "Quelle différence avec Semrush ou Screaming Frog ?",
    a: "Semrush et Screaming Frog auditent le référencement classique : titres, maillage interne, vitesse. Cited vérifie une chose précise et quotidienne — est-ce que les robots des IA peuvent lire le site aujourd'hui. Les deux se complètent, l'un ne remplace pas l'autre.",
  },
  {
    q: "Quelle différence avec WP Umbrella ou ManageWP ?",
    a: "Ces outils surveillent la disponibilité, les sauvegardes et les mises à jour de WordPress. Aucun ne vérifie si un pare-feu ou un plugin de sécurité bloque les robots IA. Cited s'ajoute à côté de votre outil de maintenance, il ne le remplace pas.",
  },
  {
    q: "Faut-il installer quelque chose sur les sites clients ?",
    a: "Non. Cited interroge chaque site depuis l'extérieur, comme le ferait un visiteur. Aucune extension WordPress, aucun script à ajouter, aucun accès à demander au client pour commencer.",
  },
  {
    q: "Et si mon client veut bloquer l'entraînement des IA ?",
    a: "C'est un choix légitime, et il concerne l'entraînement (GPTBot, ClaudeBot), pas la citation. Un site peut interdire l'entraînement tout en autorisant OAI-SearchBot, Claude-SearchBot et PerplexityBot à le citer dans les réponses. Cited distingue les deux dans son rapport, au lieu de tout bloquer ou tout autoriser en bloc.",
  },
  {
    q: "Pourquoi pas simplement Cloudflare AI Crawl Control ?",
    a: "C'est un bon outil, gratuit, mais limité à un site à la fois, chez Cloudflare, dans un tableau de bord technique. Cited regroupe tout le portefeuille de vos clients, quel que soit l'hébergeur, avec un rapport en français prêt à envoyer. Une intégration Cloudflare en lecture seule est en préparation pour croiser les deux sources.",
  },
];

export function HomePage() {
  return (
    <div className={`${schibsted.variable} ${tokens.root} ${styles.page}`}>
      <a href="#contenu" className={styles.skipLink}>
        Aller au contenu
      </a>

      <header className={styles.header}>
        <div className={styles.shell}>
          <div className={styles.headerInner}>
            <span className={styles.logo}>Cited</span>
            <nav className={styles.nav} aria-label="Navigation principale">
              <Link href="#comment-ca-marche">Fonctionnement</Link>
              <Link href="#tarifs">Tarifs</Link>
              <Link href="#faq">Questions</Link>
            </nav>
            <div className={styles.headerCtas}>
              <Link href="/login" className={styles.headerLogin}>
                Connexion
              </Link>
              <Link href="/register" className={styles.btnPrimary}>
                Essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main id="contenu">
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.shell}>
            <div className={styles.heroGrid}>
              <div className={styles.heroText}>
                <h1 className={styles.h1}>
                  Pourquoi ChatGPT ne cite pas ce site ?
                </h1>
                <p className={styles.lead}>
                  Scannez une URL : Cited vous dit si les robots de ChatGPT,
                  Claude et Perplexity sont bloqués ou si la page leur arrive
                  vide. Le diagnostic est gratuit, sans compte. Puis
                  surveillez tout votre portefeuille client, chaque jour, avec
                  une alerte dès qu&apos;un site casse.
                </p>
                <p className={styles.leadNote}>
                  On commence par ce qui bloque techniquement : l&apos;accès
                  des robots IA, le robots.txt, les pare-feux et plugins de
                  sécurité, les pages vides sans JavaScript. Pas le contenu du
                  site, pas sa notoriété.
                </p>
                <div className={styles.heroCtas}>
                  <a href="#scan" className={styles.btnPrimary}>
                    Scanner un site
                  </a>
                  <Link href="/register" className={styles.btnGhost}>
                    Essai gratuit
                  </Link>
                </div>
                <div id="scan" className={styles.scanFormWrap}>
                  <ScanForm />
                </div>
              </div>

              <div className={styles.heroPanel}>
                <PortfolioPanel />
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi personne ne le voit */}
        <section className={styles.section} aria-labelledby="causes-title">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 id="causes-title" className={styles.h2}>
                Pourquoi personne ne le voit
              </h2>
              <p className={styles.sectionLead}>
                Ces cinq réglages coupent l&apos;accès des robots IA. Aucun
                n&apos;apparaît dans un rapport de maintenance classique.
              </p>
            </div>
            <dl className={styles.causesList}>
              {causes.map((c) => (
                <div className={styles.causeRow} key={c.term}>
                  <dt className={styles.causeTerm}>{c.term}</dt>
                  <dd className={styles.causeBody}>{c.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Comment ça marche */}
        <section
          className={styles.section}
          id="comment-ca-marche"
          aria-labelledby="steps-title"
        >
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 id="steps-title" className={styles.h2}>
                Comment ça marche
              </h2>
            </div>
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li className={styles.step} key={s.title}>
                  <span className={styles.stepNum} aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepBody}>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Le rapport de maintenance */}
        <section className={styles.section} aria-labelledby="report-title">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 id="report-title" className={styles.h2}>
                Le rapport de maintenance, avec une ligne de plus
              </h2>
              <p className={styles.sectionLead}>
                Vous facturez déjà la maintenance. Cited vous donne une ligne
                de plus à y ajouter, avec un chiffre qui la justifie.
              </p>
            </div>

            <div className={styles.reportGrid}>
              <div className={styles.reportCard}>
                <div className={styles.reportCardHead}>
                  <span className={styles.reportLogo} aria-hidden="true">
                    ND
                  </span>
                  <div>
                    <p className={styles.reportAgency}>
                      Rapport mensuel — Agence Nord Digital
                    </p>
                    <p className={styles.reportPeriod}>Septembre 2026</p>
                  </div>
                </div>
                <dl className={styles.reportRows}>
                  <div className={styles.reportRow}>
                    <dt>Sites lisibles par les 3 assistants</dt>
                    <dd className={`${styles.reportValue} ${styles.tabular}`}>
                      27 / 30
                    </dd>
                  </div>
                  <div className={styles.reportRow}>
                    <dt>Sites à corriger ce mois-ci</dt>
                    <dd className={`${styles.reportValue} ${styles.tabular}`}>3</dd>
                  </div>
                  <div className={styles.reportRow}>
                    <dt>Incidents résolus avant signalement client</dt>
                    <dd className={`${styles.reportValue} ${styles.tabular}`}>2</dd>
                  </div>
                </dl>
                <p className={styles.reportCaption}>
                  Exemple de rapport, agence et chiffres fictifs.
                </p>
              </div>

              <div className={styles.reportMath}>
                <p className={styles.reportMathLine}>
                  <span className={styles.tabular}>30 sites × 10 € = 300 €</span>
                  /mois refacturés à vos clients, pour un abonnement Cited
                  Agence à <span className={styles.tabular}>99 €</span>/mois.
                </p>
                <p className={styles.reportMathNote}>
                  Le prix de Cited tient dans la ligne que vous ajoutez à
                  votre contrat de maintenance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ce que Cited vérifie */}
        <section className={styles.section} aria-labelledby="checks-title">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 id="checks-title" className={styles.h2}>
                Ce que Cited vérifie
              </h2>
              <p className={styles.sectionLead}>
                Un tableau honnête, avec ce qui est mesuré aujourd&apos;hui et
                ce qui reste à construire.
              </p>
            </div>
            <table className={styles.checksTable}>
              <thead>
                <tr>
                  <th scope="col">Contrôle</th>
                  <th scope="col">Ce que ça dit</th>
                  <th scope="col">Fiabilité</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((c) => (
                  <tr key={c.check}>
                    <th scope="row" data-label="Contrôle">
                      {c.check}
                    </th>
                    <td data-label="Ce que ça dit">{c.detail}</td>
                    <td data-label="Fiabilité">
                      <span
                        className={`${styles.reliability} ${
                          c.reliability === "Certain"
                            ? styles.reliabilityOk
                            : c.reliability === "Indicatif"
                              ? styles.reliabilityWarn
                              : styles.reliabilityPrep
                        }`}
                      >
                        {c.reliability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.checksNote}>
              Cited ne se fait pas passer pour le vrai robot : les protections
              modernes vérifient l&apos;origine des requêtes, pas seulement
              leur en-tête. La ligne « robot IA imité » reste donc un indice,
              jamais une preuve de ce que voit GPTBot.
            </p>
          </div>
        </section>

        {/* Tarifs teaser */}
        <section className={styles.section} id="tarifs" aria-labelledby="pricing-title">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 id="pricing-title" className={styles.h2}>
                Un tarif par taille de portefeuille
              </h2>
            </div>
            <div className={styles.pricingGrid}>
              {plans.map((p) => (
                <div
                  className={`${styles.priceCard} ${p.featured ? styles.priceCardFeatured : ""}`}
                  key={p.name}
                >
                  <p className={styles.priceName}>{p.name}</p>
                  <p className={styles.pricePoint}>
                    <span className={styles.tabular}>{p.price}</span>
                    <span className={styles.pricePer}>/mois</span>
                  </p>
                  <p className={styles.priceSites}>{p.sites}</p>
                </div>
              ))}
            </div>
            <Link href="/pricing" className={styles.pricingLink}>
              Voir le détail des tarifs
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.section} id="faq" aria-labelledby="faq-title">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 id="faq-title" className={styles.h2}>
                Questions courantes
              </h2>
            </div>
            <div className={styles.faqList}>
              {faqs.map((f) => (
                <details className={styles.faqItem} key={f.q}>
                  <summary className={styles.faqQuestion}>{f.q}</summary>
                  <p className={styles.faqAnswer}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA finale */}
        <section className={styles.finalCta} aria-labelledby="final-cta-title">
          <div className={styles.shell}>
            <h2 id="final-cta-title" className={styles.finalCtaTitle}>
              Vérifiez un premier site en 15 secondes
            </h2>
            <p className={styles.finalCtaLead}>
              Sans compte pour le scan. Sans carte bancaire pour l&apos;essai.
            </p>
            <div className={styles.heroCtas}>
              <a href="#scan" className={styles.btnPrimary}>
                Scanner un site
              </a>
              <Link href="/register" className={styles.btnGhost}>
                Essai gratuit
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div className={styles.footerInner}>
            <span className={styles.logo}>Cited</span>
            <nav className={styles.footerLinks} aria-label="Pied de page">
              <Link href="#comment-ca-marche">Fonctionnement</Link>
              <Link href="/pricing">Tarifs</Link>
              <Link href="#faq">Questions</Link>
              <Link href="/register">Essai gratuit</Link>
            </nav>
            <p className={styles.footerNote}>
              Cited est un outil de vérification technique. Il ne mesure pas
              vos citations dans les réponses des assistants IA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
