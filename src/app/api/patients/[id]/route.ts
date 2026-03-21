import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await ensureSchema()
  const db = getDb()
  const result = await db.execute({ sql: 'SELECT id, name, email, phone, dob, address FROM users WHERE id = ?', args: [id] })
  const user = result.rows[0]
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await ensureSchema()
  const body = await req.json()
  const { name, email, password, phone, dob, address } = body
  const db = getDb()
  if (password) {
    const hash = bcrypt.hashSync(password, 10)
    await db.execute({ sql: 'UPDATE users SET name=?, email=?, password=?, phone=?, dob=?, address=? WHERE id=?', args: [name, email, hash, phone || null, dob || null, address || null, id] })
  } else {
    await db.execute({ sql: 'UPDATE users SET name=?, email=?, phone=?, dob=?, address=? WHERE id=?', args: [name, email, phone || null, dob || null, address || null, id] })
  }
  const user = (await db.execute({ sql: 'SELECT id, name, email, phone, dob, address FROM users WHERE id = ?', args: [id] })).rows[0]
  return NextResponse.json({ user })
}