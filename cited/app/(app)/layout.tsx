import Link from "next/link";
import { auth } from "@/auth";
import { LayoutDashboard, Globe, Settings, LogOut, Bell, FileText } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4 md:hidden">
        <Link href="/" className="font-heading text-xl font-semibold tracking-tight">Cited<span className="text-cited">.</span></Link>
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink">Menu</summary>
          <nav className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-line bg-white p-2 shadow-panel">
            <Link href="/dashboard" className="block rounded px-3 py-2 text-sm hover:bg-paper">Portefeuille</Link>
            <Link href="/alerts" className="block rounded px-3 py-2 text-sm hover:bg-paper">Alertes</Link>
            <Link href="/reports" className="block rounded px-3 py-2 text-sm hover:bg-paper">Rapports</Link>
            <Link href="/sources" className="block rounded px-3 py-2 text-sm hover:bg-paper">Sources</Link>
            <Link href="/settings" className="block rounded px-3 py-2 text-sm hover:bg-paper">Réglages</Link>
          </nav>
        </details>
      </div>
      <div className="flex min-h-[calc(100vh-65px)] md:min-h-screen">
      <aside className="hidden w-64 border-r border-line bg-white/60 p-5 md:flex md:flex-col">
        <Link href="/" className="mb-10 font-heading text-xl font-semibold tracking-tight">Cited<span className="text-cited">.</span></Link>
        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2.5 font-medium text-muted hover:bg-paper-deep hover:text-ink">
            <LayoutDashboard className="w-4 h-4" />
            Portefeuille
          </Link>
          <Link href="/alerts" className="flex items-center gap-2 rounded-md px-3 py-2.5 font-medium text-muted hover:bg-paper-deep hover:text-ink">
            <Bell className="w-4 h-4" />
            Alertes
          </Link>
          <Link href="/reports" className="flex items-center gap-2 rounded-md px-3 py-2.5 font-medium text-muted hover:bg-paper-deep hover:text-ink">
            <FileText className="w-4 h-4" />
            Rapports
          </Link>
          <Link href="/sources" className="flex items-center gap-2 rounded-md px-3 py-2.5 font-medium text-muted hover:bg-paper-deep hover:text-ink">
            <Globe className="w-4 h-4" />
            Sources
          </Link>
          <Link href="/settings" className="flex items-center gap-2 rounded-md px-3 py-2.5 font-medium text-muted hover:bg-paper-deep hover:text-ink">
            <Settings className="w-4 h-4" />
            Réglages
          </Link>
          <Link href="/pricing" className="flex items-center gap-2 px-3 py-2 rounded text-muted hover:bg-muted/10 hover:text-ink transition-colors font-medium">
            Voir les plans
          </Link>
        </nav>
        <div className="flex items-center justify-between gap-2 border-t border-line pt-4 text-sm">
          <span className="truncate">{session.user?.name || session.user?.email}</span>
          <form action={async () => {
            "use server";
            const { signOut } = await import("@/auth");
            await signOut({ redirectTo: "/" });
          }}>
            <button type="submit" className="text-muted hover:text-ink" title="Déconnexion" aria-label="Déconnexion">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {children}
      </main>
      </div>
    </div>
  );
}
