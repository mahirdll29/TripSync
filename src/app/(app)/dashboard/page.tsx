import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserTrips } from "@/lib/queries"
import DashboardClient from "./DashboardClient"

export const metadata = {
  title: "Dashboard — TripSync",
  description: "View and manage your trips",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const trips = await getUserTrips(session.user.id)

  return (
    <DashboardClient
      trips={trips}
      userName={session.user.name ?? "Traveler"}
    />
  )
}
