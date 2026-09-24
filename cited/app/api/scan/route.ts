import { NextResponse } from "next/server";
import { z } from "zod";
import { runCoreScan } from "@/lib/scanner/core";
import { assertSafeUrl } from "@/lib/scanner/crawler";
import { callerKey, rateLimit } from "@/lib/rate-limit";

// 3 scans par minute et par IP, compteur partagé en base (voir lib/rate-limit).
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 3;

const INVALID_URL = "Veuillez fournir une URL valide, incluant http:// ou https://";

const requestSchema = z.object({
  url: z.string().url(INVALID_URL)
    .refine(val => val.startsWith('http://') || val.startsWith('https://'), { message: INVALID_URL }),
});

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting based on IP
    const quota = await rateLimit(callerKey(request, "scan"), MAX_REQUESTS, RATE_LIMIT_WINDOW_MS);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez réessayer dans quelques instants." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, Math.ceil((quota.resetAt.getTime() - Date.now()) / 1000))) },
        }
      );
    }

    // 2. Parse and Validate Request
    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "URL invalide" },
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // 3. SSRF Protection (le crawler la refait sur chaque redirection)
    try {
      await assertSafeUrl(url);
    } catch {
      return NextResponse.json(
        { error: "Cette URL ne peut pas être scannée pour des raisons de sécurité." },
        { status: 403 }
      );
    }

    // 4. Execute Scan for "GPTBot"
    const { report, results } = await runCoreScan(url, ["GPTBot"]);

    return NextResponse.json({ ...results[0], report });
  } catch (error) {
    console.error("Scan API Error:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'analyse." },
      { status: 500 }
    );
  }
}
