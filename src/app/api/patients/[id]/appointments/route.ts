import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await ensureSchema()
  console.debug(`[DEBUG] Fetching appointments for user id: ${id} at ${new Date().toISOString()}`)
  const db = getDb()
  const result = await db.execute({ sql: 'SELECT * FROM appointments WHERE user_id = ? ORDER BY datetime ASC', args: [id] })
  return NextResponse.json({ appointments: result.rows })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await ensureSchema()
  const body = await req.json()
  const { provider, datetime, repeat, end_date } = body
  if (!provider || !datetime) {
    console.warn(`[WARN] Appointment creation failed — missing fields for user id: ${id} at ${new Date().toISOString()}`)
    return NextResponse.json({ error: 'Provider and datetime required' }, { status: 400 })
  }
  const db = getDb()
  const res = await db.execute({ sql: 'INSERT INTO appointments (user_id, provider, datetime, repeat, end_date) VALUES (?, ?, ?, ?, ?)', args: [id, provider, datetime, repeat || 'none', end_date || null] })
  const insertId = Number(res.lastInsertRowid ?? 0)
  const appt = (await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [insertId] })).rows[0]
  return NextResponse.json({ appointment: appt }, { status: 201 })
}