import Link from "next/link";
import { auth } from "@/auth";
import { LayoutDashboard, Globe, Settings, LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <aside className="w-64 border-r border-muted/40 p-4 flex flex-col">
        <div className="font-title font-semibold text-xl mb-8 tracking-tight">Cited</div>
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded bg-muted/20 font-medium">
            <LayoutDashboard className="w-4 h-4" />
            Mes marques
          </Link>
          <Link href="/sources" className="flex items-center gap-2 px-3 py-2 rounded text-muted hover:bg-muted/10 hover:text-ink transition-colors font-medium">
            <Globe className="w-4 h-4" />
            Sources
          </Link>
          <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded text-muted hover:bg-muted/10 hover:text-ink transition-colors font-medium">
            <Settings className="w-4 h-4" />
            Réglages
          </Link>
        </nav>
        <div className="pt-4 border-t border-muted/40 text-sm flex items-center gap-2 justify-between">
          <span className="truncate">{session.user?.name || session.user?.email}</span>
          <form action={async () => {
            "use server";
            const { signOut } = await import("@/auth");
            await signOut({ redirectTo: "/" });
          }}>
            <button type="submit" className="text-muted hover:text-ink" title="Déconnexion">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
