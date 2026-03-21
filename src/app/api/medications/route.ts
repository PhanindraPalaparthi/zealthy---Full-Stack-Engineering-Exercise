import { NextResponse } from 'next/server'
import { getDb, ensureSchema } from '@/lib/db'

export async function GET() {
  await ensureSchema()
  const db = getDb()
  const meds = await db.execute('SELECT name FROM medications ORDER BY name')
  const doses = await db.execute('SELECT value FROM dosages ORDER BY id')
  return NextResponse.json({
    medications: meds.rows.map((r: any) => r.name),
    dosages: doses.rows.map((r: any) => r.value),
  })
}