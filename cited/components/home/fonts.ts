import { Schibsted_Grotesk } from "next/font/google";

/** Police unique des pages marketing : grotesque éditoriale, chiffres tabulaires disponibles. */
export const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-marketing",
  display: "swap",
});
