# Stratégie marketing

> **Version :** 2.0 · **Date :** 16 septembre 2026 · Produit désigné par son nom de code `Cited`
>
> ⚠️ **Pivot.** Ce document a été refondu. La prospection sortante vers les agences, les démos et l'offre membre fondateur sont abandonnés. L'acquisition est désormais 100 % automatisable : audit public, pages programmatiques, email froid vers l'inscription.

---

## 1. L'idée directrice

**Inchangée.** On vend de la visibilité dans les moteurs IA. Notre propre visibilité dans les moteurs IA est la démonstration du produit.

Tout découle de là. Un concurrent peut copier une fonctionnalité en trois mois. Il ne peut pas copier le fait que ChatGPT nous cite quand on lui demande qui mesure la visibilité IA.

La marketing n'est pas à côté du produit, c'est sa preuve.

---

## 2. Positionnement

```
POUR      les petites marques, SaaS solo et consultants SEO indépendants
QUI       ne savent pas si les moteurs IA les citent
          et n'ont personne pour corriger ça
CITED     est un outil qui mesure la visibilité IA et génère les correctifs
QUI       produit les actions concrètes à appliquer (contenu, JSON-LD, llms.txt)
CONTRAIRE aux outils existants (Peec, Qwairy, Profound, Otterly)
          qui se contentent de mesurer
NOUS      sommes le seul outil qui corrige, pas seulement un tableau de bord de plus
```

**La phrase à retenir :** « L'outil qui corrige ta visibilité IA, pas seulement un tableau de bord de plus. »

