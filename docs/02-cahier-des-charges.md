# Cahier des charges — « Cited » V2

> Document de référence pour la construction du produit.
> **Version :** 2.0 · **Date :** 16 septembre 2026
>
> ⚠️ **Pivot.** Ce document a été refondu suite au passage d'un modèle B2B agences à un modèle self-serve pour petites marques. Les changements majeurs : suppression du multi-tenant agence, des rôles, de la marque blanche. Ajout des correctifs générés.

---

## 1. Contexte et objectif

### 1.1 Le produit en une phrase

Une application web qui mesure si la marque d'un utilisateur est citée par les moteurs de réponse IA (ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude), la compare à ses concurrents, et **génère les correctifs à appliquer** (contenu, JSON-LD, `llms.txt`).

### 1.2 Qui l'utilise

Un **propriétaire de marque** (PME, SaaS solo, consultant, e-commerçant indépendant) qui veut savoir si les moteurs IA le citent et, surtout, **quoi faire pour y apparaître**.

### 1.3 Ce qui définit la réussite de la V1

| Critère | Cible |
|---|---|
| L'audit gratuit retourne un résultat en moins de 30 secondes | Obligatoire |
| Un utilisateur atteint son premier résultat sans aucune configuration manuelle | Obligatoire |
| Les correctifs générés sont concrets, actionnables et liés aux données réelles | Obligatoire |
| Le coût réel par appel moteur est mesurable et visible en administration | Obligatoire |
| Le funnel audit gratuit → email → inscription convertit à > 1 % | Obligatoire |

---

## 2. Périmètre

### 2.1 Doit être livré (Must)

| # | Fonctionnalité |
|---|---|
| M1 | Audit gratuit public (domaine → résultat en 30s, sans inscription) |
| M2 | Authentification (Google OAuth, inscription self-serve) |
| M3 | Création d'une marque : domaine, nom, concurrents, secteur (détection IA) |
| M4 | Génération assistée par IA d'une liste de requêtes à suivre |
| M5 | Moteur d'exécution planifiée sur les moteurs IA sélectionnés |
| M6 | Analyse des réponses : mention, position, sentiment, sources citées |
| M7 | Tableau de bord : score de visibilité, évolution, part de voix, top sources |
| M8 | **Correctifs générés** : contenu optimisé, JSON-LD, `llms.txt`, fiches sources |
| M9 | Recommandations priorisées générées à partir des données |
| M10 | Abonnement Stripe self-serve avec quotas |
| M11 | Cache mutualisé des appels moteurs |

### 2.2 Devrait être livré (Should)

| # | Fonctionnalité |
|---|---|
| S1 | Alerte email sur variation significative du score |
| S2 | Comparaison de deux périodes |
| S3 | Export CSV et JSON |
| S4 | Journal d'exécution consultable (quelle requête, quand, quel coût) |
| S5 | Pages programmatiques (« [Marque] est-elle citée par ChatGPT ? ») |

### 2.3 Hors périmètre V1 (Won't)

- ~~Génération automatique de contenu correctif~~ → **Passé en M8, c'est la différenciation**
- API publique → V3
- Intégration Google Analytics / Search Console → V3
- Application mobile
- SSO / SAML
- ~~Multi-tenant agence / marque blanche~~ → **Abandonné**
- Support d'autres langues d'interface que le français et l'anglais

---

## 3. Personas et parcours

### 3.1 Personas

| Persona | Profil | Besoin principal |
|---|---|---|
| **Sophie**, fondatrice d'un SaaS | PME 5 pers., pas d'agence SEO | Savoir si ChatGPT la cite, corriger si non |
| **Thomas**, consultant SEO indépendant | Freelance, 8 clients | Un outil à bas prix pour suivre ses clients |
| **Marie**, e-commerçante | Boutique en ligne, fait tout seule | Recevoir les actions concrètes, copier-coller |

### 3.2 Parcours d'activation (le parcours critique)

```
Page d'accueil → saisie du domaine + nom de marque
   └─> Détection auto du secteur et des concurrents (IA)
      └─> Exécution immédiate (5 requêtes, 1 moteur)
         └─> Résultat : grille de couverture, score, concurrents  ⏱️ < 30 s
            └─> CTA : "Rapport complet par email" (= lead capturé)
            └─> CTA : "Suivre ma marque + recevoir les correctifs" (= inscription)
               └─> Inscription Google OAuth
                  └─> Ajout marques supplémentaires (optionnel)
                     └─> Première campagne complète lancée
                        └─> Correctifs générés
```

