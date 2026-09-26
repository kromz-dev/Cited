import Link from "next/link";
import { ScanForm } from "./ScanForm";
import { PortfolioPanel } from "./PortfolioPanel";
import { schibsted } from "./fonts";
import tokens from "./tokens.module.css";
import styles from "./home.module.css";

const steps = [
  {
    title: "1. Ajoutez vos clients",
    body: "L'URL de chaque client suffit. Vous pouvez aussi déposer le logo de votre agence, utilisé sur le rapport mensuel.",
  },
  {
    title: "2. Surveillance automatique",
    body: "Decelio vérifie chaque site, chaque jour : le robots.txt par robot IA, la réponse au pare-feu, et la présence du texte utile sans JavaScript.",
  },
  {
    title: "3. Vous recevez la cause, pas juste l'alerte",
    body: "Un e-mail dès qu'un site casse, avec la cause probable et le correctif. Un rapport mensuel récapitule tout le portefeuille, à votre marque.",
  },
];

const checks = [
  {
    feature: "Veille robots.txt",
    benefit: "Vérifie que les bots IA (GPTBot, ClaudeBot, etc.) ne sont pas bloqués.",
  },
  {
    feature: "Passage du pare-feu",
    benefit: "S'assure que Cloudflare ou Wordfence ne rejettent pas les requêtes IA.",
  },
  {
    feature: "Vérification du contenu brut",
    benefit: "Garantit que le texte est présent dans le HTML sans exécution de JavaScript.",
  },
  {
    feature: "Rapports marque blanche",
    benefit: "Générez un PDF professionnel à vos couleurs pour justifier votre facturation.",
  },
];

const comparison = [
  { feature: "Surveillance accès robots IA", cited: "Oui", semrush: "Non", managewp: "Non" },
  { feature: "Analyse des pare-feux", cited: "Oui", semrush: "Non", managewp: "Non" },
  { feature: "Audit SEO complet", cited: "Non", semrush: "Oui", managewp: "Non" },
  { feature: "Mise à jour des plugins", cited: "Non", semrush: "Non", managewp: "Oui" },
];

const faqs = [
  {
    q: "Qu'est-ce que Decelio ?",
    a: "Decelio est un outil de surveillance automatisé pour agences web. Il centralise le contrôle technique de l'accessibilité AEO pour tout votre portefeuille de sites.",
  },
  {
    q: "Quelle différence avec Semrush ?",
    a: "Semrush audite le référencement classique. Decelio vérifie uniquement l'accès technique des robots IA à vos sites.",
  },
  {
    q: "Faut-il installer un plugin WordPress ?",
    a: "Non. Decelio interroge chaque site depuis l'extérieur, comme le ferait un visiteur IA. Aucun script ni accès requis.",
  },
  {
    q: "Est-ce compatible avec tous les hébergeurs ?",
    a: "Oui. Decelio analyse la réponse HTTP publique de votre site, quel que soit l'hébergeur ou le CMS utilisé.",
  },
  {
    q: "Comment sont envoyées les alertes ?",
    a: "Dès qu'un robot IA est bloqué, vous recevez une alerte par e-mail avec la cause probable et sa solution.",
  },
  {
    q: "Puis-je facturer ce service à mes clients ?",
    a: "Absolument. Nos rapports PDF en marque blanche vous permettent d'ajouter une ligne de facturation à vos contrats de maintenance.",
  },
];

