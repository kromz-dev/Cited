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
| `main` | Seule branche vivante. La CI (tsc, eslint, vitest, build) tourne sur chaque PR et sur chaque push. | **Rouge** depuis la fusion de #56 (25/09) : jobs `prisma` (dérive schéma/migrations sur `User`, `ApiCall`, etc. — voir PR #65) et `test` en échec. |

Chaque tâche part de `main` sur sa propre branche `feat/t0XX-<sujet>` (ou `fix/`, `docs/`, `chore/`), une PR par tâche, fusion par l'humain une fois la CI verte.

**Qui fait quoi (25/09)** : Claude (infra MCP, rapports, onboarding, audits — dossiers `Cited-claude`, `Cited-claude-2`, `Cited-fixci`), Grok (cœur produit T019-T030, T035, T053, T055), Jules (résolution des conflits des PR #62, #53, #50, #54, #55 — ne pas y toucher pendant qu'il travaille), le fondateur (T001, fusions, runbook de déploiement). Antigravity n'est plus un agent actif sur le projet ; son ancien worktree WSL (`cited-antigravity`, branche `feat/t036-pdf-e2e`) traîne encore en local, non fusionné.

**41 tâches cochées sur 60** dans `tasks/mvp-tasks.md` — **c'est elle qui fait foi**, cette section n'est qu'un résumé.

### PR ouvertes (25/09)

| PR | Tâche | Base | État |
|---|---|---|---|
| #65 | fix CI (drift Prisma + test mal imbriqué) | `main` | CI rouge : le job `prisma` échoue toujours (dérive schéma/migrations non résolue) — **pas fusionnable en l'état**. |
| #64 | T003/T004 (infra Render, `/api/health`, runbook Neon) | `main` | CI rouge : `prisma` et `test` échouent (même dérive que #65/main). |
| #62 | T026 (journal des alertes envoyées) | `main` | **Conflit** avec `main` — à laisser à Jules. |
| #59 | T034 (dashboard données réelles + PDF) | `main` | Check `quality` en échec. |
| #57 | T032b (isolation logique et sécurité MonthlyReport) | `main` | CI rouge : `prisma` et `test` échouent (même dérive). |
| #55 | T053 (logs structurés JSON) | `main` | **Conflit** avec `main` — à laisser à Jules. |
| #54 | T030 (une seule alerte après scan répété) | `main` | **Conflit** avec `main` — à laisser à Jules. |
| #53 | T027 (vrai quota de plan au dashboard) | `main` | **Conflit** avec `main` — à laisser à Jules. |
| #50 | T022 (ajout de domaines uniquement depuis le portefeuille) | `main` | **Conflit** avec `main` — à laisser à Jules. |
| #45 | docs (état du 25/09) | `main` | Périmée, remplacée par la présente mise à jour — à fermer. |
| #28-#32 | Dependabot (Prisma, TypeScript, `@types/node`, groupe minor/patch) | `main` | Non triées dans cette session. |

Aucune fusion n'a eu lieu dans cette session : la vérification de #65 a échoué (job `prisma`), ce qui bloquait aussi l'étape suivante (#64, #57, #62), et `main` était déjà rouge indépendamment de #65 (fusion de #56 le 25/09).

**Incident du 24/09** (historique) : T040, T041, T050 (PR #14-#16) et T047 (PR #20) étaient des PR empilées, fusionnées dans leur branche de base au lieu de `main`. Restaurées par les PR #33 et #34. Règle depuis : pas de PR empilées, ou fusion avec `--delete-branch`.

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

1. **Remettre `main` au vert** : la dérive schéma Prisma / migrations (voir PR #65, job `prisma`) touche `User` (`stripeSubId`→`stripeSubscriptionId`/`stripePriceId`/`stripeCurrentPeriodEnd`, `plan` enum→string) et plusieurs clés étrangères. Tant que ce n'est pas résolu, #65, #64 et #57 restent bloquées en CI et rien d'autre ne doit être fusionné sur `main`.
2. **T003/T004** (infra) : le code (`/api/health`, `render.yaml`, runbook Neon) est prêt côté PR #64, mais pas encore sur `main` — bloqué par le point 1. Une fois fusionné : créer le service Render (région Francfort, `cited/` comme racine de build), puis baseliner et migrer la base Neon en production.
3. **Conflits en cours** : PR #62, #55, #54, #53, #50 sont en conflit avec `main` — résolution en cours par Jules, ne pas y toucher.
4. **T036** : le travail existe uniquement dans le worktree WSL `cited-antigravity` (branche `feat/t036-pdf-e2e`), jamais commité/poussé côté projet actif — à récupérer ou refaire.
5. **2 stash locaux** dans le dépôt `Cited` (voir ci-dessous) à trier : l'un contient du travail T019 (verrou de ligne + quota Studio) déjà fusionné depuis (à vérifier avant de le jeter), l'autre du PostHog/traces hors `main`.
6. **Reprendre le cœur produit, dans l'ordre de `tasks/mvp-tasks.md`**, une fois `main` vert et les conflits résolus.
7. **Onboarding restant** : T043-T045. T048 attend le rapport mensuel (T032b, PR #57).
8. **Écrans fictifs restants** : T051 (audit final).
9. **Qualité** : T053-T055 (voir conflits ci-dessus), puis T057 une fois le déploiement en place.
10. **Déployer une préversion gratuite**, une fois T003/T004 faits.
11. **Marketing** (0 €) : baromètre « les sites français bloquent-ils ChatGPT ? », puis prospection écrite de 150 agences (`docs/06-kit-prospection.md`). Ne publier que des constats vérifiés.

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
