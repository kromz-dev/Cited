import { NextResponse } from "next/server";
import { generateDiagnosticPdfBuffer } from "@/lib/reports/renderDiagnosticPdf";
import type { ScanReport, ScanCoreResult } from "@/lib/scanner/core";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { report, results } = body as { report: ScanReport; results: ScanCoreResult[] };

    if (!report || !results) {
      return NextResponse.json({ error: "Missing report or results" }, { status: 400 });
    }

    const pdfBuffer = await generateDiagnosticPdfBuffer(report, results);

    let domain = "domain";
    try {
      const url = new URL(report.finalUrl);
      domain = url.hostname.replace(/^www\./, "");
    } catch (err) {
      // fallback
    }

    // `Buffer` n'est pas un `BodyInit` dans les types DOM : on passe le même
    // contenu sous forme de `Uint8Array` (une copie, négligeable pour un PDF).
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="diagnostic-${domain}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
