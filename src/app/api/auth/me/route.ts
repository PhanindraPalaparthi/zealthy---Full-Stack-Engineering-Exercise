import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb, ensureSchema } from '@/lib/db'

export async function GET() {
  await ensureSchema()
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })
  const db = getDb()
  const result = await db.execute({ sql: 'SELECT id, name, email, phone, dob, address FROM users WHERE id = ?', args: [session.id] })
  const user = result.rows[0] || null
  return NextResponse.json({ user })
}