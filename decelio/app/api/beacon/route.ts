import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const payloadSchema = z.object({
  path: z.string().max(500).default("/"),
  referrer: z.string().max(500).nullable().default(null),
});

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = /bot|crawler|spider|crawling|lighthouse/i.test(userAgent);
    
    if (isBot) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await request.text();
    let path: string = "/";
    let referrer: string | null = null;
    
    if (data) {
      try {
        const payload = JSON.parse(data);
        const parsed = payloadSchema.safeParse(payload);
        if (parsed.success) {
          path = parsed.data.path;
          referrer = parsed.data.referrer;
        }
      } catch {
        // Ignorer les erreurs de parse, on garde les valeurs par défaut
      }
    }

    await db.pageView.create({
      data: {
        path,
        referrer,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur api/beacon:", error);
    return new NextResponse(null, { status: 500 });
  }
}
