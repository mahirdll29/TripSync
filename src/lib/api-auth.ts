import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { getDb, type DbTrip } from "@/lib/db"

type HandlerContext = {
  params: Record<string, string>
  userId: string
}

type Handler = (
  req: NextRequest,
  context: HandlerContext
) => Promise<NextResponse | Response>

export function withAuth(handler: Handler) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const params = await context.params
    return handler(req, { params, userId: session.user.id })
  }
}

export function requireTripMember(tripId: string, userId: string): DbTrip | null {
  const db = getDb()
  const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(Number(tripId)) as DbTrip | undefined
  if (!trip) return null

  const isMember = db.prepare(
    "SELECT 1 FROM trip_members WHERE trip_id = ? AND user_id = ?"
  ).get(Number(tripId), Number(userId))

  if (!isMember) return null
  return trip
}

export function requireTripOwner(tripId: string, userId: string): DbTrip | null {
  const db = getDb()
  const trip = db.prepare("SELECT * FROM trips WHERE id = ? AND created_by = ?")
    .get(Number(tripId), Number(userId)) as DbTrip | undefined
  return trip ?? null
}
