import { Schibsted_Grotesk } from "next/font/google";

/**
 * Police unique du système (marketing et application) : grotesque éditoriale,
 * chiffres tabulaires disponibles (`font-variant-numeric: tabular-nums`).
 * Poids : 400 texte, 500 interface, 600 titres, 700 affichage.
 */
export const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-marketing",
  display: "swap",
});
