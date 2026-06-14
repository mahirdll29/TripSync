"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CARD_CONTAINER } from "@/lib/animations"
import TripCard from "@/components/trip/TripCard"
import CreateTripModal from "@/components/trip/CreateTripModal"
import EmptyState from "@/components/shared/EmptyState"
import { type CreateTripInput } from "@/lib/validations"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface DashboardClientProps {
  trips: Array<{
    _id: string
    name: string
    description?: string
    coverEmoji: string
    createdBy: { name: string; image?: string }
    members: Array<{ name: string; image?: string }>
    cities?: string[]
    hotelCount?: number
    updatedAt: string
  }>
  userName: string
}

export default function DashboardClient({ trips: initialTrips, userName }: DashboardClientProps) {
  const [trips, setTrips] = useState(initialTrips)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  async function handleCreateTrip(data: CreateTripInput) {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error ?? "Failed to create trip")
      throw new Error(err.error)
    }

    const trip = await res.json()
    setTrips([{ ...trip, cities: [], hotelCount: 0 }, ...trips])
    toast.success("Trip created! 🎉")
    router.push(`/trips/${trip._id}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary">
            Hey {userName.split(" ")[0]} ✈️
          </h1>
          <p className="text-text-secondary mt-1">Where to next?</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover hover:shadow-accent active:scale-[0.97] transition-all w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Create Trip
        </button>
      </div>

      {/* Trip Grid */}
      {trips.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={CARD_CONTAINER}
          initial="initial"
          animate="animate"
        >
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mx-auto">
              <path
                d="M20 60 Q40 20 60 40 Q80 60 100 25"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.4"
              />
              <circle cx="20" cy="60" r="3" fill="var(--color-accent)" opacity="0.6" />
              <circle cx="60" cy="40" r="3" fill="var(--color-teal)" opacity="0.6" />
              <circle cx="100" cy="25" r="3" fill="var(--color-accent)" opacity="0.6" />
              <text x="48" y="75" fill="var(--color-text-tertiary)" fontSize="8" textAnchor="middle">
                ✈️
              </text>
            </svg>
          }
          title="No trips yet"
          description="Plan your first adventure with friends"
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover hover:shadow-accent active:scale-[0.97] transition-all"
            >
              <Plus size={16} /> Create Trip
            </button>
          }
        />
      )}

      <CreateTripModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTrip}
      />
    </div>
  )
}
