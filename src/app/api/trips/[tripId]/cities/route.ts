import { NextResponse } from "next/server"
import { withAuth, requireTripMember } from "@/lib/api-auth"
import { CreateCitySchema } from "@/lib/validations"
import { getDb, serializeCity, type DbCity } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export const GET = withAuth(async (_req, { params, userId }) => {
  try {
    const trip = requireTripMember(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const db = getDb()
    const cities = db.prepare(
      "SELECT * FROM cities WHERE trip_id = ? ORDER BY sort_order ASC"
    ).all(Number(params.tripId)) as DbCity[]

    return NextResponse.json(cities.map(serializeCity))
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
    const parsed = CreateCitySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = getDb()
    const tripIdNum = Number(params.tripId)

    // Check city limit
    const countRow = db.prepare(
      "SELECT COUNT(*) as count FROM cities WHERE trip_id = ?"
    ).get(tripIdNum) as { count: number }
    if (countRow.count >= 20) {
      return NextResponse.json(
        { error: "Maximum 20 cities per trip" },
        { status: 403 }
      )
    }

    const result = db.prepare(`
      INSERT INTO cities (trip_id, name, emoji, sort_order, created_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      tripIdNum,
      parsed.data.name,
      parsed.data.emoji || "📍",
      countRow.count,
      Number(userId)
    )

    const city = db.prepare("SELECT * FROM cities WHERE id = ?")
      .get(result.lastInsertRowid) as DbCity

    return NextResponse.json(serializeCity(city), { status: 201 })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
