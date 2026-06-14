"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { STAR_POP } from "@/lib/animations"

interface ShortlistButtonProps {
  hotelId: string
  tripId: string
  isShortlisted: boolean
  onToggle: (hotelId: string, tripId: string) => Promise<void>
}

export default function ShortlistButton({ hotelId, tripId, isShortlisted, onToggle }: ShortlistButtonProps) {
  const [shortlisted, setShortlisted] = useState(isShortlisted)
  const [animating, setAnimating] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setShortlisted(isShortlisted)
  }, [isShortlisted])

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (loading) return

    const prev = shortlisted
    setShortlisted(!prev)
    setAnimating(true)
    setLoading(true)

    try {
      await onToggle(hotelId, tripId)
    } catch {
      setShortlisted(prev)
    } finally {
      setLoading(false)
      setTimeout(() => setAnimating(false), 400)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="p-1.5 rounded-[var(--radius-md)] transition-colors hover:bg-teal-soft group"
      aria-label={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
      disabled={loading}
    >
      <motion.div animate={animating ? STAR_POP : {}}>
        <Star
          size={18}
          className={`transition-colors ${
            shortlisted
              ? "fill-teal text-teal drop-shadow-[0_0_8px_rgba(0,201,167,0.4)]"
              : "text-text-tertiary group-hover:text-teal"
          }`}
        />
      </motion.div>
    </button>
  )
}
