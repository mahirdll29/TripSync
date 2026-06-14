"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CARD_CONTAINER } from "@/lib/animations"
import { TripDetailData, SerializedHotel } from "@/types"
import CityTabs from "@/components/city/CityTabs"
import AddCityModal from "@/components/city/AddCityModal"
import HotelCard from "@/components/hotel/HotelCard"
import AddHotelModal from "@/components/hotel/AddHotelModal"
import EmptyState from "@/components/shared/EmptyState"
import ConfirmDialog from "@/components/shared/ConfirmDialog"
import { ArrowLeft, Users, Link2, Settings, Plus, Building2, MapPin, Check } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import type { CreateCityInput, CreateHotelInput } from "@/lib/validations"

interface TripDetailClientProps {
  initialData: TripDetailData
  userId: string
}

export default function TripDetailClient({ initialData, userId }: TripDetailClientProps) {
  const [data, setData] = useState(initialData)
  const { trip, cities, hotelsByCity } = data

  const [activeCityId, setActiveCityId] = useState<string | null>(
    cities.length > 0 ? cities[0]!._id : null
  )
  const [showAddCity, setShowAddCity] = useState(false)
  const [showAddHotel, setShowAddHotel] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [deleteHotel, setDeleteHotel] = useState<SerializedHotel | null>(null)
  const [deleteCity, setDeleteCity] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isOwner = trip.createdBy._id === userId
  const activeCity = cities.find((c) => c._id === activeCityId)
  const activeHotels = activeCityId ? (hotelsByCity[activeCityId] ?? []) : []

  const hotelCounts: Record<string, number> = {}
  for (const city of cities) {
    hotelCounts[city._id] = (hotelsByCity[city._id] ?? []).length
  }

  async function handleAddCity(cityData: CreateCityInput) {
    const res = await fetch(`/api/trips/${trip._id}/cities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cityData),
    })
    if (!res.ok) {
      toast.error("Failed to add city")
      throw new Error("Failed")
    }
    const newCity = await res.json()
    setData((prev) => ({
      ...prev,
      cities: [...prev.cities, { ...newCity, _id: newCity._id.toString?.() ?? newCity._id }],
    }))
    setActiveCityId(newCity._id.toString?.() ?? newCity._id)
    toast.success("City added!")
  }

  async function handleAddHotel(hotelData: CreateHotelInput) {
    if (!activeCityId) return
    const res = await fetch(`/api/trips/${trip._id}/cities/${activeCityId}/hotels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hotelData),
    })
    if (!res.ok) {
      toast.error("Failed to add hotel")
      throw new Error("Failed")
    }
    const newHotel = await res.json()
    setData((prev) => ({
      ...prev,
      hotelsByCity: {
        ...prev.hotelsByCity,
        [activeCityId!]: [{ ...newHotel, _id: newHotel._id.toString?.() ?? newHotel._id, isShortlisted: false }, ...(prev.hotelsByCity[activeCityId!] ?? [])],
      },
    }))
    toast.success("Hotel added! 🏨")
  }

  async function handleDeleteHotel(hotel: SerializedHotel) {
    const res = await fetch(
      `/api/trips/${trip._id}/cities/${hotel.cityId}/hotels/${hotel._id}`,
      { method: "DELETE" }
    )
    if (!res.ok) {
      toast.error("Failed to delete hotel")
      return
    }
    setData((prev) => ({
      ...prev,
      hotelsByCity: {
        ...prev.hotelsByCity,
        [hotel.cityId]: (prev.hotelsByCity[hotel.cityId] ?? []).filter((h) => h._id !== hotel._id),
      },
    }))
    toast.success("Hotel removed")
  }

  async function handleDeleteCity() {
    if (!deleteCity) return
    const res = await fetch(`/api/trips/${trip._id}/cities/${deleteCity}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      toast.error("Failed to delete city")
      return
    }
    setData((prev) => {
      const newCities = prev.cities.filter((c) => c._id !== deleteCity)
      const newHotelsByCity = { ...prev.hotelsByCity }
      delete newHotelsByCity[deleteCity]
      return { ...prev, cities: newCities, hotelsByCity: newHotelsByCity }
    })
    setActiveCityId(() => {
      const remaining = cities.filter((c) => c._id !== deleteCity)
      return remaining.length > 0 ? remaining[0]!._id : null
    })
    toast.success("City deleted")
    setDeleteCity(null)
  }

  const handleShortlistToggle = useCallback(async (hotelId: string, tripId: string) => {
    const res = await fetch("/api/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelId, tripId }),
    })
    if (!res.ok) {
      toast.error("Failed to update shortlist")
      throw new Error("Failed")
    }
    const { action } = await res.json()
    setData((prev) => {
      const newHotelsByCity = { ...prev.hotelsByCity }
      for (const [cityId, hotels] of Object.entries(newHotelsByCity)) {
        newHotelsByCity[cityId] = hotels.map((h) =>
          h._id === hotelId ? { ...h, isShortlisted: action === "added" } : h
        )
      }
      return { ...prev, hotelsByCity: newHotelsByCity }
    })
  }, [])

  async function handleCopyInvite() {
    const url = `${window.location.origin}/invite/${trip.inviteCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Link copied! 🔗")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Trip Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Trips
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary flex items-center gap-2">
              <span>{trip.coverEmoji}</span> {trip.name}
            </h1>
            {trip.description && (
              <p className="text-text-secondary mt-1 text-sm">{trip.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Members button */}
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary bg-bg-surface-hover border border-border-default rounded-[var(--radius-md)] hover:border-border-strong transition-all"
            >
              <Users size={14} /> {trip.members.length}
            </button>

            {/* Invite */}
            <button
              onClick={handleCopyInvite}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary bg-bg-surface-hover border border-border-default rounded-[var(--radius-md)] hover:border-border-strong transition-all"
            >
              {copied ? <Check size={14} className="text-teal" /> : <Link2 size={14} />}
              {copied ? "Copied!" : "Invite"}
            </button>

            {/* Settings link */}
            {isOwner && (
              <Link
                href={`/trips/${trip._id}/settings`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary bg-bg-surface-hover border border-border-default rounded-[var(--radius-md)] hover:border-border-strong transition-all"
              >
                <Settings size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Members panel (inline for simplicity) */}
      {showMembers && (
        <div className="mb-6 p-4 bg-bg-surface border border-border-default rounded-[var(--radius-lg)]">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Members</h3>
          <div className="space-y-2">
            {trip.members.map((member) => (
              <div key={member._id} className="flex items-center gap-3">
                {member.image ? (
                  <Image src={member.image} alt={member.name} width={28} height={28} className="rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-accent-soft flex items-center justify-center text-xs font-semibold text-accent">
                    {member.name?.charAt(0)}
                  </div>
                )}
                <span className="text-sm text-text-primary">{member.name}</span>
                {member._id === trip.createdBy._id && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-accent-soft text-accent rounded-full font-medium">Owner</span>
                )}
                {member._id === userId && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-teal-soft text-teal rounded-full font-medium">You</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* City Tabs */}
      {cities.length > 0 ? (
        <>
          <div className="mb-6">
            <CityTabs
              cities={cities}
              activeCityId={activeCityId}
              onCitySelect={setActiveCityId}
              onAddCity={() => setShowAddCity(true)}
              hotelCounts={hotelCounts}
            />
          </div>

          {/* Active city content */}
          {activeCity && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {activeCity.emoji} {activeCity.name}
                  </h2>
                  {isOwner && (
                    <button
                      onClick={() => setDeleteCity(activeCity._id)}
                      className="text-xs text-text-tertiary hover:text-error transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowAddHotel(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover hover:shadow-accent active:scale-[0.97] transition-all"
                >
                  <Plus size={14} /> Add Hotel
                </button>
              </div>

              {/* Hotel Grid */}
              {activeHotels.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={CARD_CONTAINER}
                  initial="initial"
                  animate="animate"
                  key={activeCityId}
                >
                  {activeHotels.map((hotel) => (
                    <HotelCard
                      key={hotel._id}
                      hotel={hotel}
                      isShortlisted={hotel.isShortlisted ?? false}
                      onShortlistToggle={handleShortlistToggle}
                      canEdit={hotel.addedBy?._id === userId || isOwner}
                      canDelete={hotel.addedBy?._id === userId || isOwner}
                      onDelete={(h) => setDeleteHotel(h)}
                    />
                  ))}
                </motion.div>
              ) : (
                <EmptyState
                  icon={<Building2 size={48} strokeWidth={1} />}
                  title="No hotels yet"
                  description="Drop hotel links here — paste any Agoda, MakeMyTrip, or Airbnb link"
                  action={
                    <button
                      onClick={() => setShowAddHotel(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover transition-all"
                    >
                      <Plus size={14} /> Add Hotel
                    </button>
                  }
                />
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<MapPin size={48} strokeWidth={1} />}
          title="Add your first destination"
          description="Start by adding the cities you're considering for this trip"
          action={
            <button
              onClick={() => setShowAddCity(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover transition-all"
            >
              <Plus size={14} /> Add City
            </button>
          }
        />
      )}

      {/* Modals */}
      <AddCityModal
        isOpen={showAddCity}
        onClose={() => setShowAddCity(false)}
        onSubmit={handleAddCity}
      />

      <AddHotelModal
        isOpen={showAddHotel}
        onClose={() => setShowAddHotel(false)}
        onSubmit={handleAddHotel}
      />

      <ConfirmDialog
        isOpen={!!deleteHotel}
        onClose={() => setDeleteHotel(null)}
        onConfirm={() => { if (deleteHotel) handleDeleteHotel(deleteHotel) }}
        title="Remove Hotel"
        message={`Remove "${deleteHotel?.name}"? This will also remove all shortlist entries for this hotel.`}
        confirmLabel="Remove"
      />

      <ConfirmDialog
        isOpen={!!deleteCity}
        onClose={() => setDeleteCity(null)}
        onConfirm={handleDeleteCity}
        title="Delete City"
        message={`Delete this city? This will remove all ${hotelCounts[deleteCity ?? ""] ?? 0} hotels in it.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
