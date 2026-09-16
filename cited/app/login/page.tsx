import { signIn } from "@/auth";
import Link from "next/link";
import { safeCallbackUrl } from "@/lib/auth-route-policy";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

export const metadata = {
  title: "Connexion | Cited",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const destination = safeCallbackUrl(callbackUrl);

  return (
    <main className="min-h-screen bg-paper px-6 py-16 flex items-center justify-center">
      <div className="w-full max-w-md flex-col items-center">
        <div className="text-center mb-8">
          <Link href="/" className="font-heading text-4xl font-bold tracking-tight text-ink">
            Cited<span className="text-cited">.</span>
          </Link>
          <h1 className="mt-6 font-heading text-2xl font-semibold text-ink">Bienvenue sur Cited</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Connectez-vous pour protéger votre référencement IA.
          </p>
        </div>
        
        <section className="w-full rounded-xl border border-muted/20 bg-white p-8 shadow-sm">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: destination });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper"
            >
              <GoogleIcon className="h-5 w-5" />
              Continuer avec Google
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted">
            En vous connectant, vous acceptez nos CGU et notre politique de confidentialité.
          </p>
        </section>
      </div>
    </main>
  );
}
