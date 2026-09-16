import { ScanForm } from "./ScanForm";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-[var(--color-accent)] text-[var(--color-bg)]">
      <svg viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice" fill="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <g stroke="var(--color-bg)" strokeWidth="1.4" opacity="0.4" strokeDasharray="6 12" className="animate-[cited-flow_11s_linear_infinite]">
          <path d="M-40 30 C220 130, 520 260, 704 356"></path>
          <path d="M-60 250 C220 290, 520 340, 706 372"></path>
          <path d="M-40 740 C220 620, 520 470, 706 400"></path>
          <path d="M1480 30 C1220 130, 920 260, 736 356"></path>
          <path d="M1500 250 C1220 290, 920 340, 734 372"></path>
          <path d="M1480 740 C1220 620, 920 470, 734 400"></path>
        </g>
        <g stroke="var(--color-bg)" fill="none">
          <circle cx="720" cy="380" r="170" strokeWidth="1.4" opacity="0.26"></circle>
          <circle cx="720" cy="380" r="310" strokeWidth="1.3" opacity="0.18"></circle>
          <circle cx="720" cy="380" r="470" strokeWidth="1.2" opacity="0.12"></circle>
          <circle cx="720" cy="380" r="640" strokeWidth="1.1" opacity="0.08"></circle>
        </g>
      </svg>
      
      {/* Constellations */}
      <div className="hidden lg:block absolute left-[5%] top-[16%] z-10 animate-[cited-float_7s_ease-in-out_infinite_0s]">
        <div className="flex items-center gap-2 bg-[var(--color-bg)] text-[var(--color-text)] rounded-full px-4 py-2.5 shadow-md text-sm font-bold whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>GPTBot
        </div>
      </div>
      <div className="hidden lg:block absolute left-[2%] top-[44%] z-10 animate-[cited-float_9.2s_ease-in-out_infinite_1.1s]">
        <div className="flex items-center gap-2 bg-[var(--color-bg)] text-[var(--color-text)] rounded-full px-4 py-2.5 shadow-md text-sm font-bold whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>PerplexityBot
        </div>
      </div>
      <div className="hidden lg:block absolute left-[8%] bottom-[16%] z-10 animate-[cited-float_8.8s_ease-in-out_infinite_1.6s]">
        <div className="flex items-center gap-2 bg-[var(--color-bg)] text-[var(--color-text)] rounded-full px-4 py-2.5 shadow-md text-sm font-bold whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>Bingbot
        </div>
      </div>
      <div className="hidden lg:block absolute right-[5%] top-[14%] z-10 animate-[cited-float_8.4s_ease-in-out_infinite_0.6s]">
        <div className="flex items-center gap-2 bg-[var(--color-bg)] text-[var(--color-text)] rounded-full px-4 py-2.5 shadow-md text-sm font-bold whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>ClaudeBot
        </div>
      </div>
      <div className="hidden lg:block absolute right-[3%] top-[42%] z-10 animate-[cited-float_7.8s_ease-in-out_infinite_0.3s]">
        <div className="flex items-center gap-2 bg-[var(--color-bg)] text-[var(--color-text)] rounded-full px-4 py-2.5 shadow-md text-sm font-bold whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>Gemini
        </div>
      </div>
      <div className="hidden lg:block absolute right-[8%] bottom-[14%] z-10 animate-[cited-float_7.4s_ease-in-out_infinite_0.9s]">
        <div className="flex items-center gap-2 bg-[var(--color-bg)] text-[var(--color-text)] rounded-full px-4 py-2.5 shadow-md text-sm font-bold whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"></span>Applebot
        </div>
      </div>

      <div className="relative z-10 max-w-[1080px] mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider bg-[var(--color-bg)] text-[var(--color-text)] rounded-full px-4 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-[cited-pulse_2.4s_ease-in-out_infinite]"></span>
          Radar de visibilité IA · agences web & no-code
        </div>
        <h1 className="text-[clamp(38px,5.4vw,74px)] leading-none m-0 max-w-[18ch] [text-wrap:balance] font-bold">
          Un de vos sites est invisible pour l'IA.
        </h1>
        <p className="text-[clamp(15px,1.4vw,19px)] mt-6 max-w-[52ch] [text-wrap:pretty]">
          Lequel ? Entrez un domaine. Nous le testons avec le User-Agent de GPTBot, exactement comme le font ChatGPT et Claude.
        </p>
        
        <ScanForm />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes cited-flow { to { stroke-dashoffset: -260 } }
        @keyframes cited-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-9px) } }
        @keyframes cited-pulse { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }
      `}} />
    </div>
  );
}
