import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

/**
 * Edge-compatible auth config.
 * Uses only the Credentials provider (name + email, no password).
 * User upsert into SQLite happens in auth.ts (non-Edge).
 */
export default {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      id: "demo-login",
      name: "Email Login",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Your name" },
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
      },
      async authorize(credentials) {
        const name = credentials?.name as string
        const email = credentials?.email as string

        if (!email || !name) return null

        // Simple email format check
        if (!/^\S+@\S+\.\S+$/.test(email)) return null

        // Return a user object — the JWT callback will store the id
        // The actual SQLite upsert happens in the jwt callback (auth.ts)
        return {
          id: email, // temporary — replaced with real DB id in jwt callback
          name,
          email,
          image: null,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl

      // Always allow these routes
      if (pathname.startsWith("/api/auth")) return true
      if (pathname.startsWith("/invite/")) return true
      if (pathname === "/" || pathname === "/login") return true

      // Require auth for everything else
      return isLoggedIn
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig
