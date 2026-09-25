import { NextResponse } from "next/server";

// Route de santé pour le pinger Render (T003) et le health check du service.
//
// Elle ne doit JAMAIS toucher la base ni appeler un service externe : sinon
// Neon ne se met jamais en veille (§8 de docs/10-plan-technique.md — un ping
// toutes les 10-14 min qui interrogerait la base consommerait 720 h x 0,25 CU
// = 180 CU-h/mois, au-delà des 100 CU-h gratuites de Neon). Ne pas importer
// `@/lib/db` dans ce fichier.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
