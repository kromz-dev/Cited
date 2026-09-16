# Cahier des charges — Cited (Scanner Black-Box)

## 1. Contexte et objectif
Un outil d'audit externe (cron) qui vérifie quotidiennement que les sites surveillés ne bloquent pas les robots d'intelligence artificielle (ChatGPT, Claude) et servent bien du contenu exploitable.

## 2. Périmètre (MVP)
### 2.1 Doit être livré (Must)
- **M1 : Scan public (Lead Magnet) :** Entrer une URL sur la landing page, lancer un fetch avec `User-Agent: GPTBot`, et afficher le statut (200 OK, 403 Bloqué, ou Coquille vide).
- **M2 : Authentification :** Inscription / Connexion Agence (NextAuth).
- **M3 : Tableau de bord Agence :** Interface pour ajouter/supprimer des URLs à surveiller, affichant le statut actuel de chaque site en temps réel.
- **M4 : Moteur de scan automatisé :** Tâche de fond (Inngest ou Cron natif) itérant quotidiennement sur toutes les URLs actives de la base de données.
- **M5 : Alerting :** Système d'envoi de Webhook/Email si le statut d'une URL se dégrade (ex: passage de OK à BLOQUÉ).
- **M6 : Monétisation :** Stripe Checkout (Abonnement unique Agence à 99€/mois).

### 2.2 Hors périmètre (Won't)
- Pas d'installation de package npm, middleware, ou script JS chez le client final.
- Pas de proxy de pré-rendu ou de correction automatique de code.
- Pas d'analyse sémantique LLM (scoring, part de voix).

## 3. Architecture Technique
- **Framework :** Next.js 14+ (App Router)
- **Base de données :** PostgreSQL (via Prisma)
- **Authentification :** NextAuth v5
- **Tâches de fond :** Inngest
- **Paiement :** Stripe

## 4. Modèle de données (Simplifié)
- `User` : L'agence (avec ses clés d'abonnement Stripe).
- `MonitoredSite` : Une URL surveillée appartenant à l'agence.
- `ScanLog` : L'historique des scans pour une URL (Date, Status HTTP, Taille du body, Statut final).

## 5. Règles métier du Moteur de Scan
Lorsqu'un scan est exécuté sur une URL :
1. Si le code HTTP != 200 (ex: 403, 500) -> Statut = **BLOQUÉ**.
2. Si le code HTTP == 200 mais que le contenu texte pertinent extrait du HTML est très faible (< 200 caractères) -> Statut = **COQUILLE VIDE** (Typique d'une SPA sans SSR).
3. Si le code HTTP == 200 et texte pertinent suffisant -> Statut = **OK**.
