import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-paper pb-8 pt-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="mb-4 inline-block font-heading text-2xl font-bold tracking-tight text-ink">
              Cited<span className="text-cited">.</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted">
              Le scanner technique et proxy géré pour rendre les sites modernes lisibles par l'IA.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 font-semibold text-ink">Produit</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link href="#features" className="hover:text-cited transition-colors">Fonctionnalités</Link></li>
              <li><Link href="#how-it-works" className="hover:text-cited transition-colors">Comment ça marche</Link></li>
              <li><Link href="/pricing" className="hover:text-cited transition-colors">Tarifs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-ink">Ressources</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link href="#" className="hover:text-cited transition-colors">Documentation API</Link></li>
              <li><Link href="#" className="hover:text-cited transition-colors">Guide d'installation</Link></li>
              <li><Link href="#" className="hover:text-cited transition-colors">Blog SEO & AEO</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-ink">Légal</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li><Link href="#" className="hover:text-cited transition-colors">Mentions légales</Link></li>
              <li><Link href="#" className="hover:text-cited transition-colors">Politique de confidentialité</Link></li>
              <li><Link href="#" className="hover:text-cited transition-colors">CGV</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-12 bg-line" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted md:flex-row">
          <p>© {new Date().getFullYear()} Cited. Tous droits réservés.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-ink transition-colors">X (Twitter)</Link>
            <Link href="#" className="hover:text-ink transition-colors">LinkedIn</Link>
            <Link href="#" className="hover:text-ink transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
