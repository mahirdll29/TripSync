import { NextResponse } from "next/server"
import { withAuth, requireTripMember, requireTripOwner } from "@/lib/api-auth"
import { UpdateCitySchema } from "@/lib/validations"
import { getDb, serializeCity, type DbCity } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export const PATCH = withAuth(async (req, { params, userId }) => {
  try {
    const trip = requireTripMember(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = UpdateCitySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = getDb()
    const updates: string[] = []
    const values: unknown[] = []

    if (parsed.data.name !== undefined) {
      updates.push("name = ?")
      values.push(parsed.data.name)
    }
    if (parsed.data.emoji !== undefined) {
      updates.push("emoji = ?")
      values.push(parsed.data.emoji)
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(Number(params.cityId), Number(params.tripId))
      const result = db.prepare(
        `UPDATE cities SET ${updates.join(", ")} WHERE id = ? AND trip_id = ?`
      ).run(...values)

      if (result.changes === 0) {
        return NextResponse.json({ error: "City not found" }, { status: 404 })
      }
    }

    const updated = db.prepare("SELECT * FROM cities WHERE id = ?")
      .get(Number(params.cityId)) as DbCity | undefined
    if (!updated) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    return NextResponse.json(serializeCity(updated))
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const DELETE = withAuth(async (_req, { params, userId }) => {
  try {
    // Only trip owner can delete cities
    const trip = requireTripOwner(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const db = getDb()
    const cityIdNum = Number(params.cityId)
    const tripIdNum = Number(params.tripId)

    const city = db.prepare("SELECT * FROM cities WHERE id = ? AND trip_id = ?")
      .get(cityIdNum, tripIdNum) as DbCity | undefined
    if (!city) {
      return NextResponse.json({ error: "City not found" }, { status: 404 })
    }

    // Cascade: delete shortlists for hotels in this city, then hotels, then city
    db.prepare(`
      DELETE FROM shortlists WHERE hotel_id IN (
        SELECT id FROM hotels WHERE city_id = ?
      )
    `).run(cityIdNum)
    db.prepare("DELETE FROM hotels WHERE city_id = ?").run(cityIdNum)
    db.prepare("DELETE FROM cities WHERE id = ?").run(cityIdNum)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
