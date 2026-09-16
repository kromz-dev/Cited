"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("laura@atelier-boreal.fr");
  const [password, setPassword] = useState("••••••••••••");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    router.push("/dashboard");
  }

  function handleMagicLink() {
    setMagicLinkSent(true);
    setTimeout(() => setMagicLinkSent(false), 5000);
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
          <Link
            href="/register"
            className="text-paper/75 hover:text-paper text-sm transition-opacity"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      {/* Main 2-column layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column - Connexion Form */}
        <div className="p-6 sm:p-12 lg:py-14 flex justify-center items-center">
          <div className="w-full max-w-[420px]">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#ae1800] mb-3">
              Connexion
            </div>
            <h1 className="text-[34px] font-extrabold leading-[1.08] mb-2.5 text-ink">
              Content de vous revoir
            </h1>
            <p className="text-sm text-ink mb-6.5 leading-normal">
              Accédez au portefeuille de votre agence et à l&apos;historique des verdicts.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-mail" className="text-xs text-ink/70 font-medium">
                  E-mail professionnel
                </label>
                <input
                  id="c-mail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm text-ink bg-[#eae9e9] border border-line rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#ec3013] focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-pass" className="text-xs text-ink/70 font-medium">
                  Mot de passe
                </label>
                <input
                  id="c-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2 text-sm text-ink bg-[#eae9e9] border border-line rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#ec3013] focus:border-transparent transition-colors"
                />
                <div className="mt-1">
                  <Link
                    href="#"
                    className="text-[13px] text-ink hover:text-[#ec3013] transition-colors"
                  >
                    Mot de passe oublié
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[48px] rounded-[10px] bg-[#ec3013] hover:bg-[#dd2b0f] active:bg-[#ae1800] text-white font-bold text-sm flex items-center justify-center transition-colors disabled:opacity-50 mt-1 cursor-pointer"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3.5 my-6.5">
              <span className="flex-1 h-px bg-line" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                ou
              </span>
              <span className="flex-1 h-px bg-line" />
            </div>

            {/* Magic Link Button */}
            <button
              type="button"
              onClick={handleMagicLink}
              className="w-full min-h-[46px] rounded-[10px] border border-line bg-transparent hover:bg-black/5 active:bg-black/10 text-ink font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
            >
              {magicLinkSent
                ? "Lien envoyé ! Vérifiez votre boîte de réception"
                : "Recevoir un lien de connexion par e-mail"}
            </button>

            <p className="text-muted mt-5.5 text-[13px]">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="text-[#ae1800] hover:text-[#ec3013] underline font-medium transition-colors"
              >
                Ouvrir un compte agence
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column - Status announcement */}
        <div className="bg-[#ec3013] text-paper p-6 sm:p-12 lg:p-14 flex items-center justify-center">
          <div className="w-full max-w-[440px]">
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-paper/80 mb-5">
              Depuis votre dernière visite
            </div>
            <h2 className="text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.08] m-0 text-paper">
              2 domaines de votre portefeuille sont passés au rouge.
            </h2>
            <div className="mt-7 flex flex-col gap-3.5 text-sm text-paper">
              <div className="flex gap-3 border-t border-paper/30 pt-3.5">
                <span className="font-mono min-w-[56px] font-bold">403</span>
                <span>client-vitrine.bubbleapps.io bloque GPTBot depuis 6 jours.</span>
              </div>
              <div className="flex gap-3 border-t border-paper/30 pt-3.5">
                <span className="font-mono min-w-[56px] font-bold">200</span>
                <span>maison-verdier.com ne sert plus que 148 caractères utiles.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
