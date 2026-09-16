# Projet « Cited » — dossier de conception

SaaS de visibilité de marque dans les moteurs de réponse IA, vendu en self-serve aux petites marques, SaaS solo et consultants SEO indépendants. Le produit ne se contente pas de mesurer : il **génère les correctifs** (contenu, JSON-LD, `llms.txt`).

## Ordre de lecture

| # | Document | Contenu | Statut |
|---|---|---|---|
| 0 | [`00-demarrage-budget-zero.md`](./00-demarrage-budget-zero.md) | **Commencer ici.** Stratégie à budget zéro : l'audit public gratuit comme funnel | ✅ Mis à jour — pivot self-serve |
| 1 | [`01-plan-business.md`](./01-plan-business.md) | Marché, positionnement, tarification, économie unitaire, go-to-market, risques | ✅ Mis à jour — pivot self-serve |
| 2 | [`02-cahier-des-charges.md`](./02-cahier-des-charges.md) | Spécifications fonctionnelles et techniques, modèle de données, lots | ✅ Mis à jour — modèle simplifié |
| 3 | [`03-direction-design.md`](./03-direction-design.md) | Direction artistique, jetons de design, prompts Stitch prêts à coller | ✅ Mis à jour — écrans adaptés |
| 4 | [`04-brief-developpeur.md`](./04-brief-developpeur.md) | Message de cadrage (contexte historique) | ⚠️ Obsolète — le dev c'est nous |
| 5 | [`05-strategie-marketing.md`](./05-strategie-marketing.md) | Canaux d'acquisition automatisables, Baromètre, mesure | ✅ Mis à jour — plus de prospection/démos |

## En un paragraphe

Le SEO bascule vers les moteurs de réponse IA. Les petites marques ne savent pas si ChatGPT ou Perplexity les citent, et n'ont personne pour corriger ça. Les outils GEO existants mesurent, mais **aucun ne génère les correctifs**. On comble ce trou : mesure + diagnostic + contenu corrigé + JSON-LD + `llms.txt`, le tout en self-serve à 29-79 €/mois, sans jamais parler à personne.

## Le pivot (16 sept. 2026)

| | Avant | Maintenant |
|---|---|---|
| **Client** | Agences SEO | Petites marques, SaaS solo, consultants SEO |
| **Prix** | 149–699 €/mois | 29–79 €/mois, carte bancaire, sans appel |
| **Différenciation** | Marque blanche multi-clients | On corrige, on ne se contente pas de mesurer |
| **Acquisition** | Prospection + démos | Audit public + pages programmatiques + email auto |
| **Complexité technique** | Multi-tenant, rôles, quotas, marque blanche | Bien plus simple — le multi-tenant agence disparaît |

## État d'avancement

- [x] Sélection de l'idée parmi 50 candidates, avec validation marché
- [x] Plan business — mis à jour avec le pivot
- [x] Cahier des charges — simplifié, multi-tenant supprimé
- [x] Stratégie de financement à budget zéro — recentrée sur le self-serve
- [x] Direction artistique et prompts de maquettage — adaptée
- [x] Stratégie marketing — recentrée sur 3 canaux automatisables
- [ ] Teardown concurrentiel détaillé *(relancé)*
- [ ] **Nom du produit — 3 candidats en lice, non tranché**

| Nom | Domaines libres au 16/09/2026 | Force | Faiblesse |
|---|---|---|---|
| **Jauge** | `jauge.io` **et** `jauge.ai` | Mot d'instrument, cohérent avec la direction design ; les 2 extensions disponibles | Imprononçable pour un anglophone |
| **Indice** | `indice.io` seulement | Très naturel en français, marche en ES/IT/PT | `.com`, `.ai`, `.fr` déjà pris — marque non maîtrisée |
| **Pythie** | `pythie.io` seulement | L'oracle de Delphes, concept parfait, mémorable | Obscur, orthographe piégeuse, `.ai` et `.com` pris |

Vérification INPI à faire avant tout achat. `Cited` reste le nom de code dans les documents.

- [ ] Maquettes générées via Stitch
- [x] ~~Script d'audit Phase 0 — confié au développeur~~ → Devient l'audit public intégré au produit
- [ ] 100 premiers utilisateurs de l'audit gratuit
