import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { upsertUser } from "./db"

/**
 * Full auth config with SQLite user upsert.
 * Only used in server components and API routes (Node.js runtime).
 * Middleware uses auth.config.ts directly to stay Edge-compatible.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        // On sign-in, upsert the user into SQLite and store the real DB id
        const dbUser = upsertUser(
          user.name ?? "Anonymous",
          user.email ?? "",
          user.image
        )
        token.id = String(dbUser.id)
        token.name = dbUser.name
        token.email = dbUser.email
      }
      return token
    },
  },
})
