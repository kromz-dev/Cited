import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isAppRoute = req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/brands")
  
  if (isAppRoute && !req.auth) {
    const newUrl = new URL("/", req.nextUrl.origin)
    return NextResponse.redirect(newUrl)
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
