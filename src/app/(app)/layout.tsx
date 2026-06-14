"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"
import Navbar from "@/components/layout/Navbar"
import MobileNav from "@/components/layout/MobileNav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-bg-base">
        <Navbar />
        <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-text-primary)",
              borderRadius: "var(--radius-lg)",
            },
          }}
        />
      </div>
    </SessionProvider>
  )
}
