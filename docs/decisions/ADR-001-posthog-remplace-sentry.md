# ADR-001 : PostHog remplace Sentry pour les erreurs et la mesure produit

## Statut

Accepté

## Date

2026-09-24

## Contexte

Le plan technique (`docs/10-plan-technique.md`, version du 24/09) retenait Sentry Developer pour la capture d'erreurs (ENF-009) et un compteur maison sans cookie pour l'audience marketing (T006). Le commit `7ffd4f2` a abandonné Sentry au profit de PostHog, sans mettre à jour le plan ni les tâches T001, T005 et T053.

Besoins :

- capturer les erreurs serveur et client, avec le contexte d'un échec de scan ou d'envoi d'alerte (ENF-009, T053) ;
- mesurer le parcours produit (scan public, inscription, ajout de sites) ;
- budget 0 € et usage commercial permis (ENF-016).

## Décision

Utiliser PostHog Cloud, région UE (`https://eu.i.posthog.com`), avec :

- `posthog-js` côté navigateur : exceptions (`capture_exceptions`), pages vues et événements produit ;
- `posthog-node` côté serveur : exceptions et événements des moteurs IA (`lib/posthog-ai.ts`).

Variables : `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST`.

Quotas gratuits mensuels, vérifiés le 24/09/2026 sur [posthog.com/pricing](https://posthog.com/pricing) : 1 M d'événements analytiques, 5 000 enregistrements de session, 100 000 exceptions, 100 000 événements LLM, 1 M de requêtes de feature flags. La page ne précise ni la durée de rétention du palier gratuit ni l'usage commercial : à confirmer dans le cadre de T001.

## Alternatives considérées

### Sentry Developer (choix initial)

- Pour : spécialiste des erreurs, traces de pile et source maps de meilleure qualité.
- Contre : 5 000 événements par mois, un seul utilisateur ; la mesure produit exige un second outil.
- Rejeté : deux outils à intégrer et à surveiller au lieu d'un (principe VI).

### Compteur maison seul (T006) et journaux Render

- Pour : aucun tiers, aucun cookie.
- Contre : pas de capture d'erreurs côté client, pas de tunnel de conversion.
- Conservé pour l'audience marketing, insuffisant pour ENF-009.

## Conséquences

- T005 devient « Intégrer PostHog » ; T053 vérifie la remontée des échecs dans PostHog.
- **Point RGPD ouvert.** Par défaut, `posthog-js` stocke un identifiant dans un cookie ou le `localStorage`. Dans l'UE, ce traceur exige un consentement préalable, sauf à utiliser un mode sans persistance (`persistence: "memory"` ou le mode sans cookie de PostHog). Le principe de T006 (« pas de cookie, pas de tiers » sur les pages marketing) ne tient plus si PostHog est chargé sur ces pages. À trancher dans T005 : mode sans persistance hors session connectée, ou bandeau de consentement.
- `posthog.identify` envoie l'e-mail et le nom de l'utilisateur à PostHog : PostHog devient sous-traitant de données personnelles. Il faut le mentionner dans la politique de confidentialité et limiter l'identification à l'identifiant interne si l'e-mail n'est pas nécessaire.
- Le quota de 100 000 exceptions par mois laisse de la marge, mais une boucle d'erreurs pendant le scan quotidien peut le consommer : grouper les erreurs répétées par site plutôt que d'en émettre une par bot.
