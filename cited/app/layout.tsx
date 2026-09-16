import type { Metadata } from "next";
import { Nunito, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cited | Rendez votre site lisible par ChatGPT & Claude",
  description: "80% des sites React & SPA apparaissent vides aux LLMs. Cited est un scanner technique et un proxy géré qui permet aux sites modernes d'être lus et cités par l'IA.",
  keywords: ["LLM optimization", "AEO", "SEO pour IA", "ChatGPT lisibilité", "Perplexity bot", "Claude bot", "React SEO"],
  openGraph: {
    title: "Cited | Rendez votre site lisible par ChatGPT & Claude",
    description: "Cited est un scanner technique et un proxy géré qui permet aux sites modernes d'être lus et cités par l'IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={cn(nunito.variable, "font-sans", geist.variable)}>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
