"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { safeCallbackUrl } from "@/lib/auth-route-policy";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(result.error ?? "Impossible de créer le compte.");
      setLoading(false);
      return;
    }
    router.push(`/login?callbackUrl=${encodeURIComponent(safeCallbackUrl("/dashboard"))}&registered=1`);
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-16">
      <div className="mx-auto max-w-md">
        <Link href="/" className="font-heading text-3xl font-bold tracking-tight text-ink">Cited<span className="text-cited">.</span></Link>
        <section className="mt-12 rounded-lg border border-line bg-white p-8 shadow-panel">
          <h1 className="font-heading text-2xl font-semibold text-ink">Créer votre compte</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Suivez la visibilité de vos marques avec un compte Cited.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div><label className="mb-2 block text-sm font-semibold" htmlFor="name">Nom</label><input id="name" name="name" autoComplete="name" required className="w-full rounded-md border border-line bg-paper px-3 py-3 text-sm focus:border-cited focus:bg-white" /></div>
            <div><label className="mb-2 block text-sm font-semibold" htmlFor="email">Adresse email</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-md border border-line bg-paper px-3 py-3 text-sm focus:border-cited focus:bg-white" /></div>
            <div><label className="mb-2 block text-sm font-semibold" htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required className="w-full rounded-md border border-line bg-paper px-3 py-3 text-sm focus:border-cited focus:bg-white" /><p className="mt-1 text-xs text-muted">12 caractères minimum.</p></div>
            {error && <p role="alert" className="rounded-md border border-rival/30 bg-rival-light p-3 text-sm text-rival">{error}</p>}
            <button type="submit" disabled={loading} className="min-h-11 w-full rounded bg-cited px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Création..." : "Créer mon compte"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">Déjà inscrit ? <Link href="/login" className="font-semibold text-cited hover:underline">Se connecter</Link></p>
        </section>
      </div>
    </main>
  );
}