**Exigence :** l'audit gratuit ne demande **aucune inscription**. C'est le résultat qui convainc, pas une promesse.

---

## 4. Spécifications fonctionnelles

### 4.1 M1 — Audit gratuit public

**Le cœur du funnel d'acquisition.** N'importe qui entre un domaine et obtient un diagnostic instantané.

**Entrée :** domaine + nom de marque.
**Traitement :**
1. Fetch de la page d'accueil → LLM détecte secteur + 3 concurrents.
2. Génère 5 requêtes pertinentes (une par famille sauf Comparaison qui en a 2).
3. Exécute sur 1 moteur (Gemini, quota gratuit).
4. Analyse chaque réponse.

**Sortie (affichée sans inscription) :**
- Grille de couverture (5 requêtes × 1 moteur)
- Score de visibilité
- Concurrents détectés + qui est cité
- Sources les plus citées

**Sortie complémentaire (demande un email) :**
- Rapport détaillé
- Aperçu des correctifs possibles

**Critères d'acceptation :**
- ✅ Résultat en moins de 30 secondes.
- ✅ Un domaine injoignable n'empêche pas l'audit : l'utilisateur remplit le secteur à la main.
- ✅ Rate limiting : 1 audit par IP par heure, 3 par domaine par jour.

---

### 4.2 M2 — Authentification

**Modèle simplifié :** `User` → `Brand` (ses marques suivies).

- Connexion via Google OAuth (NextAuth v5). Email/mot de passe non requis en V1.
- À la première connexion, l'utilisateur crée son profil. Pas d'organisation, pas de rôles.
- Le plan (FREE/SOLO/PRO/SCALE) est attaché au `User`.

**Critères d'acceptation :**
- ✅ Un utilisateur ne peut accéder qu'à ses propres marques. Forcer l'ID d'une marque d'un autre utilisateur → 404.
- ✅ L'inscription prend moins de 60 secondes.

---

### 4.3 M3 — Création d'une marque

**Formulaire :** nom de la marque, domaine (obligatoire, validé), secteur, marché (pays + langue).

**Détection assistée :** à la saisie du domaine, le système récupère la page d'accueil, l'analyse via un LLM et pré-remplit : secteur d'activité, description de la marque, 3 à 5 concurrents probables. **Tout est modifiable** — c'est une proposition, pas une décision.

**Concurrents :** de 0 à 5 en V1, chacun avec un nom de marque et un domaine.

**Critères d'acceptation :**
- ✅ Un domaine injoignable n'empêche pas la création.
- ✅ La création décrémente le quota de marques ; à quota atteint, un écran d'upgrade s'affiche.

---

### 4.4 M4 — Génération des requêtes à suivre

Même logique que l'ancien CdC (§4.3). À partir du secteur, de la marque et du marché, un LLM propose **20 à 30 requêtes** réparties en 4 familles (Découverte, Comparaison, Marque, Problème).

L'utilisateur coche, édite, ajoute ou supprime. Chaque requête porte une langue et un pays.

---

### 4.5 M5 — Moteur d'exécution planifiée

Même logique que l'ancien CdC (§4.4). File d'attente (Inngest ou Trigger.dev), reprises, limitation de débit, idempotence.

---

### 4.6 M6 — Analyse des réponses

Même logique que l'ancien CdC (§4.5). Score de visibilité, part de voix, sentiment, sources citées.

> ⚠️ Les formules de scoring sont **implémentées dans des fonctions pures, isolées et testées unitairement**.

---

### 4.7 M7 — Tableau de bord

**Écran principal** — liste des marques suivies, chacune avec : nom, score actuel, variation, mini-grille de couverture.

