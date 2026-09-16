import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"
import { isProtectedPath, safeCallbackUrl } from "@/lib/auth-route-policy"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  if (isProtectedPath(req.nextUrl.pathname) && !req.auth) {
    const newUrl = new URL("/login", req.nextUrl.origin)
    const callbackUrl = safeCallbackUrl(`${req.nextUrl.pathname}${req.nextUrl.search}`)
    newUrl.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(newUrl)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
