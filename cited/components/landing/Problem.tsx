export function Problem() {
  return (
    <div className="relative overflow-hidden py-16 lg:py-24 border-b border-[var(--color-divider,#eaeaea)]">
      <div className="absolute right-[-160px] top-[-120px] w-[480px] h-[480px] opacity-[0.055] animate-[cited-drift_90s_linear_infinite] pointer-events-none">
        <svg viewBox="0 0 200 200" width="480" height="480" fill="none" stroke="var(--color-text)" strokeWidth="1.2">
          <ellipse cx="100" cy="30" rx="86" ry="22"></ellipse>
          <ellipse cx="100" cy="62" rx="68" ry="18"></ellipse>
          <ellipse cx="100" cy="92" rx="50" ry="14"></ellipse>
          <ellipse cx="100" cy="120" rx="34" ry="10"></ellipse>
          <ellipse cx="100" cy="145" rx="20" ry="7"></ellipse>
          <ellipse cx="100" cy="166" rx="9" ry="4"></ellipse>
        </svg>
      </div>
      <div className="max-w-[1080px] mx-auto relative px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
          <div className="p-8 border-l border-[var(--color-divider,#eaeaea)]">
            <div className="text-4xl font-bold text-[var(--color-accent)]">403</div>
            <div className="text-sm mt-3 opacity-80">Le pare-feu refuse les bots IA. Le site reste normal dans un navigateur.</div>
          </div>
          <div className="p-8 border-l border-[var(--color-divider,#eaeaea)]">
            <div className="text-4xl font-bold">&lt;200</div>
            <div className="text-sm mt-3 opacity-80">Caractères utiles reçus : la page est une coquille vide, rien à citer.</div>
          </div>
          <div className="p-8 border-l border-[var(--color-divider,#eaeaea)]">
            <div className="text-4xl font-bold">24 h</div>
            <div className="text-sm mt-3 opacity-80">Fréquence des scans. Une régression est signalée le jour même.</div>
          </div>
          <div className="p-8 border-l border-[var(--color-divider,#eaeaea)]">
            <div className="text-4xl font-bold">0</div>
            <div className="text-sm mt-3 opacity-80">Ligne de code à installer chez le client. Audit entièrement externe.</div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes cited-drift { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}} />
    </div>
  );
}
