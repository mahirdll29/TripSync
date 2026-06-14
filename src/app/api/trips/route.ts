import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-auth"
import { CreateTripSchema } from "@/lib/validations"
import { getDb, getUserById, serializeTrip, type DbTrip, type DbUser } from "@/lib/db"
import { nanoid } from "nanoid"
import { handleApiError } from "@/lib/errors"

export const GET = withAuth(async (_req, { userId }) => {
  try {
    const db = getDb()
    const userIdNum = Number(userId)

    const trips = db.prepare(`
      SELECT t.* FROM trips t
      JOIN trip_members tm ON tm.trip_id = t.id
      WHERE tm.user_id = ?
      ORDER BY t.updated_at DESC
    `).all(userIdNum) as DbTrip[]

    const result = trips.map((trip) => {
      const createdBy = getUserById(trip.created_by)!
      const members = db.prepare(`
        SELECT u.* FROM users u
        JOIN trip_members tm ON tm.user_id = u.id
        WHERE tm.trip_id = ?
      `).all(trip.id) as DbUser[]
      return serializeTrip(trip, createdBy, members)
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const POST = withAuth(async (req, { userId }) => {
  try {
    const body = await req.json()
    const parsed = CreateTripSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const db = getDb()
    const userIdNum = Number(userId)

    // Check trip limit
    const countRow = db.prepare(
      "SELECT COUNT(*) as count FROM trips WHERE created_by = ?"
    ).get(userIdNum) as { count: number }
    if (countRow.count >= 20) {
      return NextResponse.json(
        { error: "Maximum 20 trips per account" },
        { status: 403 }
      )
    }

    const inviteCode = nanoid(10)
    const result = db.prepare(`
      INSERT INTO trips (name, description, cover_emoji, created_by, invite_code, invite_enabled)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(
      parsed.data.name,
      parsed.data.description || "",
      parsed.data.coverEmoji || "✈️",
      userIdNum,
      inviteCode
    )

    const tripId = result.lastInsertRowid as number

    // Add creator as member
    db.prepare("INSERT INTO trip_members (trip_id, user_id) VALUES (?, ?)").run(tripId, userIdNum)

    // Return populated trip
    const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(tripId) as DbTrip
    const createdBy = getUserById(userIdNum)!
    const members = [createdBy]

    return NextResponse.json(serializeTrip(trip, createdBy, members), { status: 201 })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
