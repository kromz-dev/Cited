# PRD — MVP Cited

**Statut** : Draft prêt pour développement | **Créé** : 24 septembre 2026 | **Constitution** : `docs/08-constitution.md`
**Sources** : `docs/05-analyse-strategique.md`, `docs/06-kit-prospection.md`, code du dépôt `cited/` (lecture au 24 septembre 2026)

Légende des états utilisés dans les exigences fonctionnelles :
- **Existant** : livré et fonctionnel dans le dépôt.
- **En cours** : en cours de correction par un autre ingénieur sur le moteur de scan (redirections, `robots.txt` par bot, User-Agent honnête, détection de challenge, meta robots, trois résultats séparés, limite de débit en base) — traité comme acquis à l'échéance du MVP, ne pas re-livrer.
- **À modifier** : le code existe mais ne correspond pas à l'exigence (souvent une maquette à données fictives à raccorder au réel).
- **À construire** : n'existe pas dans le dépôt.

---

## 1. Résumé

Cited est un diagnostic gratuit qui explique, cause à l'appui, pourquoi ChatGPT, Claude ou Perplexity ne lisent pas ou ne citent pas un site — en commençant par ce qui bloque techniquement (pare-feu, `robots.txt`, dépendance JavaScript). Ce diagnostic sert d'aimant à prospects pour un produit payant : la surveillance quotidienne, en marque blanche, du portefeuille client complet d'une agence de maintenance WordPress ou d'une agence SEO/GEO. L'agence est alertée par e-mail dès qu'un site régresse, avec la cause et le correctif, et reçoit chaque mois un rapport PDF à son logo à glisser dans son propre reporting client.

Le moteur d'audit technique et l'infrastructure (authentification, base de données, tâche planifiée, Stripe, alerting) sont déjà largement construits dans le dépôt `cited/`, à la suite d'un premier pivot (« Scanner Black-Box », voir `docs/01-04`). Ce PRD ne repart pas de zéro : il documente ce qui est solide, ce qui est en cours de correction par ailleurs, et ce qui manque pour atteindre le positionnement et la cible décidés en septembre 2026 (`docs/05-analyse-strategique.md`).

## 2. Contexte et problème

Les blocages qui empêchent un site d'être lu par une IA générative sont **invisibles depuis un navigateur normal** : une règle de pare-feu, un plugin de sécurité ou une case cochée par erreur suffisent, sans que le site ait l'air cassé pour un humain. Deux publics vivent ce problème sans outil pour le voir venir :

- Les **freelances et agences de maintenance WordPress**, qui gèrent 20 à 150 sites sous contrat récurrent et découvrent un blocage après coup, souvent signalé par le client lui-même — ce qui abîme la relation de confiance qui justifie le contrat de maintenance.
- Les **agences SEO/GEO**, qui vendent déjà du « référencement IA » à leurs clients sans disposer d'un livrable technique prouvant que le site est effectivement lisible par les IA — leurs outils de suivi de citations (Semrush, Peec, Otterly) mesurent le résultat, pas la cause technique.

Le marché existant (voir §7 de l'analyse stratégique) a soit la détection sans la marque blanche multi-clients (Profound, Peec), soit la marque blanche sans la détection IA (WP Umbrella, ManageWP), soit un contrôle ponctuel sans surveillance (Screaming Frog, checkers gratuits). Aucun produit ne réunit contrôle quotidien multi-bots, alertes, rapport mensuel en marque blanche et tableau de bord multi-clients à un prix d'agence.

## 3. Objectifs

1. Convertir au moins 10 % des scans gratuits en création de compte, en rendant le diagnostic gratuit honnête, actionnable (cause + correctif) et par assistant (ChatGPT/Claude/Perplexity).
2. Faire vivre, dès le premier scan quotidien, une preuve de valeur récurrente pour l'agence : un état de portefeuille à jour, sans intervention manuelle.
3. Éliminer le risque de faux positif qui détruirait la crédibilité commerciale (principe I de la constitution) avant toute prospection à grande échelle.
4. Atteindre 10 agences payantes (~1 000 € de MRR) et un taux de résiliation inférieur à 5 %/mois d'ici 90 jours (§11 de l'analyse stratégique), grâce au rapport mensuel en marque blanche comme fonctionnalité anti-résiliation principale.
5. Garder l'ensemble du parcours (découverte, essai, achat, onboarding) autosuffisant par écrit, sans appel commercial (décision §13.2).

## 4. Non-objectifs (résumé — détail en §11 Hors périmètre)

