import { auth } from "@/auth";
import { db } from "@/lib/db";
import { whiteLabelFor } from "@/lib/billing/plans";
import { DEFAULT_ACCENT_COLOR } from "@/lib/reports/renderMonthlyReportPdf";
import { Badge } from "@/components/ui/badge";
import { whiteLabelMessage } from "./white-label-summary";
import { BrandSettingsForm } from "./BrandSettingsForm";

/**
 * Section Marque blanche des paramètres (T033, EF-048/EF-050).
 *
 * Server Component, même schéma que `SubscriptionSection`/`PersonalDataSection` :
 * lit la session et la base directement. `whiteLabelFor(plan)` (lib/billing/plans.ts)
 * est la seule autorité sur l'accès — le formulaire n'est monté que pour les
 * comptes qui y ont droit ; les autres voient uniquement la phrase d'annonce,
 * `updateBrandSettings` revérifiant de toute façon le palier côté serveur.
 */
export async function WhiteLabelSection() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!user) return null;

  const hasAccess = whiteLabelFor(user.plan);

  const brandSettings = hasAccess
    ? await db.brandSettings.findUnique({
        where: { userId },
        select: { agencyName: true, logoUrl: true, accentColor: true },
      })
    : null;

  return (
    <section id="marque-blanche" className="scroll-mt-8 border-b border-line pb-8">
      <div className="mb-1.5 flex items-center gap-2">
        <h2 className="text-xl font-semibold text-ink">Marque blanche</h2>
        {!hasAccess && <Badge variant="outline">En préparation</Badge>}
      </div>
      <p className="mb-4.5 max-w-[60ch] text-sm text-ink-2">
        Les rapports clients porteront votre identité, sans mention de Cited.
        {!hasAccess && ` ${whiteLabelMessage(false)}`}
      </p>

      {hasAccess && (
        <BrandSettingsForm
          initialAgencyName={brandSettings?.agencyName ?? ""}
          initialLogoUrl={brandSettings?.logoUrl ?? ""}
          initialAccentColor={brandSettings?.accentColor ?? DEFAULT_ACCENT_COLOR}
        />
      )}
    </section>
  );
}
