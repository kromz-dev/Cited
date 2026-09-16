"use client";

import { ScanForm } from "@/components/landing/ScanForm";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-32">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-cited-light/80 blur-[100px]" />
      
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col items-start text-left">
          <Badge 
            variant="outline" 
            className="mb-6 border-cited/30 bg-cited/5 px-4 py-1.5 text-sm font-medium text-cited"
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cited animate-pulse" />
            Nouveau Scanner IA
          </Badge>
          
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl">
            <span className="inline-block animate-fade-in" style={{ animationDelay: "0ms" }}>
              Votre
            </span>{" "}
            <span className="inline-block animate-fade-in" style={{ animationDelay: "100ms" }}>
              site
            </span>{" "}
            <span className="inline-block animate-fade-in" style={{ animationDelay: "200ms" }}>
              est-il
            </span>{" "}
            <span className="inline-block animate-fade-in" style={{ animationDelay: "300ms" }}>
              lisible
            </span>
            <br className="hidden sm:block" />
            <span className="inline-block animate-fade-in" style={{ animationDelay: "400ms" }}>
              par{" "}
              <span className="bg-gradient-to-r from-cited to-teal-500 bg-clip-text text-transparent">
                ChatGPT ?
              </span>
            </span>
          </h1>
          
          {/* AEO Blockquote - Designed for AI extraction */}
          <blockquote className="mb-8 border-l-4 border-cited pl-6 text-lg font-medium leading-relaxed text-muted animate-fade-in" style={{ animationDelay: "500ms" }}>
            "Cited est un scanner technique et un proxy géré qui permet aux sites modernes (React, SPA) d'être lus et cités par les moteurs de recherche IA comme Perplexity et Claude."
          </blockquote>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted animate-fade-in" style={{ animationDelay: "600ms" }}>
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-paper-deep text-xs font-bold text-muted shadow-sm">
                  {i === 3 ? "2k+" : String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-ink">Recommandé par les experts SEO</span>
              <span>Rejoignez +2,000 sites optimisés pour l'IA</span>
            </div>
          </div>
        </div>

        {/* Scan Form (Primary Interactive CTA) */}
        <div className="relative z-10 w-full animate-fade-in" style={{ animationDelay: "700ms" }}>
          <ScanForm />
        </div>
      </div>
    </section>
  );
}
