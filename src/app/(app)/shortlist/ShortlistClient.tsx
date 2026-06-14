"use client"

import { useState } from "react"
import { Star, ExternalLink } from "lucide-react"
import EmptyState from "@/components/shared/EmptyState"
import SourceBadge from "@/components/hotel/SourceBadge"
import { ShortlistGroup } from "@/types"
import { toast } from "sonner"
import Link from "next/link"

interface ShortlistClientProps {
  shortlists: ShortlistGroup[]
}

export default function ShortlistClient({ shortlists: initialData }: ShortlistClientProps) {
  const [shortlists, setShortlists] = useState(initialData)

  async function handleRemove(hotelId: string) {
    const res = await fetch(`/api/shortlist/${hotelId}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Failed to remove from shortlist")
      return
    }

    setShortlists((prev) =>
      prev
        .map((group) => ({
          ...group,
          hotels: group.hotels.filter((h) => {
            const id = typeof h.hotelId === "object" ? (h.hotelId as { _id: string })._id : h.hotelId
            return id !== hotelId
          }),
        }))
        .filter((group) => group.hotels.length > 0)
    )
    toast.success("Removed from shortlist")
  }

  if (shortlists.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary mb-8 flex items-center gap-2">
          <Star size={28} className="text-teal" /> My Shortlist
        </h1>
        <EmptyState
          icon={<Star size={48} strokeWidth={1} />}
          title="Your shortlist is empty"
          description="Star hotels you love while browsing trips"
          action={
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover transition-all"
            >
              Browse Trips
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-text-primary mb-8 flex items-center gap-2">
        <Star size={28} className="text-teal" /> My Shortlist
      </h1>

      <div className="space-y-8">
        {shortlists.map((group) => (
          <div key={group.trip._id}>
            <Link
              href={`/trips/${group.trip._id}`}
              className="inline-flex items-center gap-2 text-lg font-semibold text-text-primary hover:text-accent transition-colors mb-4"
            >
              <span>{group.trip.coverEmoji}</span> {group.trip.name}
            </Link>

            <div className="space-y-2">
              {group.hotels.map((item) => {
                const hotel = typeof item.hotelId === "object" ? (item.hotelId as unknown as { _id: string; name: string; url: string; source: string; pricePerNight?: number }) : null
                if (!hotel) return null
                const hotelId = hotel._id ?? ""

                return (
                  <div
                    key={hotelId}
                    className="flex items-center gap-4 p-4 bg-bg-surface border border-border-default rounded-[var(--radius-lg)] hover:border-border-strong transition-all group"
                  >
                    <button
                      onClick={() => handleRemove(hotelId)}
                      className="shrink-0"
                      aria-label="Remove from shortlist"
                    >
                      <Star size={18} className="fill-teal text-teal hover:fill-transparent transition-colors" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-text-primary truncate">
                          {hotel.name}
                        </span>
                        <SourceBadge source={hotel.source ?? "Other"} />
                      </div>
                      {hotel.pricePerNight != null && (
                        <span className="text-xs text-accent font-medium">
                          ₹{hotel.pricePerNight.toLocaleString()}/night
                        </span>
                      )}
                    </div>
                    <a
                      href={hotel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-[var(--radius-md)] transition-all"
                    >
                      Open <ExternalLink size={12} />
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
