"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SerializedTrip } from "@/types"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import { ArrowLeft, Trash2, Link2, Copy, Check, RefreshCw, Shield, Users } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface TripSettingsClientProps {
  trip: SerializedTrip
  userId: string
}

export default function TripSettingsClient({ trip: initialTrip, userId }: TripSettingsClientProps) {
  const router = useRouter()
  const [trip, setTrip] = useState(initialTrip)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(trip.name)
  const [description, setDescription] = useState(trip.description ?? "")

  async function handleDelete() {
    const res = await fetch(`/api/trips/${trip._id}`, { method: "DELETE" })
    if (!res.ok) {
      toast.error("Failed to delete trip")
      return
    }
    toast.success("Trip deleted")
    router.push("/dashboard")
  }

  async function handleSaveEdit() {
    const res = await fetch(`/api/trips/${trip._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    })
    if (!res.ok) {
      toast.error("Failed to update trip")
      return
    }
    const updated = await res.json()
    setTrip(updated)
    setEditing(false)
    toast.success("Trip updated!")
  }

  async function handleCopyInvite() {
    const url = `${window.location.origin}/invite/${trip.inviteCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerateCode() {
    const res = await fetch(`/api/trips/${trip._id}/invite?action=regenerate`, {
      method: "POST",
    })
    if (!res.ok) {
      toast.error("Failed to regenerate code")
      return
    }
    const { inviteCode } = await res.json()
    setTrip((prev) => ({ ...prev, inviteCode }))
    toast.success("New invite link generated!")
  }

  async function handleToggleInvite() {
    const res = await fetch(`/api/trips/${trip._id}/invite`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteEnabled: !trip.inviteEnabled }),
    })
    if (!res.ok) {
      toast.error("Failed to update invite settings")
      return
    }
    setTrip((prev) => ({ ...prev, inviteEnabled: !prev.inviteEnabled }))
    toast.success(trip.inviteEnabled ? "Invites disabled" : "Invites enabled")
  }

  async function handleRemoveMember(memberId: string) {
    const res = await fetch(`/api/trips/${trip._id}/members?userId=${memberId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      toast.error("Failed to remove member")
      return
    }
    setTrip((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m._id !== memberId),
    }))
    toast.success("Member removed")
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/trips/${trip._id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Trip
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-8">
        {trip.coverEmoji} Trip Settings
      </h1>

      {/* Trip Info */}
      <section className="mb-8 p-6 bg-bg-surface border border-border-default rounded-[var(--radius-lg)]">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Trip Details</h2>
        {editing ? (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-base border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-base border border-border-default rounded-[var(--radius-md)] text-text-primary text-sm resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-bg-surface-hover rounded-[var(--radius-md)] text-sm text-text-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-text-primary">{trip.name}</p>
            {trip.description && <p className="text-sm text-text-secondary mt-1">{trip.description}</p>}
            <button onClick={() => setEditing(true)} className="mt-3 text-sm text-accent hover:underline">
              Edit
            </button>
          </div>
        )}
      </section>

      {/* Invite Settings */}
      <section className="mb-8 p-6 bg-bg-surface border border-border-default rounded-[var(--radius-lg)]">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Link2 size={14} /> Invite Link
        </h2>
        <div className="flex items-center gap-2 p-3 bg-bg-base rounded-[var(--radius-md)] mb-4">
          <code className="text-xs text-text-secondary flex-1 truncate">
            {typeof window !== "undefined" ? `${window.location.origin}/invite/${trip.inviteCode}` : `*/invite/${trip.inviteCode}`}
          </code>
          <button onClick={handleCopyInvite} className="p-1.5 hover:bg-bg-surface-hover rounded-[var(--radius-sm)] transition-colors">
            {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} className="text-text-tertiary" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRegenerateCode}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary bg-bg-surface-hover border border-border-default rounded-[var(--radius-md)] hover:border-border-strong transition-all"
          >
            <RefreshCw size={14} /> Regenerate
          </button>
          <button
            onClick={handleToggleInvite}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm border rounded-[var(--radius-md)] transition-all ${
              trip.inviteEnabled
                ? "text-teal bg-teal-soft border-teal/20"
                : "text-text-tertiary bg-bg-surface-hover border-border-default"
            }`}
          >
            <Shield size={14} /> {trip.inviteEnabled ? "Invites On" : "Invites Off"}
          </button>
        </div>
      </section>

      {/* Members */}
      <section className="mb-8 p-6 bg-bg-surface border border-border-default rounded-[var(--radius-lg)]">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users size={14} /> Members ({trip.members.length})
        </h2>
        <div className="space-y-3">
          {trip.members.map((member) => (
            <div key={member._id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {member.image ? (
                  <Image src={member.image} alt={member.name} width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-sm font-semibold text-accent">
                    {member.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-text-primary">{member.name}</p>
                  <p className="text-xs text-text-tertiary">{member.email}</p>
                </div>
                {member._id === trip.createdBy._id && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-accent-soft text-accent rounded-full font-medium ml-2">Owner</span>
                )}
              </div>
              {member._id !== userId && (
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  className="text-xs text-text-tertiary hover:text-error transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-6 bg-bg-surface border border-error/20 rounded-[var(--radius-lg)]">
        <h2 className="text-sm font-semibold text-error uppercase tracking-wider mb-4">Danger Zone</h2>
        <p className="text-sm text-text-secondary mb-4">
          Deleting this trip will remove all cities, hotels, and shortlists. This cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-error-soft border border-error/25 rounded-[var(--radius-md)] text-sm font-medium text-error hover:bg-error/10 transition-all"
        >
          <Trash2 size={14} /> Delete Trip
        </button>
      </section>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={`Delete "${trip.name}"?`}
        message="This will remove all cities, hotels, and shortlists. This cannot be undone."
        confirmLabel="Delete Trip"
        requireTypedConfirmation={trip.name}
      />
    </div>
  )
}
