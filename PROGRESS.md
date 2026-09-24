# Cited — état du projet et reprise

Ce document est la source de vérité de l'environnement de développement.

**Stack :** Next.js 16 · React 19 · TypeScript strict · Prisma 5 · PostgreSQL 17 · Tailwind 4 · NextAuth v5 · Stripe · Inngest
**Dernière session :** 16 septembre 2026

---

## Reprendre en 5 commandes

```bash
cd /mnt/c/Users/kkace/Desktop/saas/SAAS_1/cited
sudo service postgresql start          # PostgreSQL 17 natif WSL, base `cited`, rôle `cited`
npx prisma generate
npx tsc --noEmit                       # oracle
npm run dev
```

Variables d'environnement (voir `.env.example`) :
`DATABASE_URL`, `AUTH_SECRET`, `INNGEST_SIGNING_KEY`, `STRIPE_*`, etc.

---

## 🎯 Décision Stratégique : Pivot "Scanner Black-Box"

Après analyse du marché (Lovable qui offre le pré-rendu gratuit, la complexité d'un middleware npm impossible à installer sur du no-code), **le produit a radicalement pivoté.** 

Les anciens plans impliquant des analyses sémantiques poussées, des générations de correctifs (JSON-LD) ou des proxies de pré-rendu complexes ont été **abandonnés**. 

**La nouvelle direction :**
Cited est désormais un outil d'**Audit Externe (Black-Box)** pour les Agences No-Code. Il scanne quotidiennement les sites de leurs clients en usurpant le User-Agent d'une IA (ex: GPTBot) pour vérifier que le rendu n'est pas bloqué par un pare-feu (Erreur 403) ou vide de contenu.
C'est un produit à haute marge, vendu sur le principe de la *Tranquillité d'esprit* (Peace of Mind) à 99€/mois pour sécuriser les contrats de maintenance des agences.

**Pour le détail des spécifications mises à jour, voir :**
- `docs/01-plan-business.md`
- `docs/02-cahier-des-charges.md`
- `docs/04-pivot-veille.md`

**Mise à jour du 24 septembre 2026 :** l'analyse stratégique (`docs/05-analyse-strategique.md`) remet en cause la cible no-code et la méthode de mesure par User-Agent imité. Cibles recommandées : agences de maintenance WordPress et agences SEO/GEO. Kit commercial : `docs/06-kit-prospection.md`.

Toutes les anciennes documentations obsolètes ont été supprimées. La prochaine étape est le développement du moteur de scan.

**Mise à jour du 24 septembre 2026 (2) :** constitution du projet et PRD du MVP écrits — `docs/08-constitution.md` (principes, portes de qualité) et `docs/09-prd-mvp.md` (parcours, exigences EF/ENF taguées Existant/En cours/À modifier/À construire, critères de sortie).
