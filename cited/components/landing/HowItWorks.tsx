export function HowItWorks() {
  return (
    <div id="how-it-works" className="py-16 lg:py-24 border-b border-[var(--color-divider,#eaeaea)]">
      <div className="max-w-[1080px] mx-auto px-6">
        <div className="flex flex-wrap gap-4 justify-between items-baseline mb-10">
          <h2 className="text-[clamp(26px,3vw,34px)] font-bold m-0">Comment ça marche</h2>
          <span className="text-sm opacity-70">Trois étapes, dix secondes d&apos;installation</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-t-2 border-[var(--color-accent)] pt-5 pr-5 pb-6 transition-transform duration-200 hover:-translate-y-1">
            <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3">Étape 01</div>
            <h3 className="text-xl font-bold mb-3">Vous collez vos domaines</h3>
            <p className="text-sm opacity-80 m-0 leading-relaxed">Un par ligne, ou en lot depuis un CSV. Jusqu&apos;à 20 sites dans l&apos;offre agence.</p>
          </div>
          <div className="border-t-2 border-[var(--color-divider,#eaeaea)] pt-5 pr-5 pb-6 transition-transform duration-200 hover:-translate-y-1">
            <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3">Étape 02</div>
            <h3 className="text-xl font-bold mb-3">Nous scannons chaque jour</h3>
            <p className="text-sm opacity-80 m-0 leading-relaxed">Requête avec le User-Agent des bots IA, lecture du HTML servi, mesure du texte réellement exploitable.</p>
          </div>
          <div className="border-t-2 border-[var(--color-divider,#eaeaea)] pt-5 pr-5 pb-6 transition-transform duration-200 hover:-translate-y-1">
            <div className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3">Étape 03</div>
            <h3 className="text-xl font-bold mb-3">Vous êtes alerté, pas votre client</h3>
            <p className="text-sm opacity-80 m-0 leading-relaxed">Slack ou e-mail au premier passage de vert à rouge, avec le code HTTP et la page concernée.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
