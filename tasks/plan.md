# Implementation Plan: Cited - Scanner Black-Box

## Overview
Création d'un outil d'audit externe (Scanner Black-Box) pour les agences No-Code. Le système scanne régulièrement des URLs avec un User-Agent IA, enregistre le résultat (200 OK, 403, Coquille Vide) et alerte l'agence en cas de régression.

## Architecture Decisions
- La base de données PostgreSQL existante est conservée. Nous ajouterons les nouveaux modèles (`MonitoredSite`, `ScanLog`) en gardant l'infrastructure NextAuth déjà en place.
- Le moteur de scan utilisera un `fetch` natif côté serveur sans navigateur headless, pour garantir la rapidité et réduire les coûts d'infrastructure.
- L'automatisation des scans quotidiens s'appuiera sur Inngest (déjà présent dans la stack).

---

## Task List

### Phase 1: Foundation (Database & Core Engine)

#### Task 1: Update Prisma Schema for Scanner
**Description:** Ajouter les modèles nécessaires pour le scanner au schéma Prisma existant, en les liant au modèle `User` (qui représente l'agence).
**Acceptance criteria:**
- [ ] Le modèle `MonitoredSite` est créé (URL, name, statut actuel).
- [ ] Le modèle `ScanLog` est créé (relié à `MonitoredSite`, stocke le code HTTP, le payload, et la date).
- [ ] Les relations avec le modèle `User` existant sont correctes.
**Verification:**
- [ ] `npx prisma format` passe.
- [ ] `npx prisma db push` s'exécute sans erreur sur la base locale.
**Dependencies:** None
**Files likely touched:**
- `prisma/schema.prisma`
**Estimated scope:** Small: 1 fichier

#### Task 2: Core Scanner Logic
**Description:** Créer la fonction pure côté serveur responsable d'effectuer le fetch sur une URL avec l'en-tête `User-Agent: GPTBot` et d'analyser le HTML retourné.
**Acceptance criteria:**
- [ ] La fonction retourne `BLOQUÉ` si le code HTTP n'est pas 200 (ex: 403).
- [ ] La fonction extrait le texte du HTML (en ignorant les balises `<script>` et `<style>`).
- [ ] La fonction retourne `COQUILLE VIDE` si le texte extrait fait moins de 200 caractères.
- [ ] La fonction retourne `OK` sinon.
**Verification:**
- [ ] Exécution des tests via `node --test`.
- [ ] Les tests couvrent les 3 cas (200 OK, 403, page vide).
**Dependencies:** Task 1
**Files likely touched:**
- `src/lib/scanner/core.ts`
- `src/lib/scanner/core.test.ts`
**Estimated scope:** Small: 1-2 fichiers

### Checkpoint: Foundation
- [ ] Les tests unitaires de la logique de scan passent.
- [ ] La base de données est migrée.

---

### Phase 2: Acquisition (Lead Magnet)

#### Task 3: Public API Endpoint for Instant Scan
**Description:** Créer une Server Action ou une Route API (Next.js) publique permettant de lancer le scanner sur une URL à la volée.
**Acceptance criteria:**
- [ ] L'endpoint reçoit une URL, appelle la logique de scan (Task 2) et retourne le résultat.
- [ ] Un rate-limiting est appliqué (ex: max 3 par IP).
**Verification:**
- [ ] Appel de l'API via Postman ou cURL retourne le bon JSON.
**Dependencies:** Task 2
**Files likely touched:**
- `src/app/api/scan/route.ts` (ou actions)
**Estimated scope:** Small: 1 fichier

#### Task 4: Landing Page UI (Scan Form)
**Description:** Intégrer un champ de saisie sur la page d'accueil pour que les visiteurs puissent tester leur site immédiatement.
**Acceptance criteria:**
- [ ] Un input URL est présent avec un bouton "Scanner".
- [ ] Le résultat (OK, Bloqué, Vide) s'affiche visuellement (Vert/Rouge) sans rechargement de page.
**Verification:**
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: Tester une URL valide et une URL bloquée depuis le navigateur.
**Dependencies:** Task 3
**Files likely touched:**
- `src/app/(marketing)/page.tsx`
- `src/components/ScanForm.tsx`
**Estimated scope:** Medium: 2-3 fichiers

### Checkpoint: Acquisition
- [ ] Un visiteur anonyme peut auditer un site en 5 secondes sur la page d'accueil.

---

### Phase 3: Agency Dashboard

#### Task 5: API/Actions for Monitored Sites
**Description:** Créer le backend permettant à une agence authentifiée d'ajouter, lister et supprimer les URLs qu'elle souhaite surveiller.
**Acceptance criteria:**
- [ ] L'utilisateur connecté peut créer un `MonitoredSite`.
- [ ] L'utilisateur connecté peut récupérer la liste de ses sites.
- [ ] Isolation : un utilisateur ne peut pas voir ou supprimer les sites d'un autre.
**Verification:**
- [ ] Tests de sécurité (vérification de la session utilisateur).
**Dependencies:** Task 1
**Files likely touched:**
- `src/app/actions/sites.ts`
**Estimated scope:** Medium: 2-3 fichiers

#### Task 6: Dashboard UI
**Description:** Construire l'interface d'administration pour l'agence.
**Acceptance criteria:**
- [ ] Affichage sous forme de tableau ou grille des sites surveillés.
- [ ] Un code couleur clair indique le dernier statut connu (Vert = OK, Rouge = Problème).
- [ ] Un bouton permet d'ajouter un nouveau domaine.
**Verification:**
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: Connexion via OAuth, ajout d'un site, vérification de l'affichage.
**Dependencies:** Task 5
**Files likely touched:**
- `src/app/(app)/dashboard/page.tsx`
- `src/components/DashboardSites.tsx`
**Estimated scope:** Medium: 3-4 fichiers

### Checkpoint: Agency Dashboard
- [ ] L'utilisateur peut gérer son portefeuille de sites. L'application compile sans erreur TS.

---

### Phase 4: Automation & Alerting

#### Task 7: Inngest Cron Job
**Description:** Créer la tâche planifiée Inngest qui itère sur tous les sites surveillés de la base pour les auditer.
**Acceptance criteria:**
- [ ] Le job se lance automatiquement tous les jours (ou toutes les X heures).
- [ ] Il enregistre le résultat dans la table `ScanLog` pour chaque site.
- [ ] Il met à jour le champ `status` du `MonitoredSite`.
**Verification:**
- [ ] Test local via le dev server Inngest.
**Dependencies:** Task 2, Task 5
**Files likely touched:**
- `src/inngest/functions/daily-scan.ts`
- `src/inngest/client.ts`
**Estimated scope:** Medium: 2 fichiers

#### Task 8: Alerting Service
**Description:** Intégrer un système de notification (Email via Resend ou Webhook Slack) lorsqu'une régression est détectée par le cron.
**Acceptance criteria:**
- [ ] Si le statut d'un site passe de `OK` à `BLOQUÉ` ou `COQUILLE VIDE`, une alerte est envoyée.
- [ ] Pas de spam : une seule alerte par changement de statut.
**Verification:**
- [ ] Manual check: Forcer une erreur en base et déclencher le job Inngest, vérifier la réception du mail/Slack.
**Dependencies:** Task 7
**Files likely touched:**
- `src/lib/alerting/sendAlert.ts`
- `src/inngest/functions/daily-scan.ts`
**Estimated scope:** Small: 2 fichiers

---

### Phase 5: Monetization

#### Task 9: Stripe Integration
**Description:** Restreindre l'ajout de sites via un paywall à 99€/mois pour l'offre Agence.
**Acceptance criteria:**
- [ ] Intégration du Stripe Checkout.
- [ ] Le webhook Stripe met à jour le champ `plan` du `User`.
- [ ] Si l'utilisateur n'est pas payant, il ne peut pas ajouter plus de X sites (quota gratuit) ou l'accès au Dashboard est bloqué.
**Verification:**
- [ ] Test complet de l'abonnement en mode Stripe Test via CLI.
**Dependencies:** Task 5
**Files likely touched:**
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/billing/stripe.ts`
**Estimated scope:** Medium: 3-4 fichiers

### Checkpoint: Complete
- [ ] Tous les critères d'acceptation sont remplis.
- [ ] Aucune erreur TS (`npx tsc --noEmit`).

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Le User-Agent `GPTBot` est bloqué globalement (Vercel IP ban) | High | Utiliser un pool de proxies ou diversifier les User-Agents si un blocage au niveau de l'IP est détecté. |
| Les sites lourds font un timeout sur le fetch | Medium | Définir un AbortController avec un timeout strict (ex: 10s) pour ne pas bloquer les files d'attente Inngest. |
| Coûts d'exécution de la boucle Inngest | Low | Batcher les appels par lots de 50 pour limiter les exécutions de fonctions serverless. |

## Open Questions
- Le quota gratuit avant paywall (Task 9) doit-il être de 1 site surveillé gratuitement, ou 0 (paywall direct) ?
