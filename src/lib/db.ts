import { createClient } from '@libsql/client'
import path from 'path'
import fs from 'fs'

function getDbUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('libsql://')) {
    console.info('[INFO] Using Turso cloud database')
    return process.env.DATABASE_URL
  }
  if (process.env.VERCEL) {
    const tmpPath = '/tmp/zealthy.db'
    const seedPath = path.join(process.cwd(), 'zealthy.db')
    if (!fs.existsSync(tmpPath) && fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, tmpPath)
      console.info('[INFO] Copied seeded DB to /tmp/zealthy.db')
    }
    return `file:${tmpPath}`
  }
  return process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'zealthy.db')}`
}

function getAuthToken(): string | undefined {
  return process.env.DATABASE_AUTH_TOKEN || undefined
}

let _client: ReturnType<typeof createClient> | null = null

export function getDb() {
  if (!_client) {
    const url = getDbUrl()
    const authToken = getAuthToken()
    _client = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    })
  }
  return _client
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    dob TEXT,
    address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    datetime TEXT NOT NULL,
    repeat TEXT NOT NULL DEFAULT 'none',
    end_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    medication TEXT NOT NULL,
    dosage TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    refill_on TEXT NOT NULL,
    refill_schedule TEXT NOT NULL DEFAULT 'monthly',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS dosages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value TEXT UNIQUE NOT NULL
  )`,
]

let initialized = false
export async function ensureSchema() {
  if (initialized) return
  const db = getDb()
  for (const stmt of SCHEMA) {
    await db.execute(stmt)
  }
  initialized = true
}

export default getDb