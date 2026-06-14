import { NextResponse } from "next/server"
import { withAuth, requireTripMember, requireTripOwner } from "@/lib/api-auth"
import { UpdateTripSchema } from "@/lib/validations"
import { getDb, getUserById, serializeTrip, type DbTrip, type DbUser } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export const GET = withAuth(async (_req, { params, userId }) => {
  try {
    const trip = requireTripMember(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const db = getDb()
    const createdBy = getUserById(trip.created_by)!
    const members = db.prepare(`
      SELECT u.* FROM users u
      JOIN trip_members tm ON tm.user_id = u.id
      WHERE tm.trip_id = ?
    `).all(trip.id) as DbUser[]

    return NextResponse.json(serializeTrip(trip, createdBy, members))
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const PATCH = withAuth(async (req, { params, userId }) => {
  try {
    const trip = requireTripOwner(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found or not authorized" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = UpdateTripSchema.safeParse(body)
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
    if (parsed.data.description !== undefined) {
      updates.push("description = ?")
      values.push(parsed.data.description)
    }
    if (parsed.data.coverEmoji !== undefined) {
      updates.push("cover_emoji = ?")
      values.push(parsed.data.coverEmoji)
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(Number(params.tripId))
      db.prepare(`UPDATE trips SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    const updated = db.prepare("SELECT * FROM trips WHERE id = ?").get(Number(params.tripId)) as DbTrip
    const createdBy = getUserById(updated.created_by)!
    const members = db.prepare(`
      SELECT u.* FROM users u
      JOIN trip_members tm ON tm.user_id = u.id
      WHERE tm.trip_id = ?
    `).all(updated.id) as DbUser[]

    return NextResponse.json(serializeTrip(updated, createdBy, members))
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const DELETE = withAuth(async (_req, { params, userId }) => {
  try {
    const trip = requireTripOwner(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found or not authorized" }, { status: 404 })
    }

    const db = getDb()
    const tripIdNum = Number(params.tripId)

    // Cascade delete (SQLite foreign keys with ON DELETE CASCADE handle most,
    // but we do it explicitly for safety)
    db.prepare("DELETE FROM shortlists WHERE trip_id = ?").run(tripIdNum)
    db.prepare("DELETE FROM hotels WHERE trip_id = ?").run(tripIdNum)
    db.prepare("DELETE FROM cities WHERE trip_id = ?").run(tripIdNum)
    db.prepare("DELETE FROM trip_members WHERE trip_id = ?").run(tripIdNum)
    db.prepare("DELETE FROM trips WHERE id = ?").run(tripIdNum)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
