import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import authConfig from "./auth.config"
import { verifyPassword } from "@/lib/password"
import { loginSchema } from "@/lib/auth-validation"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email et mot de passe",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, email: true, name: true, image: true, passwordHash: true },
        });
        if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
          return null;
        }
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
})
