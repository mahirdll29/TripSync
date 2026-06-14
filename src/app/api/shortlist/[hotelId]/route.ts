import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-auth"
import { getDb } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export const DELETE = withAuth(async (_req, { params, userId }) => {
  try {
    const db = getDb()
    const result = db.prepare(
      "DELETE FROM shortlists WHERE hotel_id = ? AND user_id = ?"
    ).run(Number(params.hotelId), Number(userId))

    if (result.changes === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error) as NextResponse
  }
})