- Ne pas construire l'intégration Cloudflare en lecture seule, l'import de logs, Slack, les webhooks, une API publique, le multi-utilisateur, la facturation annuelle en libre-service, le suivi de citations IA (plan B), le rendu headless de chaque page, un plugin WordPress ou une extension Chrome. Ce sont des paliers v1.1+.
- Ne pas corriger vous-même le moteur de scan de bas niveau (crawler, robots.txt, détection de challenge) : un autre ingénieur y travaille (statut *En cours* dans les exigences ci-dessous).
- Ne pas rouvrir la question du prix, des cibles ou du nom du produit : ce sont des décisions déjà prises (§8, §9, §13.3 de l'analyse stratégique).

## 5. Personas

### Sophie — freelance maintenance WordPress
45 sites sous contrat de maintenance mensuel (30–80 €/site), ex-salariée d'agence, aujourd'hui indépendante. Elle utilise Wordfence, Cloudflare et un hébergeur mutualisé français. Elle envoie un rapport de maintenance mensuel fait à la main. Elle a découvert au moins une fois un blocage *après* son client. Elle fréquente WP Marmite et les groupes Facebook WordPress France. Elle décide seule, sans comité d'achat, et n'a pas le temps pour une démonstration en direct.

- **Déclencheurs d'achat** : migration d'hébergeur, activation de Cloudflare ou du mode « Under Attack », mise à jour de Wordfence, ou un client qui lui demande « pourquoi ChatGPT ne parle pas de nous ? ».
- **Dans ses mots** : « Je découvre après coup que l'hébergeur a bloqué des trucs. » / « Je ne peux pas vérifier 60 sites à la main. »
- **Ce qui la fait payer** : une preuve concrète sur un de ses propres sites clients, pas un argumentaire général sur l'IA.
- **Ce qui la fait rester abonnée** : le rapport mensuel en marque blanche, qui remplace un travail manuel qu'elle fait déjà et qu'elle peut refacturer 10 à 20 €/site.

### Julien — fondateur d'agence SEO/GEO
Agence de 3 personnes à Lyon, 15 à 60 clients en abonnement SEO, vient de packager une offre « référencement IA / GEO » à 800–2 000 €/mois sans livrable technique dédié. Outillé Semrush/Ahrefs, Search Console, Looker Studio. Il est sous pression pour prouver la valeur de sa nouvelle offre GEO et a besoin d'un rapport propre à montrer au client, pas d'un outil de plus à apprendre.

- **Déclencheurs d'achat** : lancement d'une offre GEO, client qui demande sa visibilité dans ChatGPT, refonte du site d'un client en JavaScript, perte d'un client après un audit raté.
- **Dans ses mots** : « Je ne sais pas packager le GEO, il me faut un livrable propre. » / « Mes rapports mensuels sont faits à la main. »
- **Ce qui le fait payer** : un livrable technique qui manque à son offre GEO, que ses outils de suivi de citations (Semrush, Peec, Otterly) ne fournissent pas.
- **Ce qui le fait rester abonné** : la preuve mensuelle, à glisser telle quelle dans son reporting GEO existant, sans travail de mise en page supplémentaire.

## 6. Parcours utilisateurs prioritaires

### P1 — Diagnostic gratuit et conversion en compte
**Pourquoi cette priorité** : c'est le sommet de l'entonnoir entier (baromètre, prospection écrite, contenu SEO) et l'objectif « scan → inscription ≥ 10 % » en dépend directement. Sans ce parcours honnête et convaincant, aucune autre fonctionnalité ne rencontre de prospects.
**Test indépendant** : un visiteur anonyme peut scanner un domaine, voir un verdict par assistant avec cause et correctif, et créer un compte, sans qu'aucune autre fonctionnalité du produit soit nécessaire.

**Scénarios d'acceptation :**
1. **Étant donné** un visiteur anonyme sur la page d'accueil, **quand** il saisit l'URL d'un site accessible et lance le scan, **alors** il reçoit en moins de 20 secondes un verdict distinct pour ChatGPT, Claude et Perplexity, chacun avec sa cause probable si le verdict n'est pas « lisible ».
2. **Étant donné** un site dont le `robots.txt` interdit un bot IA mais dont le pare-feu laisse passer les autres, **quand** le scan s'exécute, **alors** les trois résultats (politique robots.txt, risque d'accès, dépendance JS) sont affichés séparément, jamais fondus en un score unique.
3. **Étant donné** un verdict affiché, **quand** l'utilisateur clique sur « créer un compte », **alors** il arrive sur l'inscription avec le domaine scanné pré-rempli comme premier site à surveiller.
4. **Étant donné** une URL qui redirige (http→https, apex→www), **quand** le scan s'exécute, **alors** le scan suit la redirection (en la revalidant contre le SSRF) au lieu de renvoyer une erreur.
5. **Étant donné** un site qui n'a pas de problème vérifié, **quand** le scan s'exécute, **alors** aucun message alarmiste n'est affiché : le produit dit clairement que le site est lisible.

### P2 — Suivi quotidien du portefeuille et alerte de régression
**Pourquoi cette priorité** : c'est la valeur payante centrale (« sachez avant votre client »). C'est ce qui justifie l'abonnement mois après mois en dehors des pics d'incident.
**Test indépendant** : une agence déjà abonnée avec des sites ajoutés peut, sans autre fonctionnalité, constater un changement de statut sur son tableau de bord et recevoir un e-mail expliquant la cause et le correctif.

**Scénarios d'acceptation :**
1. **Étant donné** un site surveillé dont le statut était « lisible » la veille, **quand** le scan quotidien détecte un blocage, **alors** une alerte e-mail part au responsable du compte avec la cause identifiée et un correctif suggéré, en moins d'une heure après le scan planifié.
2. **Étant donné** un site déjà en alerte depuis 3 jours, **quand** le scan du jour confirme le même blocage, **alors** aucune nouvelle alerte n'est envoyée (une alerte par changement d'état, jamais par scan).
3. **Étant donné** un site qui revient à un état lisible après blocage, **quand** le scan le confirme, **alors** une alerte distincte de « retour au vert » est envoyée, avec un ton différent de l'alerte de régression.
4. **Étant donné** une agence connectée à son tableau de bord, **quand** elle l'ouvre, **alors** elle voit l'état réel et à jour de chaque site de son portefeuille, avec le nombre de jours consécutifs en état dégradé calculé sur l'historique réel.
5. **Étant donné** un site en alerte, **quand** l'agence ouvre sa page de détail, **alors** elle voit l'historique réel des scans et la réponse brute reçue par chaque bot, pas une donnée de démonstration.

### P3 — Onboarding self-serve payant et rapport mensuel en marque blanche
**Pourquoi cette priorité** : c'est ce qui transforme un essai en abonnement payant et ce qui limite la résiliation dans la durée (§12 de l'analyse stratégique). Il dépend de P1 et P2 mais constitue la troisième tranche livrable, testable séparément une fois le portefeuille et les alertes en place.
**Test indépendant** : une agence peut s'inscrire, importer son portefeuille en une fois, payer via Stripe (avec ou sans l'offre fondatrice), recevoir le questionnaire de découverte à J+3 et télécharger un rapport mensuel à son logo — sans qu'aucun appel ni intervention humaine ne soit nécessaire.

**Scénarios d'acceptation :**
1. **Étant donné** une agence venant de créer un compte, **quand** elle colle une liste de 20 domaines ou importe un CSV, **alors** les sites valides sont ajoutés en une fois, dans la limite du quota de son plan, avec un message clair pour les lignes invalides ou dupliquées.
2. **Étant donné** une agence qui choisit le plan Agence (99 €, 30 sites), **quand** elle valide le paiement, **alors** elle est immédiatement débloquée pour ajouter jusqu'à 30 sites, sans étape manuelle côté Cited.
3. **Étant donné** un compte créé depuis 3 jours, **quand** ce délai est écoulé, **alors** un e-mail avec les 5 questions de découverte part automatiquement, sans intervention humaine.
4. **Étant donné** une agence sur le plan Agence ou Studio, **quand** elle configure son logo et sa couleur dans les paramètres, **alors** le rapport mensuel PDF généré porte cette identité, sans mention visible de Cited.
5. **Étant donné** les 10 premiers comptes payants, **quand** un onzième prospect tente d'activer le coupon fondateur, **alors** le coupon n'est plus disponible et le prospect paie le tarif plein.

