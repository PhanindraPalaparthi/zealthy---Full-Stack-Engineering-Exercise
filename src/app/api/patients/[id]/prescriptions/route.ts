import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await ensureSchema()
  console.debug(`[DEBUG] Fetching prescriptions for user id: ${id} at ${new Date().toISOString()}`)
  const db = getDb()
  const result = await db.execute({ sql: 'SELECT * FROM prescriptions WHERE user_id = ? ORDER BY refill_on ASC', args: [id] })
  return NextResponse.json({ prescriptions: result.rows })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await ensureSchema()
  const body = await req.json()
  const { medication, dosage, quantity, refill_on, refill_schedule } = body
  if (!medication || !dosage || !refill_on) {
    console.error(`[ERROR] Prescription creation failed — missing fields for user id: ${id} at ${new Date().toISOString()}`)
    return NextResponse.json({ error: 'Medication, dosage, and refill date required' }, { status: 400 })
  }
  const db = getDb()
  const res = await db.execute({ sql: 'INSERT INTO prescriptions (user_id, medication, dosage, quantity, refill_on, refill_schedule) VALUES (?, ?, ?, ?, ?, ?)', args: [id, medication, dosage, quantity || 1, refill_on, refill_schedule || 'monthly'] })
  const insertId = Number(res.lastInsertRowid ?? 0)
  const rx = (await db.execute({ sql: 'SELECT * FROM prescriptions WHERE id = ?', args: [insertId] })).rows[0]
  return NextResponse.json({ prescription: rx }, { status: 201 })
}