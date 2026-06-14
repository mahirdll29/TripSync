import {
  getDb,
  getUserById,
  serializeTrip,
  serializeCity,
  serializeHotel,
  type DbTrip,
  type DbCity,
  type DbHotel,
  type DbUser,
} from "@/lib/db"

export function getTripWithCitiesAndHotels(tripId: string, userId: string) {
  const db = getDb()
  const tripIdNum = Number(tripId)
  const userIdNum = Number(userId)

  // Check membership
  const isMember = db.prepare(
    "SELECT 1 FROM trip_members WHERE trip_id = ? AND user_id = ?"
  ).get(tripIdNum, userIdNum)
  if (!isMember) return null

  const trip = db.prepare("SELECT * FROM trips WHERE id = ?").get(tripIdNum) as DbTrip | undefined
  if (!trip) return null

  const createdBy = getUserById(trip.created_by)!
  const memberRows = db.prepare(`
    SELECT u.* FROM users u
    JOIN trip_members tm ON tm.user_id = u.id
    WHERE tm.trip_id = ?
  `).all(tripIdNum) as DbUser[]

  const cities = db.prepare(
    "SELECT * FROM cities WHERE trip_id = ? ORDER BY sort_order ASC"
  ).all(tripIdNum) as DbCity[]

  const hotels = db.prepare(
    "SELECT * FROM hotels WHERE trip_id = ? ORDER BY created_at DESC"
  ).all(tripIdNum) as DbHotel[]

  // Get user's shortlisted hotel IDs
  const shortlistedRows = db.prepare(
    "SELECT hotel_id FROM shortlists WHERE user_id = ? AND trip_id = ?"
  ).all(userIdNum, tripIdNum) as { hotel_id: number }[]
  const shortlistedSet = new Set(shortlistedRows.map((r) => r.hotel_id))

  // Group hotels by city
  const hotelsByCity: Record<string, ReturnType<typeof serializeHotel>[]> = {}
  for (const hotel of hotels) {
    const key = String(hotel.city_id)
    const addedBy = getUserById(hotel.added_by)!
    if (!hotelsByCity[key]) hotelsByCity[key] = []
    hotelsByCity[key]!.push(
      serializeHotel(hotel, addedBy, shortlistedSet.has(hotel.id))
    )
  }

  return {
    trip: serializeTrip(trip, createdBy, memberRows),
    cities: cities.map(serializeCity),
    hotelsByCity,
  }
}

export function getUserShortlists(userId: string) {
  const db = getDb()
  const userIdNum = Number(userId)

  const rows = db.prepare(`
    SELECT s.*, h.*, t.name as trip_name, t.cover_emoji as trip_cover_emoji, t.id as t_id,
           s.id as shortlist_id, s.created_at as shortlist_created_at,
           h.id as hotel_id, h.name as hotel_name, h.url as hotel_url,
           h.source as hotel_source, h.notes as hotel_notes,
           h.price_per_night as hotel_price, h.currency as hotel_currency,
           h.city_id as hotel_city_id, h.trip_id as hotel_trip_id,
           h.added_by as hotel_added_by, h.created_at as hotel_created_at,
           h.updated_at as hotel_updated_at
    FROM shortlists s
    JOIN hotels h ON h.id = s.hotel_id
    JOIN trips t ON t.id = s.trip_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `).all(userIdNum) as Array<Record<string, unknown>>

  const grouped: Record<string, {
    trip: { name: string; coverEmoji: string; _id: string }
    hotels: Array<{
      _id: string
      hotelId: ReturnType<typeof serializeHotel>
      tripId: string
      createdAt: string
    }>
  }> = {}

  for (const row of rows) {
    const tId = String(row.t_id)
    if (!grouped[tId]) {
      grouped[tId] = {
        trip: {
          name: row.trip_name as string,
          coverEmoji: row.trip_cover_emoji as string,
          _id: tId,
        },
        hotels: [],
      }
    }

    const addedBy = getUserById(row.hotel_added_by as number)!
    const hotel: DbHotel = {
      id: row.hotel_id as number,
      city_id: row.hotel_city_id as number,
      trip_id: row.hotel_trip_id as number,
      name: row.hotel_name as string,
      url: row.hotel_url as string,
      source: row.hotel_source as string,
      notes: (row.hotel_notes as string) || "",
      added_by: row.hotel_added_by as number,
      price_per_night: row.hotel_price as number | null,
      currency: row.hotel_currency as string,
      created_at: row.hotel_created_at as string,
      updated_at: row.hotel_updated_at as string,
    }

    grouped[tId]!.hotels.push({
      _id: String(row.shortlist_id),
      hotelId: serializeHotel(hotel, addedBy),
      tripId: tId,
      createdAt: row.shortlist_created_at as string,
    })
  }

  return Object.values(grouped)
}

export function getUserTrips(userId: string) {
  const db = getDb()
  const userIdNum = Number(userId)

  const trips = db.prepare(`
    SELECT t.* FROM trips t
    JOIN trip_members tm ON tm.trip_id = t.id
    WHERE tm.user_id = ?
    ORDER BY t.updated_at DESC
  `).all(userIdNum) as DbTrip[]

  return trips.map((trip) => {
    const createdBy = getUserById(trip.created_by)!
    const memberRows = db.prepare(`
      SELECT u.* FROM users u
      JOIN trip_members tm ON tm.user_id = u.id
      WHERE tm.trip_id = ?
    `).all(trip.id) as DbUser[]

    const cities = db.prepare(
      "SELECT name FROM cities WHERE trip_id = ?"
    ).all(trip.id) as { name: string }[]

    const hotelCount = (db.prepare(
      "SELECT COUNT(*) as count FROM hotels WHERE trip_id = ?"
    ).get(trip.id) as { count: number }).count

    return {
      ...serializeTrip(trip, createdBy, memberRows),
      cities: cities.map((c) => c.name),
      hotelCount,
    }
  })
}
