import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { PricingPreview } from "@/components/landing/PricingPreview";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg,#fff)] text-[var(--color-text,#000)] font-sans">
      <Header />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <PricingPreview />
      <FinalCTA />
      <Footer />
    </main>
  );
}
