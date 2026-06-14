"use client"

import { useState } from "react"
import Modal from "./Modal"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmLabel?: string
  requireTypedConfirmation?: string
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  requireTypedConfirmation,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState("")
  const [loading, setLoading] = useState(false)

  const canConfirm = requireTypedConfirmation
    ? typedValue === requireTypedConfirmation
    : true

  async function handleConfirm() {
    if (!canConfirm) return
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
      setTypedValue("")
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div role="alertdialog">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-[var(--radius-md)] bg-error-soft shrink-0">
            <AlertTriangle size={18} className="text-error" />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
        </div>

        {requireTypedConfirmation && (
          <div className="mb-4">
            <label className="block text-xs text-text-secondary mb-1.5">
              Type <span className="text-text-primary font-medium">{requireTypedConfirmation}</span> to confirm
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
              placeholder={requireTypedConfirmation}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-bg-surface-hover border border-border-default rounded-[var(--radius-md)] text-sm font-medium text-text-primary hover:bg-bg-surface-active hover:border-border-strong transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="px-4 py-2.5 bg-error-soft border border-error/25 rounded-[var(--radius-md)] text-sm font-medium text-error hover:bg-error/10 hover:border-error/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
