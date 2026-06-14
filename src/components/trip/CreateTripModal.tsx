"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateTripSchema, type CreateTripInput } from "@/lib/validations"
import Modal from "@/components/shared/Modal"
import { Loader2 } from "lucide-react"

interface CreateTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTripInput) => Promise<void>
}

const EMOJI_OPTIONS = ["✈️", "🏖️", "🏔️", "🌍", "🗺️", "🏕️", "🚗", "🚂", "🏄", "🎒", "⛷️", "🏝️", "🌊", "🏜️", "🗼"]

export default function CreateTripModal({ isOpen, onClose, onSubmit }: CreateTripModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState("✈️")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTripInput>({
    resolver: zodResolver(CreateTripSchema),
    defaultValues: { coverEmoji: "✈️" },
  })

  async function handleFormSubmit(data: CreateTripInput) {
    setLoading(true)
    try {
      await onSubmit({ ...data, coverEmoji: selectedEmoji })
      reset()
      setSelectedEmoji("✈️")
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Trip">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Trip Name *
          </label>
          <input
            {...register("name")}
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none transition-all"
            placeholder="e.g. North India Trip"
            autoFocus
          />
          {errors.name && (
            <p className="text-xs text-error mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Description
          </label>
          <textarea
            {...register("description")}
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm placeholder:text-text-tertiary focus:border-accent/50 focus:ring-2 focus:ring-accent/10 outline-none resize-none transition-all"
            placeholder="A quick note about the trip..."
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Cover Emoji
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className={`w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-lg transition-all ${
                  selectedEmoji === emoji
                    ? "bg-accent-soft border border-accent/40 scale-110"
                    : "bg-bg-surface-hover border border-border-default hover:border-border-strong"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Create Trip"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
