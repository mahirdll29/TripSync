import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getTripWithCitiesAndHotels } from "@/lib/queries"
import TripDetailClient from "./TripDetailClient"

export async function generateMetadata() {
  return {
    title: `Trip — TripSync`,
  }
}

export default async function TripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { tripId } = await params
  const data = await getTripWithCitiesAndHotels(tripId, session.user.id)
  if (!data) notFound()

  return (
    <TripDetailClient
      initialData={data}
      userId={session.user.id}
    />
  )
}
