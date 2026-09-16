# Plan Business — Cited (Scanner Black-Box)

## 1. Le Problème
Les agences No-Code (Bubble, Bolt) vendent des sites vitrines et applications web onéreux à leurs clients. Or, ces plateformes sont souvent capricieuses avec le SEO IA : un pare-feu (Cloudflare) mal configuré ou une mise à jour de la plateforme peut rendre le site invisible aux bots IA (`GPTBot`, `ClaudeBot`), renvoyant une erreur 403 ou une page blanche (coquille vide).
L'agence perd la face si son client s'en rend compte en premier.

## 2. La Solution (Le Produit)
Un scanner "Black-Box" externe. Cited ping les URLs des clients de l'extérieur tous les jours en usurpant le User-Agent d'une IA. S'il y a un blocage ou une régression, l'agence reçoit immédiatement une alerte (Slack/Email).
Zéro installation requise sur le site du client final.

## 3. Modèle de Revenus (SaaS B2B)
**Vendre la "Peace of Mind" (Tranquillité d'esprit)**
- **Lead Magnet :** Audit instantané gratuit d'une URL depuis la page d'accueil de Cited.
- **Offre Agence :** 99€/mois pour surveiller un portefeuille de sites (ex: jusqu'à 20 sites). L'agence marge sur son propre contrat de maintenance.
*Une seule agence cliente suffit à générer >1000€ d'ARR.*

## 4. Stratégie d'Acquisition
- Outbound ciblé vers les fondateurs d'agences et freelances Bubble/Bolt (LinkedIn/Twitter).
- Approche : Scanner leur portfolio gratuitement et leur montrer que certains de leurs sites sont actuellement bloqués par l'IA. C'est une vente basée sur la preuve immédiate.