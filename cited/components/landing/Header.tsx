import Link from "next/link";

export function Header() {
  return (
    <div className="flex justify-center border-b border-[var(--color-divider,#eaeaea)]">
      <div className="w-full max-w-[1080px] px-6 py-4 flex items-center justify-between text-sm font-medium">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-auto" style={{ color: "var(--color-bg)" }}>
          <span style={{ color: "var(--color-accent)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 6.5h16"></path>
              <path d="M6.5 12h11"></path>
              <path d="M10 17.5h5"></path>
            </svg>
          </span>
          <span style={{ color: "var(--color-text)" }}>Cited<span style={{ color: "var(--color-accent)" }}>.</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#how-it-works" className="hover:opacity-70 transition-opacity">Fonctionnement</Link>
          <Link href="/pricing" className="hover:opacity-70 transition-opacity">Tarifs</Link>
          <Link href="/login" className="hover:opacity-70 transition-opacity">Connexion</Link>
        </div>
      </div>
    </div>
  );
}
