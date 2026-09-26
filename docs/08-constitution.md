# Constitution Decelio

Ce document fixe les principes non négociables du produit et de son développement. Il prime sur toute décision ponctuelle : une tâche, un ticket ou une demande qui le contredit doit d'abord faire modifier ce texte, par un amendement explicite (voir Gouvernance), pas être exécutée en douce.

Portée : le produit Decelio décrit dans `docs/05-analyse-strategique.md` et `docs/09-prd-mvp.md`. Dépôt de code : `cited/` (Next.js 16, TypeScript strict, Prisma/PostgreSQL, Inngest, Stripe).

## Principes fondateurs

### I. Honnêteté de la mesure avant toute promesse
Decelio vend la preuve d'un problème technique, pas un chiffre séduisant. Toute donnée affichée à un client (verdict, score, historique) doit être :
- **vérifiable** : reliée à une cause identifiable (règle `robots.txt`, code HTTP, challenge, dépendance JS), jamais un score agrégé qui masque la cause ;
- **honnêtement étiquetée** : une requête qui imite l'User-Agent d'un bot IA depuis un serveur non vérifié est présentée comme « requête non vérifiée se présentant comme X », jamais comme « ce que voit GPTBot » (§3.2 de l'analyse stratégique) ;
- **sans faux positif toléré** : une alerte envoyée sans cause confirmée détruit la crédibilité du produit plus vite qu'elle ne le construit. En cas de doute sur la fiabilité d'un signal, le produit affiche « à vérifier », jamais un verdict tranché.
Cette règle prime sur la vitesse de livraison : une fonctionnalité de mesure incertaine reste marquée comme telle dans l'UI jusqu'à preuve du contraire, elle n'est jamais présentée comme définitive pour gagner en clarté perçue.

### II. Aucune fonctionnalité promise n'est laissée non construite
La landing page, la page de tarifs et l'application n'affichent jamais une fonctionnalité qui n'existe pas encore comme si elle existait. Une fonctionnalité prévue mais non livrée est soit absente de l'interface, soit clairement marquée « en préparation », jamais présentée comme active (bouton qui ne fait rien, aperçu figé faisant croire à une donnée réelle, tableau qui affiche des chiffres inventés). Toute maquette d'écran construite avant que le back-end existe doit soit consommer de vraies données dès qu'elles existent, soit rester hors de la navigation accessible aux utilisateurs payants tant qu'elle ne le fait pas.

### III. Sécurité par défaut, jamais en option
- Toute requête sortante du scanner vers une URL fournie par un tiers (scan public ou site surveillé) passe par une validation SSRF : résolution DNS vérifiée, IP privée/loopback/lien-local refusée, protocole limité à `http`/`https`, et **chaque redirection suivie est revalidée** avant d'être suivie (jamais de confiance aveugle dans un en-tête `Location`).
- Toute limitation de débit protégeant une ressource publique (scan gratuit, inscription) est adossée à une ressource partagée entre instances (base de données), jamais à une mémoire de processus qui redevient nulle en environnement sans serveur.
- Les secrets (clés Stripe, Resend, signature Inngest) ne sont jamais commités, jamais journalisés en clair, jamais renvoyés au client.
- Le cycle de vie RGPD (export, purge programmée après résiliation) est un champ de données explicite sur `User`, jamais une suppression manuelle à la discrétion d'un opérateur.

### IV. Rigueur technique : TypeScript strict et tests avant fusion
- `tsc --noEmit` sans erreur, `eslint` sans erreur, `vitest run` vert et `next build` réussi sont les quatre conditions de toute fusion sur la branche principale — aucune n'est optionnelle, aucune n'est contournée par un commentaire de suppression sans justification écrite dans la revue.
- Toute règle métier qui détermine un verdict affiché à un client (statut d'un scan, calcul de quota, transition de plan Stripe) a un test qui couvre au moins le cas nominal et un cas limite documenté.
- Le mode strict de TypeScript n'est jamais relâché pour aller plus vite ; un type `any` non justifié est un défaut, pas un raccourci acceptable.

### V. Accessibilité AA non négociable
Toute interface livrée (marketing, application, e-mails transactionnels, rapport PDF) respecte WCAG 2.1 niveau AA : contraste suffisant, navigation clavier complète, libellés explicites pour les lecteurs d'écran, cibles tactiles d'au moins 44 px. Une fonctionnalité qui ne peut pas être livrée accessible n'est pas livrée dans cet état ; elle est retardée ou simplifiée jusqu'à l'être.

### VI. Simplicité radicale, pensée pour un fondateur solo
Decelio est développé et exploité par une seule personne au stade MVP. Toute décision technique se pose la question : « est-ce que je peux encore comprendre et réparer ceci seul, à 2 h du matin, six mois après l'avoir écrit ? ». En conséquence :
- pas d'infrastructure qu'un fondateur solo ne peut pas superviser (pas de flotte de microservices, pas de file d'attente maison quand Inngest suffit) ;
- toute dépendance nouvelle se justifie par un problème réel déjà rencontré, pas par anticipation ;
- le rendu headless reste l'exception (pages suspectes seulement) tant que le volume ne justifie pas un service dédié payant (§13 de l'analyse stratégique).

### VII. Écriture produit en français clair, sans jargon
Toute UI, tout e-mail transactionnel, toute page publique s'adresse à une freelance ou un fondateur d'agence pressés, pas à un ingénieur. Le vocabulaire technique (robots.txt, challenge, User-Agent) n'est utilisé que lorsqu'il est expliqué en une phrase à côté. Aucune fonctionnalité n'exige un appel commercial pour être comprise ou activée : la vente et l'onboarding sont entièrement écrits et autonomes (§13, décision 2).

## Exigences transverses

- **Stack de référence** : Next.js 16 (App Router), React 19, TypeScript strict, Prisma 5 / PostgreSQL 17, Tailwind 4, NextAuth v5, Stripe, Inngest, Resend.
- **Hébergement et données** : préférence pour un hébergement France/UE des données personnelles ; toute exception est documentée et justifiée.
- **Performance du scan** : un scan d'une URL isolée se termine en moins de 20 s (budget par bot inclus) ; le lot quotidien complet tient dans une fenêtre d'une heure pour 1 000 sites surveillés.
- **Nommage des statuts** : les statuts métier exposés à l'utilisateur (`OK`, `BLOQUÉ`, `COQUILLE VIDE`) restent stables une fois publiés ; un changement de sémantique est un changement de contrat, documenté dans le PRD concerné avant d'être codé.

## Portes de qualité (obligatoires avant toute fusion)

| Porte | Commande | Doit être |
|---|---|---|
| Typage | `npx tsc --noEmit` | Sans erreur |
| Style et bonnes pratiques | `npm run lint` | Sans erreur |
| Tests unitaires et d'intégration | `npx vitest run` | Vert, aucun test ignoré sans justification écrite |
| Build de production | `npm run build` | Réussi |

Une pull request qui ne satisfait pas les quatre portes n'est pas fusionnée, y compris pour une correction urgente : on corrige la porte qui échoue, on ne la contourne pas.

## Gouvernance

- Cette constitution prime sur toute pratique contraire observée dans le code existant : un écart constaté (par exemple un User-Agent imité non étiqueté, un correctif marqué « en préparation » qui s'affiche comme actif) est une dette à corriger, pas un précédent à suivre.
- **Amendement** : toute modification d'un principe est écrite dans ce fichier, avec la date, la raison du changement et son impact sur les documents qui en dépendent (`docs/09-prd-mvp.md` notamment). Un amendement silencieux (changement de pratique sans mise à jour de ce texte) n'a pas de valeur.
- **Revue** : toute pull request touchant à la mesure du scanner, à la sécurité, à la facturation ou à une donnée personnelle est relue à la lumière des principes I, III et IV avant d'être fusionnée.
- Ce document est à la racine de `docs/` et fait autorité sur `PROGRESS.md`, `tasks/mvp-tasks.md` et tout autre document opérationnel en cas de contradiction.

**Version** : 1.0.0 | **Ratifiée** : 24 septembre 2026 | **Dernier amendement** : 24 septembre 2026
