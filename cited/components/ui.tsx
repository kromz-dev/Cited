import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { Check, CircleDashed, TriangleAlert } from "lucide-react";

/**
 * Alias historiques, conservés pour compatibilité pendant la migration.
 * Restylés sur les jetons du système (`docs/07-design-system.md`) : plus
 * aucune couleur codée en dur, plus de capitales espacées, aucune flèche
 * décorative. Nouveaux écrans : utiliser `components/ui/*` directement
 * (`Button`, `Badge`, `Card`, `Verdict`).
 */
type Tone = "default" | "cited" | "rival" | "signal";

const toneClass: Record<Tone, string> = {
  default: "border-line bg-surface-2 text-ink-2",
  cited: "border-transparent bg-ok-soft text-ok",
  rival: "border-transparent bg-stop-soft text-stop",
  signal: "border-transparent bg-warn-soft text-warn",
};

export function Panel({ children, className = "", glass = false, ...props }: HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-line ${glass ? "bg-surface/70 shadow-float backdrop-blur-md" : "bg-surface"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({ children, className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-ink text-surface hover:bg-ink/88",
    secondary: "border border-line-strong bg-surface text-ink hover:bg-surface-2",
    ghost: "text-ink hover:bg-surface-2",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "default", className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex h-6 w-fit items-center rounded-xs border px-2 type-caption font-medium ${toneClass[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <div className="mb-2 text-sm text-ink-2">{eyebrow}</div>}
        <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm leading-6 text-ink-2">{description}</p>}
      </div>
      {action}
    </header>
  );
}

/** Ancien indicateur de statut : forme + couleur, sans mot. À préférer : `<Verdict variant="glyph">`. */
export function StatusDot({ status = "neutral" }: { status?: "positive" | "negative" | "neutral" | "pending" }) {
  const styles = { positive: "bg-ok", negative: "bg-stop", neutral: "bg-ink-3", pending: "bg-warn" };
  return <span className={`inline-block h-2 w-2 rounded-full ${styles[status]}`} aria-hidden="true" />;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Panel className="p-12 text-center">
      <CircleDashed className="mx-auto mb-4 h-8 w-8 text-ink-3" strokeWidth={1.5} />
      <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-2">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </Panel>
  );
}

export function ResultMark({ mentioned }: { mentioned: boolean }) {
  return mentioned ? (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ok-soft text-ok">
      <Check className="h-4 w-4" />
    </span>
  ) : (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-stop-soft text-stop">
      <TriangleAlert className="h-4 w-4" />
    </span>
  );
}

/** Lien de navigation, sans flèche décorative. */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-1 text-sm font-medium text-cobalt hover:underline">
      {children}
    </a>
  );
}