### Cas limites (transverses aux trois parcours)

- **Domaine injoignable ou résolu vers une IP privée** : le scan (public ou planifié) refuse la requête avec un message clair, sans exposer de détail réseau interne (ENF-001).
- **Site qui répond différemment selon le bot** (ex. `robots.txt` interdit ChatGPT mais autorise Claude) : les trois verdicts par assistant restent indépendants, jamais moyennés en un seul chiffre (EF-001, EF-002).
- **Site qui redevient joignable entre deux scans après une panne réseau ponctuelle** : un `ERREUR` isolé ne déclenche pas d'alerte de régression tant que le statut fonctionnel (`OK`/`BLOQUÉ`/`COQUILLE VIDE`) n'a pas réellement changé (EF-030, EF-034).
- **Agence qui atteint son quota de sites en pleine campagne de prospection** : le message de refus d'ajout doit orienter vers le palier supérieur plutôt que vers une simple erreur technique (EF-018).
- **Client qui n'a jamais de problème pendant tout un mois** : le rapport mensuel se génère quand même, avec une disponibilité à 100 % affichée comme une preuve de veille active, pas comme une absence de contenu (EF-047, argument anti-résiliation §12).
- **Onzième candidat à l'offre fondatrice** : le coupon doit être indisponible sans ambiguïté, jamais appliqué « par erreur » faute de contrôle serveur (EF-058, EF-066).
- **Résiliation en cours de mois** : les sites restent surveillés et alertants jusqu'à la fin de la période déjà payée (`stripeCurrentPeriodEnd`), la purge des données n'intervenant que 60 jours après (EF-056).

## 7. Exigences fonctionnelles

### A. Diagnostic public (scan gratuit)
*Porte l'objectif « scan → inscription ≥ 10 % » (§3) ; dépend directement des correctifs du moteur de scan actuellement en cours par ailleurs.*

- **EF-001** [À construire] Le diagnostic public DOIT afficher un verdict distinct par assistant (ChatGPT, Claude, Perplexity), chacun avec sa cause et son correctif propres — remplace le verdict unique actuel basé sur un seul bot (`GPTBot`) affiché par `components/landing/ScanForm.tsx` et `app/api/scan/route.ts`.
- **EF-002** [À construire] Le diagnostic DOIT afficher séparément les trois résultats définis en §3.3 de l'analyse stratégique : politique `robots.txt` par bot, risque de blocage à l'accès (code HTTP, challenge, `cf-mitigated`), dépendance au JavaScript (écart HTML brut / rendu de contrôle) — jamais un score unique qui les mélange.
- **EF-003** [En cours] Le moteur DOIT suivre les redirections (http→https, apex↔www, changement de chemin) en revalidant chaque étape contre le SSRF, au lieu de renvoyer une erreur (`redirect: "error"` dans `lib/scanner/crawler.ts`).
- **EF-004** [En cours] Le moteur DOIT lire et interpréter `robots.txt` par jeton de bot (groupe le plus spécifique gagne, RFC 9309) avant de conclure à un blocage ou à un accès.
- **EF-005** [En cours] Le moteur DOIT utiliser un User-Agent honnête et déclaré pour sa requête de référence, et étiqueter toute requête à User-Agent imité comme non vérifiée (principe I de la constitution) — remplace l'usurpation actuelle de `GPTBot`/`ClaudeBot` sans étiquette dans `lib/scanner/agents.ts`.
- **EF-006** [En cours] Le moteur DOIT détecter les pages de challenge (Cloudflare Turnstile, « Just a moment… », en-tête `cf-mitigated: challenge`) au-delà de la seule recherche du mot « cloudflare » dans le HTML, faite aujourd'hui dans `lib/scanner/analyzer.ts`.
- **EF-007** [À construire] Le moteur DOIT lire `meta robots`, `X-Robots-Tag` et `noindex` pour affiner le verdict robots.txt (EF-002), en complément du fichier `robots.txt`.
- **EF-008** [À construire] Le diagnostic DOIT couvrir, en plus des bots d'entraînement déjà scannés (GPTBot, ClaudeBot, PerplexityBot, `lib/scanner/agents.ts`), les bots de citation qui déterminent si un site peut être *cité* (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, Perplexity-User — §3.1). Le rapport doit préciser qu'un blocage de bot d'entraînement n'empêche pas la citation, et inversement.
- **EF-009** [Existant] Le diagnostic public NE DOIT PAS exiger de compte pour lancer un scan (`ScanForm`, `/api/scan`).
- **EF-010** [En cours] Le diagnostic public DOIT être protégé contre le SSRF (résolution DNS, refus des plages privées, `lib/scanner/crawler.ts::assertSafeUrl` et `app/api/scan/route.ts::isSafeUrl`) et limité en débit par une ressource partagée en base — déjà le cas pour `/api/audit` (`lib/rate-limit.ts`), à généraliser à `/api/scan` qui reste aujourd'hui en mémoire de processus (P8 de l'analyse stratégique).
- **EF-011** [À construire] Le résultat du diagnostic public DOIT proposer un export PDF « à envoyer à mon client », au logo Cited (la marque blanche du client final reste réservée aux comptes payants, EF-047 et suivants).

### B. Compte et authentification
*Fondation technique de tous les autres domaines ; largement livrée, les manques sont ponctuels (RGPD visible, mot de passe oublié).*

- **EF-012** [Existant] Le système DOIT permettre la création de compte par e-mail et mot de passe (`app/api/auth/register/route.ts`, NextAuth v5), avec limitation de débit par IP adossée à la base.
- **EF-013** [Existant] Le système DOIT permettre la connexion par e-mail et mot de passe et la gestion de session (`app/login`).
- **EF-014** [À construire] Le système DOIT permettre la réinitialisation de mot de passe par e-mail — absente du dépôt actuel.
- **EF-015** [À construire] Le compte DOIT exposer, dans les paramètres, l'export des données personnelles et la date de purge programmée après résiliation, en s'appuyant sur les champs déjà présents sur `User` (`dataExportedAt`, `purgeAt`) mais non affichés dans `app/(app)/settings/page.tsx`, qui est aujourd'hui une page à données fictives.

