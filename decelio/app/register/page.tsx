"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Verdict } from "@/components/ui/verdict";

export default function RegisterPage() {
  const router = useRouter();
  const [agency, setAgency] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 409) {
          router.push("/dashboard");
          return;
        }
        setError(data.error || "L'inscription a échoué. Vérifiez vos informations et réessayez.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      {/* En-tête */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-3.5">
          <Link href="/" className="text-[19px] font-bold tracking-tight text-ink hover:opacity-80 transition-opacity">
            Decelio
          </Link>
          <span className="text-sm text-ink-2">Étape 1 sur 3</span>
        </div>
      </header>

      {/* Barre de progression */}
      <div className="flex h-1.5 bg-line">
        <span className="flex-1 bg-ink" />
        <span className="flex-[2]" />
      </div>

      {/* Deux colonnes */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Colonne gauche : formulaire du compte agence */}
        <div className="flex justify-center p-6 sm:p-12 lg:py-13">
          <div className="w-full max-w-[430px]">
            <p className="mb-2 text-sm font-medium text-ink-2">Créer le compte agence</p>
            <h1 className="mb-2.5 text-[34px] font-extrabold leading-[1.08] text-ink">
              Un compte pour tout le portefeuille
            </h1>
            <p className="mb-6.5 text-sm leading-normal text-ink-2">
              Vous pourrez inviter vos collègues ensuite : les scans et les alertes sont partagés à l&apos;échelle de
              l&apos;agence.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="i-agency" className="text-xs font-medium text-ink-2">
                  Nom de l&apos;agence
                </label>
                <Input
                  id="i-agency"
                  type="text"
                  required
                  fieldSize="lg"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  placeholder="Nom de votre agence"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="i-mail" className="text-xs font-medium text-ink-2">
                  E-mail professionnel
                </label>
                <Input
                  id="i-mail"
                  type="email"
                  required
                  fieldSize="lg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@votre-agence.fr"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="i-pass" className="text-xs font-medium text-ink-2">
                  Mot de passe
                </label>
                <Input
                  id="i-pass"
                  type="password"
                  minLength={12}
                  required
                  fieldSize="lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="text-xs text-ink-2">12 caractères minimum.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span id="i-size-label" className="text-xs font-medium text-ink-2">
                  Nombre de sites à surveiller
                </span>
                <div role="group" aria-labelledby="i-size-label" className="inline-flex w-fit gap-1.5">
                  {(["1-5", "6-20", "20+"] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={siteSize === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSiteSize(option)}
                      aria-pressed={siteSize === option}
                    >
                      {option === "1-5" ? "1 à 5" : option === "6-20" ? "6 à 20" : "20 et plus"}
                    </Button>
                  ))}
                </div>
              </div>

              {error && (
                <p role="alert" className="rounded-md border border-stop/30 bg-stop-soft p-3 text-sm text-stop">
                  {error}
                </p>
              )}

              <Button type="submit" size="lg" disabled={loading} className="mt-1 w-full">
                {loading ? "Création du compte..." : "Créer mon compte"}
              </Button>

              <p className="m-0 text-xs leading-normal text-ink-2">
                Carte bancaire demandée à la dernière étape. Résiliable en un clic.
              </p>
            </form>

            <p className="mt-6 text-[13px] text-ink-2">
              Déjà un compte ?{" "}
              <Link href="/login" className="font-medium text-cobalt hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Colonne droite : illustration d'un premier scan (exemple, pas les données du visiteur) */}
        <div className="flex justify-center border-t border-line bg-surface-2 p-6 sm:p-12 lg:py-13 lg:border-t-0 lg:border-l">
          <div className="w-full max-w-[430px]">
            <p className="mb-4.5 text-sm font-medium text-ink-2">Exemple de premier scan</p>

            <Card className="overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-line">
                <div className="font-mono text-[13px] text-ink">exemple-client.fr</div>
                <div className="mt-1 flex items-center gap-3">
                  <Verdict value="refuse" detail="HTTP 403" size="lg" />
                </div>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-px bg-line p-0">
                <div className="bg-surface p-3.5 sm:px-4.5 sm:py-3.5">
                  <div className="text-xs font-medium text-ink-2">GPTBot</div>
                  <div className="mt-1 font-mono text-[13px] text-ink">403 Forbidden</div>
                </div>
                <div className="bg-surface p-3.5 sm:px-4.5 sm:py-3.5">
                  <div className="text-xs font-medium text-ink-2">Navigateur</div>
                  <div className="mt-1 font-mono text-[13px] text-ink">200 OK</div>
                </div>
                <div className="bg-surface p-3.5 sm:px-4.5 sm:py-3.5">
                  <div className="text-xs font-medium text-ink-2">Texte utile</div>
                  <div className="mt-1 font-mono text-[13px] text-ink">0 caractère</div>
                </div>
                <div className="bg-surface p-3.5 sm:px-4.5 sm:py-3.5">
                  <div className="text-xs font-medium text-ink-2">Depuis</div>
                  <div className="mt-1 font-mono text-[13px] text-ink">6 jours</div>
                </div>
              </CardContent>
            </Card>
            <p className="mt-2 text-xs text-ink-2">Illustration, domaine fictif.</p>

            <p className="mt-5 text-sm leading-normal text-ink-2">
              Chaque domaine que vous ajoutez reste surveillé chaque jour, avec alerte dès qu&apos;il redevient
              lisible — ou qu&apos;il se dégrade encore.
            </p>

            <div className="mt-5.5 flex flex-col gap-2 border-t border-line pt-4.5 text-sm text-ink-2">
              <div>30 domaines inclus · 99 € par mois</div>
              <div>Scan quotidien, alertes e-mail (Slack et webhook en préparation)</div>
              <div>Aucune installation chez vos clients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
