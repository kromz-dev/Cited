import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl font-bold tracking-tight text-ink">
            Cited<span className="text-cited">.</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <Link href="#features" className="hover:text-ink transition-colors">
            Fonctionnalités
          </Link>
          <Link href="#how-it-works" className="hover:text-ink transition-colors">
            Comment ça marche
          </Link>
          <Link href="#faq" className="hover:text-ink transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-ink hover:bg-cited-light/50">
              Connexion
            </Button>
          </Link>
          <Link href="/pricing">
            <Button className="bg-cited text-white hover:bg-cited/90 shadow-md hover:shadow-glow transition-all">
              Tarifs
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