**Écran « Marque »** — 4 blocs :
1. **Grille de couverture** (l'élément dominant) — requêtes en lignes, moteurs en colonnes, cellules pleines/vides.
2. **Courbe d'évolution** — score dans le temps, une ligne par moteur.
3. **Comparatif concurrents** — barres horizontales, part de voix.
4. **Tableau des requêtes** — une ligne par requête avec le détail par moteur.

**Écran « Sources »** — domaines les plus cités, avec le nombre de citations et un indicateur « Votre marque y figure » (oui/non).

---

### 4.8 M8 — Correctifs générés (LA DIFFÉRENCIATION)

C'est ce qui fait passer le produit de « un tableau de bord de plus » à « un outil qui fait le travail ».

À partir des données d'une campagne, le système génère des correctifs prêts à appliquer :

| Type de correctif | Ce que c'est | Exemple |
|---|---|---|
| **Contenu optimisé** | Paragraphe à ajouter/modifier sur le site | « Ajoutez ce texte sur votre page /facturation pour être cité sur 'logiciel de facturation pour indépendant' » |
| **Schema JSON-LD** | Markup structuré prêt à coller | `<script type="application/ld+json">...` avec les propriétés adaptées au secteur |
| **`llms.txt`** | Fichier standardisé pour les moteurs IA | Contenu du fichier prêt à déployer à la racine du site |
| **Fiche source** | Site cible où obtenir une présence | « Ce site est cité dans 7/12 réponses où vous êtes absent. Proposez-y un article ou une fiche. » |

> 🔴 **Exigence.** Un correctif doit toujours s'appuyer sur un chiffre issu des données réelles. Un correctif générique (« publiez plus de contenu ») est un défaut de conformité.

**Critères d'acceptation :**
- ✅ Chaque correctif est lié à une requête précise où la marque est absente.
- ✅ Le contenu généré est copiable en un clic.
- ✅ Le JSON-LD est valide et passe la validation schema.org.
- ✅ Le `llms.txt` est conforme au standard.

---

### 4.9 M9 — Recommandations priorisées

Même logique que l'ancien CdC (§4.7). 5 à 10 recommandations avec titre, constat chiffré, action concrète, priorité et effort.

---

### 4.10 M10 — Abonnement Stripe self-serve

**Stripe Checkout + Customer Portal + webhooks.** Quatre tiers, mensuel et annuel.

**Compteurs à tenir par utilisateur et par cycle de facturation :**
- Nombre de marques actives
- Nombre de requêtes actives par marque
- Nombre d'appels moteurs consommés

**Comportement au dépassement :** blocage avant l'action, message explicite, upgrade immédiat.

**Exigences webhooks :** signature vérifiée, idempotence obligatoire (table `ProcessedWebhook`).

---

### 4.11 M11 — Cache mutualisé

Même logique que l'ancien CdC (§4.10). Cache global inter-utilisateurs, 24h par défaut, bouton « rafraîchir » qui décrémente le quota.

---

## 5. Architecture technique

### 5.1 Pile imposée

| Couche | Technologie | Justification |
|---|---|---|
| Framework | **Next.js 14+, App Router, TypeScript strict** | Écosystème, un seul déploiement |
| Base de données | **PostgreSQL** (Neon, région UE) | Relationnel, offre gratuite |
| ORM | **Prisma** | Migrations versionnées, typage |
| Authentification | **NextAuth v5**, Google OAuth | Pas d'authentification à maintenir |
| Paiement | **Stripe** (Checkout + Portal) | Standard |
| Interface | **Tailwind CSS + shadcn/ui** | Rapidité, cohérence |
| Graphiques | **Recharts** | Suffisant, léger |
| Hébergement | **Vercel** | Déploiement, aperçus de branches |
| File d'attente | **Inngest** ou **Trigger.dev** | Exécutions durables |

### 5.2 ADR-001 — File d'attente

Inchangé. Voir l'ancien CdC §5.2.

### 5.3 ADR-002 — Connecteurs vers les moteurs IA

Inchangé. L'interface `EngineConnector` et l'architecture à connecteurs interchangeables restent la référence. Le connecteur Gemini est déjà implémenté dans `src/engines/`.

---

### 5.4 Modèle de données

```prisma
model User {
  id              String   @id @default(cuid())
  name            String?
  email           String   @unique
  emailVerified   DateTime?
  image           String?
  plan            Plan     @default(FREE)
  stripeCustomerId  String?  @unique
  stripeSubId       String?  @unique
  currentPeriodEnd  DateTime?
  createdAt       DateTime @default(now())

  accounts  Account[]
  sessions  Session[]
  brands    Brand[]
}

model Brand {
  id          String   @id @default(cuid())
  userId      String
  name        String
  domain      String
  brandName   String
  industry    String?
  country     String   @default("FR")
  language    String   @default("fr")
  frequency   Frequency @default(WEEKLY)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  competitors Competitor[]
  prompts     Prompt[]
  campaigns   Campaign[]

  @@index([userId])
}

model Competitor {
  id          String @id @default(cuid())
  brandId     String
  brandName   String
  domain      String?
  brand       Brand @relation(fields: [brandId], references: [id], onDelete: Cascade)
  @@index([brandId])
}

model Prompt {
  id          String     @id @default(cuid())
  brandId     String
  text        String
  family      PromptFamily
  isActive    Boolean    @default(true)
  brand       Brand      @relation(fields: [brandId], references: [id], onDelete: Cascade)
  runs        Run[]
  @@index([brandId, isActive])
}

model Campaign {
  id           String   @id @default(cuid())
  brandId      String
  status       CampaignStatus @default(QUEUED)
  startedAt    DateTime @default(now())
  finishedAt   DateTime?
  tasksTotal   Int      @default(0)
  tasksDone    Int      @default(0)
  tasksFailed  Int      @default(0)
  visibilityScore Float?
  shareOfVoice    Float?
  totalCostUsd    Float  @default(0)

  brand        Brand @relation(fields: [brandId], references: [id], onDelete: Cascade)
  runs         Run[]
  recommendations Recommendation[]
  corrections     Correction[]
  @@index([brandId, startedAt])
}

model Run {
  id           String   @id @default(cuid())
  campaignId   String
  promptId     String
  engine       EngineId
  status       RunStatus @default(PENDING)
  rawResponse  String?   @db.Text
  brandMentioned Boolean @default(false)
  brandPosition  Int?
  sentiment      Sentiment?
  snippet        String?  @db.Text
  costUsd        Float    @default(0)
  latencyMs      Int?
  fromCache      Boolean  @default(false)
  errorMessage   String?
  attempts       Int      @default(0)
  createdAt      DateTime @default(now())

  campaign     Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  prompt       Prompt   @relation(fields: [promptId], references: [id], onDelete: Cascade)
  citations    Citation[]
  competitorMentions CompetitorMention[]

  @@unique([campaignId, promptId, engine])
  @@index([campaignId, status])
}

model Citation {
  id       String @id @default(cuid())
  runId    String
  url      String
  domain   String
  title    String?
  position Int
  run      Run @relation(fields: [runId], references: [id], onDelete: Cascade)
  @@index([runId])
  @@index([domain])
}

model CompetitorMention {
  id           String @id @default(cuid())
  runId        String
  competitorId String
  position     Int?
  run          Run @relation(fields: [runId], references: [id], onDelete: Cascade)
  @@index([runId])
}

model Recommendation {
  id          String @id @default(cuid())
  campaignId  String
  title       String
  finding     String @db.Text
  action      String @db.Text
  priority    Priority
  effort      Effort
  rank        Int
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  @@index([campaignId])
}

model Correction {
  id          String @id @default(cuid())
  campaignId  String
  type        CorrectionType
  title       String
  targetUrl   String?
  targetQuery String?
  content     String  @db.Text
  priority    Priority
  applied     Boolean @default(false)
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  @@index([campaignId])
}

model EngineCache {
  id          String   @id @default(cuid())
  fingerprint String   @unique
  engine      EngineId
  rawResponse String   @db.Text
  citations   Json
  costUsd     Float
  createdAt   DateTime @default(now())
  expiresAt   DateTime
  @@index([expiresAt])
}

model AuditLead {
  id        String   @id @default(cuid())
  email     String
  domain    String
  brandName String
  score     Float?
  createdAt DateTime @default(now())
  @@unique([email, domain])
}

model UsageCounter {
  id           String   @id @default(cuid())
  userId       String
  periodStart  DateTime
  periodEnd    DateTime
  engineCalls  Int      @default(0)
  costUsd      Float    @default(0)
  @@unique([userId, periodStart])
}

model ProcessedWebhook {
  id          String   @id
  processedAt DateTime @default(now())
}

enum Plan { FREE SOLO PRO SCALE }
enum Frequency { WEEKLY TWICE_WEEKLY DAILY }
enum PromptFamily { DISCOVERY COMPARISON BRAND PROBLEM }
enum CampaignStatus { QUEUED RUNNING COMPLETED PARTIAL FAILED }
enum RunStatus { PENDING RUNNING DONE FAILED UNPARSEABLE }
enum EngineId { CHATGPT PERPLEXITY GOOGLE_AIO GEMINI CLAUDE }
enum Sentiment { POSITIVE NEUTRAL NEGATIVE }
enum Priority { HIGH MEDIUM LOW }
enum Effort { LOW MEDIUM HIGH }
enum CorrectionType { CONTENT PAGE_SEO JSONLD LLMS_TXT SOURCE_OUTREACH }
```

**Ce qui a changé par rapport à la V1 :**
- `Agency`, `Membership`, `Role`, `AgencyStatus` → **supprimés**
- `Workspace` → renommé en `Brand`, rattaché directement à `User`
- `Report` → **supprimé** (les rapports deviennent des pages, pas des PDFs)
- `Correction`, `CorrectionType` → **ajoutés** (la différenciation)
- `AuditLead` → **ajouté** (capture d'emails depuis l'audit gratuit)
- `UsageCounter.agencyId` → remplacé par `userId`
- `Plan` : `TRIAL` remplacé par `FREE`, ajout de `SOLO`

---

### 5.5 Organisation du code

```
/app
  /(marketing)          pages publiques, audit gratuit, pages programmatiques
  /(app)                application authentifiée
  /api
/lib
  /engines              connecteurs — un fichier par moteur + registre
  /scoring              fonctions pures de calcul (score, part de voix) + tests
  /analysis             extraction mention / sentiment / citations
  /corrections          génération de correctifs (contenu, JSON-LD, llms.txt)
  /billing              Stripe, quotas, compteurs
  /auth                 configuration NextAuth
  /prompts              génération de requêtes
/inngest                définitions des tâches de fond
/prisma
```

**Règles :**
- Les fonctions de `lib/scoring`, `lib/analysis` et `lib/corrections` sont **pures** : pas d'accès base, pas d'accès réseau.
- Aucun fichier de plus de 400 lignes.
- TypeScript en mode `strict`. `any` interdit sauf commentaire justifiant.

---

## 6. Exigences non fonctionnelles

| Domaine | Exigence |
|---|---|
| **Performance** | Audit gratuit sous 30 s. Chargement du dashboard sous 2 s |
| **Montée en charge** | 100 audits/jour + 200 utilisateurs payants sans dégradation |
| **Sécurité** | Isolation par `userId`. Validation de toutes les entrées par Zod. Rate limiting. |
| **RGPD** | Hébergement UE (Neon Frankfurt, Vercel Paris). Export et suppression du compte. |
| **Navigateurs** | 2 dernières versions de Chrome, Firefox, Safari, Edge |
| **Langues** | Interface française et anglaise |
| **Accessibilité** | Contrastes AA, navigation clavier |

---

## 7. Lots de livraison

| Lot | Contenu | Jours | Pourquoi dans cet ordre |
|---|---|---|---|
| **P0** | Audit gratuit public + logique d'analyse | **5-7** | C'est le funnel. Pas de produit sans ça. |
| **L1** | Auth + marques + suivi récurrent + dashboard | **8-10** | Le produit payant minimal |
| **L2** | Correctifs générés | **6-8** | La différenciation. Ce que personne ne fait. |
| **L3** | Stripe + pages programmatiques | **6-8** | La monétisation + le canal organique |
| **L4** | Email automatisé + polish | **4-5** | L'acquisition outbound automatisée |

**Total : ~29-38 jours, contre ~57 dans l'ancien plan.**

### Périmètre réduit si le temps manque

Retirer sans hésiter : les moteurs Claude et Gemini dans le suivi récurrent (garder ChatGPT, Perplexity, Google AI Overviews), l'écran sources, les alertes. Les correctifs JSON-LD et `llms.txt` peuvent passer en V1.1, le correctif contenu reste obligatoire.

---

## 8. Tests exigés (bloquants)

| Test | Portée |
|---|---|
| **Isolation utilisateurs** | Un utilisateur ne peut accéder aux marques d'un autre → 404 |
| **Calculs de score** | Tests unitaires sur les fonctions pures |
| **Idempotence des webhooks** | Rejeu triple → un seul effet |
| **Idempotence des campagnes** | Relance → aucun doublon |
| **Correctifs** | Le JSON-LD généré est valide. Le `llms.txt` est conforme. |
| **Connecteurs** | Tests avec réponses simulées, aucun appel réseau en CI |

Couverture minimale exigée sur `lib/scoring`, `lib/analysis`, `lib/corrections` et `lib/billing` : **80 %**.

---

## 9. Points ouverts

| # | Question | Bloque | Statut |
|---|---|---|---|
| 1 | Nom du produit | L3 | ⏳ Ouvert |
| 2 | Clé API Gemini | P0 | ⏳ À créer |
| 3 | Grille tarifaire définitive | L3 | 🟢 Proposée (29/49/79 €) |
| 4 | Hébergement Vercel + Neon en région UE | Conformité RGPD | 🟡 À confirmer |

**Rien ne bloque le lot P0**, qui peut démarrer immédiatement.
