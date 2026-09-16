import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/auth-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Données invalides." }, { status: 400 });
  }

  const { email, name, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "Un compte existe déjà avec cette adresse email." }, { status: 409 });
  }

  await db.user.create({
    data: { email, name, passwordHash: await hashPassword(password) },
  });
  return NextResponse.json({ success: true }, { status: 201 });
}
