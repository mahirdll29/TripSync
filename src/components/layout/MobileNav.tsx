"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plane, Star } from "lucide-react"

export default function MobileNav() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard", label: "Trips", icon: Plane },
    { href: "/shortlist", label: "Shortlist", icon: Star },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/90 backdrop-blur-xl border-t border-border-subtle md:hidden">
      <div className="flex items-center justify-around h-14">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-[var(--radius-md)] transition-all ${
                isActive
                  ? "text-accent"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
