
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/lib/billing/actions";

const tiers = [
  {
    name: "FREE",
    id: "tier-free",
    priceMonthly: "0 €",
    description: "Le strict minimum pour tester.",
    features: [
      "1 Audit public",
      "Pas de suivi récurrent",
      "Pas de correctifs IA",
    ],
    action: "Créer un compte gratuit",
    priceId: null,
  },
  {
    name: "SOLO",
    id: "tier-solo",
    priceMonthly: "29 €",
    description: "Parfait pour un indépendant ou une seule marque.",
    features: [
      "1 Marque suivie",
      "Jusqu'à 15 requêtes",
      "Audit hebdomadaire automatique",
      "Correctifs de contenu SEO & JSON-LD",
    ],
    action: "Commencer avec Solo",
    priceId: process.env.STRIPE_PRICE_SOLO,
    mostPopular: false,
  },
  {
    name: "PRO",
    id: "tier-pro",
    priceMonthly: "49 €",
    description: "L'outil complet pour suivre sa visibilité IA sérieusement.",
    features: [
      "3 Marques suivies",
      "Jusqu'à 50 requêtes par marque",
      "Audit 2x / semaine",
      "Génération llms.txt & sources",
      "Export CSV",
    ],
    action: "Passer Pro",
    priceId: process.env.STRIPE_PRICE_PRO,
    mostPopular: true,
  },
  {
    name: "SCALE",
    id: "tier-scale",
    priceMonthly: "79 €",
    description: "Pour les marques en forte croissance.",
    features: [
      "10 Marques suivies",
      "Jusqu'à 100 requêtes par marque",
      "Audit quotidien",
      "Support prioritaire",
    ],
    action: "Passer Scale",
    priceId: process.env.STRIPE_PRICE_SCALE,
    mostPopular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Tarifs</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choisissez le plan adapté à votre visibilité IA
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Obtenez des correctifs concrets pour améliorer votre classement sur ChatGPT, Perplexity et Gemini.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 ${
                tier.mostPopular ? "bg-gray-900 ring-gray-900" : "bg-white"
              }`}
            >
              <h3
                id={tier.id}
                className={`text-lg font-semibold leading-8 ${
                  tier.mostPopular ? "text-white" : "text-gray-900"
                }`}
              >
                {tier.name}
              </h3>
              <p
                className={`mt-4 text-sm leading-6 ${
                  tier.mostPopular ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    tier.mostPopular ? "text-white" : "text-gray-900"
                  }`}
                >
                  {tier.priceMonthly}
                </span>
                <span
                  className={`text-sm font-semibold leading-6 ${
                    tier.mostPopular ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  /mois
                </span>
              </p>
              <form
                action={async () => {
                  "use server";
                  // On transmet le nom du plan, jamais l'identifiant de tarif :
                  // c'est le serveur qui décide du prix correspondant.
                  if (tier.name !== "FREE") {
                    await createCheckoutSession(tier.name);
                  }
                }}
                className="mt-6"
              >
                <button
                  type="submit"
                  disabled={!tier.priceId && tier.name !== "FREE"}
                  className={`w-full py-2 px-4 rounded-md font-semibold text-sm transition-colors ${
                    tier.mostPopular
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "bg-[var(--color-cited)] text-white hover:bg-blue-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {tier.action}
                </button>
              </form>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 xl:mt-10 ${
                  tier.mostPopular ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className={`h-6 w-5 flex-none ${
                        tier.mostPopular ? "text-white" : "text-indigo-600"
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
