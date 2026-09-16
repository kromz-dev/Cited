import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ArrowUpRight, Check, CircleAlert, CircleDashed } from "lucide-react";

type Tone = "default" | "cited" | "rival" | "signal";

export function Panel({ children, className = "", glass = false, ...props }: HTMLAttributes<HTMLDivElement> & { glass?: boolean }) {
  return (
    <div className={`border border-line bg-white ${glass ? "bg-white/70 shadow-glass backdrop-blur-md" : "shadow-panel"} rounded-lg ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Button({ children, className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-cited text-white hover:bg-ink",
    secondary: "border border-line bg-white text-ink hover:border-cited hover:text-cited",
    ghost: "text-muted hover:bg-paper-deep hover:text-ink",
  };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-heading text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export function Badge({ children, tone = "default", className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { children: ReactNode; tone?: Tone }) {
  const styles = {
    default: "bg-paper-deep text-muted",
    cited: "bg-cited-light text-cited",
    rival: "bg-rival-light text-rival",
    signal: "bg-signal-light text-signal",
  };
  return <span className={`inline-flex items-center rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${styles[tone]} ${className}`} {...props}>{children}</span>;
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
    <div className="max-w-2xl">
      {eyebrow && <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cited">{eyebrow}</div>}
      <h1 className="text-4xl text-ink md:text-5xl">{title}</h1>
      {description && <p className="mt-3 max-w-xl text-base leading-7 text-muted">{description}</p>}
    </div>
    {action}
  </header>;
}

export function StatusDot({ status = "neutral" }: { status?: "positive" | "negative" | "neutral" | "pending" }) {
  const styles = { positive: "bg-cited", negative: "bg-rival", neutral: "bg-muted", pending: "bg-signal" };
  return <span className={`inline-block h-2 w-2 rounded-full ${styles[status]}`} aria-hidden="true" />;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <Panel className="p-12 text-center">
    <CircleDashed className="mx-auto mb-4 h-8 w-8 text-muted" strokeWidth={1.5} />
    <h2 className="text-xl">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </Panel>;
}

export function ResultMark({ mentioned }: { mentioned: boolean }) {
  return mentioned
    ? <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cited-light text-cited"><Check className="h-4 w-4" /></span>
    : <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rival-light text-rival"><CircleAlert className="h-4 w-4" /></span>;
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} className="inline-flex items-center gap-1 font-heading text-sm font-semibold text-cited hover:text-ink">{children}<ArrowUpRight className="h-4 w-4" /></a>;
}