### C. Portefeuille de sites
*Cœur du parcours P3 (onboarding) et condition du parcours P2 (rien à surveiller sans portefeuille) ; le principal manque est l'application réelle du quota.*

- **EF-016** [Existant] L'utilisateur connecté DOIT pouvoir ajouter un site un par un (nom + URL) via `app/actions/sites.ts::addMonitoredSite` et `components/DashboardSites.tsx`.
- **EF-017** [Existant] L'ajout d'un site DOIT être refusé si l'utilisateur n'a pas d'abonnement actif (vérification du plan et de `stripeCurrentPeriodEnd` dans `addMonitoredSite`).
- **EF-018** [À construire] L'ajout d'un site DOIT être refusé au-delà du quota du plan (10 / 30 / 100 sites selon Freelance / Agence / Studio) : aujourd'hui, seule l'absence d'abonnement bloque l'ajout, jamais le nombre de sites déjà présents.
- **EF-019** [À construire] Le système DOIT permettre l'ajout en masse par collage d'une liste de domaines (un par ligne) ou import CSV, avec dé-duplication et validation d'URL avant création. La page `app/(app)/onboarding/page.tsx` simule déjà cette interaction (texte de démonstration, lecture de CSV côté client) mais n'écrit rien en base ; elle doit être raccordée à une action serveur réelle et au quota (EF-018).
- **EF-020** [Existant] L'utilisateur DOIT pouvoir supprimer un site de son portefeuille, avec isolation stricte par `userId` (`deleteMonitoredSite`).
- **EF-021** [À modifier] La page dédiée « Ajouter un site » (`app/(app)/sites/new/page.tsx`) fait doublon avec le formulaire intégré au tableau de bord (`DashboardSites`) ; à unifier en un seul point d'entrée d'ajout, cohérent avec le quota et l'import en masse.
- **EF-022** [À construire] Le système DOIT valider que l'URL ajoutée est un domaine joignable et non une IP privée avant de créer l'entrée `MonitoredSite` (même garde SSRF que le scan public, EF-010) ; `addMonitoredSite` ne fait aujourd'hui aucune validation de format ni de sécurité sur l'URL fournie.
- **EF-023** [Existant] Chaque site du portefeuille DOIT être rattaché à un seul compte (`MonitoredSite.userId`), sans partage entre comptes.

### D. Scan quotidien automatisé
*Le mécanisme de planification (Inngest) est solide ; ce qui manque est la richesse du verdict produit à chaque passage, pas la fiabilité du déclenchement.*

