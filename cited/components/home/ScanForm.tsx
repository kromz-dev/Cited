"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Verdict, type VerdictValue } from "@/components/ui/verdict";
import type { BotAgent } from "@/lib/scanner/agents";
import type { ScanCoreResult, ScanReport } from "@/lib/scanner/core";

type ScanApiResponse = ScanCoreResult & { report: ScanReport };

/**
 * Un assistant par bot de citation (pas d'entraînement) : c'est ce qui
 * détermine si l'assistant peut citer le site dans une réponse.
 */
const ASSISTANTS: { label: string; bot: BotAgent }[] = [
  { label: "ChatGPT", bot: "OAI-SearchBot" },
  { label: "Claude", bot: "Claude-SearchBot" },
  { label: "Perplexity", bot: "PerplexityBot" },
];

interface ResultSummary {
  value: VerdictValue;
  cause: string;
  fix?: string;
}

function verdictForBot(report: ScanReport, bot: BotAgent): ResultSummary {
  const { access, robots, jsDependency } = report;

  if (access.risk === "unreachable" || access.risk === "http_error") {
    return {
      value: "inconnu",
      cause:
        access.risk === "unreachable"
          ? `Le site n'a pas répondu${access.error ? ` (${access.error})` : ""}.`
          : `Le site a répondu avec une erreur HTTP ${access.httpStatus}.`,
    };
  }

  const policy = robots.policies.find((p) => p.bot === bot);
  if (policy?.verdict === "disallowed") {
    return {
      value: "refuse",
      cause:
        robots.fetchStatus === "unreachable"
          ? "Le fichier robots.txt est injoignable ; par précaution, tout est interdit."
          : `Le fichier robots.txt interdit ${policy.token}.`,
      fix: "Autoriser ce robot dans robots.txt.",
    };
  }

  if (access.risk === "challenged" || access.risk === "blocked") {
    return {
      value: "refuse",
      cause:
        access.risk === "challenged"
          ? "Un pare-feu ou un challenge de sécurité répond avant le contenu."
          : `Le site refuse la requête (HTTP ${access.httpStatus}).`,
      fix: "Autoriser ce robot dans les règles du pare-feu ou du plugin de sécurité.",
    };
  }

  if (jsDependency.verdict === "js_dependent" || jsDependency.verdict === "likely_js_dependent") {
    return {
      value: "vide",
      cause: `La page arrive quasi vide sans exécuter de JavaScript (${jsDependency.rawWordCount} mots).`,
      fix: "Pré-rendre le contenu côté serveur (SSR/SSG) pour les robots qui n'exécutent pas de script.",
    };
  }

  return { value: "lu", cause: "Le robot peut lire le contenu normalement." };
}

function robotsSummary(report: ScanReport): ResultSummary {
  const { robots } = report;
  if (robots.fetchStatus === "unreachable") {
    return {
      value: "inconnu",
      cause: "Le fichier robots.txt est injoignable (panne ou délai dépassé).",
      fix: "Vérifier que /robots.txt répond correctement depuis l'hébergeur.",
    };
  }
  if (robots.fetchStatus === "challenged") {
    return {
      value: "inconnu",
      cause: "Un pare-feu répond à la place du fichier robots.txt : sa politique est illisible.",
    };
  }
  if (robots.fetchStatus === "unavailable") {
    return { value: "lu", cause: "Le fichier robots.txt n'existe pas (404) : tout est autorisé par défaut." };
  }
  const disallowed = ASSISTANTS.filter(
    (a) => robots.policies.find((p) => p.bot === a.bot)?.verdict === "disallowed"
  );
  if (disallowed.length === 0) {
    return { value: "lu", cause: "robots.txt autorise ChatGPT, Claude et Perplexity à citer ce site." };
  }
  return {
    value: "refuse",
    cause: `robots.txt interdit ${disallowed.map((a) => a.label).join(", ")}.`,
    fix: "Autoriser ces robots dans robots.txt avec un groupe User-agent dédié.",
  };
}

function accessSummary(report: ScanReport): ResultSummary {
  const { access } = report;
  switch (access.risk) {
    case "ok":
      return { value: "lu", cause: `Le site répond normalement (HTTP ${access.httpStatus}).` };
    case "challenged":
      return {
        value: "refuse",
        cause: `Un pare-feu ou un challenge de sécurité répond à la place du contenu${
          access.signals.length ? ` (${access.signals.join(", ")})` : ""
        }.`,
        fix: "Autoriser les robots IA vérifiés dans les règles du pare-feu (Cloudflare, Wordfence, hébergeur).",
      };
    case "blocked":
      return {
        value: "refuse",
        cause: `Le site refuse la requête (HTTP ${access.httpStatus}).`,
        fix: "Vérifier les règles de sécurité qui bloquent ce code réponse.",
      };
    case "http_error":
      return { value: "inconnu", cause: `Le site répond avec une erreur HTTP ${access.httpStatus}.` };
    case "unreachable":
      return {
        value: "inconnu",
        cause: `Le site n'a pas répondu${access.error ? ` : ${access.error}` : "."}`,
      };
  }
}

