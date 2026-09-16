import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Globe, Settings, Home, Wrench } from "lucide-react";
import { signOut } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-white flex flex-col">
        <div className="flex h-16 shrink-0 items-center border-b border-line px-6">
          <Link href="/dashboard" className="font-heading text-2xl font-bold text-ink">
            Cited<span className="text-cited">.</span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          <nav className="flex-1 space-y-1">
            <Link
              href="/dashboard"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-paper"
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0 text-muted group-hover:text-ink" />
              Vue d'ensemble
            </Link>
            <Link
              href="/dashboard/sites"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-paper"
            >
              <Globe className="mr-3 h-5 w-5 flex-shrink-0 text-muted group-hover:text-ink" />
              Mes Sites
            </Link>
            <Link
              href="/dashboard/settings"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-paper"
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-muted group-hover:text-ink" />
              Paramètres
            </Link>
          </nav>
        </div>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={session.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${session.user.email}`}
              alt="Avatar"
              className="h-8 w-8 rounded-full"
            />
            <div className="flex flex-col truncate">
              <span className="truncate text-sm font-medium text-ink">
                {session.user.name || session.user.email?.split("@")[0]}
              </span>
              <span className="truncate text-xs text-muted">{session.user.email}</span>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="mt-2"
          >
            <button
              type="submit"
              className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-signal hover:bg-signal/10"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-64">
        {children}
      </main>
    </div>
  );
}
