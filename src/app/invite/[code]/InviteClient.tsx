"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plane, Users, ArrowRight } from "lucide-react"
import { toast } from "sonner"

interface InviteClientProps {
  trip: {
    _id: string
    name: string
    coverEmoji: string
    createdBy: { name: string; image?: string }
    members: string[]
  }
  code: string
  isLoggedIn: boolean
  userId?: string
}

export default function InviteClient({ trip, code, isLoggedIn }: InviteClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/invite/${code}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/invite/${code}`, { method: "POST" })
      const data = await res.json()

      if (res.status === 409) {
        toast("You're already in this trip")
        router.push(`/trips/${data.tripId}`)
        return
      }

      if (!res.ok) {
        toast.error(data.error ?? "Failed to join trip")
        return
      }

      toast.success("Welcome to the trip! 🎉")
      router.push(`/trips/${data.tripId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(255,107,53,0.06)_0%,transparent_50%),radial-gradient(ellipse_at_70%_70%,rgba(0,201,167,0.04)_0%,transparent_50%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-accent flex items-center justify-center">
            <Plane size={16} className="text-white -rotate-45" />
          </div>
          <span className="text-lg font-bold text-text-primary">TripSync</span>
        </div>

        {/* Invite Card */}
        <div className="bg-bg-surface border border-border-strong rounded-[var(--radius-xl)] overflow-hidden shadow-lg">
          <div className="h-24 bg-gradient-to-br from-accent/20 via-bg-surface to-teal/10 flex items-center justify-center">
            <span className="text-5xl">{trip.coverEmoji}</span>
          </div>
          <div className="p-6 text-center">
            <p className="text-xs text-text-secondary mb-2">You&apos;re invited to join</p>
            <h1 className="text-2xl font-bold text-text-primary mb-3">{trip.name}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-text-secondary mb-6">
              <span>by {trip.createdBy?.name ?? "Someone"}</span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {trip.members?.length ?? 1} members
              </span>
            </div>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent rounded-[var(--radius-md)] text-base font-semibold text-white hover:bg-accent-hover hover:shadow-accent active:scale-[0.97] disabled:opacity-50 transition-all"
            >
              {loading ? "Joining..." : isLoggedIn ? "Join Trip" : "Sign in to Join"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <p className="text-xs text-text-tertiary text-center mt-4">
          {isLoggedIn
            ? "You'll be added as a member of this trip"
            : "You'll need to sign in first"}
        </p>
      </div>
    </div>
  )
}
