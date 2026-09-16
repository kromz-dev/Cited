# Direction artistique et prompts Stitch

> À utiliser pour générer les maquettes. Destiné au commanditaire.
> **Version :** 2.0 · **Date :** 16 septembre 2026
>
> ⚠️ **Pivot.** Les écrans ont été adaptés au modèle self-serve. L'écran agence (liste de clients) est remplacé par un écran personnel (liste de ses marques). L'écran rapport marque blanche est supprimé. Un écran « Correctifs » est ajouté.

---

## 1. Le parti pris

**Inchangé.** L'objet caractéristique du produit est la matrice de couverture, pas le score.

Une marque est nommée ou elle ne l'est pas, pour chaque requête et chaque moteur. C'est binaire à l'unité, et ça devient un taux à l'agrégat. L'image juste du produit est donc une **grille de présences et d'absences** — un relevé de mesure, pas une page de marketing.

Conséquence sur tous les écrans : le grand chiffre coloré n'est jamais le héros. La grille l'est.

```
                ChatGPT  Perplexity  AI Overviews
meilleur crm      ███       ░░░          ███
crm pour tpe      ░░░       ███          ░░░
alternative à X   ███       ███          ███
avis sur X        ███       ░░░          ░░░
                  ▲ cité    ▲ absent
```

Un utilisateur qui voit cet écran comprend immédiatement où est le trou.

---

## 2. Jetons de design

### Couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| `paper` | `#F2F4F3` | Fond général, papier froid |
| `ink` | `#12211E` | Texte principal, cellules pleines |
| `cited` | `#0E6E5C` | État « cité » — cellule pleine, courbe de la marque |
| `rival` | `#7A2E4A` | Présence d'un concurrent |
| `muted` | `#8C9A96` | Filets, états vides, texte secondaire |
| `signal` | `#C9A227` | **Une seule utilisation par écran** : la variation qui mérite l'attention |

### Typographie

| Rôle | Police | Raison |
|---|---|---|
| Titres | **Chivo** | Grotesque à verticales franches |
| Texte et données | **IBM Plex Sans** | Dessinée pour la donnée dense |

Une seule graisse de titre (600), deux de texte (400, 500).

### Forme et espace

- Rayon des angles : **4 px**.
- Filets de 1 px en `muted` à 40 % d'opacité. Pas d'ombres portées.
- Échelle d'espacement : 4 / 8 / 12 / 16 / 24 / 32 / 48.
- Largeur utile : 1 280 px minimum. Usage bureau assumé.

---

## 3. Ce qu'il faut refuser dans la sortie de Stitch

Inchangé. Voir la V1 pour la liste complète (dégradés, cartes arrondies, chiffres géants, emojis, etc.).

---

## 4. Configuration du système de design Stitch

Inchangée. Voir la V1.

---

## 5. Prompts prêts à coller

> Réglages communs : appareil **DESKTOP**, système de design appliqué.

### Écran 0 — Landing page + audit gratuit (NOUVEAU)

```
Page d'accueil d'un outil de mesure et correction de visibilité de marque dans les
moteurs de réponse IA. Fond papier froid, typographie sobre et assurée.

En haut : navigation minimale (logo à gauche, "Se connecter" à droite).

Zone hero, centrée : un titre court en Chivo 600 ("Votre marque est-elle citée
par les IA ?"), un sous-titre d'une ligne en IBM Plex Sans 400, puis un champ
de saisie large avec le placeholder "Entrez votre domaine" et un bouton vert
profond "Analyser". Sous le champ, un compteur discret "12 847 audits réalisés".

En dessous, 3 colonnes avec icônes minimalistes : "Mesurez en 30 secondes",
"Comparez à vos concurrents", "Recevez les correctifs à appliquer". Le mot
"correctifs" est en vert profond.

Pas de capture d'écran du produit, pas de témoignage, pas de logos clients.
L'outil est la démo.
```

### Écran 1 — Résultat de l'audit gratuit (NOUVEAU)

