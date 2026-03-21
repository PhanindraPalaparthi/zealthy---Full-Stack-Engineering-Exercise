import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  await ensureSchema()
  const db = getDb()
  const result = await db.execute(`
    SELECT u.id, u.name, u.email, u.phone, u.dob, u.address, u.created_at,
      (SELECT COUNT(*) FROM appointments WHERE user_id = u.id) as appointment_count,
      (SELECT COUNT(*) FROM prescriptions WHERE user_id = u.id) as prescription_count
    FROM users u ORDER BY u.created_at DESC
  `)
  return NextResponse.json({ users: result.rows })
}

export async function POST(req: NextRequest) {
  await ensureSchema()
  const body = await req.json()
  const { name, email, password, phone, dob, address } = body
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }
  const db = getDb()
  const hash = bcrypt.hashSync(password, 10)
  try {
    const res = await db.execute({
      sql: 'INSERT INTO users (name, email, password, phone, dob, address) VALUES (?, ?, ?, ?, ?, ?)',
      args: [name, email, hash, phone || null, dob || null, address || null],
    })
    const insertId = Number(res.lastInsertRowid ?? 0)
    const user = (await db.execute({ sql: 'SELECT id, name, email, phone, dob, address FROM users WHERE id = ?', args: [insertId] })).rows[0]
    console.info(`[INFO] New patient created: ${name} (${email}) at ${new Date().toISOString()}`)
    return NextResponse.json({ user }, { status: 201 })
  } catch (e: any) {
    console.error(`[ERROR] Failed to create patient: ${email} — ${e.message} at ${new Date().toISOString()}`)
    if (e.message?.includes('UNIQUE')) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}