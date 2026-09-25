"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateBrandSettings } from "@/app/actions/settings";

/**
 * Formulaire de marque blanche (EF-048, EF-050) : nom d'agence, URL de logo
 * (https, optionnelle) et couleur d'accent, branché sur `updateBrandSettings`.
 * Rendu uniquement par `WhiteLabelSection` pour les comptes PRO/SCALE — la
 * vérification du palier reste côté serveur dans l'action elle-même, ce
 * composant ne fait que relayer sa réponse.
 */
export function BrandSettingsForm({
  initialAgencyName,
  initialLogoUrl,
  initialAccentColor,
}: {
  initialAgencyName: string;
  initialLogoUrl: string;
  initialAccentColor: string;
}) {
  const [agencyName, setAgencyName] = useState(initialAgencyName);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [accentColor, setAccentColor] = useState(initialAccentColor);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const res = await updateBrandSettings({
        agencyName,
        accentColor,
        logoUrl: logoUrl.trim() || undefined,
      });

      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="brand-agency-name" className="text-sm font-medium text-ink">
          Nom de l&apos;agence
        </label>
        <Input
          id="brand-agency-name"
          value={agencyName}
          onChange={(event) => setAgencyName(event.target.value)}
          maxLength={80}
          required
          placeholder="Atelier Boréal Agence"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="brand-logo-url" className="text-sm font-medium text-ink">
          URL du logo (optionnel)
        </label>
        <Input
          id="brand-logo-url"
          type="url"
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
          maxLength={2048}
          placeholder="https://…/logo.png"
        />
        <p className="type-caption text-ink-2">
          Lien https:// direct vers un PNG ou JPEG. Un logo inaccessible n&apos;empêche jamais la génération du
          rapport, il n&apos;apparaît simplement pas.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="brand-accent-color" className="text-sm font-medium text-ink">
          Couleur d&apos;accent
        </label>
        <div className="flex items-center gap-2.5">
          <input
            id="brand-accent-color"
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#18213a"}
            onChange={(event) => setAccentColor(event.target.value)}
            className="h-9 w-11 shrink-0 cursor-pointer rounded-sm border border-line-strong bg-surface"
            aria-label="Sélecteur de couleur d'accent"
          />
          <Input
            value={accentColor}
            onChange={(event) => setAccentColor(event.target.value)}
            maxLength={7}
            className="w-32"
            aria-label="Couleur d'accent (hexadécimal)"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-stop">
          {error}
        </p>
      )}
      {saved && !error && <p className="text-sm text-ok">Réglages enregistrés.</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
