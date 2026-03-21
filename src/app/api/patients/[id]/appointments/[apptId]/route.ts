import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; apptId: string }> }) {
  const { id, apptId } = await params
  await ensureSchema()
  const body = await req.json()
  const { provider, datetime, repeat, end_date } = body
  const db = getDb()
  await db.execute({ sql: 'UPDATE appointments SET provider=?, datetime=?, repeat=?, end_date=? WHERE id=? AND user_id=?', args: [provider, datetime, repeat || 'none', end_date || null, apptId, id] })
  const appt = (await db.execute({ sql: 'SELECT * FROM appointments WHERE id = ?', args: [apptId] })).rows[0]
  return NextResponse.json({ appointment: appt })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; apptId: string }> }) {
  const { id, apptId } = await params
  await ensureSchema()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM appointments WHERE id = ? AND user_id = ?', args: [apptId, id] })
  return NextResponse.json({ ok: true })
}