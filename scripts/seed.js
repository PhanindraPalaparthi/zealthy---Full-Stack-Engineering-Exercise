const { createClient } = require('@libsql/client')
const bcrypt = require('bcryptjs')
const path = require('path')

const DB_URL = process.env.DATABASE_URL || `file:${path.join(process.cwd(), 'zealthy.db')}`
const DB_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN

const db = createClient({
  url: DB_URL,
  ...(DB_AUTH_TOKEN ? { authToken: DB_AUTH_TOKEN } : {}),
})

const SCHEMA_STATEMENTS = [
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

const medications = ["Diovan","Lexapro","Metformin","Ozempic","Prozac","Seroquel","Tegretol"]
const dosages = ["1mg","2mg","3mg","5mg","10mg","25mg","50mg","100mg","250mg","500mg","1000mg"]

const users = [
  {
    name: "Mark Johnson",
    email: "mark@some-email-provider.net",
    password: "Password123!",
    appointments: [
      { provider: "Dr Kim West", datetime: "2026-04-16T16:30:00.000Z", repeat: "weekly" },
      { provider: "Dr Lin James", datetime: "2026-04-19T18:30:00.000Z", repeat: "monthly" },
    ],
    prescriptions: [
      { medication: "Lexapro", dosage: "5mg", quantity: 2, refill_on: "2026-03-25", refill_schedule: "monthly" },
      { medication: "Ozempic", dosage: "1mg", quantity: 1, refill_on: "2026-03-28", refill_schedule: "monthly" },
    ],
  },
  {
    name: "Lisa Smith",
    email: "lisa@some-email-provider.net",
    password: "Password123!",
    appointments: [
      { provider: "Dr Sally Field", datetime: "2026-04-22T18:15:00.000Z", repeat: "monthly" },
      { provider: "Dr Lin James", datetime: "2026-04-25T20:00:00.000Z", repeat: "weekly" },
    ],
    prescriptions: [
      { medication: "Metformin", dosage: "500mg", quantity: 2, refill_on: "2026-03-22", refill_schedule: "monthly" },
      { medication: "Diovan", dosage: "100mg", quantity: 1, refill_on: "2026-03-27", refill_schedule: "monthly" },
    ],
  },
]

async function seed() {
  console.log('🌱 Setting up schema...')
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.execute(stmt)
  }

  console.log('💊 Seeding medications...')
  for (const m of medications) {
    await db.execute({ sql: 'INSERT OR IGNORE INTO medications (name) VALUES (?)', args: [m] })
  }
  for (const d of dosages) {
    await db.execute({ sql: 'INSERT OR IGNORE INTO dosages (value) VALUES (?)', args: [d] })
  }

  console.log('👤 Seeding users...')
  for (const user of users) {
    const hash = bcrypt.hashSync(user.password, 10)
    const res = await db.execute({
      sql: 'INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)',
      args: [user.name, user.email, hash],
    })
    const userId = res.lastInsertRowid
    if (!userId || userId === 0n) {
      console.log(`  ⚠️  ${user.name} already exists, skipping`)
      continue
    }
    for (const a of user.appointments) {
      await db.execute({
        sql: 'INSERT INTO appointments (user_id, provider, datetime, repeat) VALUES (?, ?, ?, ?)',
        args: [userId, a.provider, a.datetime, a.repeat],
      })
    }
    for (const p of user.prescriptions) {
      await db.execute({
        sql: 'INSERT INTO prescriptions (user_id, medication, dosage, quantity, refill_on, refill_schedule) VALUES (?, ?, ?, ?, ?, ?)',
        args: [userId, p.medication, p.dosage, p.quantity, p.refill_on, p.refill_schedule],
      })
    }
    console.log(`  ✅ Created ${user.name}`)
  }

  console.log('\n✅ Database seeded! Test credentials:')
  console.log('   mark@some-email-provider.net / Password123!')
  console.log('   lisa@some-email-provider.net / Password123!')
  db.close()
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1) })