**Ce que ça exclut délibérément :** les grands comptes, les agences (elles veulent la marque blanche, qu'on ne fait plus), les entreprises avec équipe SEO interne.

---

## 3. Principe d'exécution : les trois canaux simultanés, tous automatisables

~~À budget zéro et en solo, la dispersion est le risque. On n'ouvre pas un deuxième canal tant que le premier n'a pas produit.~~ **Nouveau principe :** les trois canaux sont automatisables et ne nécessitent aucun appel ni démo. On les construit ensemble.

| Canal | Ce que c'est | Effort humain | Coût |
|---|---|---|---|
| L'audit public gratuit | Page web, résultat en 30s | Aucun après construction | 0 € (Gemini gratuit) |
| Les pages programmatiques | Milliers de pages "[Marque] + ChatGPT" | Aucun après construction | 0 € |
| L'email froid → inscription | Audit envoyé, lien vers le produit | Script + liste d'emails | ~0 € |

---

## 4. Canal 1 — L'audit gratuit public (le funnel principal)

**Le principe :** ne jamais présenter l'outil. Montrer le résultat.

L'utilisateur ne s'inscrit pas pour essayer. Il colle son domaine et voit son diagnostic en 30 secondes. C'est à la fois le produit d'appel, la démo et l'argument.

### Comment ça fonctionne

```
Visiteur → entre son domaine + nom de marque
   ↓
Résultat instantané (grille, score, concurrents) — sans inscription
   ↓
"Recevoir le rapport complet" → saisie email = lead capturé
   ↓
"Suivre ma marque + recevoir les correctifs" → inscription self-serve
```

### Contraintes vérifiées

- 5 requêtes × 1 moteur (Gemini gratuit) = 5 appels par audit.
- 500 requêtes ancrées/jour = **100 audits/jour à zéro euro**.
- L'audit complet prend < 30 secondes.

### Métriques

| Indicateur | Cible |
|---|---|
| Audits réalisés / jour | > 50 |
| Taux de capture email | > 20 % |
| Email → inscription payante | > 5 % |
| Audit → inscription directe | > 1 % |

---

## 5. Canal 2 — Les pages programmatiques

### Le principe

Notre outil génère une donnée que personne d'autre ne possède : quelles marques les moteurs IA citent réellement. On la publie.

> **« [Marque] est-elle citée par ChatGPT ? » — Résultat mis à jour le 15 septembre 2026**
> Sur 15 requêtes testées, [Marque] apparaît dans 3 réponses. Son concurrent [Y] dans 11.

Des milliers de pages, une par marque connue, générées automatiquement.

### Pourquoi c'est le meilleur contenu possible

| Effet | Mécanisme |
|---|---|
| **Les moteurs IA le citent** | C'est de la donnée primaire, chiffrée, datée — le profil de source que les moteurs retiennent |
| **Il se démontre lui-même** | Quand ChatGPT cite notre page, c'est une démonstration du produit par le produit |
| **Il convertit directement** | Chaque marque mal classée est un prospect qui tombe sur sa propre page et veut corriger |
| **Il ne coûte presque rien** | C'est l'outil qui le fabrique |

### La boucle vertueuse

```
L'outil produit la donnée
   └─> Les pages publient la donnée
      └─> Les moteurs IA citent les pages
         └─> Les marques découvrent Cited par ChatGPT
            └─> Elles font l'audit gratuit
               └─> Elles s'abonnent
                  └─> Plus de données, plus de pages
```

---

## 6. Canal 3 — L'email froid vers l'inscription

**Pas vers un appel. Jamais.** Le lien mène au produit, pas à un agenda.

### Le message

> **Objet :** Votre marque est citée 2 fois sur 15 par ChatGPT
>
> [Prénom],
>
> J'ai fait passer [domaine] dans notre outil de mesure de visibilité IA.
>
> Votre marque ressort dans 2 réponses sur 15. [Concurrent] dans 11.
>
> Le rapport complet est ici : [lien vers l'audit public pré-rempli]
>
> Si vous voulez corriger ça, l'outil génère le contenu à modifier, le JSON-LD à ajouter et le fichier llms.txt à mettre en place : [lien inscription]

**Pourquoi ce message fonctionne :**

| Choix | Raison |
|---|---|
| L'objet est un constat, pas une offre | Information, pas publicité |
| Le rapport est déjà fait | On donne avant de demander |
| On ne propose jamais d'appel | Le oui est facile |
| Le CTA mène à l'action, pas à un rendez-vous | Self-serve |

### Le rythme

- Liste : 200 marques/SaaS francophones identifiés via les pages programmatiques.
- Audit pré-généré pour chacune (coût : ~0 € via le quota gratuit).
- Séquence : Email 1 avec le rapport → relance J+4 → dernier angle J+10.
- **Pas de démo. Pas d'appel. Le lien mène au produit.**

---

## 7. Le Baromètre — donnée propriétaire (inchangé dans le principe)

> **Baromètre de la visibilité IA — Logiciels de facturation, septembre 2026**
> Les 10 marques les plus citées par ChatGPT, Perplexity et Google AI Overviews.

Un baromètre par secteur. Douze secteurs sur l'année. C'est la partie qui construit un avantage durable.

### Le pré-requis technique

**Vérifier le `robots.txt` avant toute chose.** Si `GPTBot`, `PerplexityBot`, `ClaudeBot` ou `Google-Extended` sont bloqués, le site est invisible pour les moteurs IA.

### Ce qui rend un contenu citable

- Un chiffre vérifiable tous les deux paragraphes
- Une date explicite et une période de mesure
- Une méthodologie publiée, reproductible
- Du balisage `JSON-LD` sur les données du classement
- Une section questions/réponses

---

## 8. Ce qu'on ne fait pas

| Canal | Pourquoi non |
|---|---|
| **Démos en visio** | On ne fait pas d'appels. Le produit se vend seul. |
| **Prospection agences** | Plus notre cible |
| **Google Ads** | Budget zéro, enchères trop élevées |
| **LinkedIn Ads** | Même raison |
| **Contenu SEO générique** (« qu'est-ce que le GEO ») | Cinquante sites publient déjà ça |
| **Product Hunt** | Mauvaise cible pour les petites marques francophones |
| **Appels à froid** | Jamais. Le lien mène au produit, pas à l'agenda |

---

## 9. Mesure

### Funnel principal

| Étape | Indicateur | Cible |
|---|---|---|
| Visiteur → audit | Taux d'utilisation | > 30 % des visiteurs |
| Audit → email capturé | Taux de capture | > 20 % |
| Email → inscription payante | Taux de conversion | > 5 % |
| Inscription → rétention M2 | Rétention | > 60 % |

### Seuils de décision

| Résultat après 30 jours en ligne | Décision |
|---|---|
| > 50 audits/jour + > 5 inscriptions payantes | ✅ On construit la V1 complète |
| 10-50 audits/jour, 1-4 inscriptions | 🟡 Funnel à optimiser |
| < 10 audits/jour | 🔴 Trafic insuffisant → pages programmatiques + email |
| 0 inscription après 60 jours | 🔴 **Stop.** Coût de l'échec : ~12 € |

### Pages programmatiques

| Indicateur | Cible à 6 mois |
|---|---|
| Pages publiées | > 1 000 marques |
| Citations obtenues dans les moteurs IA | Cité sur au moins 10 requêtes |
| Trafic organique | > 500 visites/mois |

Le suivi de nos propres citations se fait avec notre propre outil.

---

## 10. Les trois prochaines actions

| # | Action | Prérequis |
|---|---|---|
| 1 | Construire l'audit public gratuit (lot P0) | Clé API Gemini |
| 2 | Déployer sur Vercel, tester sur 5 domaines réels | P0 terminé |
| 3 | Mesurer le funnel pendant 30 jours | Déploiement |

L'action 1 est en cours. Tout le reste en découle.
