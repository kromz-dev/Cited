import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * Nom de fichier sûr pour l'en-tête `Content-Disposition` : lettres/chiffres
 * ASCII et tirets uniquement (accents retirés, reste remplacé).
 */
function slug(value: string): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "client";
}

/**
 * T032b (EF-049) : téléchargement du PDF d'un `MonthlyReport` déjà généré
 * par `generateMonthlyReport` (app/actions/reports.ts). La propriété se
 * vérifie via `client.userId`, comme `MonthlyReport` n'a pas de `userId`
 * propre — même règle que `loadMonthlyReportData`. Un rapport absent ou
 * appartenant à un autre compte rend un 404 identique (pas de fuite
 * d'existence), sur le modèle de `deleteMonitoredSite` (sites.ts).
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await db.monthlyReport.findUnique({
      where: { id },
      select: {
        pdf: true,
        period: true,
        client: { select: { userId: true, name: true } },
      },
    });

    if (!report || !report.pdf || report.client.userId !== userId) {
      return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 });
    }

    const filename = `rapport-${slug(report.client.name)}-${report.period}.pdf`;

    // `Buffer` n'est pas un `BodyInit` dans les types DOM : on passe le même
    // contenu sous forme de `Uint8Array` (voir app/api/pdf/diagnostic/route.ts).
    return new NextResponse(new Uint8Array(report.pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading monthly report PDF:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
