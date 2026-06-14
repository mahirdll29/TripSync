"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { Plane, Star, LogOut, ChevronDown } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-border-subtle">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-accent flex items-center justify-center">
            <Plane size={16} className="text-white -rotate-45" />
          </div>
          <span className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors hidden sm:block">
            TripSync
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-[var(--radius-md)] transition-all"
          >
            My Trips
          </Link>
          <Link
            href="/shortlist"
            className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-[var(--radius-md)] transition-all flex items-center gap-1.5"
          >
            <Star size={14} /> Shortlist
          </Link>
        </div>

        {/* User menu */}
        {session?.user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-bg-surface-hover transition-all"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? ""}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent">
                  {session.user.name?.charAt(0) ?? "?"}
                </div>
              )}
              <ChevronDown size={14} className="text-text-tertiary hidden sm:block" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-bg-surface border border-border-strong rounded-[var(--radius-lg)] shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border-subtle">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-[var(--radius-md)] transition-all md:hidden"
                    >
                      My Trips
                    </Link>
                    <Link
                      href="/shortlist"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-[var(--radius-md)] transition-all md:hidden"
                    >
                      <Star size={14} /> Shortlist
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-soft rounded-[var(--radius-md)] transition-all"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
