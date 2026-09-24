"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Verdict } from "@/components/ui/verdict";

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
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* En-tête */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-[19px] font-bold tracking-tight text-ink hover:opacity-80 transition-opacity">
            Cited
          </Link>
          <Link href="/register" className="text-sm text-ink-2 hover:text-ink transition-colors">
            Créer un compte
          </Link>
        </div>
      </header>

      {/* Deux colonnes */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Colonne gauche : formulaire de connexion */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:py-14">
          <div className="w-full max-w-[420px]">
            <p className="mb-2 text-sm font-medium text-ink-2">Connexion</p>
            <h1 className="mb-2.5 text-[34px] font-extrabold leading-[1.08] text-ink">
              Content de vous revoir
            </h1>
            <p className="mb-6.5 text-sm leading-normal text-ink-2">
              Accédez au portefeuille de votre agence et à l&apos;historique des verdicts.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-mail" className="text-xs font-medium text-ink-2">
                  E-mail professionnel
                </label>
                <Input
                  id="c-mail"
                  type="email"
                  required
                  fieldSize="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-pass" className="text-xs font-medium text-ink-2">
                  Mot de passe
                </label>
                <Input
                  id="c-pass"
                  type="password"
                  required
                  fieldSize="lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Link href="/forgot-password" className="mt-1 w-fit text-[13px] text-cobalt hover:underline">
                  Mot de passe oublié
                </Link>
              </div>

              <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="my-6.5 flex items-center gap-3.5">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs font-medium text-ink-2">ou</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleMagicLink}>
              {magicLinkSent
                ? "Lien envoyé, vérifiez votre boîte de réception"
                : "Recevoir un lien de connexion par e-mail"}
            </Button>

            <p className="mt-5.5 text-[13px] text-ink-2">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-medium text-cobalt hover:underline">
                Créer mon compte
              </Link>
            </p>
          </div>
        </div>

        {/* Colonne droite : dernier changement détecté sur le portefeuille */}
        <div className="flex items-center justify-center bg-ink p-6 text-paper sm:p-12 lg:p-14">
          <div className="w-full max-w-[440px]">
            <p className="mb-5 text-sm font-medium text-paper/70">Depuis votre dernière visite</p>
            <h2 className="m-0 text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.08] text-paper">
              2 domaines de votre portefeuille sont passés au rouge.
            </h2>
            <div className="mt-7 flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-3 border-t border-paper/20 pt-3.5">
                <span className="font-mono text-sm text-paper/90">client-vitrine.bubbleapps.io</span>
                <Verdict value="refuse" detail="403" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-paper/20 pt-3.5">
                <span className="font-mono text-sm text-paper/90">maison-verdier.com</span>
                <Verdict value="vide" detail="0 caractère" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
