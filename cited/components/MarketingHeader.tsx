import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-heading text-2xl font-bold tracking-tight text-[var(--color-ink)]">
          Cited<span className="text-[var(--color-cited)]">.</span>
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-5 text-sm font-medium">
          <Link href="/#fonctionnement" className="hidden text-gray-600 transition-colors hover:text-[var(--color-cited)] sm:inline">
            Fonctionnement
          </Link>
          <Link href="/pricing" className="text-gray-600 transition-colors hover:text-[var(--color-cited)]">
            Tarifs
          </Link>
          <Link href="/dashboard" className="rounded border border-gray-200 px-3 py-2 text-[var(--color-ink)] transition-colors hover:border-[var(--color-cited)] hover:text-[var(--color-cited)]">
            Tableau de bord
          </Link>
        </nav>
      </div>
    </header>
  );
}
