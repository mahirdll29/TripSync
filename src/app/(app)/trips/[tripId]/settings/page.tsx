import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getDb, getUserById, serializeTrip, type DbTrip, type DbUser } from "@/lib/db"
import TripSettingsClient from "./TripSettingsClient"

export default async function TripSettingsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { tripId } = await params
  const db = getDb()

  const trip = db.prepare(
    "SELECT * FROM trips WHERE id = ? AND created_by = ?"
  ).get(Number(tripId), Number(session.user.id)) as DbTrip | undefined

  if (!trip) notFound()

  const createdBy = getUserById(trip.created_by)!
  const members = db.prepare(`
    SELECT u.* FROM users u
    JOIN trip_members tm ON tm.user_id = u.id
    WHERE tm.trip_id = ?
  `).all(trip.id) as DbUser[]

  return (
    <TripSettingsClient
      trip={serializeTrip(trip, createdBy, members)}
      userId={session.user.id}
    />
  )
}
