# Cited — feuille de route et journal

Suivi du développement. Mis à jour après chaque sous-tâche validée.

**Dépôt :** https://github.com/kromz-dev/Cited (privé)
**Stack :** Next.js 16 · React 19 · TypeScript strict · Prisma 5 · PostgreSQL 17 · Tailwind 4 · NextAuth v5 · Stripe · Inngest
**Base de dev :** PostgreSQL 17.11 natif dans WSL (`postgresql://cited@localhost:5432/cited`). Cible production : Neon, même version majeure.

---

## Décisions structurantes

| # | Décision | Statut |
|---|---|---|
| D1 | Modèle de tenant : `User → Brand`. Vente directe à la marque, self-serve, funnel d'audit gratuit. La marque blanche pour agences du cahier des charges est écartée. | ✅ Arrêtée |
| D2 | Dépôt unique à la racine du projet : le code, les spécifications et les connecteurs de référence partagent une seule histoire. | ✅ Arrêtée |
| D3 | Dépôt privé — `docs/` contient le plan business et la grille tarifaire. | ✅ Arrêtée |
| D4 | PostgreSQL dès le développement, pas SQLite : les enums, les tableaux et le type `Json` ne survivent pas à une migration tardive. | ✅ Arrêtée |
| D5 | Un couple requête/moteur est interrogé N fois par campagne (défaut : 3) et le score est publié avec sa marge d'erreur. | ✅ Arrêtée |
| D6 | Nom du produit. `Cited` reste un nom de code. | ⏳ Ouvert |
| D7 | Moteur de mesure : `GROQ` n'a pas d'accès web. Voir « Risque R1 ». | 🔴 À trancher |

---

## Risques ouverts

**R1 — Le moteur actuel ne mesure pas ce que le produit prétend mesurer.**
`lib/engines/groq.ts` interroge `llama-3.3-70b-versatile`, un modèle sans accès web. Son message système lui demande de se comporter « comme si » il disposait d'une base RAG temps réel et de citer « des URLs réelles (ou très probables) ». Les citations produites sont donc générées de mémoire paramétrique, pas relevées sur le web. Elles alimentent la table `Citation`, puis l'écran des sources les plus citées vendu au client. Tant que ce point n'est pas corrigé, le produit fabrique une partie de sa donnée.
Correction : réserver `GROQ` au rôle de juge et de générateur, et mesurer avec un moteur réellement ancré (`GEMINI` avec Google Search, déjà écrit dans `lib/engines/gemini.ts`, gratuit à 500 requêtes ancrées/jour).

**R2 — Suite de tests inexécutable.** `vitest` échoue sur un binaire natif absent (bug npm sur les dépendances optionnelles, `node_modules` résolu pour Windows). Aucun oracle exécutable tant que ce n'est pas réglé.

---

## Jalons

### Lot 0 — Socle ✅
- [x] Dépôt Git à la racine, poussé sur GitHub en privé
- [x] PostgreSQL 17 local, rôle et base créés
- [x] Schéma Prisma migré de SQLite vers PostgreSQL, enums et types natifs
- [x] Modèles NextAuth (`Account`, `Session`, `VerificationToken`) ajoutés — sans eux la connexion Google échouait
- [x] `lib/db.ts` correctement typé : les `@ts-ignore` masquaient toutes les erreurs de schéma
- [x] Migration initiale versionnée
- [x] `tsc --noEmit` vert

### Lot 1 — Moteur de campagne 🔄
- [x] Répétitions par couple requête/moteur, contrainte unique élargie
- [x] Idempotence de campagne sur le créneau planifié
- [x] Reprise après incident : un run abouti n'est jamais rejoué
- [x] Texte et version de requête figés sur le run
- [x] Panier de moteurs figé sur la campagne
- [x] Score publié avec sa marge d'erreur à 95 %
- [x] Journal `ApiCall` par appel, avec son objet et son coût réel
- [x] Correctifs déclenchés sur les absences constantes, plus sur un tirage isolé
- [ ] Connecteur de mesure réellement ancré (voir R1)
- [ ] Cache moteur : empreinte avec version de modèle, exclusion de la marque demandeuse
- [ ] Débit et réessais avec bail sur les colonnes déjà prévues

### Lot 2 — Détection et score
- [ ] `mention-detector` : frontières de mot pour les marques multi-mots, position robuste
- [ ] `llm-judge` : délimiteurs d'échappement sur le texte injecté
- [ ] Tests unitaires : marque absente, position 1, réponse sans liste, marque au nom commun

### Lot 3 — Interface
- [ ] Matrice de couverture comme objet principal, score en second
- [ ] Affichage de la marge d'erreur sur toute variation

### Lot 4 — Facturation et quotas
- [x] Table blanche des tarifs côté serveur : le plan se déduit de ce que Stripe confirme avoir facturé
- [x] Idempotence des webhooks Stripe rendue transactionnelle, rejeu traité en succès
- [x] Rétrogradation de plan effective, fin de période lue au bon endroit de l'API Stripe
- [ ] Quotas durs sur les runs, blocage avant l'action

### Sécurité — bloquants traités
- [x] `AUTH_SECRET` était un texte de remplacement : en session JWT, cela permettait de forger le jeton de n'importe quel compte
- [x] `launchAuditCampaign` s'exécutait sans authentification, sur un `brandId` reçu du client
- [x] `/api/inngest` acceptait tout POST anonyme, `INNGEST_SIGNING_KEY` absente
- [x] `/api/audit` sans validation ni limitation de débit — Zod + plafond horaire adossé à la base
- [x] Élévation de plan : on pouvait payer le tarif le plus bas et recevoir PRO
- [ ] Validation et quotas sur `createBrand` et `detectBrand`
- [ ] Échappement HTML et limitation de débit sur `captureLead` et l'envoi Resend
- [ ] Middleware en refus par défaut
- [ ] Export et suppression de compte (RGPD)

### Lot 5 — Mise en production
- [ ] Audit de sécurité
- [ ] Intégration continue
- [ ] Bascule sur Neon

---

## Journal

### 2026-09-16
- Dépôt restructuré à la racine du projet, poussé sur GitHub en privé.
- PostgreSQL 17.11 installé localement, base `cited` créée.
- Schéma migré vers PostgreSQL. Correctifs d'intégrité : modèles NextAuth manquants, répétitions de run, gel du texte de requête, clés étrangères composites, relation `CompetitorMention` vers `Competitor`, unicité `(runId, url)` sur les citations, colonnes de bail pour l'exécution durable, tables `ApiCall` et compteurs d'usage séparant runs vendus et appels payés.
- `lib/db.ts` retypé : les `@ts-ignore` rendaient le typage inopérant et masquaient quatre erreurs réelles.
- Moteur de campagne réécrit sur le nouveau schéma.
