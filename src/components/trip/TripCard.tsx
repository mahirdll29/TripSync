"use client"

import { motion } from "framer-motion"
import { CARD_ITEM } from "@/lib/animations"
import { getTripGradient, getRelativeTime } from "@/lib/utils"
import { Users, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"

interface TripCardProps {
  trip: {
    _id: string
    name: string
    description?: string
    coverEmoji: string
    createdBy: { name: string; image?: string }
    members: Array<{ name: string; image?: string }>
    cities?: string[]
    hotelCount?: number
    updatedAt: string
  }
}

export default function TripCard({ trip }: TripCardProps) {
  const gradient = getTripGradient(trip.name)

  return (
    <motion.div variants={CARD_ITEM}>
      <Link href={`/trips/${trip._id}`} className="block group">
        <div className="bg-bg-surface border border-border-default rounded-[var(--radius-lg)] overflow-hidden hover:border-border-strong hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          {/* Gradient mesh header */}
          <div
            className="h-[120px] flex items-center justify-center relative overflow-hidden"
            style={{ background: gradient }}
          >
            <span className="text-4xl">{trip.coverEmoji}</span>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-surface/30" />
          </div>

          {/* Card body */}
          <div className="p-5">
            <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-accent transition-colors">
              {trip.name}
            </h3>

            {/* City pills */}
            {trip.cities && trip.cities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {trip.cities.slice(0, 3).map((city, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs text-text-secondary bg-bg-surface-hover rounded-full border border-border-subtle"
                  >
                    📍 {city}
                  </span>
                ))}
                {trip.cities.length > 3 && (
                  <span className="px-2 py-0.5 text-xs text-text-tertiary">
                    +{trip.cities.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Users size={13} /> {trip.members?.length ?? 0} members
              </span>
              <span className="flex items-center gap-1">
                <Building2 size={13} /> {trip.hotelCount ?? 0} hotels
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
              <span className="text-xs text-text-tertiary">
                {getRelativeTime(trip.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
