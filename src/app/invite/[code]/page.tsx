import { auth } from "@/lib/auth"
import { getDb, getUserById, type DbTrip } from "@/lib/db"
import Link from "next/link"
import InviteClient from "./InviteClient"

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const session = await auth()

  const db = getDb()
  const trip = db.prepare("SELECT * FROM trips WHERE invite_code = ?").get(code) as DbTrip | undefined

  if (!trip || !trip.invite_enabled) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <p className="text-6xl mb-4">🔗</p>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Invalid Invite Link</h1>
          <p className="text-text-secondary mb-6">This invite link is invalid or has been disabled.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent rounded-[var(--radius-md)] text-sm font-semibold text-white hover:bg-accent-hover transition-all"
          >
            Go to TripSync
          </Link>
        </div>
      </div>
    )
  }

  const createdBy = getUserById(trip.created_by)!
  const memberRows = db.prepare(
    "SELECT user_id FROM trip_members WHERE trip_id = ?"
  ).all(trip.id) as { user_id: number }[]

  return (
    <InviteClient
      trip={{
        _id: String(trip.id),
        name: trip.name,
        coverEmoji: trip.cover_emoji,
        createdBy: { name: createdBy.name, image: createdBy.image ?? undefined },
        members: memberRows.map((m) => String(m.user_id)),
      }}
      code={code}
      isLoggedIn={!!session?.user}
      userId={session?.user?.id}
    />
  )
}
