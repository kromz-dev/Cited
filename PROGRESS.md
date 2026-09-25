# Cited — état du projet et reprise

Source de vérité pour reprendre le travail, avec un humain ou un agent.
**Dernière mise à jour :** 25 septembre 2026.

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

53 tâches cochées sur 60 dans `tasks/mvp-tasks.md` — **c'est elle qui fait foi**, cette section n'est qu'un résumé.

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

1. **T003 et T004** : le fondateur crée le service Render à partir du `render.yaml` maintenant dans le dépôt (Francfort, racine de build `cited/`) et saisit les secrets, puis baseline et migre Neon avec la commande ci-dessus. Rien n'est encore provisionné.
2. **T005** — PostHog. Le fondateur a commencé ce travail en local le 24/09 sans jamais le commiter : soit ces fichiers sont récupérés, soit le travail reprend de zéro.
3. **T051** — audit final « aucune donnée fictive dans le chemin critique ». Le job CI `quality-guard` ne fait aujourd'hui qu'avertir sur les chaînes de démonstration connues ; il doit devenir un échec bloquant une fois cette tâche faite.
4. **T054** — audit d'accessibilité WCAG AA des écrans désormais raccordés aux données réelles.
5. **T057** — vérification de bout en bout du pipeline de déploiement, une fois T003 et T004 faits.
6. **T001** — confirmer par écrit les conditions d'usage commercial de Render, Neon, Resend et PostHog. Aucun outil n'expose ce texte contractuel ; lecture manuelle.
7. Puis le marketing à 0 € : le baromètre « les sites français bloquent-ils ChatGPT ? », puis la prospection écrite de 150 agences (`docs/06-kit-prospection.md`). Ne publier que des constats vérifiés.

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
