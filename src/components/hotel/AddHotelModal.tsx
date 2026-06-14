"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateHotelSchema, type CreateHotelInput } from "@/lib/validations"
import { detectBookingSource } from "@/lib/utils"
import Modal from "@/components/shared/Modal"
import SourceBadge from "./SourceBadge"
import { Loader2 } from "lucide-react"

interface AddHotelModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateHotelInput) => Promise<void>
}

export default function AddHotelModal({ isOpen, onClose, onSubmit }: AddHotelModalProps) {
  const [detectedSource, setDetectedSource] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHotelInput>({
    resolver: zodResolver(CreateHotelSchema),
  })

  async function handleFormSubmit(data: CreateHotelInput) {
    setLoading(true)
    try {
      await onSubmit(data)
      reset()
      setDetectedSource(null)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value
    if (url.length > 10) {
      try {
        new URL(url)
        setDetectedSource(detectBookingSource(url))
      } catch {
        setDetectedSource(null)
      }
    } else {
      setDetectedSource(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Hotel">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Hotel Name *
          </label>
          <input
            {...register("name")}
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
            placeholder="e.g. The Pine Resort"
            autoFocus
          />
          {errors.name && (
            <p className="text-xs text-error mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Booking URL *
          </label>
          <input
            {...register("url", { onChange: handleUrlChange })}
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
            placeholder="https://www.agoda.com/..."
          />
          {detectedSource && (
            <div className="mt-2">
              <SourceBadge source={detectedSource} />
            </div>
          )}
          {errors.url && (
            <p className="text-xs text-error mt-1">{errors.url.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Notes
          </label>
          <textarea
            {...register("notes")}
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none resize-none transition-all"
            placeholder="e.g. Great mountain views, near Mall Road"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Price per night (₹)
          </label>
          <input
            {...register("pricePerNight", { valueAsNumber: true })}
            type="number"
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
            placeholder="e.g. 2800"
            min={0}
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-bg-surface-hover border border-border-default rounded-[var(--radius-md)] text-sm font-medium text-text-primary hover:bg-bg-surface-active transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover hover:shadow-accent active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Add Hotel"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
