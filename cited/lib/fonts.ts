import { Geist_Mono } from "next/font/google";

export { schibsted as sans } from "@/components/home/fonts";

/** Mono réservée aux extraits de code (robots.txt, règles Cloudflare). Jamais pour des libellés. */
export const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});
