"use client";

import React, { useState } from "react";
import { LoaderCircle } from "lucide-react";
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

  const abortControllerRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);

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
      if (err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap justify-center gap-2.5 mt-7 w-full max-w-[580px]"
      >
        <label className="sr-only" htmlFor="scan-url">
          URL de votre site
        </label>
        <input
          id="scan-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://votre-site.com"
          required
          className="min-h-[54px] flex-[1_1_260px] bg-white text-black border border-transparent rounded-md px-4 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            backgroundColor: "var(--color-bg, #fff)",
            color: "var(--color-text, #000)",
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url}
          className="min-h-[54px] px-6 rounded-md font-medium transition-transform duration-160 ease-in-out hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center"
          style={{
            backgroundColor: "var(--color-text, #000)",
            color: "var(--color-bg, #fff)",
          }}
        >
          {loading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "Scanner"}
        </button>
      </form>
      
      <div className="mt-3.5 text-[13px] text-center opacity-80">
        Gratuit, sans compte, résultat en 15 secondes.
      </div>

      {error && (
        <div className="mt-6 text-sm text-red-500 font-medium">
          {error}
        </div>
      )}

      {result && (
        <div
          className="mt-10 inline-flex items-center gap-4 rounded-2xl px-5 py-4 shadow-lg text-left"
          style={{
            backgroundColor: "var(--color-text, #000)",
            color: "var(--color-bg, #fff)",
          }}
        >
          <div>
            <div className="opacity-60 mb-1.5 text-xs font-medium uppercase tracking-wider">
              Réponse du site
            </div>
            <div className="font-mono text-base font-bold">
              {result.httpStatus} {result.simpleStatus}
            </div>
          </div>
          <div className="w-[1px] h-[38px] bg-white/25"></div>
          <div className="text-[13px] opacity-80 max-w-[20ch]">
            {result.simpleStatus === "OK" 
              ? `${result.wordCount} mots lus en ${result.durationMs}ms` 
              : `Mots lisibles: ${result.wordCount}. Bloqué ou vide.`}
          </div>
        </div>
      )}
    </div>
  );
}
