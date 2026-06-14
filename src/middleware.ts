import NextAuth from "next-auth"
import authConfig from "@/lib/auth.config"

/**
 * Middleware uses the Edge-safe auth config (no MongoDB/Node.js imports).
 * Route protection is handled by the `authorized` callback in auth.config.ts.
 */
export const { auth: middleware } = NextAuth(authConfig)
export default middleware

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
