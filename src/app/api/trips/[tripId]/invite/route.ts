import { NextResponse } from "next/server"
import { withAuth, requireTripOwner } from "@/lib/api-auth"
import { getDb } from "@/lib/db"
import { nanoid } from "nanoid"
import { handleApiError } from "@/lib/errors"

export const POST = withAuth(async (req, { params, userId }) => {
  try {
    const trip = requireTripOwner(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const db = getDb()
    const url = new URL(req.url)
    const action = url.searchParams.get("action")

    if (action === "regenerate") {
      const newCode = nanoid(10)
      db.prepare("UPDATE trips SET invite_code = ?, updated_at = datetime('now') WHERE id = ?")
        .run(newCode, Number(params.tripId))
      return NextResponse.json({ inviteCode: newCode })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})

export const PATCH = withAuth(async (req, { params, userId }) => {
  try {
    const trip = requireTripOwner(params.tripId!, userId)
    if (!trip) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const body = await req.json()
    const db = getDb()

    if (typeof body.inviteEnabled === "boolean") {
      db.prepare("UPDATE trips SET invite_enabled = ?, updated_at = datetime('now') WHERE id = ?")
        .run(body.inviteEnabled ? 1 : 0, Number(params.tripId))
      return NextResponse.json({ inviteEnabled: body.inviteEnabled })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
