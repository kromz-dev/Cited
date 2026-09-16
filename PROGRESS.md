# Cited — état du projet et reprise

Ce document est la source de vérité. Il doit suffire à reprendre le projet sans rien d'autre.

**Dépôt :** https://github.com/kromz-dev/Cited (privé) · branche `main`
**Stack :** Next.js 16 · React 19 · TypeScript strict · Prisma 5 · PostgreSQL 17 · Tailwind 4 · NextAuth v5 · Stripe · Inngest
**Dernière session :** 16 septembre 2026

---

## Reprendre en 5 commandes

```bash
cd /mnt/c/Users/kkace/Desktop/saas/SAAS_1/cited
sudo service postgresql start          # PostgreSQL 17 natif WSL, base `cited`, rôle `cited`
npx prisma generate
npx tsc --noEmit                       # doit rendre 0 erreur — c'est l'oracle actuel
npm run dev
```

Variables d'environnement : voir `.env.example`, toutes documentées.
Présentes et vérifiées : `DATABASE_URL`, `AUTH_SECRET`, `GEMINI_API_KEY` (testée, HTTP 200), `GROQ_API_KEY`.
Manquantes : `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `INNGEST_SIGNING_KEY`, `STRIPE_*`, `RESEND_API_KEY`, `ENGINE_CACHE_SECRET`.

---

## ⚠️ Décision en attente : stratégie v3

`docs/01-plan-business.md` a été réécrit en **v3** le 16 septembre 2026. Le produit y change de nature : il ne vend plus une mesure de visibilité, il vend un **correctif technique vérifiable** — les robots des IA n'exécutent pas le JavaScript, donc ils reçoivent une page vide, et le produit corrige ça puis surveille que ça le reste.

**Tant que cette v3 n'est pas validée ou rejetée, les priorités ci-dessous sont incertaines.** Si elle est retenue, le moteur de campagne, le score et la matrice de couverture ne sont plus le produit : ils deviennent la preuve que le correctif fonctionne. Le travail reste utile, mais les défauts de notation listés plus bas perdent en priorité.

### Critique de la v3 — huit points, par impact

1. **Le marché rétrécit par construction.** L'ICP est Lovable / Bolt / Bubble / SPA. Lovable livre déjà le rendu serveur natif pour les sites déployés après le 20 avril 2026. Le marché adressable est donc un stock qui diminue chaque mois. Ce qui survit aux correctifs de plateforme : un pare-feu qui bloque `ClaudeBot`, un redéploiement qui casse le rendu, un `robots.txt` modifié par erreur. **Conséquence : vendre la veille, offrir le correctif à l'installation.** La feuille de route fait actuellement l'inverse.

2. **La fonctionnalité manquante qui vaut le plus cher : les journaux de passage des robots.** Le scanner vérifie ce que le robot reçoit, jamais s'il est venu. Dès que le proxy de pré-rendu est installé, chaque visite de `GPTBot`, `ClaudeBot`, `PerplexityBot` et `OAI-SearchBot` est visible. Cela donne d'un coup la preuve de valeur (« ChatGPT a lu 34 pages ce mois-ci, contre 0 avant »), une donnée propriétaire que personne d'autre ne possède, et un verrou — six mois d'historique ne se remplacent pas. Absent du document.

3. **Pré-rendu réservé aux robots = question de cloaking inutile.** La parade retenue (servir le même contenu rendu) est la bonne, mais Google a déprécié le rendu dynamique en 2022, et OpenAI comme Anthropic vérifient leurs robots par plages d'IP : un robot arrivant avec un agent utilisateur banal reçoit la page vide et le client se croit corrigé. **Servir le HTML pré-rendu à tout le monde** supprime la question entièrement et profite aux visiteurs humains. Le cache rend l'argument du coût sans objet.

4. **La rétention n'a pas de réponse.** Le produit prouve que le robot reçoit une page vide, et refuse à raison de promettre une citation. Au mois 2, la seule raison de continuer à payer est la peur, qui convertit une fois mais ne retient pas. La réponse réelle est la veille plus le point 2 : les mettre au centre du prix, pas le correctif qui est un travail ponctuel.

5. **Le seuil de décision de la semaine 2 s'auto-valide.** « Moins de 15 % des sites scannés ont un problème réel » ne veut rien dire sans base de sondage définie. Scanner la vitrine Lovable donnera plus de 80 % sans rien apprendre. Et un taux élevé doit l'être chez des gens qui paieraient.

6. **La garantie ne coûte rien, donc elle ne vaut rien.** La grille passe au vert par construction puisque le pré-rendu est maîtrisé. Porter la garantie sur ce qui n'est pas totalement maîtrisé : le délai d'alerte en cas de régression.

7. **Prix et ICP se contredisent.** Facturation au site et à la page, ICP fondateur solo avec un site : il reste en Solo à 29 € pour toujours, aucune expansion. Le plan Agence à 149 € est traité en cible secondaire alors que les agences no-code ont le stock de sites touchés **et** le flux des nouveaux.

8. **« Coût de l'échec : ~6 semaines et < 50 € »** — le montant est exact et trompeur. La ressource rare n'a jamais été l'argent. Écrire « 6 semaines » seul, sinon le seuil d'arrêt paraît indolore et sera franchi.

**Sur le nom « Jauge » :** bon choix, court, instrument de mesure, cohérent avec la direction artistique. Réserve : l'anglais est prévu au mois 3 et « Jauge » ne voyage pas. Vérifier `jauge.fr` et un équivalent international avant de s'engager.

### Vérification des faits, 16 septembre 2026

Trois affirmations portantes de la v3 ont été vérifiées sur le web. La deuxième invalide une partie de la stratégie.

**✅ Les robots IA n'exécutent pas le JavaScript — confirmé, et plus fortement que le document ne l'écrit.** La documentation des fournisseurs jusqu'au deuxième trimestre 2026 confirme que `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `PerplexityBot`, `Bytespider` et `CCBot` n'exécutent aucun JavaScript. Une analyse Onely de février 2026 conclut que 42 % du contenu rendu en JavaScript n'est jamais indexé par les systèmes IA. La fondation technique du produit tient.

