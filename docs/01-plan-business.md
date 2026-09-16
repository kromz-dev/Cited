# Plan business — « Cited » (nom de code provisoire)

> SaaS de visibilité de marque dans les moteurs de réponse IA (ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude), vendu en self-serve aux petites marques.
> **Le produit ne mesure pas seulement : il génère les correctifs.**

**Version :** 2.0 · **Date :** 16 septembre 2026 · **Statut :** mis à jour — pivot self-serve

> ⚠️ **Pivot.** Ce document a été refondu. Le client cible passe des agences SEO aux petites marques / SaaS solo / consultants SEO indépendants. La marque blanche, le multi-tenant agence et la prospection par démos sont abandonnés. Voir le [README](./README.md) pour le contexte complet.

---

## 1. Résumé exécutif

Le SEO classique perd du terrain au profit des moteurs de réponse IA. Les petites marques ne savent pas si elles sont citées par ChatGPT ou Perplexity, ni pourquoi — et n'ont **personne pour corriger ça**.

Un nouveau marché d'outillage — le **GEO/AEO** (Generative / Answer Engine Optimization) — s'est créé en 18 mois et a déjà produit des sociétés à 10 M$ d'ARR.

**Cited** attaque ce marché par un angle que personne n'occupe : **on ne se contente pas de mesurer, on génère les correctifs** — contenu optimisé, schema JSON-LD, fichier `llms.txt`, fiches de sources à cibler. La petite marque qui n'a pas d'agence obtient les actions concrètes, pas un tableau de bord de plus.

| | |
|---|---|
| **Client V1** | Petites marques, SaaS solo, consultants SEO indépendants |
| **Prix V1** | 29 € à 79 €/mois, inscription carte bancaire, sans appel |
| **Marge brute** | ~84 % |
| **Objectif 12-18 mois** | 100 clients → ~4 000 € MRR |
| **Investissement initial** | ~0 à 12 € (quota gratuit Gemini + Vercel + Neon) |

---

## 2. Validation du marché

Le marché n'est pas une hypothèse, il est déjà prouvé par des chiffres publics.

