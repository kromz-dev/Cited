# Cited — état du projet et reprise

Source de vérité pour reprendre le travail, avec un humain ou un agent.
**Dernière mise à jour :** 26 septembre 2026.

**Stack :** Next.js 16 · React 19 · TypeScript strict · Prisma 5 · PostgreSQL · Tailwind 4 · NextAuth v5 · Stripe · Inngest · Resend · PostHog
**Contrainte absolue :** budget 0 €, autofinancé. Uniquement des offres gratuites qui autorisent un usage commercial (voir `docs/09-prd-mvp.md` §14, ENF-016).

---

## 1. Où on en est

**Positionnement :** « Comprendre pourquoi les IA ne lisent pas ou ne citent pas votre site, en commençant par ce qui bloque techniquement » (diagnostic gratuit). L'offre payante est la surveillance quotidienne d'un portefeuille de sites pour les **agences de maintenance WordPress et les agences SEO/GEO**, en France d'abord. Vente 100 % écrite, sans appel.

### Branches

| Branche | Rôle | État |
|---|---|---|
| `main` | Seule branche vivante. La CI (tsc, eslint, vitest, build) tourne sur chaque PR et sur chaque push. | Vert — a été rouge pendant plusieurs fusions le 25/09, remis au vert par la PR #68 (voir ci-dessous). |

Chaque tâche part de `main` sur sa propre branche `feat/t0XX-<sujet>` (ou `fix/`, `docs/`, `chore/`), une PR par tâche, fusion par l'humain une fois la CI verte.

**Deux agents en parallèle** : Claude (dossier `Cited-claude`, facturation, réglages, onboarding, infra, CI) et Grok (dossier `Cited-grok`, cœur produit : T019-T036, T053, T055). Une branche et une PR par tâche vers `main`, jamais de PR empilées.

### 25/09 : `main` remis au vert, historique de migrations reconstruit