*Nuance défavorable :* Google AI Overviews hérite du rendu de Googlebot et Copilot hérite de celui de Bing. Le document affirme que ChatGPT s'appuie sur l'index Bing « dont le rendu JavaScript est limité ». Si Bing rend le JavaScript, l'argument s'affaiblit précisément sur ChatGPT, qui est l'accroche commerciale. À vérifier avant le premier envoi d'emails froids.

**🔴 Lovable n'est plus une cible : la plateforme livre elle-même le produit, gratuitement.** La documentation Lovable indique que les anciennes applications React + Vite bénéficient d'un pré-rendu à la demande, « servi uniquement aux robots vérifiés : Google, Bing, robots d'aperçu social, et moteurs IA comme ChatGPT, Perplexity, Claude et Gemini ». C'est exactement la brique n°2 de la v3. La même documentation précise que la revue SEO et IA est gratuite sur tous les plans.

Le §2.2 du plan est donc faux : le rendu serveur natif ne couvre pas seulement les sites déployés après le 20 avril 2026. Les nouvelles applications passent en SSR TanStack Start depuis le 13 mai 2026, **et les anciennes reçoivent le pré-rendu destiné aux robots**. Les deux populations sont couvertes.

**Conséquence sur la stratégie.** Le marché Lovable n'est pas en train de rétrécir, il est fermé, et c'était la première ligne de l'ICP. Restent Bubble, Bolt et les SPA maison, plus les trois problèmes qu'aucune plateforme ne corrige : un pare-feu ou un CDN qui bloque un robot, un `robots.txt` qui interdit `OAI-SearchBot` par copier-coller, un site absent de Bing — auxquels s'ajoutent les régressions après redéploiement. L'objection n°1 ci-dessus était juste mais trop prudente : **vendre la veille devient la seule voie, le pré-rendu est désormais une commodité offerte par les plateformes.** Retirer Lovable de l'échantillon de la semaine 2, sinon la validation mesurera un problème déjà résolu.

**✅ Le quota gratuit Gemini est interdit dans l'EEE, la Suisse et le Royaume-Uni — confirmé.** Les conditions imposent les services payants dès lors que l'on met une application à disposition d'utilisateurs de ces zones. La première prémisse de la v3 est exacte.

