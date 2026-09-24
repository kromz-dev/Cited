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
| `main` | Seule branche vivante. La CI (tsc, eslint, vitest, build) tourne sur chaque PR et sur chaque push. | Vert |

Chaque tâche part de `main` sur sa propre branche `feat/t0XX-<sujet>` (ou `fix/`, `docs/`, `chore/`), une PR par tâche, fusion par l'humain une fois la CI verte. `chore/ci-quality-gates` et `claude/focused-gates-fav90h` (déjà fusionnées) restent sur GitHub sans usage — à supprimer quand tu veux.

**Trois agents, répartition au 25/09** :
- **Grok** (dossier `Cited-grok`) : cœur produit — T019-T030, T035, T053, T055.
- **Antigravity** (dossier `Cited-claude`, repris le 25/09 pendant que Claude est à court d'usage) : les tâches de code de Claude — T032b, T048, T034, T036, T043, T051, T054. Il n'a pas accès aux MCP.
- **Claude** : ce qui passe par les MCP (Render, Neon, Stripe, PostHog) — T003, T004, T057, vérifications de T005 et T038/T039 — plus les relectures.
- **Fondateur** : T001 (conditions d'usage), fusion des PR.

Une branche et une PR par tâche vers `main`. **Jamais de PR empilées** (incident du 24/09 ci-dessous).

### Fait (24-25/09), en plus du travail antérieur listé dans `tasks/mvp-tasks.md`

- [x] **T037-T039** : coupon fondateur Stripe (`FONDATEUR50`), accepté au checkout, `isFounderMember` via le webhook (PR #13). Reste un vrai paiement de test pour valider T038/T039 de bout en bout.
- [x] **T040, T041, T050** : abonnement réel dans les réglages, export RGPD, réglages sans données fictives (restaurées par #33).
- [x] **T042** : page Tarifs honnête sur le dépassement et le paiement annuel (#17).
- [x] **T044-T045** : onboarding avec les vrais canaux d'alerte et le choix du palier vers Stripe Checkout ; quota réel à la place de « 20 » (#39).
- [x] **T046-T047** : e-mail des 5 questions à J+3, e-mail d'offre fondatrice (#19, #34).
- [x] **T049** : `/analyse/[domain]` devient la page de résultat partageable du diagnostic (#35).
- [x] **T031** : moteur PDF du rapport mensuel (#37). **T032a** : agrégation des données d'un client sur une période (#40).
- [x] **T052** : réinitialisation de mot de passe par e-mail (#18). **T056** : purge mensuelle de `ScanLog.payload` (#21).
- [x] **T005 (code)** : PostHog intégré sans cookie ni e-mail envoyé (#36). Case non cochée : il reste à voir une erreur arriver dans PostHog.
- [x] CI renforcée (Postgres 17 en service, audit npm) (#24). Documentation : ADR-001 PostHog, budget des quotas gratuits.

**30 tâches cochées sur 60** dans `tasks/mvp-tasks.md` — **c'est elle qui fait foi**.

### PR ouvertes au 25/09 (toutes vertes)

| PR | Auteur | Tâche | À savoir |
|---|---|---|---|
| #41 | Claude | T033 marque blanche du rapport | Prête |
| #25, #26, #27 | Grok | T019 quota, T020 SSRF, T021 ajout en masse | **Empilées** : fusionner dans l'ordre, chacune avec `--delete-branch`. Vérifier sur #25 le verrou `FOR UPDATE` et le message Studio complet. |
| #38 | Grok | T023 scan quotidien par lots de 10 | Doit remplir `ScanLog.simpleStatus` et `cause`, lus par les rapports. |
| #42 | Grok | T028 retrait du bouton « Exporter » | |
| #43 | Grok | T035 association site ↔ client | |
| #28-#32 | Dependabot | Mises à jour, dont des majeures (Prisma 6/7, TypeScript 7) | À laisser de côté. |

### Points ouverts

- **T032b** (génération du rapport) est codée mais **non commitée** dans `Cited-claude`, branche `feat/t032b-generate-monthly-report`. Faille à corriger avant la PR : `generateMonthlyReportForUser(userId, …)` est exportée d'un fichier `"use server"`, donc appelable depuis le navigateur avec l'identifiant d'un autre compte. La logique doit partir dans `lib/reports/monthlyReport.ts`.
- **`main`** : `app/actions/reports.ts` (T032a) exporte des fonctions synchrones dans un fichier `"use server"`, ce qui cassera le build dès qu'une page l'importera. Réglé par la correction de T032b.

**Incident du 24/09** : T040, T041, T050 (PR #14-#16) et T047 (PR #20) étaient des PR empilées, fusionnées dans leur branche de base au lieu de `main`. Restaurées par #33 et #34.

### Services provisionnés (24/09, mode test, 0 €)

| Service | Ressource | Identifiants non secrets |
|---|---|---|
| Neon | Projet `cited`, Postgres 17, Francfort (`aws-eu-central-1`), base `cited` | `billowing-resonance-22258158`. Schéma poussé (`db push`), **aucune table `_prisma_migrations`** : à baseliner avant le premier `migrate deploy` en production (T004). |
| Stripe (test) | 3 prix + coupon fondateur | `STRIPE_PRICE_SOLO/PRO/SCALE`, coupon `FONDATEUR50` (−50 %, à vie, 10 utilisations max) — tous vérifiés via MCP le 24/09. |
| PostHog | Cloud UE, erreurs + mesure produit (remplace Sentry, voir ADR-001) | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`. Setup côté code amorcé localement par le fondateur (T005), pas encore commité au 24/09. |
| Render | Espace « My Workspace » (`tea-d97ap06rnols73ck4o20`) | **Aucun service créé** (T003, tentative en cours au 24/09, interrompue). |
| Resend | Compte | 2 clés API existantes, aucun domaine d'envoi configuré. |
| Inngest | Env `production`/`branch` | Aucune app synchronisée. `INNGEST_SIGNING_KEY`/`INNGEST_EVENT_KEY` à créer. |

Points non vérifiés (T001) : les CGU d'usage commercial de Render, Neon, Resend et PostHog ne sont pas confirmées par écrit — aucun outil MCP n'expose ce texte contractuel, à faire à la main.

---

## 2. À faire ensuite, dans l'ordre

1. **Fusionner les PR vertes** : #41, puis #25 → #26 → #27 (`--delete-branch`), #38, #42, #43.
2. **T032b** : corriger la faille « use server », commiter, PR (Antigravity). Puis T048, T034, T036.
3. **T003/T004** (Claude, MCP) : service Render (Francfort, racine `cited/`) et base Neon de production (baseline des 3 migrations, puis `migrate deploy`). Deux permissions ont été refusées en mode automatique le 24/09 (chaîne de connexion Neon, génération d'un secret) : à faire avec le fondateur présent.
4. **Cœur produit** (Grok) : T022, T024-T027, T029a-c, T030, puis T053, T055.
5. **T043** (onboarding réel, après #27), puis les audits T051 et T054.
6. **T057** une fois le déploiement en place, puis préversion gratuite en ligne.
7. **Marketing** (0 €) : baromètre « les sites français bloquent-ils ChatGPT ? », puis prospection écrite de 150 agences (`docs/06-kit-prospection.md`). Ne publier que des constats vérifiés.

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
