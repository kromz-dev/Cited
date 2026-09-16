# Stratégie business v3 — « Cited »

> **Version :** 3.1 · **Date :** 16 septembre 2026 · **Statut :** proposition, remplace la stratégie des documents 00, 01 et 05 si validée
>
> ⚠️ **Pourquoi une v3.** La v2 reposait sur quatre hypothèses fausses :
> 1. le quota gratuit Gemini est interdit pour des utilisateurs de l'EEE et de la Suisse ;
> 2. Vercel Hobby est interdit pour un usage commercial ;
> 3. les plans Pro et Scale coûtent 2 à 35 fois leur prix en appels API ;
> 4. des concurrents français génèrent déjà des correctifs à 19-49 €/mois (MENTIA, ChatSEO).
>
> La v3 reste un **SaaS self-serve, sans appel ni démo**. Elle change le problème attaqué et la façon de corriger.

---

## 1. La thèse en une phrase

**« Cited rend ton site lisible par ChatGPT, Claude et Perplexity, le prouve, et te prévient dès que ça casse. »**

| | v2 | v3 |
|---|---|---|
| Problème | « Votre marque est peu citée » (flou, non déterministe) | « Les robots IA reçoivent une page vide » (binaire, vérifiable) |
| Correctif | Texte, JSON-LD, llms.txt à copier-coller, effet non démontré | **Correctif appliqué par l'outil** (pré-rendu géré) + réglages générés |
| Coût d'un audit gratuit | Appels LLM, plafond de 100/jour | Requêtes HTTP, ~0 €, sans plafond |
| Coût d'un client payant | Jusqu'à 35× le prix | < 10 % du prix |
| Raison de payer chaque mois | Voir un score bouger | **Le correctif tourne en continu** + alerte en cas de régression |
| Concurrence directe | Nombreuse (MENTIA, Meteoria, Qwairy, Otterly…) | Des outils de pré-rendu centrés Lovable ; peu d'acteurs multi-stack orientés robots IA |

---

## 2. Le problème

### 2.1 Un trou technique, binaire et mesurable

Les robots des IA ne lisent que le HTML brut. Une analyse Vercel/MERJ portant sur plus de 500 millions de passages de GPTBot n'a trouvé **aucune exécution de JavaScript**. Même constat pour ClaudeBot et PerplexityBot. Seul le robot de Gemini, adossé à l'infrastructure Google, rend le JavaScript.

Conséquence : un site rendu côté client peut être 1er sur Google et **vide** pour ChatGPT, Claude et Perplexity. Et ChatGPT s'appuie largement sur l'index Bing, dont le rendu JavaScript est limité.

### 2.2 Qui est touché, et ne le sait pas

- Les sites construits avec **Lovable, Bolt, Bubble, Vite/React** et la plupart des applications monopage. Le rendu serveur natif de Lovable ne concerne que les sites déployés après le 20 avril 2026, avec des retours mitigés.
- Les sites derrière un **pare-feu ou un CDN** qui bloque les robots IA sans que le propriétaire le sache.
- Les `robots.txt` qui bloquent `OAI-SearchBot` (le robot de ChatGPT Search) par copier-coller d'une règle anti-entraînement.
- Les sites **absents de Bing**.

Aucun de ces problèmes ne se voit dans Google Search Console : **le propriétaire ne sait pas qu'il est invisible.**

---

## 3. Client idéal (ICP)

| Critère | Valeur |
|---|---|
| Qui | Fondateur solo ou petite équipe (1-20) dont le site ou le SaaS tourne sur Lovable, Bolt, Bubble, Vite/React ou une SPA maison |
| Signal détectable automatiquement | HTML initial quasi vide (`<div id="root"></div>`), marqueurs Lovable/Bubble, `robots.txt` bloquant, 403 sur les agents IA |
| Pourquoi ça compte | Ses prospects demandent « meilleur outil pour X » à ChatGPT ; s'il n'est pas lisible, il n'existe pas |
| Compétence | Sait modifier un DNS ou coller un snippet, n'est pas expert SEO |
| Budget | Paie déjà plusieurs outils à 20-100 €/mois |
| Géographie | France et francophonie au lancement, anglophones dès que l'outil est stable (le problème est identique partout) |

**Cible secondaire :** agences web et no-code qui livrent sur ces stacks → plan multi-sites.

