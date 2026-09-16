"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form action={submit} className="mt-8 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="email">Adresse email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-md border border-line bg-paper px-3 py-3 text-sm focus:border-cited focus:bg-white" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-md border border-line bg-paper px-3 py-3 text-sm focus:border-cited focus:bg-white" />
      </div>
      {error && <p role="alert" className="rounded-md border border-rival/30 bg-rival-light p-3 text-sm text-rival">{error}</p>}
      <button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded bg-cited px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
        {loading ? "Connexion..." : "Se connecter"} <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-center text-sm text-muted">Pas encore de compte ? <Link href="/register" className="font-semibold text-cited hover:underline">Créer un compte</Link></p>
    </form>
  );
}
