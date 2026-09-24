import { ScanForm } from "@/components/home/ScanForm";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#FAFAF9] text-[#1A1916] pb-24">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative pt-20 sm:pt-28 lg:pt-32 pb-12">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          
          {/* Header Section */}
          <div className="mx-auto flex max-w-[940px] flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider bg-white text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              L&apos;analytics des LLMs pour votre SaaS
            </div>
            
            <h1 className="mt-5 text-balance text-[2.5rem] font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-[3.2rem] lg:text-[4rem]">
              Découvrez exactement comment <br className="hidden sm:block" />
              <span className="text-[#147866]">l&apos;IA lit vos sites.</span>
            </h1>
            
            <p className="mt-6 max-w-[650px] text-pretty text-base leading-relaxed text-gray-500 sm:text-lg">
              Funnels, métriques et logs de requêtes liés directement à vos domaines. Voyez quels bots IA vous bloquent (403), et lesquels vous citent.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
              <ScanForm />
            </div>
            <p className="mt-4 text-xs font-medium text-gray-400">Scan gratuit · Sans carte bancaire · Résultat en 10 secondes</p>
          </div>
          
          {/* Dashboard UI Mockup */}
          <div className="mt-16 sm:mt-20 mx-auto w-full max-w-5xl">
            <div className="relative rounded-xl border border-gray-200 bg-white shadow-2xl shadow-gray-200/50 overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
              
              {/* Window Header */}
              <div className="flex h-12 items-center border-b border-gray-100 bg-[#FCFCFB] px-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <span className="text-gray-900 bg-white shadow-sm border border-gray-100 rounded-md px-3 py-1">Dashboard</span>
                    <span className="hover:text-gray-900 cursor-pointer">Logs IA</span>
                    <span className="hover:text-gray-900 cursor-pointer">A/B Testing SEO</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Layout */}
              <div className="flex h-[450px] sm:h-[550px] bg-white">
                
                {/* Sidebar (Hidden on mobile) */}
                <div className="hidden sm:flex w-48 flex-col border-r border-gray-100 bg-[#FCFCFB] p-4">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-[#147866] text-white flex items-center justify-center font-bold">C</div>
                    <div className="text-sm font-semibold">Cited App</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Vue d&apos;ensemble</div>
                    <div className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-900 rounded-md">Portefeuille</div>
                    <div className="px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md">Alertes</div>
                    <div className="px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-md">Rapports</div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
                  
                  {/* Top Metrics Row */}
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Visibilité globale</h3>
                      <p className="text-xs text-gray-500">Derniers 30 jours · Tous les domaines</p>
                    </div>
                    <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100">
                      <span className="px-3 py-1 text-xs font-medium text-gray-500">24h</span>
                      <span className="px-3 py-1 text-xs font-medium bg-white shadow-sm rounded-md text-gray-900">30j</span>
                      <span className="px-3 py-1 text-xs font-medium text-gray-500">Année</span>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="p-3 border border-gray-100 rounded-lg bg-white">
                      <div className="text-[10px] uppercase font-semibold text-gray-400 mb-1">Domaines Actifs</div>
                      <div className="text-xl font-bold text-gray-900">24 <span className="text-xs text-green-500 font-normal ml-1">↑ 2</span></div>
                    </div>
                    <div className="p-3 border border-gray-100 rounded-lg bg-white">
                      <div className="text-[10px] uppercase font-semibold text-gray-400 mb-1">Requêtes IA (Mois)</div>
                      <div className="text-xl font-bold text-gray-900">14.2k <span className="text-xs text-green-500 font-normal ml-1">↑ 18%</span></div>
                    </div>
                    <div className="p-3 border border-red-100 rounded-lg bg-red-50/30">
                      <div className="text-[10px] uppercase font-semibold text-red-400 mb-1">Blocages 403</div>
                      <div className="text-xl font-bold text-red-600">3 <span className="text-xs text-red-500 font-normal ml-1">Nouveau</span></div>
                    </div>
                    <div className="p-3 border border-gray-100 rounded-lg bg-white">
                      <div className="text-[10px] uppercase font-semibold text-gray-400 mb-1">Score SEO IA</div>
                      <div className="text-xl font-bold text-gray-900">92% <span className="text-xs text-gray-400 font-normal ml-1">Stable</span></div>
                    </div>
                  </div>

                  {/* Big Chart Area (Fake SVG Chart) */}
                  <div className="flex-1 border border-gray-100 rounded-lg p-4 bg-white relative overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-semibold text-gray-700">Requêtes par LLM (Traffic)</div>
                      <div className="text-xs font-semibold text-[#147866] bg-[#147866]/10 px-2 py-1 rounded-md">+42% citations globales</div>
                    </div>
                    
                    {/* SVG Chart Graphic */}
                    <div className="flex-1 w-full relative mt-2">
                      {/* Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {[1,2,3,4].map(i => <div key={i} className="w-full border-t border-gray-100 border-dashed"></div>)}
                      </div>
                      
                      {/* Chart Bars */}
                      <div className="absolute inset-x-2 bottom-0 h-full flex items-end justify-between px-2 pt-6">
                        {[40, 65, 45, 80, 55, 90, 75, 100, 85, 110, 95, 120].map((h, i) => (
                          <div key={i} className="w-full max-w-[24px] md:max-w-[32px] mx-1 flex flex-col justify-end h-full group">
                            {/* Claude Section */}
                            <div className="w-full bg-amber-400/80 rounded-t-sm transition-all duration-300 group-hover:bg-amber-400" style={{height: `${h * 0.2}%`}}></div>
                            {/* GPT Section */}
                            <div className="w-full bg-[#147866] rounded-b-sm transition-all duration-300 group-hover:opacity-80" style={{height: `${h * 0.5}%`}}></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chart Legend */}
                    <div className="mt-4 flex gap-4 text-xs font-medium justify-center">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#147866]"></div> GPTBot</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> ClaudeBot</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Bottom Live Activity Bar */}
              <div className="h-10 border-t border-gray-100 bg-[#FCFCFB] flex items-center px-4 gap-4 text-xs text-gray-500 overflow-hidden">
                <div className="flex items-center gap-2 font-medium shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Activité Live
                </div>
                <div className="w-px h-4 bg-gray-200 shrink-0"></div>
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-gray-900">GPTBot</span> vient de scanner <span className="font-semibold text-gray-900 border-b border-gray-300">acme-corp.com</span> (HTTP 200)
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
