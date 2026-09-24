import { NextResponse } from "next/server";
import { exportUserData } from "@/app/actions/gdpr";

/**
 * Téléchargement de l'export RGPD (EF-015). GET plutôt que POST : c'est un
 * lien `<a href download>` simple côté client (voir PersonalDataSection),
 * sans fetch/Blob JS. La logique d'assemblage est dans `app/actions/gdpr.ts`.
 */
export async function GET() {
  const result = await exportUserData();

  if ("error" in result) {
    const status = result.error === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(result.data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cited-export-${date}.json"`,
    },
  });
}
