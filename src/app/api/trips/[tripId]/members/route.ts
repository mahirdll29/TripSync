import { NextResponse } from "next/server"
import { withAuth, requireTripMember, requireTripOwner } from "@/lib/api-auth"
import { getDb, serializeUser, type DbUser } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export const GET = withAuth(async (_req, { params, userId }) => {
  try {
    const trip = requireTripMember(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    const db = getDb()
    const members = db.prepare(`
      SELECT u.* FROM users u
      JOIN trip_members tm ON tm.user_id = u.id
      WHERE tm.trip_id = ?
    `).all(Number(params.tripId)) as DbUser[]

    return NextResponse.json(members.map(serializeUser))
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const DELETE = withAuth(async (req, { params, userId }) => {
  try {
    const db = getDb()
    const tripId = params.tripId!
    const tripIdNum = Number(tripId)
    const url = new URL(req.url)
    const targetUserId = url.searchParams.get("userId")

    // Self-leave
    if (targetUserId === "self" || targetUserId === userId) {
      const trip = requireTripMember(tripId, userId)
      if (!trip) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 })
      }

      // Count members
      const memberCount = (db.prepare(
        "SELECT COUNT(*) as count FROM trip_members WHERE trip_id = ?"
      ).get(tripIdNum) as { count: number }).count

      if (memberCount <= 1) {
        return NextResponse.json(
          { error: "You're the only member. Delete the trip instead." },
          { status: 400 }
        )
      }

      // Can't leave if you're the owner
      if (trip.created_by === Number(userId)) {
        return NextResponse.json(
          { error: "Transfer ownership before leaving, or delete the trip." },
          { status: 400 }
        )
      }

      db.prepare("DELETE FROM trip_members WHERE trip_id = ? AND user_id = ?")
        .run(tripIdNum, Number(userId))
      db.prepare("DELETE FROM shortlists WHERE user_id = ? AND trip_id = ?")
        .run(Number(userId), tripIdNum)

      return NextResponse.json({ success: true })
    }

    // Remove member (owner only)
    if (targetUserId) {
      const trip = requireTripOwner(tripId, userId)
      if (!trip) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
      }

      if (targetUserId === userId) {
        return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 })
      }

      const targetIdNum = Number(targetUserId)
      db.prepare("DELETE FROM trip_members WHERE trip_id = ? AND user_id = ?")
        .run(tripIdNum, targetIdNum)
      db.prepare("DELETE FROM shortlists WHERE user_id = ? AND trip_id = ?")
        .run(targetIdNum, tripIdNum)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