**Trois défauts CI distincts ont été corrigés (PR #68)** :
- le job `prisma`, étape « Format check » : chemin doublé (`cited/cited/prisma/schema.prisma`) alors que le job fixe déjà `working-directory: cited` ;
- l'étape de détection de dérive de schéma : elle passait `--from-migrations` sans base shadow, ce qui ne peut jamais réussir (`Error: You must pass the --shadow-database-url if you want to diff a migrations directory.`) — elle utilise maintenant `--from-url "$DATABASE_URL"` après `migrate deploy` ;
- le job `quality-guard`, détection des tests ignorés : la regex `\.skip` non ancrée matchait la propriété ordinaire `res.data.skipped` — elle ne matche plus désormais que les formes réelles (`it.skip(`, `test.todo(`, `describe.only(`, `xit(`, `xdescribe(`).

**L'historique des migrations Prisma était cassé, pas seulement en dérive.** L'ancienne migration `20260916055018_init` créait 12 tables et 11 enums de l'ancien modèle abandonné « visibilité de marque », et sept tables que `schema.prisma` déclare (`Site`, `Page`, `BotScan`, `ScanResult`, `MonitoredSite`, `ScanLog`, `PageView`) n'avaient été créées par aucune migration — elles n'existaient sur Neon que parce qu'un `prisma db push` les y avait poussées. `prisma migrate deploy` échouait donc sur une base neuve avec `Error: P3018 ... ERROR: relation "MonitoredSite" does not exist`. L'historique a été fusionné en une migration unique, `20260925000000_init`, générée à partir du schéma. Vérifié sur un vrai Postgres (branche Neon jetable, depuis supprimée) : `migrate reset` l'applique, et `prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel ./prisma/schema.prisma --exit-code` répond `No difference detected.`

**Conséquence pour T004, à retenir** : la base Neon a été peuplée par `db push` et n'a pas de table `_prisma_migrations`. Avant le premier `migrate deploy` en production, elle doit être baselinée avec `npx prisma migrate resolve --applied 20260925000000_init`. Le runbook `docs/runbooks/deploiement-render-neon.md` porte déjà cette procédure.

### Douze pull requests fusionnées le 25/09

#68 (CI et historique de migrations), #53 (T027 quota réel du tableau de bord), #62 (T026 journal d'alertes), #54 (T030 test d'intégration alerte unique), #50 (T022 point d'entrée unique d'ajout de site), #57 (T032b génération de rapport), #64 (T003/T004 blueprint Render, `/api/health`, runbook Neon — configuration et documentation seulement, rien n'est provisionné), #55 (T053 journalisation structurée), #67 (T036 tests de rapport), #69 (T048 e-mail de rapport disponible), #70 (T043 import réel de l'onboarding et premier scan), #59 (T034 page rapports sur données réelles). La PR #65 a été fermée, remplacée par #68 ; la PR #66 est remplacée par cette mise à jour.

**Décision de conception** : la branche T026 portait un récapitulatif quotidien par cron qui aurait envoyé un second e-mail pour chaque transition déjà couverte par l'alerte immédiate de `scan-site.ts`. Il a été retiré avant fusion, car EF-033 décrit l'alerte immédiate comme un comportement déjà existant et EF-034 exige exactement une alerte par changement d'état. Un récapitulatif quotidien reste possible plus tard, mais comme un remplacement assumé, avec une ADR et une mise à jour d'EF-033 — pas comme un ajout.

**Défaut réel trouvé au passage** : sur cette même branche, la ligne `AlertEvent` n'était écrite que par le récapitulatif ; le chemin réellement emprunté par `scan-site.ts` envoyait donc l'e-mail sans jamais l'enregistrer. Corrigé dans `sendAlert.ts` ; le journal d'alertes serait sinon resté vide en production.

53 tâches cochées sur 60 dans `tasks/mvp-tasks.md` — **c'est elle qui fait foi**, cette section n'est qu'un résumé. Rien de nouveau n'a été fusionné le 26/09 (voir section suivante), donc ce compte n'a pas bougé.

### 26/09 : défaut bloquant trouvé, service Render créé, PostHog audité, pas encore fusionné

**Défaut bloquant corrigé le 26/09 : la connexion par e-mail/mot de passe ne fonctionnait pas.** Le fournisseur `Credentials` était manquant. Il a été implémenté dans `cited/auth.ts` (pour respecter le Edge Runtime sans crasher avec `node:crypto`), et couvert par 8 tests (`cited/auth.test.ts`). La PR #75 a été fusionnée.

**PR #73 ouverte, pas fusionnée : T051 (audit données fictives).** Dix fichiers nettoyés (écran de connexion simplifié, `resolveDomainName` extrait pour éviter un domaine fictif quand `siteId` vaut littéralement `client-vitrine`, etc.), le garde-fou CI `quality-guard` devient bloquant (`FAIL=1`) au lieu de seulement avertir. Vérifié : 56 fichiers de test, 367 tests verts ; toute occurrence restante des chaînes de démonstration est dans un fichier `*.test.*`, exclu du garde-fou.

**Branche `feat/t005-posthog` poussée, aucune PR ouverte.** Audit en quatre points avant travail : exceptions client et mesure produit déjà en place (héritage de la PR #36, jamais cochée), absence de Sentry quasi complète (un commentaire mort corrigé), exceptions serveur absentes. Ajouté : `cited/instrumentation.ts` et `cited/instrumentation-client.ts` (convention Next.js 16), `cited/lib/posthog-server.ts`. Autocapture et session replay désactivés explicitement côté client pour préserver le quota gratuit (1 M événements/mois, 5 000 enregistrements/mois). 368 tests verts. **Compte PostHog audité par MCP** : projet `282882`, nommé « Default project », fuseau UTC, `ingested_event: false` — **aucun événement n'a jamais été reçu**, malgré des indicateurs d'onboarding tous à `true`. Le code compile et teste correctement mais l'ingestion réelle n'est pas vérifiée. Reste au fondateur : renommer le projet, passer le fuseau en Europe/Paris, renseigner le vrai token en production, provoquer une erreur test et vérifier son apparition dans PostHog.

**Service Render créé par MCP.** `srv-darer6btqb8s73f7d670`, région Francfort, plan gratuit, URL `https://cited-6ihy.onrender.com`. **Deux champs refusés par l'API malgré l'envoi**, à corriger à la main dans le tableau de bord avant tout déploiement : Root Directory (vide au lieu de `cited`) et Health Check Path (vide au lieu de `/api/health`). Les variables d'environnement n'ont pas pu être posées par MCP non plus (erreur de type côté connecteur) — à saisir entièrement à la main.

**Resend confirmé sans domaine d'envoi** (`list-domains` → aucun résultat). Bloquant pour tous les e-mails produits (alertes, rapports, découverte, offre fondatrice) : sans domaine vérifié, seul `onboarding@resend.dev` peut envoyer, inutilisable pour démarcher de vraies agences. Achat d'un nom de domaine nécessaire — première dépense réelle du projet (budget 0 € sur les services, pas sur le domaine). Recherche de disponibilité et de prix lancée puis interrompue avant son terme (budget de session) ; à refaire.

**Test local effectué, interrompu avant la connexion.** Branche Neon jetable `local-dev` (`br-old-mode-b21jizov`), séparée de la production, créée et **baselinée** (`prisma migrate resolve --applied 20260925000000_init`) — confirme en conditions réelles que la procédure du runbook fonctionne. Serveur `next dev` démarré, page d'accueil affichée avec du contenu réel, `/api/health` répond `{"status":"ok"}`. Interrompu juste avant de tester `/register`, qui aurait immédiatement buté sur le défaut Credentials ci-dessus. `cited/.env` et `cited/.env.local` créés dans ce worktree uniquement (ignorés par git, jamais poussés) — à recréer dans tout autre worktree ou machine, et à saisir séparément dans Render, qui ne les lit pas.

**Ménage** : 6 branches distantes entièrement fusionnées supprimées de GitHub. Les checkouts locaux `Cited-claude` et `Cited-claude-2` avaient les symlinks `.claude/agents` et `.claude/skills` cassés sous Windows (`core.symlinks=false` posé pour corriger). Dependabot invité à rebaser #28 et #30 sur le `main` réparé ; #28 a été remplacé par #72 (nouveau groupe minor/patch) après rebase, à revérifier.

**Incident du 24/09 (clos)** : T040, T041, T050 (PR #14-#16) et T047 (PR #20) étaient des PR empilées, fusionnées dans leur branche de base au lieu de `main`. Restaurées par les PR #33 et #34. Règle depuis : pas de PR empilées, ou fusion avec `--delete-branch`.

### Services provisionnés (mode test, 0 €)

| Service | Ressource | Identifiants non secrets |
|---|---|---|
| Neon | Projet `cited`, Postgres 17, Francfort (`aws-eu-central-1`), base `cited` | `billowing-resonance-22258158`. Schéma poussé (`db push`), **aucune table `_prisma_migrations`** : à baseliner avec `npx prisma migrate resolve --applied 20260925000000_init` avant le premier `migrate deploy` en production (T004). Procédure détaillée : `docs/runbooks/deploiement-render-neon.md`. |
| Stripe (test) | 3 prix + coupon fondateur | `STRIPE_PRICE_SOLO/PRO/SCALE`, coupon `FONDATEUR50` (−50 %, à vie, 10 utilisations max) — tous vérifiés via MCP le 24/09. |
| PostHog | Cloud UE, erreurs + mesure produit (remplace Sentry, voir ADR-001) | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`. Setup côté code amorcé localement par le fondateur le 24/09, jamais commité — toujours pas commité au 25/09 (T005) : soit ces fichiers sont récupérés, soit le travail reprend de zéro. |
| Render | Espace « My Workspace » (`tea-d97ap06rnols73ck4o20`) | **Aucun service créé.** `render.yaml` (racine du dépôt, région Francfort, racine de build `cited/`) et `docs/runbooks/deploiement-render-neon.md` sont maintenant sur `main` (PR #64) ; le fondateur doit encore appliquer le Blueprint et saisir les secrets. |
| Resend | Compte | 2 clés API existantes, aucun domaine d'envoi configuré. |
| Inngest | Env `production`/`branch` | Aucune app synchronisée. `INNGEST_SIGNING_KEY`/`INNGEST_EVENT_KEY` à créer. |

Points non vérifiés (T001) : les CGU d'usage commercial de Render, Neon, Resend et PostHog ne sont pas confirmées par écrit — aucun outil MCP n'expose ce texte contractuel, à faire à la main.

Cinq pull requests Dependabot restent ouvertes (#28 à #32), dont trois montées majeures (Prisma 7, TypeScript 7, `@types/node` 25) — reportées volontairement après la stabilisation.

---

## 2. À faire ensuite, dans l'ordre

1. ~~**Corriger le fournisseur Credentials manquant**~~ (Corrigé via la PR #75, fusionnée)
2. ~~**Fusionner PR #73** (T051) une fois relue.~~ (Fusionnée)
3. ~~**Ouvrir la PR pour `feat/t005-posthog`** (T005) une fois relue — la branche est poussée, pas encore de PR.~~ (PR #76 fusionnée)
4. **T003 et T004** : le service Render existe (`srv-darer6btqb8s73f7d670`) mais Root Directory, Health Check Path et toutes les variables d'environnement restent à saisir à la main dans le tableau de bord (l'API MCP les a refusées). Puis baseline et migration Neon avec la commande de la section 1.
5. **Domaine d'envoi Resend** — aucun domaine possédé à ce jour. Achat nécessaire (première dépense réelle), puis vérification SPF/DKIM/DMARC dans Resend. Bloquant pour tout e-mail produit en dehors des tests.
6. ~~**T054** — audit d'accessibilité WCAG AA des écrans désormais raccordés aux données réelles.~~ (Vérifié le 26/09 via axe-core/playwright)
7. **T057** — vérification de bout en bout du pipeline de déploiement, une fois 1 et 4 faits.
8. ~~**T001** — confirmer par écrit les conditions d'usage commercial de Render, Neon, Resend et PostHog.~~ (Vérifié le 26/09 : l'usage commercial est autorisé sur tous ces Tiers Gratuits, sous réserve de respecter leurs limites de quotas respectives : 100 emails/jour pour Resend, 0.5GB pour Neon, etc.)
9. Puis le marketing à 0 € : le baromètre « les sites français bloquent-ils ChatGPT ? », puis la prospection écrite de 150 agences (`docs/06-kit-prospection.md`). Ne publier que des constats vérifiés.

Objectif à 90 jours : 10 agences payantes, environ 1 000 € de MRR. Critère d'arrêt : moins de 5 % des sites scannés présentent un problème vérifié (plan B : visibilité IA, voir `docs/05` §13).

---

## 3. Reprendre en 5 commandes (local)

```bash
git fetch origin && git checkout main
cd cited && npm install
npx prisma generate
npx tsc --noEmit && npx vitest run      # doit être vert
npm run dev                              # http://localhost:3000, /pricing, /design-system
```

Variables d'environnement : voir `cited/.env.example` (`DATABASE_URL`, `AUTH_SECRET`, `STRIPE_*`, `RESEND_API_KEY`, `INNGEST_*`, `NEXT_PUBLIC_POSTHOG_*`).

## 4. Reprendre avec Claude (économe)

Colle ceci au début d'une nouvelle session :

> Lis `PROGRESS.md` et `tasks/mvp-tasks.md`. Budget 0 €, sois économe en tokens. Prends la prochaine tâche non cochée, fais-la sur sa propre branche depuis `main`, vérifie (tsc, eslint, vitest), ouvre une PR, coche-la dans `tasks/mvp-tasks.md` une fois fusionnée, puis mets à jour `PROGRESS.md`.

Règle de tenue : **à chaque tâche terminée, cocher la case dans `tasks/mvp-tasks.md`, et mettre à jour la section 1 de ce fichier à chaque fin de session.**
