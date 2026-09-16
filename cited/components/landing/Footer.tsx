import Link from "next/link";

export function Footer() {
  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8 flex flex-wrap gap-6 text-[13px] items-center text-[var(--color-text)]">
      <span className="font-extrabold text-base tracking-tight">Cited.</span>
      <Link href="/#how-it-works" className="hover:opacity-70 transition-opacity">Fonctionnement</Link>
      <Link href="/pricing" className="hover:opacity-70 transition-opacity">Tarifs</Link>
      <Link href="/" className="hover:opacity-70 transition-opacity">Sommaire</Link>
      <span className="opacity-50 ml-auto">© 2026 Cited</span>
    </div>
  );
}