**Anti-ICP :** sites WordPress ou Webflow sans problème technique (leur levier est éditorial), entreprises avec équipe technique interne, grands comptes.

---

## 4. Le produit

### 4.1 Les 4 briques

| # | Brique | Ce qu'elle fait | Coût marginal |
|---|---|---|---|
| 1 | **Scanner** | Pour chaque page : ce que reçoit chaque robot IA (`OAI-SearchBot`, `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`, `Google-Extended`), texte du HTML initial comparé au rendu, méta-données et JSON-LD côté serveur, `robots.txt`, `sitemap.xml` | ~0 € |
| 2 | **Correctif géré** | Pré-rendu servi aux robots uniquement, installé en quelques minutes : enregistrement DNS, Worker Cloudflare ou middleware prêt à coller selon l'hébergeur. Plus `robots.txt` corrigé et règles de pare-feu générées | Rendu headless mis en cache, à mesurer |
| 3 | **Veille** | Contrôle quotidien, **alerte immédiate** si un redéploiement casse le rendu, si un pare-feu bloque un robot ou si `robots.txt` change | ~0 € |
| 4 | **Visibilité** | Échantillon mensuel de requêtes sur ChatGPT et Perplexity, sources citées, évolution. La mesure GEO de la v2, mais en complément, pas en cœur | ~0,02 $/appel |

La **grille de la direction design** reste l'objet central : pages en lignes, robots en colonnes, cellule pleine = contenu reçu, vide = page vide.

### 4.2 Parcours self-serve

```
URL collée → scanner (< 20 s, sans inscription)
   └─> « 7 pages sur 12 arrivent vides chez ChatGPT »
      └─> Rapport complet → email (lead)
      └─> « Corriger maintenant » → inscription + carte
         └─> Assistant d'installation selon la stack détectée
            └─> Re-scan automatique : grille avant/après
               └─> Veille quotidienne activée
```

Le moment « aha » est la **grille avant/après** : elle passe du vide au plein en quelques minutes.

### 4.3 Promesse honnête

On garantit ce qu'on contrôle : **les robots IA reçoivent le contenu.** On ne promet jamais une citation par ChatGPT.

Proposition : **remboursement du premier mois si la grille ne passe pas au vert** sur les pages déclarées.

---

## 5. Tarification

Métrique de valeur : **le site suivi et corrigé** (plus le client a de sites et de pages, plus il tire de valeur). Pas de piège à 9 € : un prix trop bas attire des utilisateurs qui ne paieront jamais un vrai prix et se relève très mal ensuite.

| Plan | Prix/mois | Sites | Pages pré-rendues | Veille | Visibilité IA |
|---|---|---|---|---|---|
| **Scanner** | 0 € | Illimité (ponctuel) | — | — | — |
| **Solo** | 29 € | 1 | 200 | Quotidienne + alertes | 10 requêtes × 2 moteurs, mensuel |
| **Pro** ⭐ | 59 € | 3 | 1 000 | Quotidienne + alertes | 25 requêtes × 2 moteurs, mensuel |
| **Agence** | 149 € | 15 | 5 000 | Quotidienne + alertes + rapport client | 25 requêtes × 2 moteurs par site |

- −20 % en annuel.
- **Offre de lancement réelle** : 50 places « fondateur », −30 % à vie en annuel. Le compteur affiche le vrai nombre restant.
- Prix de départ pour apprendre : si les premiers clients paient sans hésiter, on monte.

### Économie unitaire (hypothèse 0,02 $ par appel moteur)

| Plan | Appels visibilité/mois | Coût API | Rendu + infra (estimation à mesurer) | Coût total | Part du prix |
|---|---|---|---|---|---|
| Solo | 20 | ~0,40 $ | ~0,50 € | ~1 € | ~3 % |
| Pro | 150 | ~3 $ | ~1,50 € | ~4,50 € | ~8 % |
| Agence | 750 | ~15 $ | ~6 € | ~20 € | ~13 % |

> 🔴 **À mesurer dès les premiers clients :** le coût réel du rendu headless. Le cache (re-rendu seulement quand la page change) est ce qui garde ce poste bas.

**Coûts fixes réalistes :** 10-30 €/mois (VPS pour le rendu et la veille, domaine, email transactionnel, crédits API prépayés). Pas de Vercel Hobby, pas de Gemini gratuit.

