import { describe, it, expect } from "vitest";
import { detectBrandMention } from "./mention-detector";

describe("detectBrandMention", () => {
  describe("détection de base", () => {
    it("détecte une mention simple", () => {
      const text = "Le meilleur outil est Acme pour facturer.";
      const result = detectBrandMention(text, "Acme");
      expect(result.isMentioned).toBe(true);
      expect(result.snippet).toContain("Acme");
      expect(result.matchedTerm).toBe("Acme");
    });

    it("ignore la casse", () => {
      const text = "Vous pouvez utiliser ACME ou megaSoft.";
      const result = detectBrandMention(text, "acme");
      expect(result.isMentioned).toBe(true);
    });

    it("évite les faux positifs partiels", () => {
      // Si la marque est "Mac", "Machine" ne doit pas matcher
      const text = "Utilisez cette machine pour le travail.";
      const result = detectBrandMention(text, "Mac");
      expect(result.isMentioned).toBe(false);
    });

    it("retourne faux si la marque est absente", () => {
      const text = "Il n'y a pas d'outil recommandé.";
      const result = detectBrandMention(text, "Acme");
      expect(result.isMentioned).toBe(false);
      expect(result.position).toBeNull();
      expect(result.snippet).toBeNull();
      expect(result.matchedTerm).toBeNull();
    });

    it("retourne faux sur texte ou marque vide", () => {
      expect(detectBrandMention("", "Acme").isMentioned).toBe(false);
      expect(detectBrandMention("du texte", "").isMentioned).toBe(false);
      expect(detectBrandMention("du texte", "   ").isMentioned).toBe(false);
    });
  });

  describe("frontières de mot (marques multi-mots, tirets, métacaractères)", () => {
    it("détecte une marque multi-mots", () => {
      const text = "Je recommande Le Slip Français pour les sous-vêtements.";
      const result = detectBrandMention(text, "Le Slip Français");
      expect(result.isMentioned).toBe(true);
      expect(result.snippet).toContain("Le Slip Français");
    });

    it("refuse un préfixe de marque multi-mots collé à un autre mot", () => {
      // Régression : l'ancien indexOf brut matchait "Blue Bottle" dans "Blue Bottles"
      const text = "Il vend des Blue Bottles en verre.";
      const result = detectBrandMention(text, "Blue Bottle");
      expect(result.isMentioned).toBe(false);
    });

    it("refuse une marque multi-mots précédée d'un caractère de mot", () => {
      const text = "SuperLe Slip Français n'existe pas.";
      const result = detectBrandMention(text, "Le Slip Français");
      expect(result.isMentioned).toBe(false);
    });

    it("tolère un espacement variable entre les mots de la marque", () => {
      const text = "Marque citée :\nLe Slip\nFrançais est cité.";
      const result = detectBrandMention(text, "Le Slip Français");
      expect(result.isMentioned).toBe(true);
    });

    it("gère les marques à tiret", () => {
      expect(detectBrandMention("On cite Rolls-Royce ici.", "Rolls-Royce").isMentioned).toBe(true);
      expect(detectBrandMention("On cite Rolls-Royces ici.", "Rolls-Royce").isMentioned).toBe(false);
    });

    it("échappe les métacaractères de regex dans le nom de marque", () => {
      // "C++" ne doit pas être interprété comme une répétition regex
      expect(detectBrandMention("On code en C++ chez eux.", "C++").isMentioned).toBe(true);
      expect(detectBrandMention("On code en Cpp chez eux.", "C++").isMentioned).toBe(false);
      // Le point ne doit pas devenir un joker
      expect(detectBrandMention("La marque Ax9 existe.", "A.9").isMentioned).toBe(false);
      expect(detectBrandMention("La marque A.9 existe.", "A.9").isMentioned).toBe(true);
    });

    it("gère les apostrophes dans le nom de marque", () => {
      const result = detectBrandMention("Les produits L'Oréal sont chers.", "l'oreal");
      expect(result.isMentioned).toBe(true);
    });
  });

  describe("normalisation des accents", () => {
    it("détecte une marque accentuée écrite sans accent", () => {
      const result = detectBrandMention("Achetez chez Decathlon demain.", "Décathlon");
      expect(result.isMentioned).toBe(true);
    });

    it("détecte une marque non accentuée écrite avec accents", () => {
      const result = detectBrandMention("Le café Oz est ouvert.", "Cafe Oz");
      expect(result.isMentioned).toBe(true);
    });

    it("extrait le snippet du texte BRUT, pas du texte normalisé", () => {
      const text = "Les équipes recommandent Décathlon pour l'été, ÉVIDEMMENT.";
      const result = detectBrandMention(text, "decathlon");
      expect(result.snippet).toContain("Décathlon");
      expect(result.snippet).toContain("équipes");
      expect(result.snippet).toContain("ÉVIDEMMENT");
    });

    it("garde les index alignés quand le texte contient des accents avant la mention", () => {
      const text = "Créé, géré et déployé très rapidement : Acme.";
      const result = detectBrandMention(text, "Acme");
      expect(result.isMentioned).toBe(true);
      expect(result.snippet).toContain("Acme");
      expect(result.snippet).not.toContain("cme.cme");
    });
  });

  describe("position dans la liste", () => {
    it("détecte la position 1 d'une liste numérotée", () => {
      const text = [
        "Voici les meilleurs outils :",
        "1. Acme - la référence",
        "2. GlobalCorp - solide",
        "3. MegaSoft - complet",
      ].join("\n");
      const result = detectBrandMention(text, "Acme");
      expect(result.position).toBe(1);
    });

    it("détecte la position 3 d'une liste numérotée", () => {
      const text = [
        "Voici les recommandations :",
        "1. GlobalCorp - excellent outil",
        "2. MegaSoft - très complet",
        "3. Acme - nouvelle solution",
      ].join("\n");
      const result = detectBrandMention(text, "Acme");
      expect(result.isMentioned).toBe(true);
      expect(result.position).toBe(3);
    });

    it("gère les puces non numérotées", () => {
      const text = ["Options :", "- GlobalCorp", "- Acme", "- MegaSoft"].join("\n");
      expect(detectBrandMention(text, "Acme").position).toBe(2);
    });

    it("renvoie null quand la réponse ne contient aucune liste", () => {
      // Régression : l'ancien code renvoyait 1 par défaut et gonflait le score
      const text = "Pour facturer vos clients, Acme reste une bonne option en 2026.";
      const result = detectBrandMention(text, "Acme");
      expect(result.isMentioned).toBe(true);
      expect(result.position).toBeNull();
    });

    it("renvoie null quand la mention est hors liste alors qu'une liste existe", () => {
      const text = [
        "Voici les outils :",
        "1. GlobalCorp",
        "2. MegaSoft",
        "",
        "En conclusion, Acme mérite aussi un essai.",
      ].join("\n");
      const result = detectBrandMention(text, "Acme");
      expect(result.isMentioned).toBe(true);
      expect(result.position).toBeNull();
    });

    it("compte dans le bon bloc quand une liste d'introduction précède la vraie liste", () => {
      // Régression : l'ancien code comptait toutes les puces depuis le début (6)
      const text = [
        "Avant de choisir, vérifiez :",
        "- votre budget",
        "- vos besoins",
        "- votre équipe",
        "",
        "Voici mon classement :",
        "1. GlobalCorp",
        "2. MegaSoft",
        "3. Acme",
      ].join("\n");
      const result = detectBrandMention(text, "Acme");
      expect(result.position).toBe(3);
    });

    it("compte la position sur un item de liste écrit sur plusieurs lignes", () => {
      const text = [
        "Classement :",
        "1. GlobalCorp",
        "   très bon rapport qualité-prix",
        "2. Acme",
        "   nouvelle solution française",
      ].join("\n");
      const result = detectBrandMention(text, "solution française");
      expect(result.isMentioned).toBe(true);
      expect(result.position).toBe(2);
    });
  });

  describe("variantes (Brand.brandAliases)", () => {
    it("garde la signature à deux arguments compatible", () => {
      expect(detectBrandMention("On cite Acme.", "Acme").isMentioned).toBe(true);
    });

    it("détecte une variante quand le nom canonique est absent", () => {
      const text = "La solution Mega Soft est citée en premier.";
      const result = detectBrandMention(text, "MegaSoft", ["Mega Soft", "MSoft"]);
      expect(result.isMentioned).toBe(true);
      expect(result.matchedTerm).toBe("Mega Soft");
    });

    it("retient la variante qui apparaît le plus tôt dans le texte", () => {
      const text = [
        "Classement :",
        "1. MSoft - la version courte du nom",
        "2. GlobalCorp",
        "3. MegaSoft - le nom complet",
      ].join("\n");
      const result = detectBrandMention(text, "MegaSoft", ["MSoft"]);
      expect(result.matchedTerm).toBe("MSoft");
      expect(result.position).toBe(1);
    });

    it("applique les frontières de mot aux variantes aussi", () => {
      const text = "Le mot MSoftware n'est pas la marque.";
      const result = detectBrandMention(text, "MegaSoft", ["MSoft"]);
      expect(result.isMentioned).toBe(false);
    });

    it("ignore les variantes vides", () => {
      const result = detectBrandMention("On cite Acme.", "Acme", ["", "   "]);
      expect(result.isMentioned).toBe(true);
      expect(result.matchedTerm).toBe("Acme");
    });
  });

  describe("marque dont le nom est un mot courant — LIMITE CONNUE", () => {
    it("détecte l'opérateur Orange", () => {
      const text = "Pour la fibre, Orange reste le plus fiable.";
      expect(detectBrandMention(text, "Orange").isMentioned).toBe(true);
    });

    it("FAUX POSITIF assumé : le fruit est aussi détecté", () => {
      // La détection est lexicale : rien ne distingue le fruit de l'opérateur
      // sans analyse de contexte (NER / embeddings / vérification LLM).
      // Ce test documente le comportement réel au lieu de le masquer.
      // Mitigations côté appelant : filtrage sémantique en aval, ou variantes
      // plus discriminantes ("Orange Business", "Orange Télécom").
      const text = "Le matin, je bois un jus d'orange pressé.";
      const result = detectBrandMention(text, "Orange");
      expect(result.isMentioned).toBe(true); // <-- limite, pas un comportement souhaité
    });

    it("une variante plus discriminante évite le faux positif", () => {
      const fruit = "Le matin, je bois un jus d'orange pressé.";
      const operateur = "Pour la fibre, Orange Business est bien placé.";
      expect(detectBrandMention(fruit, "Orange Business").isMentioned).toBe(false);
      expect(detectBrandMention(operateur, "Orange Business").isMentioned).toBe(true);
    });
  });
});
