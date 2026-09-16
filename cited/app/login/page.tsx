import { signIn } from "@/auth";
import Link from "next/link";
import { safeCallbackUrl } from "@/lib/auth-route-policy";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Connexion | Cited",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const { callbackUrl, registered } = await searchParams;
  const destination = safeCallbackUrl(callbackUrl);

  return (
    <main className="min-h-screen bg-paper px-6 py-16">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <Link href="/" className="font-heading text-3xl font-bold tracking-tight text-ink">
          Cited<span className="text-cited">.</span>
        </Link>
        <section className="mt-12 w-full rounded-lg border border-muted/40 bg-white p-8 shadow-sm">
          <h1 className="font-heading text-2xl font-semibold text-ink">Bienvenue sur Cited</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Connectez-vous pour suivre la visibilité de vos marques dans les moteurs IA.
          </p>
          {registered === "1" && <p role="status" className="mt-4 rounded-md border border-cited/30 bg-cited-light p-3 text-sm text-cited">Compte créé. Vous pouvez maintenant vous connecter.</p>}
          <LoginForm callbackUrl={destination} />
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: destination });
            }}
            className="mt-5 border-t border-line pt-5"
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded bg-ink px-4 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink/90"
            >
              Continuer avec Google
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">
            Google OAuth reste disponible pour les comptes qui le préfèrent.
          </p>
        </section>
      </div>
    </main>
  );
}
