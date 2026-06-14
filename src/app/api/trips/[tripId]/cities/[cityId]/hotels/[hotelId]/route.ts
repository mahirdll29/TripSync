import { NextResponse } from "next/server"
import { withAuth, requireTripMember } from "@/lib/api-auth"
import { UpdateHotelSchema } from "@/lib/validations"
import { getDb, getUserById, serializeHotel, type DbHotel } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { detectBookingSource } from "@/lib/utils"

export const PATCH = withAuth(async (req, { params, userId }) => {
  try {
    const trip = requireTripMember(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const db = getDb()
    const hotel = db.prepare(
      "SELECT * FROM hotels WHERE id = ? AND trip_id = ?"
    ).get(Number(params.hotelId), Number(params.tripId)) as DbHotel | undefined

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
    }

    // Only adder or trip owner can edit
    const isAdder = hotel.added_by === Number(userId)
    const isOwner = trip.created_by === Number(userId)
    if (!isAdder && !isOwner) {
      return NextResponse.json(
        { error: "You can only edit hotels you added" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = UpdateHotelSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updates: string[] = []
    const values: unknown[] = []

    if (parsed.data.name !== undefined) {
      updates.push("name = ?")
      values.push(parsed.data.name)
    }
    if (parsed.data.url !== undefined) {
      updates.push("url = ?")
      values.push(parsed.data.url)
      updates.push("source = ?")
      values.push(detectBookingSource(parsed.data.url))
    }
    if (parsed.data.notes !== undefined) {
      updates.push("notes = ?")
      values.push(parsed.data.notes)
    }
    if (parsed.data.pricePerNight !== undefined) {
      updates.push("price_per_night = ?")
      values.push(parsed.data.pricePerNight)
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(Number(params.hotelId))
      db.prepare(`UPDATE hotels SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    const updated = db.prepare("SELECT * FROM hotels WHERE id = ?")
      .get(Number(params.hotelId)) as DbHotel
    const addedBy = getUserById(updated.added_by)!

    return NextResponse.json(serializeHotel(updated, addedBy))
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const DELETE = withAuth(async (_req, { params, userId }) => {
  try {
    const trip = requireTripMember(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const db = getDb()
    const hotel = db.prepare(
      "SELECT * FROM hotels WHERE id = ? AND trip_id = ?"
    ).get(Number(params.hotelId), Number(params.tripId)) as DbHotel | undefined

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
    }

    // Only adder or trip owner can delete
    const isAdder = hotel.added_by === Number(userId)
    const isOwner = trip.created_by === Number(userId)
    if (!isAdder && !isOwner) {
      return NextResponse.json(
        { error: "You can only delete hotels you added" },
        { status: 403 }
      )
    }

    // Cascade delete shortlists for this hotel
    db.prepare("DELETE FROM shortlists WHERE hotel_id = ?").run(Number(params.hotelId))
    db.prepare("DELETE FROM hotels WHERE id = ?").run(Number(params.hotelId))

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
