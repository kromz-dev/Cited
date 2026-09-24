# Cited — état du projet et reprise

Source de vérité pour reprendre le travail, avec un humain ou un agent.
**Dernière mise à jour :** 24 septembre 2026.

**Stack :** Next.js 16 · React 19 · TypeScript strict · Prisma 5 · PostgreSQL · Tailwind 4 · NextAuth v5 · Stripe · Inngest · Resend
**Contrainte absolue :** budget 0 €, autofinancé. Uniquement des offres gratuites qui autorisent un usage commercial (voir `docs/09-prd-mvp.md` §14, ENF-016).

---

## 1. Où on en est

**Positionnement :** « Comprendre pourquoi les IA ne lisent pas ou ne citent pas votre site, en commençant par ce qui bloque techniquement » (diagnostic gratuit). L'offre payante est la surveillance quotidienne d'un portefeuille de sites pour les **agences de maintenance WordPress et les agences SEO/GEO**, en France d'abord. Vente 100 % écrite, sans appel.

### Branches

| Branche | Rôle | État |
|---|---|---|
| `main` | Référence. La CI (tsc, eslint, vitest, build) tourne sur chaque PR. | Vert |
| `claude/focused-gates-fav90h` | Fusionnée dans `main` (PR #3, 24/09) | Réutilisable pour la suite, à repartir de `main` |

À supprimer quand tu veux (déjà dans `main`) : `chore/ci-quality-gates`.

### Fait

- [x] Analyse stratégique, marché, concurrence, choix de cible : `docs/05-analyse-strategique.md`
- [x] Kit de prospection écrit (e-mails, objections, questionnaire) : `docs/06-kit-prospection.md`
- [x] Design system unique (tokens, composants `components/ui/*`, `Verdict`, page `/design-system`) : `docs/07-design-system.md`
- [x] Constitution (principes et portes de qualité) : `docs/08-constitution.md`
- [x] PRD du MVP (67 EF, 15 ENF, décisions §14) : `docs/09-prd-mvp.md`
- [x] Scanner v2 (redirections sûres, `robots.txt` par bot, User-Agent honnête, challenges, 3 résultats séparés) : fusionné dans `main` (PR #1)
- [x] CI GitHub Actions et `main` au vert : PR #2
- [x] Nouvelle page d'accueil (angle diagnostic, portefeuille, `ScanForm` sur la nouvelle API) et nouvelle page de prix (39 / 99 / 249 €)
- [x] Skills installés dans `cited/.claude/skills`, avec un lien symbolique à la racine du dépôt (design, rédaction, PRD, ingénierie) et 6 agents marketing dans `cited/.claude/agents`

- [x] Plan technique 0 € : `docs/10-plan-technique.md`. Pile retenue : Render (offre gratuite) + Neon Postgres + Inngest + Resend + PostHog + `@react-pdf/renderer`. Les conditions de ces offres sont à confirmer (tâche T001).
- [x] Liste des tâches du MVP, 57 tâches en 9 phases : `tasks/mvp-tasks.md` (**c'est elle qui fait foi pour le « quoi faire ensuite »**)
- [x] T006 : Route de compteur d'audience RGPD-safe (pas de cookie, pas de tiers) — `app/api/beacon/route.ts`, appel `navigator.sendBeacon` depuis `app/(marketing)/layout.tsx`

### Services provisionnés (24/09, mode test, 0 €)

| Service | Ressource | Identifiants non secrets |
|---|---|---|
| Neon | Projet `cited`, Postgres 17, Francfort (`aws-eu-central-1`), base `cited`, rôle `cited` | projet `billowing-resonance-22258158`. La chaîne de connexion (secrète) est à récupérer dans la console Neon ou via le MCP, et à mettre directement dans Render (`DATABASE_URL`). |
| Stripe (test) | 3 produits et prix mensuels HT en EUR | `STRIPE_PRICE_SOLO=price_1UJ459E0KhuxlY8kOXQkdsjH` (39 €), `STRIPE_PRICE_PRO=price_1UJ45LE0KhuxlY8k1kqASn38` (99 €), `STRIPE_PRICE_SCALE=price_1UJ45PE0KhuxlY8kI8hhUDP1` (249 €). Lookup keys `cited_{solo,pro,scale}_monthly`. |
| Stripe (test) | Coupon fondateur | `FONDATEUR50` : −50 %, à vie, 10 utilisations maximum |
| PostHog | Projet Analytics + Session Replay + Error Tracking | `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` et `NEXT_PUBLIC_POSTHOG_HOST` |
| Render | Espace « My Workspace » | Service web à créer après la fusion dans `main` (T003) |
| Resend | Compte | Domaine d'envoi à ajouter (nécessite un domaine) |
| Inngest | — | Compte et clés à créer (`INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY`) |

---

## 2. À faire ensuite, dans l'ordre

1. ~~Fusionner le travail du 24/09~~ : fait (PR #3).
2. **Commencer par T001** (confirmer par écrit les offres gratuites), puis **suivre `tasks/mvp-tasks.md`** dans l'ordre. Priorités (risque n°1 du PRD) :
   - brancher les écrans maquettes sur la base (rapports, alertes, réglages, fiche site, onboarding : aujourd'hui des données fictives) ;
   - appliquer les quotas par plan (10 / 30 / 100 sites).
3. **Passe unique par écran :** données réelles, puis migration au design system, puis réécriture des textes. Écrans concernés : `login`, `register`, `app/(app)/*`, `/analyse/[domain]`, `components/DashboardSites.tsx`, `components/ui.tsx`. Ensuite, supprimer les alias legacy de `globals.css`, `app/ds/` et `app/_ds/`.
4. **Réécrire tous les textes** avec les skills `cited:copywriting`, `cited:copy-editing`, `cited:design-ux-copy`, `cited:content-research-writer`.
5. **Déployer une préversion gratuite** (pile choisie dans `docs/10-plan-technique.md`). Vercel Hobby est exclu, car son usage commercial est interdit.
6. **Marketing** (0 €) : baromètre « les sites français bloquent-ils ChatGPT ? », puis prospection écrite de 150 agences (`docs/06-kit-prospection.md`). Ne publier que des constats vérifiés.

Objectif à 90 jours : 10 agences payantes, environ 1 000 € de MRR. Critère d'arrêt : moins de 5 % des sites scannés présentent un problème vérifié (plan B : visibilité IA, voir `docs/05` §13).

---

## 3. Reprendre en 5 commandes (local)

```bash
git fetch origin && git checkout claude/focused-gates-fav90h   # ou main après fusion
cd cited && npm install
npx prisma generate
npx tsc --noEmit && npx vitest run      # doit être vert
npm run dev                              # http://localhost:3000, /pricing, /design-system
```

Variables d'environnement : voir `cited/.env.example` (`DATABASE_URL`, `AUTH_SECRET`, `STRIPE_*`, `RESEND_API_KEY`, `INNGEST_*`).

## 4. Reprendre avec Claude (économe)

Colle ceci au début d'une nouvelle session :

> Lis `PROGRESS.md` et `tasks/mvp-tasks.md`. Budget 0 €, sois économe en tokens. Prends la prochaine tâche non cochée, fais-la, vérifie (tsc, eslint, vitest), commite, coche-la dans `tasks/mvp-tasks.md`, puis mets à jour `PROGRESS.md`.

Règle de tenue : **à chaque tâche terminée, cocher la case dans `tasks/mvp-tasks.md`, et mettre à jour la section 1 de ce fichier à chaque fin de session.**
