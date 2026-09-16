import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Réglages | Cited",
};

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-semibold">Réglages</h1>
        <p className="mt-2 text-sm text-muted">Les informations de votre compte Cited.</p>
      </header>
      <section className="rounded-lg border border-muted/40 bg-white p-6">
        <h2 className="font-heading text-lg font-semibold">Compte</h2>
        <dl className="mt-6 divide-y divide-muted/20 text-sm">
          <div className="flex justify-between gap-4 py-4">
            <dt className="text-muted">Nom</dt>
            <dd className="font-medium">{user.name || "Non renseigné"}</dd>
          </div>
          <div className="flex justify-between gap-4 py-4">
            <dt className="text-muted">Adresse e-mail</dt>
            <dd className="font-medium">{user.email || "Non renseignée"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
