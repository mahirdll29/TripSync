import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserShortlists } from "@/lib/queries"
import ShortlistClient from "./ShortlistClient"

export const metadata = {
  title: "My Shortlist — TripSync",
  description: "Your shortlisted hotels across all trips",
}

export default async function ShortlistPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const shortlists = await getUserShortlists(session.user.id)

  return <ShortlistClient shortlists={shortlists} />
}
