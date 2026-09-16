"use client";

import React, { useState } from "react";
import { ArrowRight, LoaderCircle, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SimpleStatus = "OK" | "BLOQUÉ" | "COQUILLE VIDE" | "ERREUR";

interface ScanResult {
  agent: string;
  simpleStatus: SimpleStatus;
  httpStatus: number;
  durationMs: number;
  wordCount: number;
}

export function ScanForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  // We use a ref to keep track of the current AbortController
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
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

      setResult(data);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: SimpleStatus) => {
    switch (status) {
      case "OK":
        return "text-green-600 bg-green-50 border-green-200";
      case "BLOQUÉ":
      case "ERREUR":
        return "text-red-600 bg-red-50 border-red-200";
      case "COQUILLE VIDE":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: SimpleStatus) => {
    switch (status) {
      case "OK":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "BLOQUÉ":
      case "ERREUR":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "COQUILLE VIDE":
        return <AlertTriangle className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (status: SimpleStatus) => {
    switch (status) {
      case "OK":
        return "Votre site est accessible et lisible par ChatGPT.";
      case "BLOQUÉ":
        return "ChatGPT est bloqué et ne peut pas lire votre site (ex: 403 Forbidden).";
      case "COQUILLE VIDE":
        return "ChatGPT peut accéder au site, mais le contenu est vide (nécessite JavaScript).";
      case "ERREUR":
        return "Une erreur technique s'est produite lors de l'analyse.";
      default:
        return "";
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card className="border-line bg-white/80 shadow-glass backdrop-blur-md">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-cited">
              Test instantané
            </div>
            <h2 className="text-2xl font-bold text-ink">
              Votre site est-il lisible par l'IA ?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Saisissez l'URL de votre site pour simuler la visite de ChatGPT (GPTBot).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="sr-only" htmlFor="url">
                URL de votre site
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  type="url"
                  id="url"
                  name="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://votre-site.com"
                  className="flex-1 border-line bg-paper text-sm transition-colors focus-visible:ring-cited"
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !url} 
                  className="bg-cited hover:bg-cited-deep text-white"
                >
                  {loading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Scanner <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}
          </form>

          {result && (
            <div 
              className={cn(
                "mt-6 flex items-start space-x-4 rounded-lg border p-4 animate-fade-in",
                getStatusColor(result.simpleStatus)
              )}
              aria-live="polite"
            >
              <div className="shrink-0 pt-0.5">
                {getStatusIcon(result.simpleStatus)}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Statut : {result.simpleStatus}
                </h3>
                <p className="mt-1 text-sm opacity-90">
                  {getStatusMessage(result.simpleStatus)}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium opacity-80">
                  <span className="flex items-center">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
                    Code HTTP: {result.httpStatus}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
                    Mots: {result.wordCount}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
                    Temps: {result.durationMs}ms
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-xs text-muted">
        Résultat en quelques secondes · Analyse 100% gratuite
      </p>
    </div>
  );
}