### Projection (hypothèses, pas des promesses)

| Mois | Solo | Pro | Agence | MRR |
|---|---|---|---|---|
| M3 | 10 | 3 | 0 | ~470 € |
| M6 | 30 | 10 | 2 | ~1 760 € |
| M12 | 70 | 30 | 6 | ~4 710 € |

Un scénario à ~100 clients payants, comme la v2, mais sans vendre à perte.

---

## 6. Concurrence et différenciation

| Acteur | Ce qu'il fait | Notre écart |
|---|---|---|
| Hado SEO, LovableHTML | Pré-rendu pour les sites Lovable | Nous : multi-stack (Bubble, Bolt, React, SPA maison), orientés robots IA, veille des régressions |
| Prerender.io | Pré-rendu généraliste orienté SEO Google | Nous : vérification robot par robot IA, installation guidée, prix PME, français |
| MENTIA, Meteoria, Qwairy, Otterly | Mesure de visibilité IA | Nous : on corrige la cause technique au lieu de mesurer le symptôme |
| Audits de rendu JS (agences GEO) | Diagnostic ponctuel, souvent vendu en prestation | Nous : correctif appliqué + surveillance continue en self-serve |

**Le fossé à construire :**
- **la base de détection par stack** (chaque plateforme a ses pièges) ;
- **l'historique de veille** : un client qui a 6 mois d'alertes ne part pas ;
- **les données de l'étude annuelle** (voir §7.3).

---

## 7. Acquisition (100 % automatisable)

### 7.1 Le scanner comme moteur de croissance

- Sans inscription, résultat en moins de 20 s, rapport par email.
- **Badge « Lisible par les IA »** à afficher sur son site, qui renvoie au scanner.
- Chaque rapport partagé est une démonstration du produit.

### 7.2 Email froid qualifié par le scanner

- **Liste :** vitrines publiques de sites Lovable et Bubble, lancements Product Hunt, annuaires de startups.
- **Qualification :** chaque site passe dans le scanner ; **on n'écrit qu'aux sites réellement touchés**.
- **Envoi :** séquence email, relance J+4, dernier message J+10. Le lien mène au rapport et à l'inscription, jamais à un agenda.
- **Conformité B2B France :** objet clair, identité complète de l'éditeur, désinscription en un clic.

> **Objet :** [domaine] : la page /tarifs arrive vide chez ChatGPT
>
> Bonjour [Prénom],
>
> Notre scanner a vérifié ce que reçoivent les robots de ChatGPT, Claude et Perplexity sur [domaine]. Sur /tarifs et /fonctionnalités, ils ne lisent que le squelette de l'application : le texte est chargé en JavaScript, qu'ils n'exécutent pas.
>
> Google vous indexe correctement, donc rien ne signale le problème.
>
> Le rapport page par page est ici : [lien]. La correction s'installe en quelques minutes depuis la même page.
>
> [Éditeur], [adresse] · [Se désinscrire]

### 7.3 Étude de données primaires

- Scanner 1 000 sites de startups et publier **des statistiques agrégées** : part des sites illisibles par ChatGPT, répartition par stack, pages les plus touchées.
- **Aucune marque nommée** : pas de risque de dénigrement, pas de pages-modèles pénalisables par Google.
- Méthodologie publiée, chiffres datés : le profil de source que citent les IA et les médias. Version FR puis EN.

### 7.4 Places de marché et communautés

- Annuaires d'intégrations des plateformes no-code et IA (Hado SEO est référencé sur la page Discover de Lovable : le canal existe).
- Forums et communautés Bubble, Lovable, Indie Hackers : réponses utiles avec le scanner comme outil, pas de spam.

### 7.5 Ce qu'on ne fait pas

| Canal | Pourquoi non |
|---|---|
| Pages « [Marque] est-elle citée par ChatGPT ? » | Risque de pénalité Google et de dénigrement |
| Démos, appels | Hors modèle self-serve |
| Promesse de citation par ChatGPT | Invérifiable |
| llms.txt comme argument principal | Aucun effet démontré ; généré en bonus seulement |
| Compteur d'audits fictif | Pratique commerciale trompeuse |

---

## 8. Feuille de route

