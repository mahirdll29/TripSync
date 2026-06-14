import { NextResponse } from "next/server"
import { withAuth, requireTripMember } from "@/lib/api-auth"
import { CreateHotelSchema } from "@/lib/validations"
import { getDb, getUserById, serializeHotel, type DbHotel, type DbCity } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { detectBookingSource } from "@/lib/utils"

export const GET = withAuth(async (_req, { params, userId }) => {
  try {
    const trip = requireTripMember(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const db = getDb()
    const hotels = db.prepare(
      "SELECT * FROM hotels WHERE city_id = ? AND trip_id = ? ORDER BY created_at DESC"
    ).all(Number(params.cityId), Number(params.tripId)) as DbHotel[]

    const result = hotels.map((hotel) => {
      const addedBy = getUserById(hotel.added_by)!
      return serializeHotel(hotel, addedBy)
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const POST = withAuth(async (req, { params, userId }) => {
  try {
    const trip = requireTripMember(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = CreateHotelSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = getDb()
    const cityIdNum = Number(params.cityId)
    const tripIdNum = Number(params.tripId)

    // Verify city belongs to trip
    const city = db.prepare("SELECT * FROM cities WHERE id = ? AND trip_id = ?")
      .get(cityIdNum, tripIdNum) as DbCity | undefined
    if (!city) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    // Check hotel limit per city
    const countRow = db.prepare(
      "SELECT COUNT(*) as count FROM hotels WHERE city_id = ?"
    ).get(cityIdNum) as { count: number }
    if (countRow.count >= 50) {
      return NextResponse.json(
        { error: "Maximum 50 hotels per city" },
        { status: 403 }
      )
    }

    const source = detectBookingSource(parsed.data.url)

    const result = db.prepare(`
      INSERT INTO hotels (city_id, trip_id, name, url, source, notes, added_by, price_per_night, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INR')
    `).run(
      cityIdNum,
      tripIdNum,
      parsed.data.name,
      parsed.data.url,
      source,
      parsed.data.notes || "",
      Number(userId),
      parsed.data.pricePerNight ?? null
    )

    const hotel = db.prepare("SELECT * FROM hotels WHERE id = ?")
      .get(result.lastInsertRowid) as DbHotel
    const addedBy = getUserById(Number(userId))!

    return NextResponse.json(serializeHotel(hotel, addedBy), { status: 201 })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
