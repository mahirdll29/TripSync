import Database from "better-sqlite3"
import path from "path"

// Database file lives in the project root by default, or uses environment variable for cloud volumes (like Railway)
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "tripsync.db")

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH)
    _db.pragma("journal_mode = WAL")
    _db.pragma("foreign_keys = ON")
    initializeSchema(_db)
  }
  return _db
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      image TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      cover_emoji TEXT NOT NULL DEFAULT '✈️',
      created_by INTEGER NOT NULL REFERENCES users(id),
      invite_code TEXT NOT NULL UNIQUE,
      invite_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS trip_members (
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (trip_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '📍',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'Other',
      notes TEXT DEFAULT '',
      added_by INTEGER NOT NULL REFERENCES users(id),
      price_per_night REAL DEFAULT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS shortlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
      trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, hotel_id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by);
    CREATE INDEX IF NOT EXISTS idx_trips_invite_code ON trips(invite_code);
    CREATE INDEX IF NOT EXISTS idx_trip_members_user ON trip_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_cities_trip ON cities(trip_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city_id);
    CREATE INDEX IF NOT EXISTS idx_hotels_trip ON hotels(trip_id);
    CREATE INDEX IF NOT EXISTS idx_hotels_added_by ON hotels(added_by);
    CREATE INDEX IF NOT EXISTS idx_shortlists_user ON shortlists(user_id);
    CREATE INDEX IF NOT EXISTS idx_shortlists_hotel ON shortlists(hotel_id);
    CREATE INDEX IF NOT EXISTS idx_shortlists_user_trip ON shortlists(user_id, trip_id);
  `)
}

// ─── Helper types ────────────────────────────────────────────────────────────

export interface DbUser {
  id: number
  name: string
  email: string
  image: string | null
  created_at: string
  updated_at: string
}

export interface DbTrip {
  id: number
  name: string
  description: string
  cover_emoji: string
  created_by: number
  invite_code: string
  invite_enabled: number // SQLite booleans are 0/1
  created_at: string
  updated_at: string
}

export interface DbCity {
  id: number
  trip_id: number
  name: string
  emoji: string
  sort_order: number
  created_by: number
  created_at: string
  updated_at: string
}

export interface DbHotel {
  id: number
  city_id: number
  trip_id: number
  name: string
  url: string
  source: string
  notes: string
  added_by: number
  price_per_night: number | null
  currency: string
  created_at: string
  updated_at: string
}

export interface DbShortlist {
  id: number
  user_id: number
  hotel_id: number
  trip_id: number
  created_at: string
}

// ─── User helpers ────────────────────────────────────────────────────────────

/** Upsert a user by email. Returns the user row. */
export function upsertUser(name: string, email: string, image?: string | null): DbUser {
  const db = getDb()
  db.prepare(`
    INSERT INTO users (name, email, image) VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET name = excluded.name, updated_at = datetime('now')
  `).run(name, email.toLowerCase(), image ?? null)

  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as DbUser
}

export function getUserById(id: number): DbUser | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as DbUser | undefined
}

export function getUserByEmail(email: string): DbUser | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as DbUser | undefined
}

// ─── Serialization helpers ───────────────────────────────────────────────────

/** Convert a DB user to the serialized shape the client expects */
export function serializeUser(u: DbUser) {
  return {
    _id: String(u.id),
    name: u.name,
    email: u.email,
    image: u.image ?? undefined,
  }
}

export function serializeTrip(t: DbTrip, createdBy: DbUser, members: DbUser[]) {
  return {
    _id: String(t.id),
    name: t.name,
    description: t.description || "",
    coverEmoji: t.cover_emoji,
    createdBy: serializeUser(createdBy),
    members: members.map(serializeUser),
    inviteCode: t.invite_code,
    inviteEnabled: !!t.invite_enabled,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }
}

export function serializeCity(c: DbCity) {
  return {
    _id: String(c.id),
    tripId: String(c.trip_id),
    name: c.name,
    emoji: c.emoji,
    order: c.sort_order,
    createdBy: String(c.created_by),
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }
}

export function serializeHotel(h: DbHotel, addedBy: DbUser, isShortlisted?: boolean) {
  return {
    _id: String(h.id),
    cityId: String(h.city_id),
    tripId: String(h.trip_id),
    name: h.name,
    url: h.url,
    source: h.source,
    notes: h.notes || "",
    addedBy: serializeUser(addedBy),
    pricePerNight: h.price_per_night ?? undefined,
    currency: h.currency,
    isShortlisted: isShortlisted ?? false,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  }
}
