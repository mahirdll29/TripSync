"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MODAL, BACKDROP } from "@/lib/animations"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}

export default function Modal({ isOpen, onClose, title, children, wide }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            {...BACKDROP}
          />
          <motion.div
            className="relative z-10 bg-bg-surface border border-border-strong w-[calc(100vw-32px)] mx-auto p-6"
            style={{
              maxWidth: wide ? 560 : 480,
              borderRadius: "var(--radius-xl)",
            }}
            {...MODAL}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-[var(--radius-md)] hover:bg-bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
