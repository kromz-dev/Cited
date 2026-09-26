"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GENERIC_MESSAGE = "Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d'être envoyé.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Trop de tentatives. Réessayez plus tard.");
        setLoading(false);
        return;
      }

      // Réponse générique dans tous les autres cas : on n'indique jamais si le
      // compte existe ou non.
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-[19px] font-bold tracking-tight text-ink hover:opacity-80 transition-opacity">
            Decelio
          </Link>
          <Link href="/login" className="text-sm text-ink-2 hover:text-ink transition-colors">
            Retour à la connexion
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <p className="mb-2 text-sm font-medium text-ink-2">Mot de passe oublié</p>
          <h1 className="mb-2.5 text-[34px] font-extrabold leading-[1.08] text-ink">Réinitialiser votre mot de passe</h1>
          <p className="mb-6.5 text-sm leading-normal text-ink-2">
            Indiquez votre e-mail professionnel : si un compte existe, vous recevrez un lien pour choisir un nouveau
            mot de passe.
          </p>

          {sent ? (
            <p role="status" className="rounded-md border border-line bg-surface-2 p-3 text-sm text-ink">
              {GENERIC_MESSAGE}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="fp-mail" className="text-xs font-medium text-ink-2">
                  E-mail professionnel
                </label>
                <Input
                  id="fp-mail"
                  type="email"
                  required
                  autoComplete="email"
                  fieldSize="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="rounded-md border border-stop/30 bg-stop-soft p-3 text-sm text-stop">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-[13px] text-ink-2">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-cobalt hover:underline">
              Créer mon compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
