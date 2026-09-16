# Cited — Le Scanner Black-Box (Pivot Agence)

## Problem Statement
Comment pourrions-nous garantir aux agences No-Code (Bubble, Bolt) que les sites de leurs clients restent parfaitement lisibles et indexables par les IA (ChatGPT, Claude) sans exiger d'elles des intégrations techniques complexes (middlewares) qui sont de toute façon bloquées par ces plateformes fermées ?

## Recommended Direction
Nous abandonnons l'idée d'un "middleware npm" (qui ratait la cible no-code) et l'idée de vendre du pré-rendu (qui devient une commodité gratuite chez Lovable ou low-cost chez les concurrents).

Le produit pivote vers une solution d'audit externe zéro-friction : le **Scanner Black-Box**. 
Notre infrastructure (Cited) va tester de l'extérieur les URLs des clients de manière planifiée, en usurpant le User-Agent des bots IA (ex: `GPTBot`). Si la requête échoue (Erreur 403 WAF) ou retourne un HTML vide de contenu sémantique, une alerte est déclenchée. 

Nous vendons la *Peace of Mind* (Tranquillité d'esprit) aux agences No-Code. Elles branchent les domaines de leurs clients sur Cited. Si une mise à jour de la plateforme (Bubble/Cloudflare) casse le rendu SEO IA, l'agence est alertée immédiatement, avant même que son client ne s'en rende compte.

## Key Assumptions to Validate
- [ ] **Volonté de payer pour la veille :** Les agences sont prêtes à payer un abonnement mensuel (ex: 99€/mois) simplement pour surveiller l'état de la visibilité IA de leurs sites. *(Test : Pitcher l'offre "Dashboard Agence" à 5 agences no-code).*
- [ ] **Détection de "coquille vide" externe :** Notre scanner peut déterminer de manière fiable si une page sans JavaScript est exploitable ou non (texte pertinent > 200 caractères). *(Test : Construire la v1 du moteur de scan).*
- [ ] **Comportement des WAF :** Les hébergeurs (Cloudflare) ne bloquent pas globalement nos IPs de scan lorsqu'on simule un bot IA. *(Test : Scaler le scanner sur 100 URLs).*

## MVP Scope (La route vers 1000€ d'ARR)
- **Le Moteur de Scan Automatisé :** Un script en tâche de fond (Inngest/Cron) qui boucle sur les URLs surveillées, fait un `fetch` avec le User-Agent `GPTBot`, et vérifie la réponse (Status HTTP, taille du body, mots pertinents).
- **Le Lead Magnet (Acquisition Gratuit) :** Un champ de test sur la landing page permettant de scanner une URL instantanément.
- **Le Dashboard Agence (Payant) :** Une interface listant les X sites surveillés de l'agence, avec une grille de statut (Vert = IA OK, Rouge = Bloqué ou Vide).
- **Système d'Alerting :** Envoi d'un webhook ou d'un message Slack à l'agence lors d'une régression (Vert -> Rouge).

## Not Doing (and Why)
- **PAS d'installation chez le client (package npm, script) :** L'onboarding doit prendre 10 secondes (entrer une URL). On ne touche pas au code du client.
- **PAS de proxy de pré-rendu propriétaire :** On audite, on ne corrige pas à leur place. La correction se fait sur leur plateforme (options natives de Bubble, etc.). 
- **PAS de modèle de prix "Solo" à 9€ :** Le B2C/Solo churn trop vite. On vise directement les agences à 99€/mois pour sécuriser rapidement les 1000€ d'ARR (un seul client suffit).

## Pricing Strategy (Théorie)
1. **Audit instantané "One-shot" :** Gratuit (Génération de lead).
2. **Dashboard Agence (Surveillance active) :** 99€/mois pour un portefeuille de sites mutualisés (ex: jusqu'à 20 sites). La valeur perçue par site est faible (~5€/site), ce qui rend la vente évidente pour l'agence qui sécurise ses contrats de maintenance.
