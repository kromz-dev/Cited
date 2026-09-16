import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createCustomerPortalSession } from "@/lib/billing/actions";
import { Button, Panel } from "@/components/ui";
import { Bell, CreditCard, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";

export const metadata = {
  title: "Réglages | Cited",
};

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Réglages</h1>
        <p className="mt-2 text-sm text-muted">Gérez votre compte, vos abonnements et vos alertes de veille.</p>
      </header>

      <Panel className="p-6">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          Compte
        </h2>
        <dl className="mt-6 divide-y divide-line text-sm">
          <div className="flex items-center justify-between py-4">
            <dt className="text-muted">Nom</dt>
            <dd className="font-medium text-ink">{user.name || "Non renseigné"}</dd>
          </div>
          <div className="flex items-center justify-between py-4">
            <dt className="text-muted">Adresse e-mail</dt>
            <dd className="font-medium text-ink">{user.email || "Non renseignée"}</dd>
          </div>
        </dl>
      </Panel>

      <Panel className="p-6">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-cited" />
          Abonnement et quotas
        </h2>
        <div className="mt-4 text-sm text-muted">
          Vous êtes actuellement sur le plan <strong className="text-ink">{user.plan}</strong>.
        </div>
        <form
          action={async () => {
            "use server";
            await createCustomerPortalSession();
          }}
          className="mt-6"
        >
          <Button type="submit">
            Gérer mon abonnement Stripe
          </Button>
        </form>
      </Panel>

      <Panel className="p-6">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-cited" />
          Veille et Alertes
        </h2>
        <p className="mt-2 text-sm text-muted">
          Recevez une notification si Cited détecte une régression critique sur vos sites (ex: un redéploiement qui casse le rendu JS pour les bots).
        </p>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <div>
            <div className="text-sm font-medium text-ink">Alertes de régression</div>
            <div className="text-xs text-muted">Email immédiat si un robot IA ne peut plus lire vos pages.</div>
          </div>
          {/* TODO: Add a real toggle component here */}
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-cited">
            <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
          </button>
        </div>
      </Panel>

      <Panel className="border-signal/50 bg-signal-light/10 p-6">
        <h2 className="font-heading text-lg font-semibold flex items-center gap-2 text-signal">
          <AlertTriangle className="w-5 h-5" />
          Zone de danger
        </h2>
        <p className="mt-2 text-sm text-signal/80">
          La suppression de votre compte entraînera la perte définitive de toutes vos configurations de pré-rendu et historiques de scan.
        </p>
        <div className="mt-6">
          <Button variant="ghost" className="text-signal hover:bg-signal/10 hover:text-signal">Supprimer mon compte</Button>
        </div>
      </Panel>
    </div>
  );
}
