import "next-auth"
import { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }

  interface JWT {
    id: string
  }
}

// Serialized types for client components
export interface SerializedUser {
  _id: string
  name: string
  email: string
  image?: string
}

export interface SerializedTrip {
  _id: string
  name: string
  description?: string
  coverEmoji: string
  createdBy: SerializedUser
  members: SerializedUser[]
  inviteCode: string
  inviteEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface SerializedCity {
  _id: string
  tripId: string
  name: string
  emoji: string
  order: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SerializedHotel {
  _id: string
  cityId: string
  tripId: string
  name: string
  url: string
  source: string
  notes?: string
  addedBy: SerializedUser
  pricePerNight?: number
  currency: string
  isShortlisted?: boolean
  createdAt: string
  updatedAt: string
}

export interface TripDetailData {
  trip: SerializedTrip
  cities: SerializedCity[]
  hotelsByCity: Record<string, SerializedHotel[]>
}

export interface ShortlistGroup {
  trip: { name: string; coverEmoji: string; _id: string }
  hotels: Array<{
    _id: string
    hotelId: SerializedHotel
    tripId: string
    createdAt: string
  }>
}
