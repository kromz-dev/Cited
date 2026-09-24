# Cited — état du projet et reprise

Source de vérité pour reprendre le travail, avec un humain ou un agent.
**Dernière mise à jour :** 24 septembre 2026.

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

**Antigravity n'est plus sur ce projet** (24/09) : son travail du jour (T019-T025 en local, jamais poussé) a été retiré à la demande du fondateur. Les tâches correspondantes sont **remises à zéro**, personne n'a commencé dessus. Prochaine session : Claude seul, sauf décision contraire.

### Fait aujourd'hui (24/09), en plus du travail antérieur listé dans `tasks/mvp-tasks.md`

- [x] **T037-T039** : coupon fondateur Stripe (`FONDATEUR50`, vérifié en mode test), accepté au checkout, marque `isFounderMember` via le webhook. Cases T038 et T039 cochées dans `tasks/mvp-tasks.md` le 24/09, le code était déjà sur `main` (PR #13).
- [x] **T042** : page Tarifs — dépassement 100 sites et paiement annuel présentés comme activables à la main, jamais en libre-service.
- [x] **T046** : e-mail des 5 questions à J+3. L'e-mail d'offre fondatrice (T047) n'existe pas encore.
- [x] **T052** : réinitialisation de mot de passe par e-mail.
- [x] **T056** : purge mensuelle de `ScanLog.payload` au-delà de 90 jours.
- [x] Documentation : `docs/decisions/ADR-001-posthog-remplace-sentry.md`, budget de quotas gratuits Inngest/Neon/Resend recalculé et corrigé dans `docs/10-plan-technique.md`.

24 tâches cochées sur 60 dans `tasks/mvp-tasks.md` — **c'est elle qui fait foi**, cette section n'est qu'un résumé.

**T040, T041 et T050** étaient codées le 24/09 (PR #14, #15, #16), mais ces PR empilées ont été fusionnées dans leur branche de base au lieu de `main`. Elles sont restaurées par la branche `fix/restore-t040-t041-t050`. **T047** (e-mail d'offre fondatrice, PR #20) est dans le même cas : restauration par une PR séparée.

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

1. **T003/T004** (infra) : créer le service Render (région Francfort, `cited/` comme racine de build), puis baseliner et migrer la base Neon en production. Bloqué au 24/09 par deux permissions refusées en mode automatique (récupération de la chaîne de connexion Neon, génération locale d'un secret) — à relancer avec le fondateur présent, ou en autorisant ces actions.
2. **Reprendre le cœur produit, dans l'ordre de `tasks/mvp-tasks.md`** : **T019 (quota par plan)** en premier — risque n°1 du PRD, rien n'est fait dessus. Puis T020-T036 (portefeuille, scan quotidien réel, alertes, rapports mensuels PDF).
3. **Onboarding restant** : T043-T045. T048 attend le rapport mensuel (T032b).
4. **Écrans fictifs restants** : T049, T051.
5. **Qualité** : T053-T055, puis T057 une fois le déploiement en place.
6. **Déployer une préversion gratuite**, une fois T003/T004 faits.
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
