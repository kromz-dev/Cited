# Démarrage à budget zéro — la stratégie révisée

> Remplace le plan de financement du document `01-plan-business.md` (§11 Budget).
> **Version :** 2.0 · **Date :** 16 septembre 2026
>
> ⚠️ **Pivot.** Ce document a été entièrement refondu suite au passage d'un modèle B2B agences à un modèle self-serve pour petites marques. Voir le [README](./README.md) pour le contexte.

---

## 1. Ce que la contrainte change

| Avant | Après |
|---|---|
| Un dev construit la V1 pour 17-37 k€ | **Aucun dev payé.** On construit ensemble, ici |
| On vend aux agences via démos et appels | **On vend en self-serve.** Inscription carte bancaire, sans appel |
| Le produit est un tableau de bord | **Le produit corrige.** Contenu, JSON-LD, `llms.txt` |
| V1 complète en 57 jours | Un audit public en ~5-7 jours, la V1 financée par les premiers clients |
| Le cahier des charges est un bon de commande | Le cahier des charges est notre plan de construction |

**Le cahier des charges reste valable et n'est pas jeté.** Il a été simplifié : plus de multi-tenant agence, plus de marque blanche, plus de rôles — mais le cœur (moteurs, analyse, scoring, cache) est intact.

---

## 2. Le coût plancher, honnêtement

À budget zéro strict, le projet est possible grâce à l'offre gratuite de Gemini.

