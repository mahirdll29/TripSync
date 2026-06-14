import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-auth"
import { ShortlistSchema } from "@/lib/validations"
import { getDb, getUserById, serializeHotel, type DbHotel } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export const GET = withAuth(async (_req, { userId }) => {
  try {
    const db = getDb()
    const userIdNum = Number(userId)

    const rows = db.prepare(`
      SELECT s.id as shortlist_id, s.created_at as shortlist_created_at,
             s.hotel_id, s.trip_id,
             h.*, t.name as trip_name, t.cover_emoji
      FROM shortlists s
      JOIN hotels h ON h.id = s.hotel_id
      JOIN trips t ON t.id = s.trip_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `).all(userIdNum) as Array<Record<string, unknown>>

    const result = rows.map((row) => {
      const addedBy = getUserById(row.added_by as number)!
      const hotel: DbHotel = {
        id: row.hotel_id as number,
        city_id: row.city_id as number,
        trip_id: row.trip_id as number,
        name: row.name as string,
        url: row.url as string,
        source: row.source as string,
        notes: (row.notes as string) || "",
        added_by: row.added_by as number,
        price_per_night: row.price_per_night as number | null,
        currency: row.currency as string,
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
      }
      return {
        _id: String(row.shortlist_id),
        hotelId: serializeHotel(hotel, addedBy),
        tripId: { name: row.trip_name, coverEmoji: row.cover_emoji, _id: String(row.trip_id) },
        createdAt: row.shortlist_created_at as string,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const POST = withAuth(async (req, { userId }) => {
  try {
    const body = await req.json()
    const parsed = ShortlistSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = getDb()
    const userIdNum = Number(userId)
    const hotelIdNum = Number(parsed.data.hotelId)
    const tripIdNum = Number(parsed.data.tripId)

    // Toggle: check if already shortlisted
    const existing = db.prepare(
      "SELECT id FROM shortlists WHERE user_id = ? AND hotel_id = ?"
    ).get(userIdNum, hotelIdNum) as { id: number } | undefined

    if (existing) {
      db.prepare("DELETE FROM shortlists WHERE id = ?").run(existing.id)
      return NextResponse.json({ action: "removed" })
    }

    // Verify hotel exists and belongs to trip
    const hotel = db.prepare(
      "SELECT * FROM hotels WHERE id = ? AND trip_id = ?"
    ).get(hotelIdNum, tripIdNum) as DbHotel | undefined
    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 })
    }

    // Verify user is trip member
    const isMember = db.prepare(
      "SELECT 1 FROM trip_members WHERE trip_id = ? AND user_id = ?"
    ).get(tripIdNum, userIdNum)
    if (!isMember) {
      return NextResponse.json({ error: "Not a trip member" }, { status: 403 })
    }

    db.prepare(
      "INSERT INTO shortlists (user_id, hotel_id, trip_id) VALUES (?, ?, ?)"
    ).run(userIdNum, hotelIdNum, tripIdNum)

    return NextResponse.json({ action: "added" }, { status: 201 })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
