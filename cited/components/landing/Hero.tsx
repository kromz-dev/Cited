import { ScanForm } from "./ScanForm";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#0A0D14] text-white">
      {/* Grille de fond subtile */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      
      {/* Lignes de connexion lumineuses (Les "Flèches") */}
      <svg viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice" fill="none" className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="glow-line-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#147866" stopOpacity="0" />
            <stop offset="50%" stopColor="#147866" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#147866" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="glow-line-2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b38318" stopOpacity="0" />
            <stop offset="50%" stopColor="#b38318" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b38318" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Lignes principales */}
        <g strokeWidth="1.5" opacity="0.4">
          <path d="M100 120 C320 180, 520 280, 680 340" stroke="url(#glow-line-1)" strokeDasharray="4 8" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M80 380 C320 380, 520 380, 680 380" stroke="url(#glow-line-1)" strokeDasharray="4 8" className="animate-[pulse_4s_ease-in-out_infinite]" />
          <path d="M100 640 C320 580, 520 480, 680 420" stroke="url(#glow-line-1)" strokeDasharray="4 8" className="animate-[pulse_3.5s_ease-in-out_infinite]" />
          
          <path d="M1340 120 C1120 180, 920 280, 760 340" stroke="url(#glow-line-2)" strokeDasharray="4 8" className="animate-[pulse_3s_ease-in-out_infinite]" />
          <path d="M1360 380 C1120 380, 920 380, 760 380" stroke="url(#glow-line-2)" strokeDasharray="4 8" className="animate-[pulse_2.5s_ease-in-out_infinite]" />
          <path d="M1340 640 C1120 580, 920 480, 760 420" stroke="url(#glow-line-2)" strokeDasharray="4 8" className="animate-[pulse_4.5s_ease-in-out_infinite]" />
        </g>

        {/* Cercles orbitaux centraux */}
        <g stroke="rgba(255,255,255,0.1)" fill="none">
          <circle cx="720" cy="380" r="180" strokeWidth="1"></circle>
          <circle cx="720" cy="380" r="280" strokeWidth="1" strokeDasharray="4 12" className="animate-[spin_40s_linear_infinite] origin-[720px_380px]"></circle>
          <circle cx="720" cy="380" r="420" strokeWidth="1" opacity="0.5"></circle>
        </g>
      </svg>
      
      {/* Logos aux extrémités des flèches */}
      <div className="hidden lg:block absolute left-[5%] top-[12%] z-10 animate-[cited-float_7s_ease-in-out_infinite_0s]">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(20,120,102,0.3)] text-sm font-bold">
          <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center">
            {/* OpenAI Logo simple */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.28 15.55c.44-1.27.44-2.65 0-3.92-.81-2.48-2.9-4.27-5.46-4.7V6.52c0-2.84-2.31-5.15-5.15-5.15-1.9 0-3.61 1.05-4.5 2.7-.9-1.65-2.6-2.7-4.5-2.7C1.42 1.37.1 2.69.1 4.22c0 .41.09.81.26 1.18.23.51.57.96 1 1.3 1.25.98 2.89 1.27 4.37.77.34-.11.66-.27.95-.47v.94c0 2.84 2.31 5.15 5.15 5.15 1.9 0 3.61-1.05 4.5-2.7.9 1.65 2.6 2.7 4.5 2.7 1.25 0 2.45-.48 3.35-1.35.9-.88 1.4-2.07 1.4-3.32 0-.25-.02-.5-.07-.75-.3-1.48-1.25-2.72-2.58-3.35.34-.23.65-.5.91-.81.44-.54.72-1.2.79-1.9.06-.69-.04-1.39-.3-2.02z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-normal">Recherche via</div>
            <div className="text-base tracking-wide">GPTBot</div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute left-[3%] top-[48%] -translate-y-1/2 z-10 animate-[cited-float_9.2s_ease-in-out_infinite_1.1s]">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(20,120,102,0.3)] text-sm font-bold">
          <div className="w-8 h-8 rounded-full bg-[#f3efe4] flex items-center justify-center text-black font-serif italic text-lg leading-none">
            A
          </div>
          <div>
            <div className="text-xs text-gray-400 font-normal">Recherche via</div>
            <div className="text-base tracking-wide">ClaudeBot</div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute left-[5%] top-[80%] z-10 animate-[cited-float_8.8s_ease-in-out_infinite_1.6s]">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(20,120,102,0.3)] text-sm font-bold">
          <div className="w-8 h-8 rounded-full bg-[#202124] border border-gray-600 flex items-center justify-center">
            {/* Perplexity icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-normal">Recherche via</div>
            <div className="text-base tracking-wide">Perplexity</div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-[5%] top-[12%] z-10 animate-[cited-float_8.4s_ease-in-out_infinite_0.6s]">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(179,131,24,0.3)] text-sm font-bold">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            {/* Google G */ }
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#4285F4">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-normal">Recherche via</div>
            <div className="text-base tracking-wide">Gemini</div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-[3%] top-[48%] -translate-y-1/2 z-10 animate-[cited-float_7.8s_ease-in-out_infinite_0.3s]">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(179,131,24,0.3)] text-sm font-bold">
          <div className="w-8 h-8 rounded-full bg-[#0668E1] flex items-center justify-center">
            {/* Meta Logo */ }
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20.352 10.963c0-3.353-2.697-6.075-6.024-6.075-2.32 0-4.323 1.341-5.289 3.284C8.073 6.229 6.07 4.888 3.75 4.888c-3.327 0-6.024 2.722-6.024 6.075 0 3.355 2.697 6.077 6.024 6.077 2.321 0 4.323-1.342 5.289-3.285.966 1.943 2.968 3.285 5.289 3.285 3.327 0 6.024-2.722 6.024-6.077ZM12 14.18c-1.503 2.155-3.957 3.518-6.732 3.518-4.417 0-8-3.582-8-8s3.583-8 8-8c2.775 0 5.229 1.363 6.732 3.518C13.503 3.043 15.957 1.68 18.732 1.68c4.417 0 8 3.582 8 8s-3.583 8-8 8c-2.775 0-5.229-1.363-6.732-3.518Z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-normal">Recherche via</div>
            <div className="text-base tracking-wide">Meta AI</div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-[5%] top-[80%] z-10 animate-[cited-float_7.4s_ease-in-out_infinite_0.9s]">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(179,131,24,0.3)] text-sm font-bold">
          <div className="w-8 h-8 rounded-full bg-[#00A4EF] flex items-center justify-center">
            {/* Bing Logo */ }
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M4 1L3 2L3 22.5L10 20L10 10.5L18.5 15.5L21 14L10 2.5L4 1Z"/>
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-normal">Recherche via</div>
            <div className="text-base tracking-wide">Bingbot</div>
          </div>
        </div>
      </div>

      <div className="relative z-20 max-w-[1080px] mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full px-4 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#147866] animate-[pulse_2.4s_ease-in-out_infinite]"></span>
          Radar de visibilité IA · agences web & no-code
        </div>
        <h1 className="text-[clamp(38px,5.4vw,74px)] leading-none m-0 max-w-[18ch] [text-wrap:balance] font-bold drop-shadow-lg">
          Un de vos sites est invisible pour l'IA.
        </h1>
        <p className="text-[clamp(15px,1.4vw,19px)] mt-6 max-w-[52ch] [text-wrap:pretty] text-gray-300">
          Lequel ? Entrez un domaine. Nous le testons avec le User-Agent des plus grands LLMs, exactement comme le font ChatGPT et Claude.
        </p>
        
        <div className="mt-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl">
          <ScanForm />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes cited-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
      `}} />
    </div>
  );
}