- **EF-024** [Existant] Un job planifié DOIT s'exécuter chaque jour (`inngest/functions/daily-scan.ts`, cron `0 3 * * *`) et répartir tous les sites actifs en événements individuels par lots de 500.
- **EF-025** [Existant] Chaque site DOIT être scanné par une fonction Inngest dédiée (`scan-site.ts`), avec une concurrence limitée (10) pour ne pas saturer les sites cibles.
- **EF-026** [À modifier] Le scan quotidien planifié NE DOIT PAS se limiter à GPTBot (`scan-site.ts` n'appelle `runCoreScan` qu'avec `["GPTBot"]`) : il doit produire un verdict par assistant (EF-001) et les trois résultats séparés (EF-002), pas un statut unique simplifié.
- **EF-027** [Existant] Chaque scan DOIT être journalisé (`ScanLog`, code HTTP et charge utile), condition nécessaire à l'historique (EF-043).
- **EF-028** [À construire] Le job quotidien DOIT respecter le budget de performance ENF-005 (1 000 sites en moins d'une heure), à revérifier une fois EF-026 livré : l'ajout de plusieurs bots par site augmente le coût par site scanné.
- **EF-029** [À construire] Le rendu headless (Playwright) DOIT être déclenché seulement sur les pages jugées suspectes (texte HTML brut très inférieur au contrôle navigateur), jamais systématiquement (décision de coût §13). Tant qu'aucun service headless n'est en place, l'indicateur de dépendance JS reste basé sur le seul écart de texte HTML actuel, explicitement signalé comme une approximation (principe I).
- **EF-030** [À construire] Un site dont le scan échoue techniquement (timeout, DNS, 5xx répété) DOIT être distingué d'un site bloqué (`ERREUR` vs `BLOQUÉ`) dans le statut stocké et affiché — `SimpleStatus` distingue déjà les deux valeurs dans `lib/scanner/core.ts`, mais `MonitoredSite.status` et l'interface ne les exploitent pas différemment aujourd'hui.
- **EF-031** [En cours] La limitation de débit du moteur de scan DOIT reposer sur une ressource partagée (base de données), jamais sur une mémoire de processus — déjà le cas pour `/api/audit`, en cours de généralisation au reste du moteur (P8 de l'analyse stratégique).
- **EF-032** [À construire] Chaque scan DOIT respecter un budget de 20 secondes par URL, tous bots confondus ; au-delà, le bot concerné est marqué `ERREUR` sans bloquer le résultat des autres bots pour la même URL.

### E. Alerte de régression
*Porte le parcours P2 dans son intégralité ; le déclenchement existe déjà, la valeur ajoutée (cause + correctif) reste à construire.*

- **EF-033** [Existant] Le système DOIT envoyer un e-mail au responsable du compte quand le statut d'un site change (`sendRegressionAlert`, Resend), déclenché par la comparaison `oldStatus`/`newStatus` dans `scan-site.ts`.
- **EF-034** [Existant] Une seule alerte DOIT être envoyée par changement d'état, jamais une par scan quotidien identique.
- **EF-035** [À construire] L'e-mail d'alerte DOIT contenir la cause identifiée et le correctif suggéré (règle Cloudflare, `robots.txt`, plugin, hébergeur) ; le modèle actuel de `lib/alerting/sendAlert.ts` n'indique que l'ancien et le nouveau statut, sans cause ni piste de correction.
- **EF-036** [À construire] Le système DOIT distinguer, dans l'alerte comme dans le journal, une régression (passage à un état dégradé) d'un retour au vert (résolution), avec objet et ton différents.
- **EF-037** [À construire] Un journal des alertes consultable DOIT exister et refléter les alertes réellement envoyées — la page `app/(app)/alerts/page.tsx` affiche aujourd'hui des données fictives codées en dur, sans lecture de la base de données.
- **EF-038** [Hors périmètre MVP — exigence négative] Les canaux Slack et webhook ne sont PAS construits dans le MVP (§11 Hors périmètre). Les paramètres et la page de tarifs ne doivent afficher ces canaux qu'en « en préparation », jamais comme actifs (principe II) : `app/(app)/settings/page.tsx` affiche aujourd'hui un canal Slack marqué « Actif » et un exemple de message figé, ce qui contredit ce principe et doit être corrigé au même titre qu'une exigence positive.

### F. Tableau de bord portefeuille
*Vitrine quotidienne du portefeuille ; existe déjà pour la liste, manque encore la granularité par assistant et les vraies métriques.*

- **EF-039** [Existant] Le tableau de bord DOIT lister tous les sites de l'utilisateur connecté avec leur dernier statut connu (`app/(app)/dashboard/page.tsx`, `getMonitoredSites`).
- **EF-040** [À construire] Le tableau de bord DOIT afficher, par site, le verdict par assistant (EF-001) et non un statut global unique — la colonne actuelle « Verdict IA » agrège tout en une seule valeur.
- **EF-041** [À modifier] Les indicateurs affichés (quota fixe « /20 », « texte utile » et « prochain scan » codés en dur dans `components/DashboardSites.tsx`) DOIVENT refléter le quota réel du plan (EF-018) et les données réelles du dernier scan, jamais des valeurs de démonstration.
- **EF-042** [À construire] Le bouton « Exporter » du tableau de bord (aujourd'hui sans effet) DOIT soit être retiré, soit déclencher un export réel (principe II).

### G. Détail d'un site et historique
*Écran de preuve individuelle pour un client donné ; la structure de page existe, son contenu est aujourd'hui entièrement fictif.*

- **EF-043** [À modifier] La page de détail d'un site DOIT afficher l'historique réel des scans (`ScanLog`) sous forme de série datée — la page actuelle (`app/(app)/sites/[siteId]/page.tsx`) affiche un graphique en barres et une trace de réponse HTTP codés en dur, indépendants du site réellement consulté.
- **EF-044** [À construire] La page de détail DOIT afficher, par assistant, le dernier code HTTP, la cause et la piste de correction (cohérent avec EF-035), reliés aux vrais `ScanLog`.
- **EF-045** [À construire] La page de détail DOIT indiquer le nombre de jours consécutifs en état dégradé, calculé depuis l'historique réel, jamais une valeur fixe.
- **EF-046** [Existant] L'accès à la page de détail DOIT être limité au propriétaire du site (filtre `userId` déjà appliqué dans la requête Prisma).

### H. Rapport mensuel en marque blanche
*Fonctionnalité anti-résiliation numéro un (§12 de l'analyse stratégique) ; entièrement à construire, y compris le modèle de données du regroupement par client.*

- **EF-047** [À construire] Le système DOIT générer un rapport mensuel par regroupement de sites (« client » de l'agence), incluant le verdict actuel et l'historique de chaque domaine, la liste des incidents datés (apparition et résolution), et la réponse brute des bots en annexe technique.
- **EF-048** [À construire] Le rapport DOIT porter le logo, le nom et la couleur d'accent de l'agence, sans mention visible de Cited sur le document final, réservé aux plans Agence et Studio (cohérent avec la grille tarifaire déjà publiée).
- **EF-049** [À construire] Le rapport DOIT être exportable en PDF depuis l'application — la page `app/(app)/reports/page.tsx` existe avec une maquette complète (six clients fictifs) et un bouton d'export qui déclenche `window.print()` sans générer de PDF réel ; à remplacer par une génération PDF serveur.
- **EF-050** [À construire] Les paramètres de marque blanche (nom affiché, logo, couleur) DOIVENT être enregistrés et effectivement appliqués au rendu du rapport — la section « Marque blanche » de `app/(app)/settings/page.tsx` est aujourd'hui un formulaire purement local (état React) qui n'écrit rien en base.
- **EF-051** [À construire] Le rapport DOIT pouvoir être régénéré à la demande (pas seulement le 1er du mois), pour un usage commercial immédiat pendant la prospection (kit de prospection §1, préparation par prospect).
- **EF-052** [À décider] Le regroupement des sites par « client » de l'agence suppose une entité distincte du site individuel, absente du modèle de données actuel (`MonitoredSite` n'a pas de champ de regroupement) — voir [À DÉCIDER : 1] en §14.

### I. Facturation, plans et quotas
*Le socle Stripe est déjà robuste (idempotence, résolution serveur du tarif) ; les manques concernent l'application du quota et l'offre fondatrice.*

- **EF-053** [Existant] Le système DOIT proposer trois plans payants (Freelance 39 €, Agence 99 €, Studio 249 €) via Stripe Checkout, avec correspondance tarif↔plan résolue côté serveur uniquement (`lib/billing/plans.ts`, `createCheckoutSession`) : le client ne peut jamais choisir arbitrairement le tarif facturé.
- **EF-054** [Existant] Le webhook Stripe DOIT mettre à jour le plan de l'utilisateur de façon idempotente (marqueur `ProcessedWebhook` dans la même transaction que l'écriture métier) pour les événements de création, mise à jour et résiliation d'abonnement.
- **EF-055** [Existant] La page de tarifs publique DOIT refléter les quatre paliers décidés (Scan libre, Freelance 10 sites, Agence 30 sites recommandé, Studio 100 sites) avec l'argument de refacturation client — déjà livré dans `app/(marketing)/pricing/page.tsx`.
- **EF-056** [Existant] La résiliation DOIT programmer une purge des données à 60 jours (`purgeAt` positionné au moment de `customer.subscription.deleted`).
- **EF-057** [À construire] Le dépassement de quota au-delà de 100 sites DOIT être facturé 2 €/site/mois. Ce mécanisme de facturation à l'usage n'existe pas (le Checkout actuel ne gère que des abonnements à quantité fixe) et peut être différé après le lancement (§8 : « au-delà », pas un blocant du jour 1) tant que l'ajout de site reste simplement bloqué au quota (EF-018).
- **EF-058** [À construire] Le système DOIT proposer un coupon « offre fondatrice » (−50 % à vie) applicable aux 10 premiers comptes payants, avec un mécanisme empêchant son octroi au-delà de 10 (voir [À DÉCIDER : 2]).
- **EF-059** [À modifier] La page « Abonnement » des paramètres DOIT afficher le vrai plan, le vrai quota utilisé et la vraie date de prélèvement de l'utilisateur connecté, et exposer un lien vers le portail client Stripe déjà disponible côté serveur (`createCustomerPortalSession`) mais non relié à un bouton dans `app/(app)/settings/page.tsx`, page actuellement statique avec des valeurs fictives.
- **EF-060** [Hors périmètre MVP] La facturation annuelle (deux mois offerts) est mentionnée sur la page de tarifs mais son activation dans Stripe Checkout n'existe pas et n'est pas requise pour le MVP (voir §11 Hors périmètre) ; le texte de la page de tarifs ne doit pas laisser croire qu'elle est activable en libre-service tant qu'elle ne l'est pas (principe II).

### J. Onboarding self-serve
*Condition du principe VII (vente 100 % écrite) ; l'écran existe déjà comme démonstration visuelle, il doit devenir fonctionnel.*

- **EF-061** [À construire] Après inscription, l'utilisateur DOIT pouvoir importer son portefeuille (ajout unitaire ou en masse, EF-016/EF-019) et lancer le premier scan sans intervention humaine, en moins de 5 minutes.
- **EF-062** [À modifier] Le flux d'onboarding actuel (`app/(app)/onboarding/page.tsx`) simule le scan (délai artificiel puis redirection) et les canaux d'alerte (cases à cocher locales sans effet) ; il doit être raccordé à de vraies actions serveur (création réelle des sites, préférences d'alerte réellement enregistrées).
- **EF-063** [À construire] Le choix du plan (Freelance/Agence/Studio) DOIT être proposé pendant l'onboarding, avec redirection vers Stripe Checkout dès que l'utilisateur dépasse le scan public gratuit et souhaite surveiller un premier site.

### K. Découverte écrite (questionnaire automatisé)
*Remplace l'appel de découverte (décision §13.2) ; entièrement à construire, mais volontairement minimal (un e-mail planifié, pas d'outil de collecte dédié).*

- **EF-064** [À construire] Un e-mail contenant les 5 questions de découverte (`docs/06-kit-prospection.md` §5) DOIT partir automatiquement 3 jours après la création du compte (tâche planifiée par utilisateur, Inngest).
- **EF-065** [À construire] Les réponses au questionnaire DOIVENT pouvoir être collectées par simple réponse e-mail ou via un formulaire externe (Tally) — aucune interface de collecte interne n'est requise pour le MVP (vente 100 % écrite, principe VII).

### L. Offre fondatrice
*Levier d'acquisition des 10 premiers comptes payants (§8) ; dépend du questionnaire de découverte (domaine K) et du mécanisme de coupon (à trancher, [À DÉCIDER : 2]).*

- **EF-066** [À construire] Le coupon fondateur (EF-058) DOIT être proposé par e-mail après au moins 3 réponses positives au questionnaire de découverte (règle qualitative, kit de prospection §5), avec une date limite d'activation affichée.
- **EF-067** [À construire] Un compte bénéficiant de l'offre fondatrice DOIT être marqué comme tel, pour suivre les 10 premiers comptes et l'obligation de retour écrit mensuel qui accompagne l'offre — champ actuellement absent du modèle `User`.

## 8. Exigences non fonctionnelles

- **ENF-001** [En cours] Sécurité SSRF : toute requête HTTP sortante vers une URL externe (scan public, scan planifié, ajout de site) valide l'IP résolue et revalide chaque redirection suivie, jamais une confiance aveugle dans un en-tête `Location`.
- **ENF-002** [En cours] Limitation de débit : toute route publique consommant des ressources (scan, inscription) est protégée par une limite adossée à PostgreSQL, jamais à la mémoire du processus.
- **ENF-003** [À modifier] RGPD : hébergement des données personnelles en France/UE priorisé ; export et purge programmée disponibles et visibles par l'utilisateur (champs `dataExportedAt`/`purgeAt` déjà présents en base, non encore exposés en interface — EF-015).
- **ENF-004** [À construire] Performance : un scan d'une URL isolée, tous bots confondus, répond en moins de 20 secondes.
- **ENF-005** [À construire] Performance : le lot quotidien complet (jusqu'à 1 000 sites) se termine en moins d'une heure.
- **ENF-006** [Existant] Disponibilité : une panne du moteur de scan sur un site n'empêche pas le scan des autres sites du lot (isolation par job Inngest individuel, concurrence limitée).
- **ENF-007** [À modifier] Accessibilité : parcours clavier complet, contraste AA, cibles tactiles ≥ 44 px sur toutes les pages listées dans ce document — à auditer en particulier sur les pages à données fictives une fois raccordées au réel.
- **ENF-008** [Existant] Langue : l'intégralité de l'interface, des e-mails et du rapport PDF est en français ; aucun texte d'interface ne reste en anglais ou en placeholder technique visible par un utilisateur final.
- **ENF-009** [À construire] Observabilité minimale : chaque échec de scan et chaque échec d'envoi d'alerte est journalisé avec une cause exploitable, pas seulement une exception générique.
- **ENF-010** [Existant] Qualité : les quatre portes de la constitution (`tsc --noEmit`, `eslint`, `vitest run`, `next build`) passent avant toute fusion.
- **ENF-011** [Existant] Idempotence : le traitement des webhooks Stripe est idempotent (rejouer un même événement ne double pas l'effet, marqueur `ProcessedWebhook`).
- **ENF-012** [Existant] Confidentialité : un utilisateur ne peut jamais lire, modifier ou supprimer un site appartenant à un autre compte (contrainte déjà vérifiée dans les actions serveur existantes).
- **ENF-013** [Existant] Résilience du rate limit : un pic de trafic sur le scan public dégrade proprement (429 avec `Retry-After`), jamais une erreur 500 non gérée (`/api/audit` le fait déjà ; à vérifier sur `/api/scan` une fois ENF-002 généralisé).
- **ENF-014** [À décider] Coût d'infrastructure : le coût de service par agence de 30 sites doit rester sous 5 €/mois au tarif actuel des API et de l'hébergement (hypothèse §12 de l'analyse stratégique) ; à instrumenter dès que le rendu headless conditionnel (EF-029) est en place.
- **ENF-015** [Existant] Maintenabilité : aucune fonctionnalité livrée ne dépend d'une intervention manuelle récurrente du fondateur (pas de script à lancer à la main chaque jour) — cohérent avec le principe VI de la constitution.

## 9. Entités clés

- **User** [Existant] — L'agence ou le freelance : identifiants de connexion, plan, identifiants Stripe, champs RGPD (`purgeAt`, `dataExportedAt`). Un compte, un portefeuille.
- **MonitoredSite** [Existant] — Un domaine surveillé, rattaché à un `User`, avec son statut courant. Ne porte aujourd'hui aucun regroupement par « client final » (voir EF-052).
- **ScanLog** [Existant] — Un scan quotidien d'un `MonitoredSite` : code HTTP, charge utile, horodatage. Base de l'historique (EF-043) et de l'alerting (EF-033).
- **Site / Page / BotScan / ScanResult** [Existant, superseded] — Modèle plus ancien (V2, multi-pages par site) conservé dans le schéma Prisma mais non utilisé par le parcours agence actuel, qui repose sur `MonitoredSite`/`ScanLog`. À conserver pour compatibilité tant qu'aucune migration n'est décidée, sans construire de nouvelles fonctionnalités dessus.
- **RateLimit** [Existant] — Fenêtre fixe de limitation de débit adossée à PostgreSQL (clé, fenêtre, compteur).
- **AuditLead** [Existant, sous-utilisé] — Capture d'e-mail associée à un scan (email, domaine, score) ; à relier explicitement au tunnel scan → inscription de EF-001/P1 s'il doit servir de source de relance.
- **ProcessedWebhook** [Existant] — Marqueur d'idempotence des événements Stripe déjà traités.
- **Client de l'agence** [À construire] — Regroupement de un ou plusieurs `MonitoredSite` sous un même client final, nécessaire au rapport mensuel par client (EF-047, EF-052).
- **Paramètres de marque blanche** [À construire] — Nom affiché, logo, couleur d'accent, rattachés à un `User`, appliqués au rapport PDF (EF-048, EF-050).
- **Rapport mensuel** [À construire] — Document généré par période et par client de l'agence, à partir des `ScanLog` de la période (EF-047 à EF-051).
- **Offre fondatrice** [À construire] — Marqueur sur `User` (ou table dédiée) indiquant l'octroi du coupon −50 % à vie et le compteur des 10 places (EF-058, EF-067).

## 10. Métriques de succès

Reprises telles que décidées en §0 et §11 de l'analyse stratégique — ce PRD ne les redéfinit pas, il les rend atteignables :

- **0 faux positif** sur 50 sites vérifiés manuellement, avant toute prospection à grande échelle (dépend des exigences *En cours* du moteur de scan, section A).
- **Scan gratuit → inscription ≥ 10 %**, mesuré une fois EF-001/EF-002 livrées (verdict par assistant, causes, correctifs).
- **15 essais** ouverts sur la fenêtre des 90 jours (semaines 5–8 du plan).
- **10 agences payantes**, soit environ **1 000 € de MRR**, d'ici le jour 90.
- **Résiliation < 5 %/mois**, portée en particulier par le rapport mensuel en marque blanche (EF-047 à EF-051) comme fonctionnalité anti-résiliation.
- **Critère d'arrêt** : si moins de 5 % des sites scannés présentent un problème *vérifié* pendant le baromètre, le problème est trop rare pour un abonnement ; on bascule vers le plan B (visibilité IA, code déjà présent dans `lib/analysis/` et `lib/scoring/`, explicitement hors périmètre de ce MVP).

## 11. Hors périmètre (v1.1 et au-delà)

- **Intégration Cloudflare en lecture seule** (AI Crawl Control) et **import de logs serveur** : c'est la mesure la plus fiable (§3.3) mais elle demande l'accès du client, hors du MVP autosuffisant.
- **Slack et webhook** comme canaux d'alerte actifs : mentionnés sur la page de tarifs comme « en préparation », non construits (EF-038).
- **API publique** : mentionnée en « en préparation » sur la page de tarifs (palier Studio), non construite.
- **Multi-utilisateur par compte** : la page paramètres affiche une maquette d'équipe ; ni les invitations ni les rôles ne sont fonctionnels dans le MVP.
- **Facturation annuelle en libre-service** : mentionnée sur la page de tarifs (« deux mois offerts ») sans activation Stripe réelle (EF-060) ; à traiter manuellement si un prospect la demande avant le premier trimestre.
- **Suivi de citations et de visibilité IA (plan B)** : code déjà présent (`lib/analysis/mention-detector.ts`, `lib/scoring/share-of-voice.ts`, `lib/prompts/query-generator.ts`) et une page publique dédiée (`app/(marketing)/analyse/[domain]/page.tsx`) qui porte encore l'ancien positionnement « visibilité de marque ». Ce code n'est pas supprimé (c'est la base du plan B si le critère d'arrêt tombe) mais ne doit pas être présenté comme le produit actuel tant que le diagnostic technique (P1) n'est pas le point d'entrée unique et cohérent (voir [À DÉCIDER : 3]).
- **Rendu headless de chaque page** : seules les pages suspectes sont rendues (EF-029) ; un rendu systématique de tout le site est un choix de coût explicitement écarté au stade MVP (§13, décision 1).
- **Plugin WordPress.org et extension Chrome** : prévus au plan d'acquisition (§10 de l'analyse stratégique) mais après le MVP, une fois la mesure validée.
- **Démonstration en direct / appel commercial** : remplacés par le diagnostic gratuit, le rapport d'exemple en PDF et la page de visite guidée (décision §13.2) ; aucune fonctionnalité de prise de rendez-vous n'est à construire.

## 12. Risques

| Risque | Impact sur ce PRD | Parade prévue |
|---|---|---|
| Le moteur de scan *En cours* (section A) livre en retard ou avec des écarts par rapport à §3.3 | P1 entier repose dessus ; un diagnostic public non honnête retarde toute prospection | Geler la prospection à grande échelle tant que le critère « 0 faux positif sur 50 sites » n'est pas vérifié (principe I) |
| Les pages à données fictives (rapports, alertes, paramètres, détail de site, onboarding) sont perçues comme fonctionnelles par un testeur pressé | Risque de vendre une fonctionnalité qui n'existe pas encore (violation du principe II) si le raccordement au réel prend du retard | Retirer ou marquer clairement « aperçu » toute maquette tant qu'elle n'est pas raccordée aux vraies données, avant toute démonstration à un prospect |
| Deux expériences de scan public coexistent (`ScanForm` orienté blocage technique, `/analyse/[domain]` orienté « visibilité de marque » avec l'ancien positionnement) | Message confus pour un visiteur qui tombe sur l'une ou l'autre page | Trancher [À DÉCIDER : 3] avant la publication du baromètre (semaine 3–5 du plan) |
| Le quota par plan n'est pas appliqué (EF-018) | Une agence peut ajouter plus de sites que son plan ne le permet, sans en payer le prix (fuite de revenu) | Prioriser EF-018 avant toute campagne de prospection à volume |
| Le rendu headless conditionnel (EF-029) n'est pas prêt à temps | Le score de dépendance JS reste une approximation par comptage de mots, moins fiable que promis en §3.3 | Étiqueter clairement l'indicateur comme approximatif tant que le rendu headless n'est pas branché (principe I) |
| Cloudflare ou une plateforme d'hébergement rend l'information de blocage gratuite (§13, risque à 12–24 mois) | Érosion de l'avantage concurrentiel de la détection seule | Le rapport mensuel en marque blanche et la vue multi-clients restent la valeur défendable, indépendamment de la détection brute |

## 13. Hypothèses

- Le moteur de scan livré par l'autre ingénieur (statut *En cours* dans ce document) respecte l'architecture de mesure décrite au §3.3 de l'analyse stratégique (trois résultats séparés, `robots.txt` par bot, User-Agent honnête étiqueté) ; ce PRD ne redéfinit pas cette architecture, il en dépend.
- Resend (déjà intégré pour les alertes de régression) reste le seul fournisseur d'e-mail transactionnel du MVP, y compris pour le questionnaire J+3 et l'offre fondatrice, sauf si [À DÉCIDER : 5] en décide autrement.
- Le rendu headless reste hébergé sur un petit VPS (Playwright, ≈ 5 €/mois, décision §13.1 de l'analyse stratégique) pour tout le MVP ; aucun service tiers payant n'est budgété avant 20 agences clientes.
- Les 50 sites utilisés pour vérifier « 0 faux positif » (métrique de sortie) sont choisis manuellement par le fondateur parmi des sites WordPress et des sites d'agences SEO/GEO réels, pas générés synthétiquement.
- Le premier lot de rapports mensuels en marque blanche (EF-047 à EF-051) peut être généré manuellement ou semi-automatiquement pour les tout premiers comptes fondateurs si l'automatisation complète prend du retard, sans que cela retarde l'encaissement des dix premiers abonnements.
- Le code du plan B (`lib/analysis/`, `lib/scoring/`, `lib/prompts/`) n'est pas maintenu activement pendant le MVP ; il n'est ni supprimé ni testé en continu (ENF-010 s'applique au périmètre MVP, pas à ce code dormant).

## 14. Décisions (24 septembre 2026)

Contrainte transverse : **budget de 0 €**. Le projet est autofinancé à 100 %. Aucune dépense fixe n'est engagée avant le premier revenu. Tout service doit avoir une offre gratuite qui autorise un usage commercial, ou être remplaçable par du code maison. Une dépense ne devient acceptable qu'une fois couverte par le MRR.

1. **Regroupement par client (EF-047, EF-052) :** entité `Client` (nom, logo, lien facultatif depuis `MonitoredSite`). Un site sans client reste valide.
2. **Coupon fondateur (EF-058, EF-066) :** coupon Stripe natif (`duration: forever`, `percent_off: 50`, `max_redemptions: 10`). Stripe ne facture aucun abonnement, seulement des frais par transaction encaissée.
3. **`/analyse/[domain]` et le plan B :** `/analyse/[domain]` devient la page de résultat partageable du diagnostic gratuit (P1), sur le nouveau moteur. Le code du plan B (`lib/analysis/`, `lib/scoring/`, `lib/prompts/`) reste dans le dépôt, sans être exposé ni appelé.
4. **Rendu headless (EF-029) :** aucun service payant. MVP : diagnostic sur le HTML brut, avec les heuristiques de dépendance au JavaScript. Le rendu Playwright est une interface optionnelle, activée seulement si elle tourne sur l'hébergement gratuit (voir ENF-016). Un service managé ne sera évalué qu'une fois financé par le MRR.
5. **E-mails (EF-064, EF-066) :** Resend et un job planifié. Pas d'outil de séquences. La prospection du kit `06` part de la boîte e-mail du fondateur, à la main, sans outil payant.

**ENF-016, budget :** le MVP s'exécute sur des offres gratuites qui autorisent un usage commercial. Les conditions exactes de chaque offre (quotas, usage commercial, mise en veille) sont à vérifier au moment de l'inscription et à consigner dans `docs/10-plan-technique.md`. Point d'attention connu : l'offre gratuite Hobby de Vercel est réservée à un usage non commercial. Elle ne convient donc pas pour encaisser des abonnements.

## 15. Critères de sortie du MVP

Le MVP est considéré prêt à ouvrir la prospection à grande échelle (semaines 5–8 du plan 90 jours) quand :

1. Les exigences *En cours* du moteur de scan (EF-003 à EF-006, EF-010, EF-031, ENF-001, ENF-002) sont livrées et vérifiées.
2. Le diagnostic public (P1, EF-001/EF-002/EF-008) affiche un verdict honnête par assistant sur au moins 50 sites vérifiés manuellement, avec **0 faux positif**.
3. Le parcours P2 (portefeuille, scan quotidien, alerte avec cause et correctif) fonctionne de bout en bout sur des données réelles, sans page à données fictives dans le chemin critique.
4. Le quota par plan est appliqué (EF-018) et le paiement Stripe débloque effectivement l'ajout de sites dans cette limite.
5. Le rapport mensuel en marque blanche (EF-047 à EF-051) peut être généré à la demande pour au moins un compte de démonstration, condition du parcours P3 et de l'argument anti-résiliation.
6. Les quatre portes de qualité de la constitution passent sur l'ensemble du dépôt (`tsc`, `eslint`, `vitest`, `build`).

Au-delà, le succès du MVP se mesure aux indicateurs de la section 10 (10 agences payantes, ~1 000 € MRR, résiliation < 5 %/mois) sur la fenêtre des 90 jours, et non à la seule complétude fonctionnelle de ce document.