| Acteur | Preuve | Source |
|---|---|---|
| **Peec AI** (Berlin) | 0 → **10 M$ ARR en 16 mois**, 2 500 clients, ~85 €/mois. Clients : Squarespace, TUI, Hugo Boss | [TNW](https://thenextweb.com/news/peec-ai-berlin-10-million-arr-geo-ai-search) |
| **Stratégie gagnante de Peec** | A gagné en **cassant le prix** (85 € contre 500 $+/siège chez les historiques), pas en étant premier | [Enterprise DNA](https://enterprisedna.co/resources/ai-pulse/ai-pulse-2026-07-22-berlin-s-peec-ai-hit-10m-arr-sixteen-months-after-launching/) |
| **Marché FR** | Qwairy, Meteoria, GetMint déjà présents à 29-200 €/mois | [Stafe](https://www.stafe.fr/outils-geo-comparatif-visibilite-ia/) |

**Lecture stratégique :** le marché est validé *et* déjà peuplé. Tous les acteurs mesurent. **Aucun ne génère les correctifs.** C'est notre différenciation.

---

## 3. Le problème, côté petite marque

Une petite marque ou un SaaS solo en 2026 vit ceci :

1. Ses prospects demandent à ChatGPT « meilleur [catégorie] » — elle ne sait pas si elle ressort.
2. Elle n'a pas d'équipe SEO ni d'agence pour investiguer.
3. Les outils GEO existants **mesurent**, mais elle ne sait pas quoi faire du résultat. Un tableau de bord ne l'aide pas.
4. Elle veut qu'on lui dise **quoi changer concrètement** : quelle page modifier, quel texte écrire, quel markup ajouter.

**Ce qu'elle veut :** un outil qui lui dit « ta marque est invisible ici, voilà exactement ce qu'il faut faire pour y remédier ».

---

## 4. Positionnement

> **« L'outil qui corrige ta visibilité IA, pas seulement un tableau de bord de plus. »**

**Ce qu'on fait :** mesurer, diagnostiquer, **et générer les correctifs prêts à appliquer**.
**Ce qu'on ne fait pas :** exécuter les corrections à la place du client (il copie-colle lui-même).

### Différenciation face aux concurrents

| Axe | Peec / Qwairy / Otterly | Cited |
|---|---|---|
| Ce qu'ils font | Mesurent la visibilité | Mesurent **et corrigent** |
| Client cible | La marque (souvent enterprise) | La petite marque qui fait seule |
| Correctifs | Aucun | Contenu, JSON-LD, `llms.txt`, fiches sources |
| Prix | 85-500 €/mois | 29-79 €/mois |
| Acquisition | Sales, démos | Self-serve, audit public gratuit |
| Onboarding | Configuration manuelle | Audit en 30 secondes, zéro config |

> ⚠️ **À vérifier avant lancement :** un teardown concurrentiel détaillé est en cours. Si l'un des acteurs ci-dessus propose déjà des correctifs générés à bas prix, le positionnement doit être resserré.

---

## 5. Client idéal (ICP)

| Critère | Valeur |
|---|---|
| Type | PME, SaaS solo, e-commerçant indépendant, consultant SEO, blogueur professionnel |
| Taille | 1 à 20 personnes |
| Budget SEO | 0-500 €/mois (souvent aucun outil GEO) |
| Géographie | France, Belgique, Suisse, Québec → puis UE → puis mondial |
| Déclencheur d'achat | A fait l'audit gratuit, a vu que sa marque est invisible, veut corriger |
| Compétence technique | Sait copier-coller du HTML ou du texte sur son site. Pas développeur. |

**Anti-ICP (à ne pas cibler en V1) :** grands comptes, entreprises avec équipe SEO interne, agences (elles veulent la marque blanche, qu'on ne fait plus).

---

## 6. Tarification

Modèle : abonnement mensuel, inscription carte bancaire, sans engagement.

| Tier | Prix/mois | Marques suivies | Requêtes/marque | Moteurs | Fréquence | Correctifs |
|---|---|---|---|---|---|---|
| **Free** | 0 € | 0 | Audit unique (5 requêtes, 1 moteur) | Gemini | Ponctuel | Non |
| **Solo** | 29 € | 1 | 25 | 3 | Hebdomadaire | ✅ Basiques |
| **Pro** ⭐ | 49 € | 3 | 50 | 5 | 2×/semaine | ✅ Complets |
| **Scale** | 79 € | 10 | 100 | 5 | Quotidienne | ✅ + Export API |

- **Pas de carte bancaire pour l'audit gratuit.** L'utilisateur doit voir ses vraies données pour être convaincu.
- −20 % en annuel.
- L'audit gratuit est **le produit d'appel, la démo et l'argument de vente** en un seul objet.

**Pourquoi ces prix :** le segment visé n'a pas de budget outil GEO. On entre à un prix inférieur à un abonnement Semrush. L'utilisateur passe de « je ne sais pas si les IA me citent » à « voilà exactement quoi corriger » pour le prix d'un repas.

---

## 7. Unit economics

**Coût variable par client (tier Pro, hypothèse haute) :**

```
3 marques × 50 requêtes × 5 moteurs          = 750 appels par exécution
× 8 exécutions/mois (2×/semaine)             = 6 000 appels/mois
× ~0,02 $ par appel (LLM + recherche web)    = ~120 $/mois
```

Avec le **cache mutualisé** (mêmes requêtes entre utilisateurs) et un **usage réel à ~30-40 % du quota**, le coût tombe à :

- **Tier Solo** : ~2-4 €/mois → **86-93 % de marge**
- **Tier Pro** : ~6-10 €/mois → **80-88 % de marge**
- **Tier Scale** : ~15-25 €/mois → **68-81 % de marge**

**Moyenne pondérée estimée : ~84 % de marge brute.**

> 🔴 **À mesurer dès les 5 premiers clients.** Si le coût dépasse 25 % du prix, il faut augmenter les prix ou réduire la fréquence par défaut.

**Projection à 12-18 mois :**

| Scénario | Composition | MRR |
|---|---|---|
| Prudent | 40 Solo + 10 Pro | 1 650 € |
| Central | 50 Solo + 30 Pro + 10 Scale | 3 710 € |
| Haut | 80 Solo + 50 Pro + 20 Scale | 5 370 € |

---

## 8. Go-to-market

### Les 3 canaux, tous automatisables

#### Canal 1 — L'audit gratuit public (le cœur du funnel)

N'importe qui colle son domaine, obtient son score en 30 secondes. Pas d'inscription, pas de carte bancaire. Le rapport complet demande un email.

**Contrainte vérifiée :** 5 requêtes × 1 moteur sur le quota gratuit Gemini = **100 audits gratuits par jour, à zéro euro.**

**Funnel :**
```
Visiteur → audit gratuit → résultat instantané
   ↓                          ↓
   email capturé              "Votre marque est invisible sur 4 requêtes"
   ↓                          ↓
   email automatisé           "Voici les correctifs pour y remédier"
   ↓                          ↓
   inscription payante        correctifs générés, suivi récurrent
```

#### Canal 2 — Les pages programmatiques

L'outil génère la donnée. On publie des milliers de pages « [Marque] est-elle citée par ChatGPT ? ». C'est de la donnée primaire — les moteurs IA la citent — et chaque page est une démonstration du produit par le produit.

#### Canal 3 — L'email froid vers l'inscription

On envoie l'audit, le lien mène au produit, **jamais à un agenda**. Pas d'appel à passer.

**Conversion attendue :** 100 audits/jour → ~20 emails/jour → ~2 inscriptions/semaine → **~8-10 clients/mois à régime de croisière.**

---

## 9. Feuille de route produit

| Phase | Contenu | Délai |
|---|---|---|
| **P0** | Audit public gratuit + logique d'analyse (le funnel) | Jours 1-7 |
| **V1** | Comptes + suivi récurrent + dashboard | Semaines 2-4 |
| **V1.1** | **Correctifs générés** (contenu, JSON-LD, `llms.txt`) — la différenciation | Semaines 4-6 |
| **V1.2** | Stripe + pages programmatiques | Semaines 6-8 |
| **V2** | Email automatisé, alertes, export CSV, comparaison de périodes | Mois 3-4 |
| **V3** | API publique, intégrations GA4 / Search Console, nouveaux moteurs | Mois 5-12 |

---

## 10. Risques

| Risque | Gravité | Probabilité | Parade |
|---|---|---|---|
| **Semrush / Ahrefs intègrent le GEO + correctifs** | 🔴 Élevée | Élevée | Les correctifs sont notre avance. Tant que les grands ne les font pas, on a une fenêtre. |
| **Coût des appels IA supérieur au modèle** | 🔴 Élevée | Moyenne | Cache mutualisé + quotas durs + audit gratuit sur Gemini gratuit |
| **Les réponses API diffèrent de l'interface grand public** | 🟡 Moyenne | Certaine | Assumer et documenter la méthodologie publiquement |
| **Pas assez de trafic sur l'audit gratuit** | 🟡 Moyenne | Moyenne | Pages programmatiques + email froid. Le référencement prend du temps |
| **Taux de conversion audit → payant trop faible** | 🟡 Moyenne | Moyenne | Optimiser le funnel, tester les correctifs comme CTA principal |
| **Blocage / évolution des conditions d'accès aux moteurs** | 🟡 Moyenne | Moyenne | Architecture à connecteurs interchangeables (ADR-002) |

---

## 11. Budget

> Le budget de développement sous-traité (18 000 – 32 000 €) est caduc : le projet est mené à budget zéro.
> **Voir `00-demarrage-budget-zero.md`** pour la stratégie détaillée.

**Coûts de démarrage : ~0 à 12 €.** Le quota gratuit de Gemini, Vercel et Neon couvre tout.

Le seul coût variable incompressible est celui des appels aux moteurs IA payants (Perplexity, ChatGPT, etc.), qui n'intervient qu'au lot L2 quand les premiers revenus les financent.

## 12. Décisions à verrouiller avant de démarrer

1. Nom du produit (le nom de domaine peut attendre la première vente).
2. ~~Validation de la grille tarifaire — et de l'offre « membre fondateur » à 79 €.~~ → Grille self-serve 29-79 € validée.
3. ~~Confirmation des ~40 € de crédits API mobilisables.~~ → Le quota gratuit Gemini suffit.
4. Créer une clé API Gemini sur [Google AI Studio](https://aistudio.google.com/apikey).
