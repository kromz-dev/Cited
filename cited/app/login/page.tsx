import Link from "next/link";

import { Verdict } from "@/components/ui/verdict";
import { safeCallbackUrl } from "@/lib/auth-route-policy";
import { LoginForm } from "./LoginForm";

/**
 * Page de connexion (T051, principe II) : le formulaire appelle réellement
 * `signIn("credentials", …)` via `LoginForm`, jamais un état simulé — avant
 * ce correctif, cette page pré-remplissait un e-mail et un mot de passe
 * inventés et redirigeait vers /dashboard sans la moindre vérification, quel
 * que soit ce qui était saisi. `LoginForm` existait déjà (T0xx, jamais
 * branché) et reste la seule voie de connexion par e-mail/mot de passe.
 *
 * `callbackUrl` vient du middleware (`middleware.ts`) quand un visiteur non
 * connecté tente d'atteindre une page protégée ; `safeCallbackUrl` refuse
 * toute valeur qui ne serait pas un chemin interne (protection open-redirect,
 * même garde que dans `middleware.ts`).
 */
export default async function LoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await props.searchParams;
  const safeUrl = safeCallbackUrl(callbackUrl);

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

            <LoginForm callbackUrl={safeUrl} />
          </div>
        </div>

        {/* Colonne droite : illustration d'une alerte (exemple, pas les données du visiteur) */}
        <div className="flex items-center justify-center bg-ink p-6 text-paper sm:p-12 lg:p-14">
          <div className="w-full max-w-[440px]">
            <p className="mb-5 text-sm font-medium text-paper/70">Exemple d&apos;alerte</p>
            <h2 className="m-0 text-[clamp(26px,3.2vw,38px)] font-extrabold leading-[1.08] text-paper">
              Vous êtes prévenu dès qu&apos;un domaine de votre portefeuille passe au rouge.
            </h2>
            <div className="mt-7 flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-3 border-t border-paper/20 pt-3.5">
                <span className="font-mono text-sm text-paper/90">exemple-client.fr</span>
                <Verdict value="refuse" detail="403" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-paper/20 pt-3.5">
                <span className="font-mono text-sm text-paper/90">exemple-agence.fr</span>
                <Verdict value="vide" detail="0 caractère" />
              </div>
            </div>
            <p className="mt-4 text-xs text-paper/60">Illustration, domaines fictifs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
