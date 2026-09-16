"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [agency, setAgency] = useState("Atelier Boréal");
  const [email, setEmail] = useState("laura@atelier-boreal.fr");
  const [password, setPassword] = useState("••••••••••••");
  const [siteSize, setSiteSize] = useState("6-20");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agency,
          email,
          password: password === "••••••••••••" ? "MotDePasse1234!" : password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 409) {
          router.push("/dashboard");
          return;
        }
        setError(data.error || "Une erreur est survenue lors de l'inscription.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans">
      {/* Topbar */}
      <header className="bg-ink text-paper">
        <div className="w-full max-w-[1240px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-paper font-extrabold text-[19px] tracking-tight mr-auto hover:opacity-95 transition-opacity"
          >
            <span className="text-[#ec3013] mr-2.5 inline-flex">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M4 6.5h16" />
                <path d="M6.5 12h11" />
                <path d="M10 17.5h5" />
              </svg>
            </span>
            Cited<span className="text-[#ec3013]">.</span>
          </Link>
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-paper/60">
            Étape 1 sur 3
          </span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex h-1.5 bg-line">
        <span className="flex-1 bg-[#ec3013]" />
        <span className="flex-[2]" />
      </div>

      {/* Main 2-column layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column - Agency Account Form */}
        <div className="p-6 sm:p-12 lg:py-13 flex justify-center">
          <div className="w-full max-w-[430px]">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#ae1800] mb-3">
              Créer le compte agence
            </div>
            <h1 className="text-[34px] font-extrabold leading-[1.08] mb-2.5 text-ink">
              Un compte pour tout le portefeuille
            </h1>
            <p className="text-sm text-ink mb-6.5 leading-normal">
              Vous pourrez inviter vos collègues ensuite : les scans et les alertes sont partagés à l&apos;échelle de l&apos;agence.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="i-agency" className="text-xs text-ink/70 font-medium">
                  Nom de l&apos;agence
                </label>
                <input
                  id="i-agency"
                  type="text"
                  required
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm text-ink bg-[#eae9e9] border border-line rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#ec3013] focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="i-mail" className="text-xs text-ink/70 font-medium">
                  E-mail professionnel
                </label>
                <input
                  id="i-mail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm text-ink bg-[#eae9e9] border border-line rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#ec3013] focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="i-pass" className="text-xs text-ink/70 font-medium">
                  Mot de passe
                </label>
                <input
                  id="i-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm text-ink bg-[#eae9e9] border border-line rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#ec3013] focus:border-transparent transition-colors"
                />
                <span className="text-muted text-xs">12 caractères minimum.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="i-size" className="text-xs text-ink/70 font-medium">
                  Nombre de sites à surveiller
                </label>
                <div id="i-size" className="inline-flex border border-line rounded-[10px] overflow-hidden w-fit">
                  <button
                    type="button"
                    onClick={() => setSiteSize("1-5")}
                    className={`px-3.5 py-2 text-[13px] font-medium transition-colors cursor-pointer border-r border-line ${
                      siteSize === "1-5"
                        ? "bg-ink text-paper"
                        : "bg-transparent text-ink hover:bg-black/5"
                    }`}
                  >
                    1 à 5
                  </button>
                  <button
                    type="button"
                    onClick={() => setSiteSize("6-20")}
                    className={`px-3.5 py-2 text-[13px] font-medium transition-colors cursor-pointer border-r border-line ${
                      siteSize === "6-20"
                        ? "bg-ink text-paper"
                        : "bg-transparent text-ink hover:bg-black/5"
                    }`}
                  >
                    6 à 20
                  </button>
                  <button
                    type="button"
                    onClick={() => setSiteSize("20+")}
                    className={`px-3.5 py-2 text-[13px] font-medium transition-colors cursor-pointer ${
                      siteSize === "20+"
                        ? "bg-ink text-paper"
                        : "bg-transparent text-ink hover:bg-black/5"
                    }`}
                  >
                    20 et plus
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 text-sm text-[#7c1405] bg-[#fff2ef] border border-[#ffc4b8] rounded-[10px]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] rounded-[10px] bg-[#ec3013] hover:bg-[#dd2b0f] active:bg-[#ae1800] text-white font-bold text-sm flex items-center justify-center transition-colors disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? "Création en cours..." : "Continuer"}
              </button>

              <p className="text-muted text-xs m-0 leading-normal">
                Carte bancaire demandée à la dernière étape. Résiliable en un clic.
              </p>
            </form>

            <p className="text-muted mt-6 text-[13px]">
              Déjà un compte ?{" "}
              <Link
                href="/login"
                className="text-[#ae1800] hover:text-[#ec3013] underline font-medium transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Preserved Scan Summary */}
        <div className="bg-[#eae9e9] border-t lg:border-t-0 lg:border-l-2 border-line p-6 sm:p-12 lg:py-13 flex justify-center">
          <div className="w-full max-w-[430px]">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted mb-4.5">
              Votre scan conservé
            </div>

            {/* Scan Card */}
            <div className="border border-line rounded-[16px] overflow-hidden bg-paper shadow-sm">
              <div className="p-5 border-b border-line">
                <div className="font-mono text-[13px] text-ink">client-vitrine.bubbleapps.io</div>
                <div className="flex items-center gap-3 mt-3">
                  <span className="w-4 h-4 rounded-[5px] bg-[#ec3013] shrink-0" />
                  <span className="font-heading font-extrabold text-[22px] text-ink">Bloqué</span>
                  <span className="ml-auto inline-flex items-center text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-[7px] bg-[#fff2ef] text-[#7c1405]">
                    HTTP 403
                  </span>
                </div>
              </div>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-px bg-line">
                <div className="p-3.5 sm:px-4.5 sm:py-3.5 bg-paper">
                  <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted">
                    GPTBot
                  </div>
                  <div className="font-mono text-[13px] mt-1 text-ink">403 Forbidden</div>
                </div>
                <div className="p-3.5 sm:px-4.5 sm:py-3.5 bg-paper">
                  <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted">
                    Navigateur
                  </div>
                  <div className="font-mono text-[13px] mt-1 text-ink">200 OK</div>
                </div>
                <div className="p-3.5 sm:px-4.5 sm:py-3.5 bg-paper">
                  <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted">
                    Texte utile
                  </div>
                  <div className="font-mono text-[13px] mt-1 text-ink">0 caractère</div>
                </div>
                <div className="p-3.5 sm:px-4.5 sm:py-3.5 bg-paper">
                  <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-muted">
                    Depuis
                  </div>
                  <div className="font-mono text-[13px] mt-1 text-ink">6 jours</div>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm text-ink/85 leading-normal">
              Ce domaine sera ajouté automatiquement à votre portefeuille. Il restera surveillé chaque jour, avec alerte dès qu&apos;il redevient lisible — ou qu&apos;il se dégrade encore.
            </p>

            <div className="border-t border-line mt-5.5 pt-4.5 flex flex-col gap-2 text-sm text-ink/85">
              <div>20 domaines inclus · 99 € par mois</div>
              <div>Scan quotidien, alertes e-mail, Slack et webhook</div>
              <div>Aucune installation chez vos clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
