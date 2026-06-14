"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CARD_ITEM } from "@/lib/animations"
import { ExternalLink, Pencil, Trash2, Link2 } from "lucide-react"
import SourceBadge from "./SourceBadge"
import ShortlistButton from "@/components/shortlist/ShortlistButton"
import { SerializedHotel } from "@/types"
import { getRelativeTime, formatCurrency, truncateUrl } from "@/lib/utils"
import Image from "next/image"

interface HotelCardProps {
  hotel: SerializedHotel
  isShortlisted: boolean
  onShortlistToggle: (hotelId: string, tripId: string) => Promise<void>
  canEdit: boolean
  canDelete: boolean
  onEdit?: (hotel: SerializedHotel) => void
  onDelete?: (hotel: SerializedHotel) => void
}

export default function HotelCard({
  hotel,
  isShortlisted,
  onShortlistToggle,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: HotelCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      className="group relative bg-bg-surface border border-border-default rounded-[var(--radius-lg)] p-5 hover:border-border-strong hover:shadow-lg transition-all duration-300"
      variants={CARD_ITEM}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Top row: source badge + shortlist */}
      <div className="flex items-center justify-between mb-3">
        <SourceBadge source={hotel.source} />
        <ShortlistButton
          hotelId={hotel._id}
          tripId={hotel.tripId}
          isShortlisted={isShortlisted}
          onToggle={onShortlistToggle}
        />
      </div>

      {/* Hotel name */}
      <h3 className="text-lg font-semibold text-text-primary mb-2 leading-tight">
        {hotel.name}
      </h3>

      {/* URL */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <Link2 size={12} className="text-text-tertiary shrink-0" />
        <span className="text-xs text-text-secondary truncate">
          {truncateUrl(hotel.url)}
        </span>
      </div>

      {/* Price */}
      {hotel.pricePerNight && (
        <p className="text-sm font-medium text-accent mb-2">
          {formatCurrency(hotel.pricePerNight, hotel.currency)}/night
        </p>
      )}

      {/* Notes */}
      {hotel.notes && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2 leading-relaxed">
          📝 {hotel.notes}
        </p>
      )}

      {/* Footer: added by + open booking */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          {hotel.addedBy?.image ? (
            <Image
              src={hotel.addedBy.image}
              alt={hotel.addedBy.name}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center text-[10px] font-medium text-accent">
              {hotel.addedBy?.name?.charAt(0) ?? "?"}
            </div>
          )}
          <span className="text-xs text-text-tertiary">
            {hotel.addedBy?.name ?? "Unknown"} · {getRelativeTime(hotel.createdAt)}
          </span>
        </div>
        <a
          href={hotel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-[var(--radius-md)] transition-all"
        >
          Open Booking <ExternalLink size={12} />
        </a>
      </div>

      {/* Hover actions */}
      {(canEdit || canDelete) && showActions && (
        <div className="absolute top-3 right-12 flex gap-1">
          {canEdit && (
            <button
              onClick={() => onEdit?.(hotel)}
              className="p-1.5 rounded-[var(--radius-md)] bg-bg-surface-hover/90 backdrop-blur-sm border border-border-default text-text-secondary hover:text-text-primary hover:bg-bg-surface-active transition-all"
              aria-label="Edit hotel"
            >
              <Pencil size={14} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete?.(hotel)}
              className="p-1.5 rounded-[var(--radius-md)] bg-bg-surface-hover/90 backdrop-blur-sm border border-border-default text-text-secondary hover:text-error hover:bg-error-soft transition-all"
              aria-label="Delete hotel"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