function jsSummary(report: ScanReport): ResultSummary {
  const { jsDependency, access } = report;
  if (access.risk !== "ok") {
    return { value: "inconnu", cause: "Non mesuré : la page n'a pas pu être chargée normalement (voir Accès)." };
  }
  switch (jsDependency.verdict) {
    case "static":
      return { value: "lu", cause: `Le texte utile est présent dans le HTML brut (${jsDependency.rawWordCount} mots).` };
    case "partial":
      return {
        value: "vide",
        cause: `Une partie du texte n'apparaît qu'après exécution du JavaScript (${jsDependency.rawWordCount} mots sur ${jsDependency.renderedWordCount ?? "?"} rendus).`,
        fix: "Pré-rendre les éléments importants côté serveur pour les robots qui n'exécutent pas de script.",
      };
    case "js_dependent":
      return {
        value: "vide",
        cause: `Le HTML brut est quasi vide (${jsDependency.rawWordCount} mots) : le contenu n'arrive qu'après JavaScript.`,
        fix: "Passer en rendu côté serveur (SSR/SSG) ou générer une version statique pour les robots.",
      };
    case "likely_js_dependent":
      return {
        value: "vide",
        cause: `Le HTML brut est très court (${jsDependency.rawWordCount} mots), sans confirmation par un rendu.`,
        fix: "Vérifier avec un rendu JavaScript, ou passer en rendu côté serveur.",
      };
    case "unknown":
      return { value: "inconnu", cause: "Impossible de mesurer le contenu de la page." };
  }
}

const RISK_LABEL: Record<string, string> = {
  ok: "accès normal",
  challenged: "défi de sécurité",
  blocked: "bloqué",
  http_error: "erreur HTTP",
  unreachable: "injoignable",
};

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return "";
  }
}

function ResultRow({ title, value, cause, fix }: { title: string } & ResultSummary) {
  return (
    <div className="flex flex-col gap-1 border-t border-line pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-2">
        <Verdict value={value} variant="inline" size="sm" />
        <span className="type-table font-medium text-ink">{title}</span>
      </div>
      <p className="type-caption text-ink-2">{cause}</p>
      {fix && (
        <p className="type-caption text-ink-2">
          <span className="font-medium text-ink">Correctif : </span>
          {fix}
        </p>
      )}
    </div>
  );
}

function ScanResultPanel({ data, submittedUrl }: { data: ScanApiResponse; submittedUrl: string }) {
  const { report } = data;
  const redirectCount = report.access.redirects.length;
  const redirected = redirectCount > 0 && report.finalUrl !== submittedUrl;

  return (
    <Card size="sm" className="mt-6 w-full max-w-[560px]">
      <CardContent className="flex flex-col gap-4">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="type-table min-w-0 truncate font-semibold text-ink">{report.finalUrl}</p>
            <p className="type-caption shrink-0 text-ink-2">
              Vérifié à <span className="tnum">{formatTime(report.scannedAt)}</span>
            </p>
          </div>
          {redirected && (
            <p className="mt-1 type-caption text-ink-2">
              Redirigé depuis {submittedUrl} ({redirectCount} redirection{redirectCount > 1 ? "s" : ""}).
            </p>
          )}
        </div>

        <ul className="flex flex-wrap gap-2">
          {ASSISTANTS.map(({ label, bot }) => {
            const v = verdictForBot(report, bot);
            return (
              <li
                key={bot}
                className="flex items-center gap-1.5 rounded-sm border border-line bg-paper px-2 py-1.5"
              >
                <Badge>{label}</Badge>
                <Verdict value={v.value} variant="inline" size="sm" />
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-3">
          <ResultRow title="Politique robots.txt" {...robotsSummary(report)} />
          <ResultRow title="Accès / pare-feu" {...accessSummary(report)} />
          <ResultRow title="Dépendance JavaScript" {...jsSummary(report)} />
        </div>

        {report.access.unverifiedProbes.length > 0 && (
          <div className="border-t border-line pt-3">
            <p className="type-caption font-medium text-ink-2">Signaux indicatifs (requêtes non vérifiées)</p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {report.access.unverifiedProbes.map((probe) => (
                <li key={probe.claimedBot} className="type-caption text-ink-2">
                  {probe.claimedBot} : {RISK_LABEL[probe.risk] ?? probe.risk} (HTTP {probe.httpStatus}) —
                  indicatif, non vérifié.
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ScanForm() {
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<ScanApiResponse | null>(null);
  const [submittedUrl, setSubmittedUrl] = React.useState("");

  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResult(null);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        signal: abortControllerRef.current.signal,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Réponse inattendue du serveur.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible de scanner ce domaine. Vérifiez l'URL.");
      }

      setSubmittedUrl(trimmed);
      setResult(data as ScanApiResponse);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-start">
      <form onSubmit={handleSubmit} className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <label htmlFor="scan-url" className="sr-only">
            URL du site à scanner
          </label>
          <Input
            id="scan-url"
            type="url"
            fieldSize="lg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://votre-site.com"
            required
            disabled={loading}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "scan-error" : undefined}
          />
        </div>
        <Button type="submit" size="lg" disabled={loading || !url.trim()} className="w-full sm:w-auto">
          {loading ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden />
              Analyse…
            </>
          ) : (
            "Scanner"
          )}
        </Button>
      </form>

      <p className="mt-2 type-caption text-ink-2">Gratuit, sans compte, résultat en 15 secondes.</p>

      {error && (
        <p id="scan-error" role="alert" className="mt-3 text-sm font-medium text-stop">
          {error}
        </p>
      )}

      {result && <ScanResultPanel data={result} submittedUrl={submittedUrl} />}
    </div>
  );
}