Sources : [Vercel/MERJ](https://vercel.com/blog/the-rise-of-the-ai-crawler) · [Lovable, SEO et AEO](https://docs.lovable.dev/features/seo-aeo) · [Gemini API, conditions additionnelles](https://ai.google.dev/gemini-api/terms)

---

## Décisions arrêtées

| # | Décision | Pourquoi |
|---|---|---|
| D1 | Tenant = `User → Brand`. Vente directe à la marque, self-serve, funnel d'audit gratuit. | Pivot assumé. La marque blanche pour agences du cahier des charges est écartée. `docs/02` décrit un autre produit sur ce point. |
| D2 | Dépôt unique à la racine : code, spécifications et connecteurs partagent une histoire. | Le projet survit au départ de n'importe qui. |
| D3 | Dépôt privé. | `docs/` contient le plan business et la grille tarifaire. |
| D4 | PostgreSQL dès le développement, jamais SQLite. | Les enums, tableaux et `Json` ne survivent pas à une migration tardive. Parité avec Neon, même version majeure. |
| D5 | N appels par couple requête/moteur (défaut 3), score publié avec sa marge d'erreur à 95 %. | Les moteurs ne sont pas déterministes. Un appel unique mesure du bruit. |
| D6 | Seul un moteur **ancré** peut mesurer. `GEMINI` mesure, `GROQ` juge et génère. | Voir R1 ci-dessous. |
| D7 | Nom du produit. `Cited` reste un nom de code. | ⏳ Ouvert. Ne bloque rien : le rapport client ne doit porter aucune trace du produit. |

---

## Risques ouverts

**R1 — Moteur de mesure. RÉSOLU au niveau du code, à vérifier en conditions réelles.**
`GROQ` (`llama-3.3-70b-versatile`) n'a aucun accès web. Son message système lui demandait de se comporter comme s'il disposait d'une base RAG temps réel et de citer « des URLs réelles (ou très probables) ». Ces citations inventées partaient en base puis à l'écran comme des sources relevées. Le registre `lib/engines/index.ts` classe désormais chaque moteur en `GROUNDED` / `UNGROUNDED`, et `getMeasurementEngine()` refuse un moteur non ancré. Campagnes et audit public passent par `GEMINI`. **Reste à faire : lancer une vraie campagne et vérifier que les citations Gemini correspondent à des pages existantes.**

**R2 — Aucun test exécutable.** `vitest` échoue sur un binaire natif absent : `Cannot find native binding` (bug npm sur les dépendances optionnelles, `node_modules` résolu pour Windows alors qu'on exécute sous Linux). Les 33 tests de `mention-detector.test.ts` n'ont jamais tourné dans leur lanceur. Trois sorties possibles : installer `@rolldown/binding-linux-x64-gnu` à la version de `rolldown` ; supprimer `package-lock.json` et `node_modules` puis `npm i` ; ou basculer sur `node --test`, natif et sans installation — **option recommandée, validée en pratique pendant la session**.

**R3 — Coût réel non mesuré.** `ApiCall` journalise chaque appel, mais `costUsd` vaut 0 pour Gemini et Groq tant qu'on est sous les offres gratuites. Le critère « le coût réel par appel est mesurable » n'est donc pas encore satisfait en conditions payantes.

---

## Ce qui est fait

- Dépôt Git à la racine, poussé sur GitHub en privé, branche `main` à jour.
- PostgreSQL 17.11 local, base et rôle créés, migration initiale versionnée.
- Schéma Prisma complet en PostgreSQL avec enums, tableaux et `Json` natifs.
- Modèles NextAuth `Account`, `Session`, `VerificationToken` — sans eux la connexion Google échouait silencieusement.
- `lib/db.ts` correctement typé. Les `@ts-ignore` précédents rendaient le typage inopérant et masquaient quatre erreurs réelles.
- Répétitions par couple requête/moteur, contrainte unique élargie, marge d'erreur à 95 % calculée.
- Idempotence de campagne sur le créneau planifié, reprise après incident sans doublon.
- Texte et version de requête figés sur le run ; suppression logique des prompts.
- Panier de moteurs figé sur la campagne.
- Runs en échec exclus du score : une panne moteur ne se lit plus comme une perte de visibilité.
- Journal `ApiCall` par appel, avec objet et coût.
- Compteurs d'usage séparant runs vendus et appels réellement payés.
- Détection de mention : frontières Unicode, position calculée dans le bloc de liste, `null` hors liste, alias, repliage d'accents préservant les index. 33 cas de test écrits.
- Juge LLM : injection de prompt colmatée, données non fiables sorties du message système, validation par schéma Zod, arbitrage contre la détection lexicale.
- Registre de moteurs ancrés / non ancrés, mesure refusée sur un moteur non ancré.
- Cinq bloquants de sécurité corrigés (voir ci-dessous).

### Sécurité — bloquants corrigés

| Trouvaille | Correction |
|---|---|
| `AUTH_SECRET` était un texte de remplacement. En session JWT, cela permettait de forger le jeton de n'importe quel compte et annulait tous les filtres `userId`. | Remplacé par 44 caractères aléatoires. |
| `launchAuditCampaign` s'exécutait sans `auth()`, sur un `brandId` reçu du client. Une Server Action est un point d'entrée public ; le middleware ne la protège jamais. | Session vérifiée, marque résolue via `userId`, marque d'autrui indiscernable d'une marque inexistante. |
| `/api/inngest` acceptait tout POST anonyme et déclenchait une campagne sur n'importe quelle marque. Le `matcher` du middleware exclut `/api`. | Clé de signature portée par le client, refus de démarrage en production sans elle. |
| `/api/audit`, public, sans validation ni plafond. | Schéma Zod strict sur le domaine, plafond horaire par appelant adossé à PostgreSQL — un compteur en mémoire est multiplié par le nombre d'instances. |
| Paiement : le client transmettait un identifiant de tarif Stripe libre, et le webhook écrivait `plan: "PRO"` en dur. On payait le tarif le plus bas et on recevait PRO. | Le client transmet un nom de plan, le serveur détient la table des tarifs, le webhook déduit le plan du prix que Stripe confirme et n'accorde rien sur un tarif inconnu. |

Idempotence Stripe rendue transactionnelle, rejeu traité en succès, fin de période lue sur la ligne d'abonnement là où Stripe l'a déplacée, rétrogradation effective, `cancelledAt` et `purgeAt` renseignés à la résiliation.

---

## Défauts du système d'analyse et de notation

Diagnostic complet, non corrigé. C'est le travail le plus rentable qui reste.

**Analyse**

1. **Le sentiment n'entre pas dans le score.** « Cette marque est à éviter » compte comme une citation réussie. Le champ existe et dort.
2. **Références implicites perdues.** L'arbitre est lexical : « la plateforme leader de prise de rendez-vous médicaux » ne compte pas. Sous-comptage systématique.
3. **Trois signaux de proéminence, un seul utilisé.** `brandPosition` alimente le score ; `positionScore` et `entitySalience` coûtent un appel de juge et ne servent à rien.
4. **Le juge est juge et partie.** Un seul appel Groq produit 10 champs à température 0,1 : ils se corrèlent. Apparence de mesures indépendantes issues d'un jugement unique.
5. **`hallucinations` vaut faux par construction.** Sans `groundTruth`, l'instruction impose `claimsCorrect = claimsGenerated`. Métrique qui semble mesurée et ne l'est pas.
6. **Les concurrents n'ont pas d'alias.** Correspondance exacte en minuscules : « Doctolib », « doctolib.fr » et « Doctolib SAS » sont trois entités. On rate des mentions concurrentes, donc **on gonfle sa propre part de voix**. Le biais va dans le sens flatteur.

**Notation**

7. **Défaut principal — le score fusionne deux faits opposés.** Avec la pondération 100/80/60/40/20 : marque citée 100 % du temps au rang 5 → 20 ; marque citée 20 % du temps au rang 1 → 20. Situations inverses, actions inverses, même chiffre. **Séparer en taux de citation et rang moyen quand cité.**
8. **L'échelle de position est une convention, pas une mesure.** Linéaire alors que l'attention ne l'est pas. À assumer comme convention affichée.
9. **`scoreMarginOfError` est calculé et jamais montré.** Sans lui, le travail sur les répétitions est perdu. Ne pas tracer de tendance avant 6 campagnes.
10. **La part de voix contredit le score.** Elle compte des mentions brutes quand le score pondère par position, et écrase tous les concurrents dans un seul seau — impossible de dire lequel gagne, alors que c'est l'information la plus actionnable. Le schéma sait le faire, le code l'aplatit.
11. **Le panier de requêtes n'est pas figé entre campagnes.** Le texte est figé sur le run, mais l'ensemble peut changer. Régénérer les prompts déplace le score sans qu'aucune visibilité n'ait bougé. Il faut un identifiant de panier sur la campagne, et refuser de tracer une courbe entre deux paniers différents.
12. **Un score absolu ne veut rien dire.** « 34/100 » n'est actionnable pour personne. Le chiffre de tête devrait être le rang parmi les marques suivies ou l'écart au leader.

---

## Prochaines étapes, par rentabilité

1. **Séparer taux de citation et rang moyen** (défaut 7). Change ce qui est vendu, pas seulement le code.
2. **Alias de concurrents** (défaut 6). Biais flatteur, corruption silencieuse de la part de voix.
3. **Intégrer le sentiment au score** (défaut 1). Une mention négative n'est pas un succès.
4. **Figer le panier de requêtes** (défaut 11). Sans cela aucune courbe n'est comparable.
5. **Basculer sur `node --test`** (R2). Rend les 33 tests existants exécutables, sans installation.
6. **Lancer une campagne réelle sur Gemini** et vérifier que les citations pointent vers des pages existantes (R1).
7. **Afficher la marge d'erreur** dans la matrice de couverture (défaut 9).
8. Nettoyer ou justifier les métriques RAG (défauts 3, 4, 5).

### Sécurité, points sérieux restants

- Validation et quotas sur `createBrand` et `detectBrand` — appels LLM déclenchables sans contrôle.
- Échappement HTML et limitation de débit sur `captureLead` et l'envoi Resend : `domain` est interpolé dans un `href` sans échappement, ce qui permet d'envoyer un courriel d'hameçonnage depuis le domaine du produit.
- Middleware en refus par défaut avec liste blanche publique.
- Export et suppression de compte. `cancelledAt`, `purgeAt` et `dataExportedAt` existent au schéma et ne sont lus nulle part.
- Épingler la version d'API Stripe et retirer le repli `sk_test_dummy` qui masque une mauvaise configuration.

### Module prévu, non écrit

`lib/cache/engine-cache.ts` — le modèle `EngineCache` existe au schéma, le module a été spécifié puis interrompu. Contraintes retenues : empreinte en HMAC avec secret serveur et séparateurs explicites, version de modèle incluse, durée de vie par famille de requête (`PROBLEM` 14 j, `DISCOVERY` et `SOLUTION` et `COMPARISON` 7 j, `BRAND` 48 h), **durée de vie intra-marque nulle** pour qu'une marque ne se voie jamais servir sa propre réponse précédente, un seul mécanisme d'expiration et non un seau calendaire doublé d'un `expiresAt`, et `fromCache` jamais exposé à l'utilisateur car il révèle qu'un autre compte suit le même prompt.

---

## Journal

### 2026-09-16
- Dépôt restructuré à la racine, poussé sur GitHub en privé.
- PostgreSQL 17.11 installé localement, base `cited` créée, migration initiale versionnée.
- Schéma migré de SQLite vers PostgreSQL avec correctifs d'intégrité : modèles NextAuth manquants, répétitions de run, gel du texte de requête, clés étrangères composites, relation `CompetitorMention` vers `Competitor`, unicité `(runId, url)` sur les citations, colonnes de bail pour l'exécution durable, tables `ApiCall` et `RateLimit`, compteurs séparant runs vendus et appels payés.
- Moteur de campagne réécrit : répétitions, idempotence sur créneau, reprise sans doublon, marge d'erreur.
- Détection de mention corrigée et couverte de 33 cas.
- Juge LLM durci contre l'injection de prompt, validation Zod, arbitrage du verdict.
- Séparation des moteurs ancrés et non ancrés ; mesure routée vers Gemini.
- Cinq bloquants de sécurité corrigés.
- Travail livré en cinq branches puis fusionné dans `main`. `tsc --noEmit` rend 0 erreur.
