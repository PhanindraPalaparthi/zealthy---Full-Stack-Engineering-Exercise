import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; rxId: string }> }) {
  const { id, rxId } = await params
  await ensureSchema()
  const body = await req.json()
  const { medication, dosage, quantity, refill_on, refill_schedule } = body
  const db = getDb()
  await db.execute({ sql: 'UPDATE prescriptions SET medication=?, dosage=?, quantity=?, refill_on=?, refill_schedule=? WHERE id=? AND user_id=?', args: [medication, dosage, quantity, refill_on, refill_schedule, rxId, id] })
  const rx = (await db.execute({ sql: 'SELECT * FROM prescriptions WHERE id = ?', args: [rxId] })).rows[0]
  return NextResponse.json({ prescription: rx })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; rxId: string }> }) {
  const { id, rxId } = await params
  await ensureSchema()
  const db = getDb()
  await db.execute({ sql: 'DELETE FROM prescriptions WHERE id = ? AND user_id = ?', args: [rxId, id] })
  return NextResponse.json({ ok: true })
}