export function HomePage({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <div className={`${schibsted.variable} ${tokens.root} ${styles.page}`}>
      <a href="#contenu" className={styles.skipLink}>Aller au contenu</a>

      <header className={styles.header}>
        <div className={styles.shell}>
          <div className={styles.headerInner}>
            <span className={styles.logo}>Decelio</span>
            <nav className={styles.nav} aria-label="Navigation principale">
              <Link href="#comment-ca-marche">Fonctionnement</Link>
              <Link href="/pricing">Tarifs</Link>
              <Link href="#faq">Questions</Link>
            </nav>
            <div className={styles.headerCtas}>
              {isLoggedIn ? (
                <Link href="/dashboard" className={styles.btnPrimary}>Tableau de bord</Link>
              ) : (
                <>
                  <Link href="/login" className={styles.headerLogin}>Connexion</Link>
                  <Link href="/register" className={styles.btnPrimary}>Essai gratuit</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="contenu">
        {/* 1. Hero */}
        <section className={styles.hero}>
          <div className={styles.shell}>
            <div className={styles.heroGrid}>
              <div className={styles.heroText}>
                <div style={{ display: "inline-block", padding: "6px 12px", background: "var(--cobalt-soft)", color: "var(--cobalt)", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "20px", border: "1px solid var(--cobalt)" }}>
                  Optimisation AEO (Answer Engine Optimization)
                </div>
                <h1 className={styles.h1}>Pourquoi l&apos;IA ignore vos sites clients ?</h1>
                <blockquote className={styles.aeoBlockquote}>
                  Decelio est un outil de surveillance automatisé pour agences web qui vérifie quotidiennement si les sites clients sont accessibles aux robots d&apos;intelligence artificielle comme ChatGPT, Claude et Perplexity.
                </blockquote>
                <div className={styles.heroCtas}>
                  <a href="#scan" className={styles.btnPrimary}>Scanner un site</a>
                  {isLoggedIn ? null : (
                    <Link href="/register" className={styles.btnGhost}>Démarrer l&apos;essai</Link>
                  )}
                </div>
                <div id="scan" className={styles.scanFormWrap} style={{ marginTop: "2rem" }}>
                  <ScanForm />
                </div>
              </div>
              <div className={styles.heroPanel}>
                <PortfolioPanel />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Problem */}
        <section className={`${styles.section} ${styles.gradientBg}`}>
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>Vos clients perdent en visibilité, et vous n&apos;en savez rien</h2>
              <p className={styles.sectionLead} style={{ marginTop: "1rem" }}>
                Vous passez des heures à optimiser le SEO de vos clients. Mais chaque jour, des sites disparaissent des résultats de l&apos;IA à cause d&apos;une simple case cochée dans Cloudflare, d&apos;une mise à jour Wordfence ou d&apos;un pare-feu mal configuré. Vous continuez à facturer la maintenance, mais les robots IA sont bloqués et personne ne vous avertit.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Solution */}
        <section className={styles.section} style={{ backgroundColor: "var(--surface)", padding: "4rem 0" }}>
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>La solution : Une surveillance proactive de l&apos;accessibilité IA</h2>
              <p className={styles.sectionLead} style={{ marginTop: "1rem" }}>
                Decelio agit comme votre système d&apos;alerte précoce. Nous simulons l&apos;accès des robots IA à vos sites pour détecter le moindre blocage. Avant même que votre client ne s&apos;aperçoive d&apos;une baisse de trafic, vous recevez une notification précise de l&apos;erreur et de sa solution. Prouvez votre valeur d&apos;expert AEO.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Features as Benefits (Bento Grid) */}
        <section className={styles.section} style={{ backgroundColor: "var(--paper)" }}>
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>Ce que nous surveillons pour vous</h2>
            </div>
            
            <div className={styles.bentoGrid}>
              {checks.map((c) => (
                <div key={c.feature} className={styles.bentoCard}>
                  <h3 className={styles.bentoTitle}>{c.feature}</h3>
                  <p className={styles.bentoBody}>{c.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Social Proof */}
        <section className={styles.section} style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <div className={styles.shell}>
            <h2 className={styles.h2} style={{ marginBottom: "1rem" }}>Ils sécurisent déjà leur SEO</h2>
            <p className={styles.sectionLead} style={{ marginBottom: "2rem", marginInline: "auto" }}>Rejoignez les agences qui anticipent l&apos;AEO et protègent leur portefeuille de clients.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", fontWeight: "bold", opacity: 0.6, fontSize: "18px" }}>
              <span>4,000+ sites surveillés</span>
              <span>•</span>
              <span>100% automatisé</span>
              <span>•</span>
              <span>Zéro faux positif</span>
            </div>
          </div>
        </section>

        {/* 6. Mid-page CTA */}
        <section className={styles.section} style={{ textAlign: "center", backgroundColor: "var(--surface)", padding: "4rem 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className={styles.shell}>
            <h2 className={styles.h2} style={{ marginBottom: "2rem" }}>Prêt à protéger vos sites ?</h2>
            <Link href="/register" className={styles.btnPrimary} style={{ fontSize: "1.1rem", padding: "12px 28px", borderRadius: "8px" }}>
              Essayer gratuitement pendant 14 jours
            </Link>
          </div>
        </section>

        {/* 7. How It Works */}
        <section className={styles.section} id="comment-ca-marche">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>Comment ça marche</h2>
            </div>
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li className={styles.step} key={s.title}>
                  <span className={styles.stepNum} aria-hidden="true">{i + 1}</span>
                  <div>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepBody}>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 8. Comparison */}
        <section className={styles.section} style={{ backgroundColor: "var(--paper)" }}>
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>Comparaison : Decelio vs Outils traditionnels</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className={styles.checksTable}>
                <thead>
                  <tr>
                    <th scope="col">Fonctionnalité</th>
                    <th scope="col">Decelio</th>
                    <th scope="col">Semrush</th>
                    <th scope="col">ManageWP</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((c) => (
                    <tr key={c.feature}>
                      <th scope="row" data-label="Fonctionnalité" style={{ fontWeight: 600 }}>{c.feature}</th>
                      <td data-label="Decelio" style={{ fontWeight: c.cited === 'Oui' ? 'bold' : 'normal', color: c.cited === 'Oui' ? 'var(--ok)' : 'inherit' }}>{c.cited}</td>
                      <td data-label="Semrush" style={{ color: "var(--ink-3)" }}>{c.semrush}</td>
                      <td data-label="ManageWP" style={{ color: "var(--ink-3)" }}>{c.managewp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 9. FAQ */}
        <section className={styles.section} id="faq">
          <div className={styles.shell}>
            <div className={styles.sectionHead}>
              <h2 className={styles.h2}>Questions courantes</h2>
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

        {/* 10. Trust Signals */}
        <section className={styles.section} style={{ textAlign: "center", padding: "2rem 0", color: "var(--ink-3)", fontSize: "0.875rem", background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
          <div className={styles.shell}>
            <p>🔒 Paiement sécurisé via Stripe &nbsp;·&nbsp; 🇪🇺 Hébergé en Europe &nbsp;·&nbsp; 🛡️ Conforme au RGPD</p>
          </div>
        </section>

        {/* 11. Final CTA */}
        <section className={styles.finalCta} style={{ background: "var(--cobalt)", color: "var(--surface)" }}>
          <div className={styles.shell}>
            <h2 className={styles.finalCtaTitle} style={{ color: "var(--surface)" }}>Vérifiez un premier site en 15 secondes</h2>
            <p className={styles.finalCtaLead} style={{ color: "var(--cobalt-soft)" }}>Sans compte pour le scan. Sans carte bancaire pour l&apos;essai.</p>
            <div className={styles.heroCtas} style={{ justifyContent: "center" }}>
              <a href="#scan" className={styles.btnPrimary} style={{ background: "var(--surface)", color: "var(--cobalt)" }}>Scanner un site</a>
              {isLoggedIn ? null : (
                <Link href="/register" className={styles.btnGhost} style={{ borderColor: "var(--cobalt-soft)", color: "var(--surface)" }}>Démarrer mon essai</Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.shell}>
          <div className={styles.footerInner}>
            <span className={styles.logo}>Decelio</span>
            <nav className={styles.footerLinks} aria-label="Pied de page">
              <Link href="#comment-ca-marche">Fonctionnement</Link>
              <Link href="/pricing">Tarifs</Link>
              <Link href="#faq">Questions</Link>
              {isLoggedIn ? null : <Link href="/register">Essai gratuit</Link>}
            </nav>
            <p className={styles.footerNote}>
              Decelio est un outil de vérification technique. Il ne mesure pas vos citations dans les réponses des assistants IA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
