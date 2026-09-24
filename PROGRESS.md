# Cited — état du projet et reprise

Source de vérité pour reprendre le travail, avec un humain ou un agent.
**Dernière mise à jour :** 24 septembre 2026, checkpoint (budget bas, session à interrompre ici).

**Stack :** Next.js 16 · React 19 · TypeScript strict · Prisma 5 · PostgreSQL (Neon) · Tailwind 4 · NextAuth v5 · Stripe · Inngest · Resend
**Contrainte absolue :** budget 0 €, autofinancé. Uniquement des offres gratuites qui autorisent un usage commercial.

---

## 1. Où on en est (tout est dans `main`, PR #1 à #4 fusionnées)

**Positionnement :** « Comprendre pourquoi les IA ne lisent pas ou ne citent pas votre site, en commençant par ce qui bloque techniquement ». Offre payante : surveillance quotidienne d'un portefeuille de sites pour les agences de maintenance WordPress et les agences SEO/GEO, en France. Vente 100 % écrite, sans appel.

### Fait

- [x] Stratégie, marché, cible, kit de prospection : `docs/05`, `docs/06`
- [x] Design system unique, appliqué à **tous** les écrans (accueil, prix, connexion, inscription, tableau de bord, sites, alertes, rapports, réglages, onboarding, `/analyse`) : `docs/07`
- [x] Constitution + PRD MVP (67 EF, 15 ENF) : `docs/08`, `docs/09`
- [x] Plan technique 0 € + 57 tâches : `docs/10`, `tasks/mvp-tasks.md`
- [x] Scanner v2 (redirections sûres, robots.txt par bot, UA honnête, 3 résultats séparés)
- [x] CI GitHub Actions verte (tsc, eslint, vitest, build) + Dependabot
- [x] Modèle de données MVP : `Client`, `BrandSettings`, `AlertEvent`, `MonthlyReport`, quotas par plan, migration additive générée (T007-T014)
- [x] Skills installés : design, rédaction, PRD, ingénierie, + skills officiels Resend/Neon/Render/Prisma/Inngest/Stripe (`cited/.claude/skills/`)
- [x] Services de test créés et **connectés en MCP** : Neon (projet `cited`, Francfort), Stripe test (3 prix + coupon `FONDATEUR50`), Sentry (projet `cited-web`), Inngest (compte `cited`), Render (workspace prêt), Resend (compte prêt, pas de domaine)

### Pas encore fait

- [ ] **Rien n'est déployé.** Aucun service web Render créé. La migration Prisma n'a jamais tourné sur la vraie base Neon.
- [ ] Les écrans de l'app affichent des **données d'exemple** (marquées comme telles), pas les vraies données de la base.
- [ ] `.env` local à remplir par l'utilisateur (voir §3).
- [ ] Variables d'environnement Render à renseigner (Neon DATABASE_URL, clés Stripe/Resend/Sentry/Inngest — aucune n'est dans le dépôt).
- [ ] T005 (Sentry dans le code), T015+ (scan public multi-bots, données réelles) : voir `tasks/mvp-tasks.md`.

---

## 2. Prochaine session : reprendre ici

1. **T003 + T004** : créer le service web Render (build `cited/`, région EU), y mettre les variables d'environnement (Neon, Stripe test, Resend, Sentry, Inngest), appliquer `npx prisma migrate deploy` contre Neon.
2. **T005** : intégrer `@sentry/nextjs` (DSN déjà noté ci-dessous).
3. Continuer `tasks/mvp-tasks.md` dans l'ordre à partir de T015 (scan public multi-bots → données réelles dans les écrans → quotas appliqués en pratique).
4. Objectif 90 jours inchangé : 10 agences payantes, ~1 000 € MRR.

### Identifiants non secrets (pas de vraies clés ici)

| Service | Ressource |
|---|---|
| Neon | Projet `cited`, `billowing-resonance-22258158`, Francfort, base/rôle `cited` |
| Stripe (test) | `STRIPE_PRICE_SOLO=price_1UJ459E0KhuxlY8kOXQkdsjH` (39€), `STRIPE_PRICE_PRO=price_1UJ45LE0KhuxlY8k1kqASn38` (99€), `STRIPE_PRICE_SCALE=price_1UJ45PE0KhuxlY8kI8hhUDP1` (249€), coupon `FONDATEUR50` |
| Sentry | Projet `cited-web`, org `cited-0g` (UE), `SENTRY_DSN=https://2d024724c6a27762e805e4c26f393241@o4512139371937792.ingest.de.sentry.io/4512139399528528` |
| Inngest | Compte `cited`, id `4056d4aa-95d1-4705-86e3-ccb4a239cf94` |
| Render | Workspace `My Workspace` |

---

## 3. Reprendre en local (5 commandes)

```bash
git fetch origin && git checkout main
cd cited && npm install
cp .env.example .env   # puis remplir DATABASE_URL, STRIPE_*, RESEND_API_KEY, INNGEST_*, AUTH_SECRET
npx prisma generate
npm run dev
```

## 4. Reprendre avec Claude (économe)

> Lis `PROGRESS.md` et `tasks/mvp-tasks.md`. Budget serré, sois économe en tokens, pas d'agents multiples sauf nécessité. Prends la prochaine tâche non cochée (commence par T003/T004/T005), fais-la, vérifie (tsc, eslint, vitest), commite, coche-la, mets à jour ce fichier.

Règle : **cocher `tasks/mvp-tasks.md` et mettre à jour la section 1 ici à chaque fin de session.**
