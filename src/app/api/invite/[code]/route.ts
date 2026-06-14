import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-auth"
import { getDb, type DbTrip } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export const POST = withAuth(async (_req, { params, userId }) => {
  try {
    const db = getDb()
    const userIdNum = Number(userId)

    const trip = db.prepare(
      "SELECT * FROM trips WHERE invite_code = ? AND invite_enabled = 1"
    ).get(params.code) as DbTrip | undefined

    if (!trip) {
      return NextResponse.json(
        { error: "Invalid or disabled invite link" },
        { status: 404 }
      )
    }

    // Already a member?
    const isMember = db.prepare(
      "SELECT 1 FROM trip_members WHERE trip_id = ? AND user_id = ?"
    ).get(trip.id, userIdNum)

    if (isMember) {
      return NextResponse.json(
        { error: "ALREADY_MEMBER", tripId: String(trip.id) },
        { status: 409 }
      )
    }

    // Add member
    db.prepare("INSERT INTO trip_members (trip_id, user_id) VALUES (?, ?)")
      .run(trip.id, userIdNum)

    return NextResponse.json({
      success: true,
      tripId: String(trip.id),
    })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
