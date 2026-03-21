import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureSchema } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  await ensureSchema()
  const { email, password } = await req.json()
  const db = getDb()
  const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] })
  const user = result.rows[0] as any

  if (!user || !bcrypt.compareSync(password, user.password as string)) {
    console.warn(`[WARN] Failed login attempt for email: ${email} at ${new Date().toISOString()}`)
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await signToken({ id: Number(user.id), email: user.email as string, name: user.name as string })
  console.info(`[INFO] User logged in successfully: ${email} (id: ${Number(user.id)}) at ${new Date().toISOString()}`)
  const res = NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } })
  res.cookies.set('session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}