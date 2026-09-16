import { NextResponse } from "next/server";
import { z } from "zod";
import { runCoreScan } from "@/lib/scanner/core";
import dns from "dns/promises";

// Simple in-memory rate limiting (max 3 requests per IP per window)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3;

// Cleanup memory leak in rate limiter
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.expiresAt) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();
}

async function isSafeUrl(urlString: string): Promise<boolean> {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;
    
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]") return false;
    
    const lookup = await dns.lookup(hostname);
    const ip = lookup.address;
    
    if (lookup.family === 4) {
      if (
        ip.startsWith("127.") || 
        ip.startsWith("10.") || 
        ip.startsWith("192.168.") || 
        ip.startsWith("169.254.")
      ) return false;
      const parts = ip.split(".");
      if (parts[0] === "172") {
        const second = parseInt(parts[1], 10);
        if (second >= 16 && second <= 31) return false;
      }
    } else if (lookup.family === 6) {
      const lowerIp = ip.toLowerCase();
      if (
        lowerIp === "::1" || 
        lowerIp.startsWith("fc") || 
        lowerIp.startsWith("fd") || 
        lowerIp.startsWith("fe80")
      ) return false;
    }
    
    return true;
  } catch (e) {
    return false; // Reject on DNS failure
  }
}

const requestSchema = z.object({
  url: z.string().url("Veuillez fournir une URL valide, incluant http:// ou https://")
    .refine(val => val.startsWith('http://') || val.startsWith('https://'), { 
      message: "Veuillez fournir une URL valide, incluant http:// ou https://" 
    }),
});

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting based on IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    if (ip !== "unknown") {
      const record = rateLimitMap.get(ip);
      if (record) {
        if (now > record.expiresAt) {
          rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
        } else if (record.count >= MAX_REQUESTS) {
          return NextResponse.json(
            { error: "Trop de requêtes. Veuillez réessayer dans quelques instants." },
            { status: 429 }
          );
        } else {
          record.count += 1;
        }
      } else {
        rateLimitMap.set(ip, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
      }
    }

    // 2. Parse and Validate Request
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "URL invalide" },
        { status: 400 }
      );
    }

    const { url } = parsed.data;

    // 3. SSRF Protection
    const isSafe = await isSafeUrl(url);
    if (!isSafe) {
      return NextResponse.json(
        { error: "Cette URL ne peut pas être scannée pour des raisons de sécurité." },
        { status: 403 }
      );
    }

    // 4. Execute Scan for "GPTBot"
    const results = await runCoreScan(url, ["GPTBot"]);
    const result = results[0];

    return NextResponse.json(result);
  } catch (error) {
    console.error("Scan API Error:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'analyse." },
      { status: 500 }
    );
  }
}