| Semaines | Lot | Contenu | Pourquoi dans cet ordre |
|---|---|---|---|
| S1-S2 | **P0 Scanner** | Contrôles déterministes, grille robots × pages, rapport email | C'est le funnel et la validation du problème |
| S2 | **Validation** | Scanner 300 sites de la cible | Mesurer la fréquence réelle du problème avant d'aller plus loin |
| S3 | **Prévente** | Page de prix + 50 places fondateur en annuel prépayé | De l'argent réel avant de construire le correctif |
| S3-S5 | **L1 Veille** | Comptes, sites, contrôle quotidien, alertes, Stripe | Premier plan payant utile même sans correctif |
| S5-S8 | **L2 Correctif géré** | Pré-rendu mis en cache, installation DNS / Worker / middleware, grille avant/après | La différenciation |
| S8-S10 | **L3 Visibilité** | Échantillon mensuel ChatGPT + Perplexity, sources | Reprend le cœur GEO de la v2 |
| S10-S12 | **Croissance** | Étude 1 000 sites, badge, plan Agence | Acquisition organique |

**Réutilisé du dossier :** direction design (la grille), architecture à connecteurs (ADR-002), fonctions de scoring pures, modèle `Brand` / `Campaign` / `Run` / `Citation`, Stripe, cache.

**Abandonné :** Gemini gratuit, Vercel Hobby, tiers Scale quotidien, pages programmatiques par marque, llms.txt comme argument.

---

## 9. Seuils de décision

| Moment | Signal | Décision |
|---|---|---|
| Fin S2 | < 15 % des sites scannés ont un problème réel | 🔴 Changer de cible (Bubble, sites derrière Cloudflare) avant de construire le correctif |
| Fin S4 | ≥ 10 préventes fondateur | ✅ Construire le correctif géré |
| Fin S4 | 1-9 préventes | 🟡 Retravailler la page et l'email, relancer 2 semaines |
| Fin S6 | 0 prévente après ~300 emails | 🔴 Arrêter. Coût de l'échec : ~6 semaines et < 50 € |
| M3 | Rétention M2 > 70 % et ≥ 15 clients | ✅ Passer à l'anglais et au plan Agence |

---

## 10. Risques

| Risque | Gravité | Parade |
|---|---|---|
| Les plateformes règlent le rendu elles-mêmes (Lovable a commencé) | 🔴 | Multi-stack dès le départ ; la veille reste utile (pare-feu, robots, régressions) |
| Le proxy de pré-rendu tombe en panne | 🔴 | Repli automatique vers le site d'origine ; les visiteurs humains ne passent jamais par le pré-rendu |
| Les IA se mettent à exécuter le JavaScript | 🟡 | Les autres contrôles restent utiles ; suivre les études de logs |
| Contenu différent servi aux robots (« cloaking ») | 🟡 | Servir strictement le même contenu rendu, jamais un contenu modifié ; le documenter |
| Scanner perçu comme intrusif | 🟡 | Agent utilisateur transparent, limitation de débit ; tests avec agents IA seulement sur les sites des clients |
| Coût du rendu headless sous-estimé | 🟡 | Cache par empreinte de page, quotas de pages par plan, mesure dès S5 |
| Temps de dev disponible | 🟡 | Périmètre réduit : P0 + L1 suffisent pour encaisser |

**Décisions à trancher avant S1 :**

1. **Nom et domaine.** « Jauge » colle bien à un instrument de mesure technique.
2. **Stacks prioritaires.** Recommandation : Lovable + React/Vite d'abord, Bubble ensuite.
3. **Méthode d'installation du correctif par défaut.** Recommandation : Worker Cloudflare, avec DNS et middleware en alternatives.
4. **Statut juridique** pour encaisser via Stripe.

---

## 11. Sources principales

- Vercel/MERJ, [The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler)
- [Gemini API Additional Terms of Service](https://ai.google.dev/gemini-api/terms)
- [Vercel Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- Prerender.io, [Lovable SEO guide](https://prerender.io/blog/how-to-make-lovable-websites-seo-friendly/)
- Hado SEO, [Lovable SEO guide](https://hadoseo.com/blog/lovable-seo-complete-guide-2026)
- Aria Shaw, [Does llms.txt actually work?](https://ariashaw.com/does-llms-txt-actually-work)
- MENTIA, [comparatif outils GEO français](https://www.getmentia.fr/blog/alternative-qwairy-comparatif-outils-geo-francais)