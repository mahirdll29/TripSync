"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { CARD_ITEM } from "@/lib/animations"

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      {...CARD_ITEM}
    >
      <div className="mb-5 text-text-tertiary">{icon}</div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-6 max-w-xs">{description}</p>
      {action}
    </motion.div>
  )
}