| Poste | Coût | Contournable ? |
|---|---|---|
| Crédits API pour l'audit public | **0 €** | ✅ Gemini gratuit : 500 req ancrées/jour = ~100 audits/jour |
| Nom de domaine (.io ou .ai) | **12 €/an** | 🟡 Reportable après les premières ventes |
| Vercel (hébergement) | 0 € | ✅ Offre gratuite suffisante |
| Neon (base de données) | 0 € | ✅ Offre gratuite suffisante (0.5 GB) |
| Inngest (file d'attente) | 0 € | ✅ Gratuit jusqu'à 50 000 exécutions/mois |
| Stripe | 0 € | ✅ Commission seulement, aucun frais fixe |
| Développement | 0 € | ✅ On le fait ici |
| **Total pour démarrer** | **~0 – 12 €** | |

> Le coût de démarrage est passé de ~40 € (ancien plan avec API payantes pour la prospection agences) à **quasi zéro** grâce au pivotement vers l'audit public gratuit alimenté par le quota Gemini.

---

## 3. Le renversement : l'audit gratuit comme funnel

~~La logique classique — construire la V1 puis chercher des clients — est celle qui exige du capital. On l'inverse.~~ L'ancien plan inversait en vendant aux agences d'abord. Le nouveau plan va plus loin : **on construit le produit d'appel ET le funnel en un seul objet.**

```
Phase 0  ─ L'audit public gratuit        ~5 à 7 jours de dev       coût : 0 €
Phase 1  ─ L'acquisition organique       continue en tâche de fond  coût : 0 €
Phase 2  ─ La V1, financée par Phase 0   démarre quand le funnel convertit
```

---

## 4. Phase 0 — L'audit public gratuit

**Ce qu'on construit :** une page web publique, sans inscription, sans paiement. N'importe qui colle son domaine et obtient un diagnostic en 30 secondes. **C'est à la fois le produit d'appel, la démo et l'argument de vente.**

```
Entrée   : un domaine + un nom de marque (formulaire web)
   ↓
1. Détecte automatiquement le secteur et 3 concurrents (IA)
2. Génère 5 requêtes pertinentes
3. Les pose à 1 moteur (Gemini avec recherche web — gratuit)
4. Détecte : la marque est-elle citée ? à quelle position ? et les concurrents ?
5. Relève les domaines cités comme sources
   ↓
Sortie   : résultat instantané sur la page (grille de couverture, score, concurrents)
   ↓
Pour le rapport complet → saisie email (= lead capturé)
Pour le suivi récurrent + correctifs → inscription payante
```

**Coût par audit :** 5 requêtes × 1 moteur = 5 appels ≈ **0 €** (quota gratuit Gemini).
**Capacité :** 500 appels/jour ÷ 5 = **100 audits gratuits par jour**, à zéro euro.

**Pourquoi c'est le bon premier objet à construire :**

1. C'est **le funnel complet**. L'utilisateur entre un domaine, voit le résultat, comprend le problème, et s'inscrit. Pas besoin de démo, pas besoin d'appel.
2. C'est **le cœur du futur produit**. Les étapes 1 à 5 ci-dessus sont exactement la logique d'exécution du SaaS. Rien n'est jeté, tout est réutilisé.
3. Ça valide **le poste de coût n°1** en conditions réelles avant d'engager quoi que ce soit.
4. Ça génère des **leads qualifiés** : chaque email récupéré est quelqu'un qui a vu que sa marque est invisible dans les moteurs IA.
5. C'est **100 % automatisable**. Pas d'appel à passer, pas de rapport à envoyer à la main.

> L'ancien plan demandait de vendre à la main à des agences avant de construire. Le nouveau plan construit un objet qui vend tout seul.

---

## 5. Phase 1 — L'acquisition organique (3 canaux automatisables)

**Objectif : 100 utilisateurs payants à 39 €/mois en 12-18 mois.** C'est plus lent que 3 agences en 3 mois, mais c'est un chemin qu'on parcourt sans jamais parler à personne.

### Canal 1 : l'audit public lui-même

L'outil gratuit est le canal principal. Chaque audit produit un lead (email). L'email de suivi est automatisé : le rapport complet + un CTA vers l'inscription payante.

**Métriques attendues :**
- 100 audits/jour → ~20 emails captés/jour → ~2 inscriptions payantes/semaine

### Canal 2 : les pages programmatiques

Notre outil génère la donnée. On publie des milliers de pages « [Marque] est-elle citée par ChatGPT ? ». Chaque page est de la donnée primaire — les moteurs IA la citent, et chaque page est une démonstration du produit par le produit.

C'est du pur travail de constructeur. Pas de rédaction manuelle, pas de SEO artisanal.

### Canal 3 : l'email froid → inscription

On envoie l'audit, le lien mène au produit, pas à un agenda. Pas de call à passer.

> **Objet :** Votre marque est citée 2 fois sur 15 par ChatGPT
>
> [Prénom], j'ai fait passer [domaine] dans notre outil de mesure de visibilité IA. Votre marque ressort dans 2 réponses sur 15. [Concurrent] dans 11.
>
> Le rapport complet est ici : [lien vers l'audit public]
>
> Si vous voulez corriger ça, l'outil génère le contenu, le JSON-LD et le `llms.txt` à mettre en place : [lien inscription]

---

## 6. Seuil de décision

| Résultat après 30 jours d'audit public en ligne | Décision |
|---|---|
| > 50 audits/jour + > 5 inscriptions payantes | ✅ On construit la V1 complète |
| 10-50 audits/jour, 1-4 inscriptions | 🟡 Le produit intéresse, le funnel ne convertit pas. On optimise la page et l'email |
| < 10 audits/jour | 🔴 Le trafic manque. On active les pages programmatiques et l'email froid |
| 0 inscription payante après 60 jours | 🔴 **On ne construit pas la V1.** On a économisé un an pour ~12 € |

> Ce seuil est le principal intérêt de la méthode : l'échec coûte 12 € au lieu d'un an.

---

## 7. Si vraiment aucune dépense n'est possible

Ce n'est plus un problème. Le plan actuel démarre à **zéro euro** :

1. **Gemini gratuit** : 500 requêtes ancrées/jour, suffisant pour 100 audits/jour.
2. **Vercel gratuit** : hébergement du site et de l'API.
3. **Neon gratuit** : base de données PostgreSQL (0.5 GB).
4. Le nom de domaine est la seule dépense, et elle peut attendre les premières ventes.

---

## 8. Ce qu'on fait maintenant

| # | Action | Qui | Quand |
|---|---|---|---|
| 1 | Construire l'audit public (Phase 0) | Nous ici | Maintenant |
| 2 | Créer une clé API Gemini sur Google AI Studio | Toi | Maintenant |
| 3 | Choisir un nom et acheter le domaine | Toi | Avant le lancement |
| 4 | Tester l'audit sur 5 domaines réels | Nous | Foulée du 1 |
| 5 | Déployer sur Vercel | Nous | Foulée du 4 |
| 6 | Mesurer le taux de conversion audit → email → inscription | Nous | 30 jours après le 5 |

---

## 9. Ce qui reste valable des autres documents

| Document | Statut |
|---|---|
| `01-plan-business.md` | ✅ Mis à jour — pivot self-serve, nouveau client cible, nouvelle tarification |
| `02-cahier-des-charges.md` | ✅ Mis à jour — modèle simplifié, correctifs ajoutés, multi-tenant supprimé |
| `03-direction-design.md` | ✅ Mis à jour — écrans adaptés au self-serve |
| `04-brief-developpeur.md` | ⚠️ Obsolète — conservé pour contexte historique |
| `05-strategie-marketing.md` | ✅ Mis à jour — 3 canaux automatisables |
| Contrat de développement | ❌ Sans objet |