```
Page de résultat d'un audit de visibilité IA, affichée publiquement sans
inscription. Fond papier froid, même univers que la landing page.

En haut : le domaine audité et le nom de la marque, la date de l'audit.

Élément principal et dominant : la matrice de couverture. 5 lignes (requêtes
générées), 1 colonne (Gemini). Cellules pleines vertes si la marque est citée,
cellules vides avec contour fin si absente. Score de visibilité en petit à côté.

En dessous, deux blocs côte à côte : à gauche, les concurrents détectés avec
leur propre score (barres horizontales, prune pour les concurrents) ; à droite,
les 5 sources les plus citées par le moteur, avec un indicateur "Votre marque
y figure" (plein/vide).

En bas, deux CTA sur fond très légèrement distinct :
- "Recevoir le rapport complet par email" (champ email + bouton)
- "Suivre ma marque chaque semaine + recevoir les correctifs" (bouton principal
  vert profond qui mène à l'inscription)
```

### Écran 2 — Mes marques (remplace l'ancien "Vue d'ensemble agence")

```
Tableau de bord d'un outil de mesure de visibilité IA, utilisé par un
propriétaire de marque pour suivre ses marques. Fond papier froid, pas de
dégradés, pas d'ombres portées, séparateurs en filets fins.

Barre latérale gauche étroite : logo du produit, navigation verticale sobre
(Mes marques, Sources, Réglages), et en bas le nom de l'utilisateur.

Zone principale : titre "Mes marques", puis un tableau de 3 lignes (3 marques
suivies). Colonnes : nom de la marque et son domaine sur deux lignes ; score de
visibilité sur 100 en chiffre moyen, non coloré ; variation depuis la semaine
précédente ; une mini-grille de 12 petits carrés montrant les requêtes citées
(pleins) ou absentes (vides) ; date de la dernière mesure.

En haut à droite, un bouton discret "Ajouter une marque" et un compteur
"2/3 marques (Plan Pro)".
```

### Écran 3 — Détail d'une marque (inchangé dans l'esprit)

```
Écran de détail d'une marque. Fond papier froid, typographie dense.

En-tête compact : nom de la marque, son domaine, la période, un sélecteur.

Élément principal : la matrice de couverture (14 requêtes × 3 moteurs).
Cellules pleines vertes si cité, vides si absent.

En dessous : courbe d'évolution (8 semaines, ligne pleine pour la marque,
lignes fines grises pour les concurrents) ; à droite, part de voix.

Le score apparaît une seule fois, en taille modeste.
```

### Écran 4 — Correctifs à appliquer (NOUVEAU — remplace l'ancien rapport marque blanche)

```
Écran listant les correctifs générés pour une marque, prêts à copier-coller.
Fond papier froid, mise en page d'un plan d'action, pas d'un tableau de bord.

Titre "Correctifs à appliquer", compteur "7 actions identifiées, 2 appliquées".

Liste de correctifs, chacun dans un bloc sobre :
- Une étiquette de type (Contenu, JSON-LD, llms.txt, Source) avec un code
  couleur discret
- Un titre en Chivo 600 ("Ajouter un paragraphe sur votre page /facturation")
- Un constat chiffré en une ligne ("Cette requête vous cite 0 fois sur 3 moteurs.
  Votre concurrent Pennylane est cité 3 fois.")
- Un bloc de code ou de texte avec le contenu exact à copier, dans un cadre
  à fond très légèrement plus sombre, avec un bouton "Copier" en haut à droite
- Un indicateur de priorité discret (Haute/Moyenne/Basse)
- Une case "Appliqué" cochable

Le bloc JSON-LD montre du code JSON dans une police monospace. Le bloc contenu
montre du texte courant. Le bloc llms.txt montre le contenu du fichier.
```

### Écran 5 — Configuration des requêtes (inchangé dans l'esprit)

Même prompt que la V1, sans les mentions d'agence.

---

## 6. Après la génération

1. Vérifier chaque écran contre le tableau du §3.
2. Exporter le code des écrans.
3. Les déposer dans `design/` à la racine du dépôt.
4. L'intégration doit être une transcription en Tailwind + shadcn/ui, pas une réinterprétation.
