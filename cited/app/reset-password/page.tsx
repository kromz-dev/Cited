"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Ce lien de réinitialisation est invalide ou a expiré.");
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p role="alert" className="rounded-md border border-stop/30 bg-stop-soft p-3 text-sm text-stop">
        Ce lien de réinitialisation est invalide ou incomplet. Demandez-en un nouveau depuis la page{" "}
        <Link href="/forgot-password" className="font-medium underline">
          mot de passe oublié
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <p role="status" className="rounded-md border border-line bg-surface-2 p-3 text-sm text-ink">
        Votre mot de passe a été mis à jour. Redirection vers la connexion...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="rp-pass" className="text-xs font-medium text-ink-2">
          Nouveau mot de passe
        </label>
        <Input
          id="rp-pass"
          type="password"
          required
          autoComplete="new-password"
          fieldSize="lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="text-xs text-ink-2">12 caractères minimum.</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="rp-pass-confirm" className="text-xs font-medium text-ink-2">
          Confirmer le mot de passe
        </label>
        <Input
          id="rp-pass-confirm"
          type="password"
          required
          autoComplete="new-password"
          fieldSize="lg"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-stop/30 bg-stop-soft p-3 text-sm text-stop">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
        {loading ? "Mise à jour..." : "Choisir ce mot de passe"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-[19px] font-bold tracking-tight text-ink hover:opacity-80 transition-opacity">
            Cited
          </Link>
          <Link href="/login" className="text-sm text-ink-2 hover:text-ink transition-colors">
            Retour à la connexion
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <p className="mb-2 text-sm font-medium text-ink-2">Nouveau mot de passe</p>
          <h1 className="mb-2.5 text-[34px] font-extrabold leading-[1.08] text-ink">Choisissez un nouveau mot de passe</h1>
          <p className="mb-6.5 text-sm leading-normal text-ink-2">
            Ce lien est valable 1 heure et ne peut être utilisé qu&apos;une seule fois.
          </p>

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
